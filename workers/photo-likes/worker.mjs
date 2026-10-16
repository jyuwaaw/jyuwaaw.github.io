const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function digest(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))), b => b.toString(16).padStart(2, '0')).join('');
}

async function readBody(request) {
  // Bound actual streamed bytes as well as Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) { await reader.cancel(); throw new Error('Body too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function createLikesWorker(catalog) {
  const known = new Set(catalog);
  return {
    async fetch(request, env) {
      const origin = request.headers.get('Origin');
      const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
      const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
      const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
      if (!origin || !allowed.includes(origin)) return reply({ error: 'Origin not allowed' }, 403);
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'POST, PUT, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type';
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
      const path = new URL(request.url).pathname;
      const query = path === '/likes/query' && request.method === 'POST';
      const photoId = path.match(/^\/likes\/([a-f0-9]{32})$/)?.[1];
      if (!query && !(photoId && request.method === 'PUT')) return reply({ error: 'Not found' }, 404);
      if (!env.VISITOR_SECRET || !env.DB || !env.RATE_LIMITER) return reply({ error: 'Likes unavailable' }, 503);
      try {
        const ipKey = await digest(`ip:${request.headers.get('CF-Connecting-IP') || 'local'}`, env.VISITOR_SECRET);
        const { success } = await env.RATE_LIMITER.limit({ key: ipKey });
        if (!success) { headers['Retry-After'] = '60'; return reply({ error: 'Please try again later' }, 429); }
        let body;
        try { body = await readBody(request); } catch { return reply({ error: 'Invalid request' }, 400); }
        if (!body || typeof body.visitor !== 'string' || !UUID.test(body.visitor)) return reply({ error: 'Invalid visitor' }, 400);
        const visitor = await digest(`visitor:${body.visitor}`, env.VISITOR_SECRET);
        if (query) {
          if (!Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 80 || body.ids.some(id => typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id))) return reply({ error: 'Invalid photographs' }, 400);
          const ids = [...new Set(body.ids)];
          // Leave newly published/removed photos unavailable until the catalog is deployed.
          const supported = ids.filter(id => known.has(id));
          let rows = [];
          if (supported.length) {
            const placeholders = supported.map(() => '?').join(',');
            const result = await env.DB.prepare(`SELECT photo_id, COUNT(*) AS count, MAX(visitor_hash = ?) AS liked FROM likes WHERE photo_id IN (${placeholders}) GROUP BY photo_id`).bind(visitor, ...supported).all();
            rows = result.results;
          }
          return reply({ likes: Object.fromEntries(ids.map(id => {
            const row = rows.find(r => r.photo_id === id);
            return [id, known.has(id) ? { count: row?.count || 0, liked: Boolean(row?.liked) } : null];
          })) });
        }
        if (!known.has(photoId)) return reply({ error: 'Unknown photograph' }, 404);
        if (typeof body.liked !== 'boolean') return reply({ error: 'Invalid like state' }, 400);
        const mutation = body.liked
          ? env.DB.prepare('INSERT OR IGNORE INTO likes (photo_id, visitor_hash) VALUES (?, ?)').bind(photoId, visitor)
          : env.DB.prepare('DELETE FROM likes WHERE photo_id = ? AND visitor_hash = ?').bind(photoId, visitor);
        const read = env.DB.prepare('SELECT COUNT(*) AS count, COALESCE(MAX(visitor_hash = ?), 0) AS liked FROM likes WHERE photo_id = ?').bind(visitor, photoId);
        // D1 batch commits the desired state and reads its count in one transaction.
        const results = await env.DB.batch([mutation, read]);
        const row = results[1].results[0];
        return reply({ count: row.count, liked: Boolean(row.liked) });
      } catch {
        return reply({ error: 'Likes unavailable' }, 503);
      }
    },
  };
}
