import { createServer } from 'node:http';
import { readFile, mkdir, open, unlink } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { reconcile, setSelection, publicCatalogue, isSyncDue } from './model.mjs';
import { repo, dataDirectory, loadState, saveState, readMusic, atomicJSON } from './storage.mjs';
import { withMusicLikeIds } from '../../lib/music-like-id.mjs';
import { forwardMusicLike } from './likes.mjs';

export async function createShelfServer({ initialState, persist = saveState, collect = readMusic, exportCatalogue = value => atomicJSON(join(repo, 'src/data/prototypes/records.json'), value), assets, likesFetch = fetch } = {}) {
  let state = initialState || await loadState();
  let queue = Promise.resolve();
  let syncing = false;
  let lastAttemptAt = 0;
  const token = randomBytes(24).toString('hex');
  const serial = task => { const next = queue.then(task); queue = next.catch(() => {}); return next; };
  async function commit(next) { await persist(next); state = next; return state; }
  async function sync() {
    if (syncing) throw Object.assign(new Error('正在同步，稍等一下。'), { status: 409 });
    syncing = true;
    lastAttemptAt = Date.now();
    try {
      const snapshot = await collect();
      // Read before entering the mutation queue; merge with the latest saved choices.
      return await serial(() => commit(reconcile(state, snapshot)));
    } catch (error) {
      await serial(() => commit({ ...state, revision: state.revision + 1, source: { ...state.source, lastError: error.message } }));
      throw error;
    } finally { syncing = false; }
  }
  const clientState = () => ({ ...state, syncing });
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="shelf-session" content="${token}"><title>唱片架 · 选曲</title><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>`;
  const server = createServer(async (request, response) => {
    const host = request.headers.host;
    const validHost = host && /^(127\.0\.0\.1|localhost):\d+$/.test(host);
    const origin = request.headers.origin;
    const common = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'", 'X-Frame-Options': 'DENY' };
    const send = (body, status = 200, type = 'application/json; charset=utf-8') => { response.writeHead(status, { ...common, 'Content-Type': type }); response.end(type.startsWith('application/json') ? JSON.stringify(body) : body); };
    if (!validHost || (origin && origin !== `http://${host}`) || request.headers['sec-fetch-site'] === 'cross-site') return send({ error: '只允许从这台 Mac 的管理页访问。' }, 403);
    const path = new URL(request.url, `http://${host}`).pathname;
    try {
      if (request.method === 'GET') {
        if (path === '/' || path === '/shelf/') return send(html, 200, 'text/html; charset=utf-8');
        if (path === '/app.js' || path === '/app.css') return send(await readFile(join(assets, path.slice(1))), 200, path.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8');
        if (/^\/music-prototype\/covers\/\d{3}\.webp$/.test(path)) return send(await readFile(join(process.env.RECORD_SHELF_COVERS || join(repo, 'public/music-prototype/covers'), basename(path))), 200, 'image/webp');
        if (/^\/music-prototype\/downloads\/\d{3}\.jpg$/.test(path)) return send(await readFile(join(process.env.RECORD_SHELF_DOWNLOADS || join(repo, 'public/music-prototype/downloads'), basename(path))), 200, 'image/jpeg');
        if (path === '/api/library') return send(clientState());
        if (path === '/api/catalogue') return send(withMusicLikeIds(publicCatalogue(state)));
        if (path === '/api/backup') { response.setHeader('Content-Disposition', 'attachment; filename="record-shelf-backup.json"'); return send(state); }
        return send({ error: '没有这个页面。' }, 404);
      }
      const musicLike = path.startsWith('/api/music-likes/');
      if (request.method !== 'POST' && !(musicLike && request.method === 'PUT')) return send({ error: 'Method not allowed' }, 405);
      if ((!musicLike && request.headers['x-shelf-session'] !== token) || !request.headers['content-type']?.startsWith('application/json') || origin !== `http://${host}`) return send({ error: '请从管理页操作。' }, 403);
      let body = '', size = 0;
      for await (const chunk of request) { size += chunk.length; if (size > 8192) throw new Error('请求内容太长。'); body += chunk; }
      let input;
      try { input = JSON.parse(body); } catch { throw new Error('请求内容无法读取，请刷新。'); }
      if (musicLike) {
        const result = await forwardMusicLike({ path: path.slice('/api/music-likes'.length), method: request.method, body: input }, publicCatalogue(state), likesFetch);
        return send(result.body, result.status);
      }
      if (path === '/api/selection') { await serial(() => commit(setSelection(state, input))); return send(clientState()); }
      if (path === '/api/sync') { await sync(); return send(clientState()); }
      if (path === '/api/schedule') {
        if (![0, 6, 24, 168].includes(input.intervalHours)) throw new Error('请选择同步频率。');
        await serial(() => {
          if (input.revision !== state.revision) throw Object.assign(new Error('设置刚更新过，请刷新。'), { status: 409 });
          return commit({ ...state, revision: state.revision + 1, source: { ...state.source, intervalHours: input.intervalHours } });
        });
        return send(clientState());
      }
      if (path === '/api/export') {
        await serial(() => exportCatalogue(publicCatalogue(state)));
        return send({ message: '已更新网站文件。上线后访客才能看到这次变化。' });
      }
      return send({ error: '没有这个操作。' }, 404);
    } catch (error) { return send({ error: error.message || '没有保存成功，请重试。' }, error.status || 400); }
  });
  const timer = setInterval(() => {
    if (!syncing && isSyncDue(state.source, Date.now(), lastAttemptAt)) sync().catch(() => {});
  }, 60_000);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  return { server, sync, currentState: () => state };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  // One owner process prevents two service instances from overwriting choices.
  const lockPath = join(dataDirectory, 'server.lock');
  let lock;
  try { lock = await open(lockPath, 'wx', 0o600); } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    const pid = Number(await readFile(lockPath, 'utf8'));
    let alive = true; try { process.kill(pid, 0); } catch (e) { if (e.code === 'ESRCH') alive = false; }
    if (alive) throw new Error('唱片架管理页已经运行。');
    await unlink(lockPath); lock = await open(lockPath, 'wx', 0o600);
  }
  await lock.writeFile(String(process.pid)); await lock.close();
  const clean = () => unlink(lockPath).catch(() => {});
  try {
    const assets = process.env.RECORD_SHELF_ASSETS || join(dataDirectory, 'app');
    if (!process.env.RECORD_SHELF_ASSETS) {
      const { build } = await import('esbuild');
      await build({ entryPoints: [join(repo, 'tools/record-shelf/client.jsx')], bundle: true, minify: true, jsx: 'automatic', outdir: assets, entryNames: 'app', define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.PUBLIC_PHOTO_LIKES_API': '""' } });
    }
    const { server } = await createShelfServer({ assets });
    const port = Number(process.env.RECORD_SHELF_PORT || 4324);
    server.listen(port, '127.0.0.1', () => console.log(`唱片架管理页：http://127.0.0.1:${port}/`));
    server.on('error', async error => { await clean(); console.error(error.message); process.exit(1); });
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await clean(); process.exit(0); }));
  } catch (error) { await clean(); throw error; }
}
