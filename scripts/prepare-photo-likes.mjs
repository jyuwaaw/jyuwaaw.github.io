import { readFile, writeFile } from 'node:fs/promises';
import { photoLikeId } from '../lib/photo-like-id.mjs';
const root = new URL('../', import.meta.url);
const photos = JSON.parse(await readFile(new URL('lib/generated/photography.json', root)));
const captions = JSON.parse(await readFile(new URL('lib/photography.json', root)));
const excluded = new Set(captions.filter(p => p.exclude).map(p => p.filename));
const ids = photos.filter(p => !excluded.has(p.filename)).map(p => photoLikeId('photography', p.filename)).sort();
await writeFile(new URL('workers/photo-likes/catalog.json', root), JSON.stringify(ids, null, 2) + '\n');
