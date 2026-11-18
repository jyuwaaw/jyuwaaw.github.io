import { randomUUID } from 'node:crypto';

export const normal = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
export const duration = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
export function isSyncDue(source, now = Date.now(), lastAttemptAt = 0) {
  return source.intervalHours > 0 && now - Date.parse(source.lastSyncAt) >= source.intervalHours * 3600_000 && now - lastAttemptAt >= 15 * 60_000;
}
const nativeKey = id => `mac:${id}`;
const userPlaylist = p => p.kind === 0 && p.distinguishedKind === 0 && !p.master;
export const artistKey = value => normal(value).split(/\s*[,，&、]\s*|\s+[xX\/]\s+/).filter(Boolean).sort().join('|');
const sameRecording = (a, b) => normal(a.title) === normal(b.title) && artistKey(a.artist) === artistKey(b.artist) && Math.abs(a.durationMs - b.durationMs) < 2100 && (!a.album || !b.album || normal(a.album) === normal(b.album));
const recordingKey = t => `${normal(t.title)}\0${artistKey(t.artist)}`;
function indexRecordings(tracks) {
  const map = new Map();
  for (const track of tracks) { const key = recordingKey(track); if (!map.has(key)) map.set(key, []); map.get(key).push(track); }
  return map;
}
const matching = (index, track) => (index.get(recordingKey(track)) || []).filter(t => sameRecording(t, track));
const searchURL = track => `https://music.apple.com/us/search?term=${encodeURIComponent(`${track.title} ${track.artist}`)}`;

export function validateSnapshot(snapshot) {
  if (snapshot?.source !== 'mac-music' || snapshot?.formatVersion !== 1 || !Array.isArray(snapshot.playlists) || !snapshot.playlists.length) throw new Error('没有读到完整的 Mac 音乐资料库，原有选曲已保留。');
  const ids = new Set();
  for (const p of snapshot.playlists) {
    if (typeof p.id !== 'string' || !/^\d+$/.test(p.id) || ids.has(p.id) || typeof p.name !== 'string' || !Array.isArray(p.tracks)) throw new Error('歌单资料不完整，原有选曲已保留。');
    ids.add(p.id);
    for (const t of p.tracks) {
      if (typeof t.id !== 'string' || !/^\d+$/.test(t.id) || typeof t.title !== 'string' || typeof t.artist !== 'string' || !Number.isFinite(t.durationMs) || t.durationMs < 0) throw new Error('歌曲资料不完整，原有选曲已保留。');
    }
  }
}

function mergeTracks(old, incoming, linkCandidates) {
  const oldById = new Map(old.tracks.flatMap(t => [t.id, ...(t.aliases || [])].map(id => [id, t])));
  const oldByURL = new Map(old.tracks.filter(t => t.url).map(t => [t.url, t]));
  const incomingIds = new Set(incoming.tracks.map(t => nativeKey(t.id)));
  const tracks = [];
  const seen = new Set();
  const byURL = new Map();
  for (const item of incoming.tracks) {
    const nativeId = nativeKey(item.id);
    if (seen.has(nativeId)) continue;
    seen.add(nativeId);
    const previous = oldById.get(nativeId);
    const candidates = previous?.url ? [previous] : matching(linkCandidates, item).filter(t => t.url);
    const urls = [...new Set(candidates.map(t => t.url))];
    const url = urls.length === 1 ? urls[0] : undefined;
    const duplicate = url && byURL.get(url);
    if (duplicate) { duplicate.aliases.push(nativeId); continue; }
    const identity = previous || (url && oldByURL.get(url));
    const track = { id: identity?.id || nativeId, aliases: [nativeId], title: item.title, artist: item.artist, album: item.album || '', durationMs: item.durationMs, duration: duration(item.durationMs), ...(url ? { url } : {}), present: true, addedAt: identity?.addedAt || incoming.readAt };
    tracks.push(track);
    if (url) byURL.set(url, track);
  }
  for (const track of old.tracks) if (![track.id, ...(track.aliases || [])].some(id => incomingIds.has(id)) && !tracks.some(t => t.id === track.id)) tracks.push({ ...track, present: false });
  return tracks;
}

// Bind the existing editorial choices once. Subsequent syncs use persistent IDs,
// never names or row positions. Ambiguous catalogue links are left unresolved.
export function bindLibrary(seed, snapshot) {
  validateSnapshot(snapshot);
  const allCandidates = indexRecordings(seed.playlists.flatMap(p => p.tracks));
  const playlists = seed.playlists.map(old => {
    const matches = snapshot.playlists.filter(p => userPlaylist(p) && p.name === old.name && p.tracks.length);
    if (matches.length !== 1) throw new Error(`无法唯一确认「${old.name}」，尚未连接资料库。`);
    const incoming = { ...matches[0], readAt: snapshot.readAt };
    if (Math.abs(old.sourceTrackCount - incoming.tracks.length) > Math.max(2, old.sourceTrackCount * .05)) throw new Error(`「${old.name}」与备份差异较大，尚未连接资料库。`);
    const idMap = new Map();
    const aliases = new Map();
    const candidates = indexRecordings(old.tracks);
    const nativeIndex = indexRecordings(incoming.tracks);
    const oldById = new Map(old.tracks.map(t => [t.id, t]));
    const ordered = old.sourceOrder?.length === incoming.tracks.length && old.sourceOrder.every((id, i) => {
      const t = oldById.get(id), next = incoming.tracks[i];
      return t && normal(t.title) === normal(next.title) && normal(t.album) === normal(next.album) && Math.abs(t.durationMs - next.durationMs) < 2100;
    });
    if (ordered) old.sourceOrder.forEach((id, i) => { if (!aliases.has(id)) aliases.set(id, []); aliases.get(id).push(nativeKey(incoming.tracks[i].id)); });
    for (const t of old.tracks) {
      const matches = matching(nativeIndex, t);
      const urls = new Set(matching(candidates, t).map(t => t.url));
      if (!aliases.has(t.id) && matches.length && urls.size === 1) aliases.set(t.id, [...new Set(matches.map(t => nativeKey(t.id)))]);
      if (aliases.has(t.id)) idMap.set(t.id, aliases.get(t.id)[0]);
    }
    const translated = { ...old, tracks: old.tracks.map(t => ({ ...t, id: idMap.get(t.id) || t.id, aliases: aliases.get(t.id) || [] })) };
    const tracks = mergeTracks(translated, incoming, candidates);
    // Fill only unambiguous links across playlists (never fuzzy-match a version).
    for (const track of tracks.filter(t => t.present && !t.url)) {
      const urls = [...new Set(matching(allCandidates, track).filter(t => t.url).map(t => t.url))];
      if (urls.length === 1) track.url = urls[0];
    }
    const { sourceOrder, ...metadata } = old;
    const canonical = new Map(tracks.flatMap(t => [t.id, ...(t.aliases || [])].map(id => [id, t.id])));
    return { ...metadata, key: nativeKey(incoming.id), sourceTrackCount: incoming.tracks.length, tracks, selected: old.selected.map(id => canonical.get(idMap.get(id) || id) || idMap.get(id) || id), present: true };
  });
  return { ...seed, revision: 1, playlists, source: { type: 'mac-music', accountLabel: seed.source.accountLabel, lastSyncAt: snapshot.readAt, lastError: null, intervalHours: 24, anchors: playlists.map(p => p.key), lastChange: { added: 0, removed: 0 } } };
}

export function reconcile(state, snapshot, now = new Date().toISOString()) {
  validateSnapshot(snapshot);
  const incoming = new Map(snapshot.playlists.filter(userPlaylist).map(p => [nativeKey(p.id), p]));
  const anchors = state.source.anchors;
  if (!anchors?.length || anchors.filter(id => incoming.has(id)).length < anchors.length * .8) throw new Error('这次读取的资料库与已连接的歌单差异过大。请检查 Mac「音乐」账号；现有资料和选曲已保留。');
  const candidates = indexRecordings(state.playlists.flatMap(p => p.tracks));
  let added = 0, removed = 0;
  const playlists = state.playlists.map(old => {
    const next = incoming.get(old.key);
    if (!next) {
      if (old.present) removed += old.tracks.filter(t => t.present).length;
      return { ...old, present: false, tracks: old.tracks.map(t => ({ ...t, present: false })) };
    }
    if (old.sourceTrackCount >= 20 && next.tracks.length < old.sourceTrackCount * .7) throw new Error(`「${old.name}」这次少了很多歌曲。已暂停更新，避免把未读全的资料当成删除。`);
    const tracks = mergeTracks(old, { ...next, readAt: now }, candidates);
    const before = new Map(old.tracks.map(t => [t.id, t.present]));
    added += tracks.filter(t => t.present && !before.get(t.id)).length;
    removed += tracks.filter(t => !t.present && before.get(t.id)).length;
    return { ...old, name: next.name, present: true, sourceTrackCount: next.tracks.length, tracks };
  });
  const known = new Set(playlists.map(p => p.key));
  for (const [key, next] of incoming) {
    // Empty local leftovers and system playlists do not become public records.
    if (known.has(key) || !next.tracks.length) continue;
    const old = { key, id: randomUUID(), name: next.name, category: '收藏与发现', tags: ['发现'], note: '', color: '#5b6c60', cover: '', featuredRank: 1000 + playlists.length, selected: [], tracks: [] };
    const tracks = mergeTracks(old, { ...next, readAt: now }, candidates);
    added += tracks.length;
    playlists.push({ ...old, tracks, present: true, sourceTrackCount: next.tracks.length });
  }
  return { ...state, revision: state.revision + 1, playlists, source: { ...state.source, lastSyncAt: now, lastError: null, lastChange: { added, removed } } };
}

export function setSelection(state, { playlistKey, trackId, selected, revision }) {
  if (revision !== state.revision) throw Object.assign(new Error('另一页刚更新过选曲，请刷新后再勾选。'), { status: 409 });
  if (typeof selected !== 'boolean') throw new Error('请选择是否展示。');
  const playlist = state.playlists.find(p => p.key === playlistKey);
  const track = playlist?.tracks.find(t => t.id === trackId);
  if (!track) throw new Error('没有找到这首歌，请刷新。');
  if (selected && (!playlist.present || !track.present)) throw new Error('这首歌已经不在原歌单里，暂时不能加入网站。');
  const ids = playlist.selected.filter(id => id !== trackId);
  if (selected) ids.push(trackId);
  return { ...state, revision: state.revision + 1, updatedAt: new Date().toISOString(), playlists: state.playlists.map(p => p === playlist ? { ...p, selected: ids } : p) };
}

export function publicCatalogue(state) {
  return { ...state.publicConfig, createdAt: state.source.lastSyncAt, records: state.playlists.filter(p => p.present).map(p => {
    const tracks = new Map(p.tracks.filter(t => t.present).map(t => [t.id, t]));
    return { id: p.id, name: p.name, category: p.category, tags: p.tags, note: p.note, color: p.color, cover: p.cover, featuredRank: p.featuredRank, trackCount: p.sourceTrackCount, picks: p.selected.flatMap(id => {
      const t = tracks.get(id);
      return t ? [{ title: t.title, artist: t.artist, duration: t.duration, url: t.url || searchURL(t), linkType: t.url ? 'song' : 'search' }] : [];
    }) };
  }) };
}
