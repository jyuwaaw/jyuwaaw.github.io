import { readFile, writeFile } from 'node:fs/promises';
import { photoLikeId } from '../lib/photo-like-id.mjs';
import { toys, toyStatsId } from '../lib/toys.mjs';
import { musicLikeIds } from '../lib/music-like-id.mjs';
// Only these public photographs, toys, playlists and selected recordings may
// receive votes. Private/unselected library tracks never enter the registry.
const root = new URL('../', import.meta.url);
const photos = JSON.parse(await readFile(new URL('lib/generated/photography.json', root)));
const captions = JSON.parse(await readFile(new URL('lib/photography.json', root)));
const records = JSON.parse(await readFile(new URL('src/data/prototypes/records.json', root)));
const excluded = new Set(captions.filter(p => p.exclude).map(p => p.filename));
const ids = [
  ...photos.filter(p => !excluded.has(p.filename)).map(p => photoLikeId('photography', p.filename)),
  ...toys.map(t => toyStatsId(t.id)),
  ...musicLikeIds(records),
].sort();
await writeFile(new URL('workers/photo-likes/catalog.json', root), JSON.stringify(ids, null, 2) + '\n');
