'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getVisitor, isLikeState, likesRequest } from '@/lib/photo-likes-client.mjs';

const endpoint = (process.env.NEXT_PUBLIC_PHOTO_LIKES_API || '').trim();

export default function usePhotoLikes(photos, enabled) {
  const available = enabled && Boolean(endpoint);
  const [likes, setLikes] = useState({});
  const [pending, setPending] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const locks = useRef(new Set());
  const visitor = useRef(null);
  const lifetime = useRef(null);
  const idsKey = photos.map(p => p.likeId).filter(Boolean).join(',');

  useEffect(() => {
    if (!available || !idsKey) return;
    const controller = new AbortController();
    lifetime.current = controller;
    setLoading(true);
    setError('');
    setLikes({});
    async function load() {
      try {
        visitor.current = getVisitor(window.localStorage);
      } catch {
        if (!controller.signal.aborted) { setError('Allow browser storage to save your likes.'); setLoading(false); }
        return;
      }
      try {
        const ids = idsKey.split(',');
        const result = {};
        // Stay below D1's parameter limit; no request per thumbnail.
        for (let i = 0; i < ids.length; i += 80) {
          const batch = ids.slice(i, i + 80);
          const data = await likesRequest(endpoint, '/likes/query', 'POST', { ids: batch, visitor: visitor.current }, { signal: controller.signal });
          for (const id of batch) {
            if (data.likes?.[id] === null) continue;
            if (!isLikeState(data.likes?.[id])) throw new Error('Invalid like response');
            result[id] = data.likes[id];
          }
        }
        if (!controller.signal.aborted) setLikes(result);
      } catch {
        if (!controller.signal.aborted) setError('Likes are unavailable. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => { controller.abort(); };
  }, [available, idsKey, attempt]);

  const toggle = useCallback(async (id) => {
    if (!likes[id] || locks.current.has(id) || loading || !visitor.current) return;
    const controller = lifetime.current;
    if (!controller || controller.signal.aborted) return;
    locks.current.add(id);
    setPending(value => ({ ...value, [id]: true }));
    setError('');
    try {
      const result = await likesRequest(endpoint, `/likes/${id}`, 'PUT', { visitor: visitor.current, liked: !likes[id].liked }, { signal: controller.signal });
      if (!isLikeState(result)) throw new Error('Invalid like response');
      if (!controller.signal.aborted) setLikes(value => ({ ...value, [id]: result }));
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message === 'Please wait a moment before trying again.' ? err.message : 'Could not confirm your like. Retry to refresh its status.');
    } finally {
      locks.current.delete(id);
      setPending(value => ({ ...value, [id]: false }));
    }
  }, [likes, loading]);

  const retry = () => { if (!locks.current.size) setAttempt(n => n + 1); };
  return { available, likes, pending, error, loading, retry, toggle };
}
