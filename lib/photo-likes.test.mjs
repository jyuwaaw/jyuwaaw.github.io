import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createLikesWorker } from '../workers/photo-likes/worker.mjs';
import { getVisitor, isLikeState, likesRequest } from './photo-likes-client.mjs';
import { photoLikeId } from './photo-like-id.mjs';

const photo = photoLikeId('photography', 'one.jpg');
const otherPhoto = photoLikeId('photography', 'two.jpg');
const visitor = '11111111-1111-4111-8111-111111111111';
const otherVisitor = '22222222-2222-4222-8222-222222222222';
const origin = 'https://jyuwaaw.github.io';

// Execute the actual Worker SQL against SQLite; model D1's atomic batch contract.
function setup(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(readFileSync(new URL('../workers/photo-likes/migrations/0001_likes.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      return { bind(...args) { return { sql, args, async all() { return { results: db.prepare(sql).all(...args) }; } }; } };
    },
    async batch(statements) {
      db.exec('BEGIN');
      try {
        const results = statements.map(({ sql, args }) => ({ results: db.prepare(sql).all(...args) }));
        db.exec('COMMIT');
        return results;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
  const env = { DB, VISITOR_SECRET: 'local-test-only-not-a-deployed-secret', ALLOWED_ORIGINS: origin, RATE_LIMITER: { async limit() { return { success: true }; } } };
  const worker = createLikesWorker([photo, otherPhoto]);
  const call = (path, body, method = 'PUT', requestOrigin = origin) => worker.fetch(new Request(`https://likes.example${path}`, {
    method, headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, ...(method === 'OPTIONS' ? {} : { body: JSON.stringify(body) }),
  }), env);
  const vote = (liked, who = visitor) => call(`/likes/${photo}`, { visitor: who, liked });
  const query = (who = visitor) => call('/likes/query', { visitor: who, ids: [photo, otherPhoto] }, 'POST');
  return { db, env, call, vote, query };
}

test('shared totals persist, repeated desired-state writes are idempotent, unlike affects only its visitor', async t => {
  const { vote, query, db } = setup(t);
  assert.deepEqual((await (await query()).json()).likes[photo], { count: 0, liked: false });
  assert.deepEqual(await (await vote(true)).json(), { count: 1, liked: true });
  await vote(true);
  await Promise.all(Array.from({ length: 6 }, () => vote(true, otherVisitor)));
  assert.deepEqual((await (await query()).json()).likes[photo], { count: 2, liked: true });
  await vote(false);
  assert.deepEqual(await (await vote(false)).json(), { count: 1, liked: false });
  assert.deepEqual((await (await query(otherVisitor)).json()).likes[photo], { count: 1, liked: true });
  const stored = db.prepare('SELECT visitor_hash FROM likes').get().visitor_hash;
  assert.match(stored, /^[a-f0-9]{64}$/);
  assert.notEqual(stored, otherVisitor);
});

test('queries tolerate catalog deployment lag but reject invalid requests and arbitrary writes', async t => {
  const { call, db } = setup(t);
  const unknown = '0'.repeat(32);
  const result = await call('/likes/query', { visitor, ids: [photo, unknown] }, 'POST');
  assert.deepEqual((await result.json()).likes, { [photo]: { count: 0, liked: false }, [unknown]: null });
  for (const body of [{ liked: true }, { visitor, liked: 'true' }, { visitor: [visitor], liked: true }]) {
    assert.equal((await call(`/likes/${photo}`, body)).status, 400);
  }
  assert.equal((await call(`/likes/${unknown}`, { visitor, liked: true })).status, 404);
  assert.equal((await call('/likes/query', { visitor, ids: Array(81).fill(photo) }, 'POST')).status, 400);
  assert.equal((await call(`/likes/${photo}`, { visitor, liked: true, junk: 'x'.repeat(9000) })).status, 400);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM likes').get().n, 0);
});

test('CORS, private caching, rate limiting and unavailable backend fail safely', async t => {
  const { env, call, vote } = setup(t);
  assert.equal((await call(`/likes/${photo}`, { visitor, liked: true }, 'PUT', 'https://unrelated.example')).status, 403);
  const preflight = await call('/likes/query', null, 'OPTIONS');
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'), null);
  assert.equal((await vote(true)).headers.get('Cache-Control'), 'no-store');
  env.RATE_LIMITER.limit = async () => ({ success: false });
  assert.equal((await vote(true)).status, 429);
  env.RATE_LIMITER.limit = async () => { throw new Error('internal database information'); };
  const failed = await vote(true);
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /internal database/);
  delete env.VISITOR_SECRET;
  assert.equal((await vote(true)).status, 503);
});

test('database failure never acknowledges a successful vote', async t => {
  const { env, vote } = setup(t);
  env.DB.batch = async () => { throw new Error('database down'); };
  assert.equal((await vote(true)).status, 503);
});

test('browser identity survives reloads and refuses silently blocked storage', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(getVisitor(storage, () => visitor), visitor);
  assert.equal(getVisitor(storage, () => otherVisitor), visitor);
  assert.throws(() => getVisitor({ getItem: () => null, setItem: () => {} }, () => visitor), /storage/);
});

test('client validates counts and handles HTTP, JSON, timeout and cancellation failures', async () => {
  assert.equal(Boolean(isLikeState({ count: -1, liked: true })), false);
  assert.equal(Boolean(isLikeState({ count: 1, liked: 1 })), false);
  assert.equal(Boolean(isLikeState({ count: 0, liked: false })), true);
  const send = options => likesRequest('https://likes.example/', '/likes/query', 'POST', { visitor }, options);
  await assert.rejects(send({ fetcher: async () => new Response('{}', { status: 429 }) }), /wait a moment/);
  await assert.rejects(send({ fetcher: async () => new Response('<html>') }));
  const fetcher = (_, { signal }) => new Promise((resolve, reject) => {
    if (signal.aborted) reject(new Error('aborted'));
    else signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  await assert.rejects(send({ fetcher, timeout: 5 }), /aborted/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(send({ fetcher, signal: controller.signal }), /aborted/);
  assert.deepEqual(await send({ fetcher: async (url, init) => {
    assert.equal(url, 'https://likes.example/likes/query');
    assert.equal(init.credentials, 'omit');
    assert.equal(init.cache, 'no-store');
    return Response.json({ ok: true });
  } }), { ok: true });
});

test('published like IDs match the backend catalog and ignore metadata/encoding changes', () => {
  const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
  const captions = read('./photography.json');
  const excluded = new Set(captions.filter(p => p.exclude).map(p => p.filename));
  const expected = read('./generated/photography.json').filter(p => !excluded.has(p.filename)).map(p => photoLikeId('photography', p.filename)).sort();
  assert.deepEqual(read('../workers/photo-likes/catalog.json'), expected);
  assert.notEqual(photoLikeId('photography', 'one.jpg'), photoLikeId('Mechanic', 'one.jpg'));
});
