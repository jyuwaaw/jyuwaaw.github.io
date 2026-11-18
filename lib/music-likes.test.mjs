import test from 'node:test';
import assert from 'node:assert/strict';
import { musicLikeIds, playlistLikeId, songLikeId, withMusicLikeIds } from './music-like-id.mjs';
import { photoLikeId } from './photo-like-id.mjs';
import { forwardMusicLike, musicLikesAPI } from '../tools/record-shelf/likes.mjs';

const song = { title: 'Song', url: 'https://music.apple.com/us/song/title/123' };
const catalogue = { records: [{ id: 1, name: 'Playlist', picks: [song] }, { id: 2, name: 'Another playlist', picks: [{ ...song, url: 'https://music.apple.com/gb/song/different-slug/123' }] }] };
const visitor = '11111111-1111-4111-8111-111111111111';

test('stable public identities ignore title, order and URL slug but distinguish recordings and photos', () => {
  const decorated = withMusicLikeIds(catalogue);
  const reordered = withMusicLikeIds({ records: [{ ...catalogue.records[0], name: 'Renamed', cover: 'new.webp' }] });
  assert.equal(decorated.records[0].likeId, reordered.records[0].likeId);
  assert.equal(decorated.records[0].picks[0].likeId, decorated.records[1].picks[0].likeId);
  assert.notEqual(songLikeId(song), songLikeId({ ...song, url: 'https://music.apple.com/us/song/live/124' }));
  assert.notEqual(playlistLikeId(1), photoLikeId('photography', '1'));
  assert.notEqual(playlistLikeId(123), songLikeId(song));
  assert.equal(musicLikeIds(catalogue).length, 3);
  for (const url of ['https://music.apple.com/us/search?term=Song', 'https://other.example/us/song/title/123', 'http://music.apple.com/us/song/title/123', 'invalid']) assert.equal(songLikeId({ url }), null);
});

test('local preview forwards only public music IDs and minimal vote data to the existing service', async () => {
  let sent;
  const fetcher = async (url, init) => { sent = { url, ...init, body: JSON.parse(init.body) }; return Response.json({ count: 1, liked: true }); };
  const id = songLikeId(song);
  const result = await forwardMusicLike({ path: `/likes/${id}`, method: 'PUT', body: { visitor, liked: true, privateLibrary: 'never forward this' } }, catalogue, fetcher);
  assert.equal(sent.url, `${musicLikesAPI}/likes/${id}`);
  assert.equal(sent.headers.Origin, 'https://jyuwaaw.github.io');
  assert.deepEqual(sent.body, { visitor, liked: true });
  assert.deepEqual(result.body, { count: 1, liked: true });
});

test('preview rejects unrelated IDs and methods, and never fabricates counts on service failure', async () => {
  let requests = 0;
  const fetcher = async () => { requests++; throw new Error('offline'); };
  const invalid = await forwardMusicLike({ path: '/likes/query', method: 'POST', body: { visitor, ids: [photoLikeId('photography', 'one.jpg')] } }, catalogue, fetcher);
  assert.equal(invalid.status, 400);
  assert.equal(requests, 0);
  const failed = await forwardMusicLike({ path: `/likes/${songLikeId(song)}`, method: 'PUT', body: { visitor, liked: true } }, catalogue, fetcher);
  assert.equal(failed.status, 503);
  assert.equal(failed.body.count, undefined);
  const views = await forwardMusicLike({ path: '/views/query', method: 'POST', body: { visitor, ids: [songLikeId(song)] } }, catalogue, fetcher);
  assert.equal(views.status, 404);
});
