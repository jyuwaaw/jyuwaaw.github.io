import { useEffect, useMemo, useState } from 'react';
import PhotoLikeButton from './PhotoLikeButton.jsx';
import usePhotoLikes from './usePhotoLikes.js';
import { likesRequest } from '@/lib/photo-likes-client.mjs';

const endpoint = (import.meta.env.PUBLIC_PHOTO_LIKES_API || '').trim();
const number = new Intl.NumberFormat('en-US');

// A toy's like button and view count. With `countVisit`, opening the page
// counts as one view, once per browser tab session; elsewhere the total is
// only read. The row keeps its height while loading so nothing below it moves.
export default function ToyStats({ statsId, title, countVisit = false, viewsLabel = '{n} views', className = '' }) {
  const items = useMemo(() => [{ likeId: statsId }], [statsId]);
  const likes = usePhotoLikes(items, true);
  const state = likes.likes[statsId];
  const [views, setViews] = useState(null);

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();
    const key = `benji.play.viewed.${statsId}`;
    // If session storage is blocked, never count: reloads would inflate the total.
    let seen = true;
    try { seen = Boolean(window.sessionStorage.getItem(key)); } catch {}
    const record = countVisit && !seen;
    const request = record
      ? likesRequest(endpoint, `/views/${statsId}`, 'POST', {}, { signal: controller.signal }).then(data => data.views)
      : likesRequest(endpoint, '/views/query', 'POST', { ids: [statsId] }, { signal: controller.signal }).then(data => data.views?.[statsId]);
    request.then(total => {
      if (!Number.isSafeInteger(total) || total < 0) return;
      if (record) try { window.sessionStorage.setItem(key, '1'); } catch {}
      if (!controller.signal.aborted) setViews(total);
    }).catch(() => {});
    return () => controller.abort();
  }, [statsId, countVisit]);

  if (!endpoint) return null;
  return <div className={`toy-stats ${className}`}>
    {state && <PhotoLikeButton {...state} disabled={Boolean(likes.pending[statsId])} noun="toy" description={title}
      className="toy-like" onToggle={() => likes.toggle(statsId)} />}
    {views !== null && <span className="toy-views">{viewsLabel.replace('{n}', number.format(views))}</span>}
    {likes.error && <span className="toy-stats-status" role="status">{likes.error} <button type="button" onClick={likes.retry}>Retry</button></span>}
  </div>;
}
