export const VISITOR_KEY = 'benji.photo-likes.visitor.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getVisitor(storage, randomUUID = () => crypto.randomUUID()) {
  const existing = storage.getItem(VISITOR_KEY);
  if (UUID.test(existing || '')) return existing;
  const visitor = randomUUID();
  storage.setItem(VISITOR_KEY, visitor);
  // Do not silently create a new voter on every load when persistence is blocked.
  if (storage.getItem(VISITOR_KEY) !== visitor) throw new Error('Browser storage unavailable');
  return visitor;
}

export function isLikeState(value) {
  return value && Number.isSafeInteger(value.count) && value.count >= 0 && typeof value.liked === 'boolean';
}

export async function likesRequest(base, path, method, body, { signal, fetcher = fetch, timeout = 8000 } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeout);
  try {
    const response = await fetcher(`${base.replace(/\/$/, '')}${path}`, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      signal: controller.signal, credentials: 'omit', cache: 'no-store',
    });
    if (!response.ok) throw new Error(response.status === 429 ? 'Please wait a moment before trying again.' : 'Likes are unavailable. Please try again.');
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
