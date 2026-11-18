import { photoLikeId } from './photo-like-id.mjs';

// Playlist identity survives title/cover/order edits. Song votes are shared
// across playlists, but different catalogue recordings keep separate totals.
export const playlistLikeId = id => photoLikeId('music-playlist', String(id));
export function songLikeId(track) {
  try {
    const url = new URL(track.url);
    if (url.protocol !== 'https:' || url.hostname !== 'music.apple.com') return null;
    const id = url.pathname.match(/\/song\/(?:[^/]+\/)?(\d+)\/?$/)?.[1];
    return id ? photoLikeId('music-song', id) : null;
  } catch { return null; }
}
export function withMusicLikeIds(catalogue) {
  return { ...catalogue, records: catalogue.records.map(record => ({ ...record, likeId: playlistLikeId(record.id), picks: record.picks.map(track => ({ ...track, likeId: songLikeId(track) })) })) };
}
export function musicLikeIds(catalogue) {
  return [...new Set(catalogue.records.flatMap(record => [playlistLikeId(record.id), ...record.picks.map(songLikeId).filter(Boolean)]))];
}
