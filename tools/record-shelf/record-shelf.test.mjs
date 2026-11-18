import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { bindLibrary, reconcile, setSelection, publicCatalogue, isSyncDue } from './model.mjs';
import { createShelfServer } from './server.mjs';
import { atomicJSON } from './storage.mjs';
import { playlistLikeId } from '../../lib/music-like-id.mjs';

const song = (id, title = 'Song', artist = 'Artist') => ({ id, title, artist, album: 'Album', durationMs: 180500 });
const playlist = (id, tracks, name = 'Playlist') => ({ id, name, kind: 0, distinguishedKind: 0, master: false, tracks });
const snapshot = playlists => ({ source: 'mac-music', formatVersion: 1, readAt: '2026-11-17T10:00:00Z', playlists });
function state() {
  const t = { ...song('catalog:99'), duration: '3:00', url: 'https://music.apple.com/us/song/song/99', present: true };
  const seed = { formatVersion: 1, revision: 0, publicConfig: { facets: {}, categoryNotes: {} }, source: { accountLabel: 'test' }, playlists: [{ key: 'backup:1', id: 1, name: 'Playlist', category: '收藏与发现', tags: [], cover: '', note: '', color: '#333333', featuredRank: 1, tracks: [t], selected: [t.id], sourceTrackCount: 1 }] };
  return bindLibrary(seed, snapshot([playlist('1', [song('10')])]));
}
test('sync preserves choices across rename/reorder; new tracks stay unselected', () => {
  const old = state();
  const next = reconcile(old, snapshot([playlist('1', [song('11', 'New'), song('10')], 'Renamed')]));
  assert.deepEqual(next.playlists[0].selected, ['mac:10']);
  assert.equal(next.playlists[0].name, 'Renamed');
  assert.deepEqual(publicCatalogue(next).records[0].picks.map(t => t.title), ['Song']);
  const checked = setSelection(next, { playlistKey: 'mac:1', trackId: 'mac:11', selected: true, revision: next.revision });
  assert.equal(publicCatalogue(checked).records[0].picks[1].linkType, 'search');
});
test('removed selections remain recoverable, hide publicly, and return when source returns', () => {
  const removed = reconcile(state(), snapshot([playlist('1', [])]));
  assert.deepEqual(removed.playlists[0].selected, ['mac:10']);
  assert.equal(removed.playlists[0].tracks[0].present, false);
  assert.equal(publicCatalogue(removed).records[0].picks.length, 0);
  const returned = reconcile(removed, snapshot([playlist('1', [song('10')])]));
  assert.equal(publicCatalogue(returned).records[0].picks.length, 1);
});
test('same catalogue recording recreated by Music keeps its selection; another version does not inherit it', () => {
  const old = state();
  const next = reconcile(old, snapshot([playlist('1', [song('12'), { ...song('13'), album: 'Live Album', durationMs: 210000 }])]));
  assert.deepEqual(next.playlists[0].selected, ['mac:10']);
  assert.equal(publicCatalogue(next).records[0].picks.length, 1);
  assert.equal(next.playlists[0].tracks.find(t => t.aliases?.includes('mac:13')).url, undefined);
});
test('collaboration punctuation and repeated occurrences bind once; version remains exact', () => {
  const old = state();
  const seed = { ...old, source: { accountLabel: 'test' }, playlists: old.playlists.map(p => ({ ...p, tracks: p.tracks.map(t => ({ ...t, artist: 'A, B' })) })) };
  const bound = bindLibrary(seed, snapshot([playlist('1', [song('10', 'Song', 'A & B'), song('11', 'Song', 'A & B')])]));
  assert.equal(bound.playlists[0].tracks.length, 1);
  assert.deepEqual(bound.playlists[0].tracks[0].aliases, ['mac:10', 'mac:11']);
  const reordered = reconcile(bound, snapshot([playlist('1', [song('11', 'Song', 'A & B')])]));
  assert.equal(publicCatalogue(reordered).records[0].picks[0].url, 'https://music.apple.com/us/song/song/99');
});
test('wrong library, truncated read, and stale edits cannot erase state', () => {
  const old = state(), before = structuredClone(old);
  assert.throws(() => reconcile(old, snapshot([playlist('2', [song('22')])])), /资料库/);
  assert.throws(() => reconcile(old, snapshot([])), /完整/);
  assert.throws(() => setSelection(old, { revision: 0 }), /刷新/);
  assert.deepEqual(old, before);
});
test('public projection excludes account, native IDs, unselected songs, and removed songs', () => {
  const next = reconcile(state(), snapshot([playlist('1', [song('10'), song('11', 'Private draft')])]));
  const output = JSON.stringify(publicCatalogue(next));
  assert.ok(!output.includes('accountLabel') && !output.includes('mac:') && !output.includes('Private draft') && !output.includes('anchors'));
});
test('daily schedule catches up after sleep, respects manual mode, and backs off failed attempts', () => {
  const source = state().source, due = Date.parse(source.lastSyncAt) + 25 * 3600_000;
  assert.equal(isSyncDue(source, due), true);
  assert.equal(isSyncDue(source, due - 2 * 3600_000), false);
  assert.equal(isSyncDue({ ...source, intervalHours: 0 }, due), false);
  assert.equal(isSyncDue(source, due, due - 5 * 60_000), false);
  assert.equal(isSyncDue(source, due, due - 16 * 60_000), true);
});
test('server persists checkbox selections and rejects cross-site/host mutation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'record-shelf-test-'));
  const path = join(dir, 'state.json');
  let collected;
  const pending = new Promise(resolve => { collected = resolve; });
  const app = await createShelfServer({ initialState: state(), persist: value => atomicJSON(path, value), collect: () => pending });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  try {
    const html = await fetch(base).then(r => r.text());
    const token = html.match(/name="shelf-session" content="([^"]+)"/)[1];
    const headers = { Origin: base, 'Content-Type': 'application/json', 'X-Shelf-Session': token };
    const change = { playlistKey: 'mac:1', trackId: 'mac:10', selected: false, revision: 1 };
    assert.equal((await fetch(`${base}/api/selection`, { method: 'POST', headers: { ...headers, Origin: 'https://evil.example' }, body: JSON.stringify(change) })).status, 403);
    const invalidHost = await new Promise(resolve => { const req = httpRequest(`${base}/api/library`, { headers: { Host: 'evil.example' } }, res => { res.resume(); resolve(res.statusCode); }); req.end(); });
    assert.equal(invalidHost, 403);
    const syncing = app.sync();
    const response = await fetch(`${base}/api/selection`, { method: 'POST', headers, body: JSON.stringify(change) });
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(await readFile(path)).playlists[0].selected, []);
    collected(snapshot([playlist('1', [song('10'), song('11', 'New')])]));
    await syncing;
    assert.deepEqual(app.currentState().playlists[0].selected, []);
    assert.equal((await fetch(`${base}/api/catalogue`).then(r => r.json())).records[0].picks.length, 0);
    assert.equal((await fetch(`${base}/api/selection`, { method: 'POST', headers, body: JSON.stringify(change) })).status, 409);
  } finally { await new Promise(resolve => app.server.close(resolve)); await rm(dir, { recursive: true }); }
});
test('local likes proxy accepts only public votes and cannot change private selections', async () => {
  let votes = 0;
  const app = await createShelfServer({ initialState: state(), persist: async () => {}, likesFetch: async (url, init) => { votes++; const body = JSON.parse(init.body); assert.equal(body.privateData, undefined); return Response.json({ count: 1, liked: true }); } });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const headers = { Origin: base, 'Content-Type': 'application/json' };
  const body = JSON.stringify({ visitor: '11111111-1111-4111-8111-111111111111', liked: true, privateData: 'do not forward' });
  try {
    const response = await fetch(`${base}/api/music-likes/likes/${playlistLikeId(1)}`, { method: 'PUT', headers, body });
    assert.equal(response.status, 200);
    assert.equal(votes, 1);
    assert.equal((await fetch(`${base}/api/music-likes/likes/${playlistLikeId(1)}`, { method: 'PUT', headers: { ...headers, Origin: 'https://other.example' }, body })).status, 403);
    assert.equal((await fetch(`${base}/api/selection`, { method: 'POST', headers, body })).status, 403);
    assert.deepEqual(app.currentState().playlists[0].selected, ['mac:10']);
  } finally { await new Promise(resolve => app.server.close(resolve)); }
});
