import { musicLikeIds } from '../../lib/music-like-id.mjs';

// Same public service and visitor identity as Photography. The local manager
// proxies only votes for the current public catalogue, not private library data.
export const musicLikesAPI = 'https://benji-photo-likes.rentmac.workers.dev';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function forwardMusicLike({ path, method, body }, catalogue, fetcher = fetch) {
  const known = new Set(musicLikeIds(catalogue));
  const query = method === 'POST' && path === '/likes/query';
  const id = method === 'PUT' && path.match(/^\/likes\/([a-f0-9]{32})$/)?.[1];
  if (!query && !id) return { status: 404, body: { error: '没有这个点赞操作。' } };
  if (!body || typeof body.visitor !== 'string' || !UUID.test(body.visitor)) return { status: 400, body: { error: '点赞身份无法读取，请刷新。' } };
  if (query && (!Array.isArray(body.ids) || !body.ids.length || body.ids.length > 80 || body.ids.some(id => !known.has(id)))) return { status: 400, body: { error: '只能查询当前展示的歌单和歌曲。' } };
  if (id && (!known.has(id) || typeof body.liked !== 'boolean')) return { status: 400, body: { error: '只能给当前展示的歌单和歌曲点赞。' } };
  const payload = query ? { visitor: body.visitor, ids: [...new Set(body.ids)] } : { visitor: body.visitor, liked: body.liked };
  try {
    const response = await fetcher(`${musicLikesAPI}${path}`, { method, headers: { 'Content-Type': 'application/json', Origin: 'https://jyuwaaw.github.io' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000), redirect: 'error' });
    return { status: response.status, body: await response.json() };
  } catch { return { status: 503, body: { error: '点赞暂时无法连接，请稍后重试。' } }; }
}
