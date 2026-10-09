import fs from 'node:fs/promises';
import path from 'node:path';
import { getPhotoSources } from '../lib/gallery-sources.mjs';

await fs.mkdir('lib/generated', { recursive: true });
for (const folder of ['photography', 'Mechanic']) {
  const sources = await getPhotoSources(folder);
  const keep = new Set(sources.flatMap(p => [path.basename(p.src), path.basename(p.fullSrc)]));
  for (const photo of sources) for (const src of [photo.src, photo.fullSrc]) {
    await fs.access(path.join('public', src));
  }
  await fs.writeFile(`lib/generated/${folder}.json`, JSON.stringify(sources, null, 2) + '\n');
  const directory = path.join('public', folder, '_web');
  for (const name of await fs.readdir(directory).catch(() => [])) {
    if (/^[a-f0-9]{16}-(preview|full)\.webp$/.test(name) && !keep.has(name)) await fs.unlink(path.join(directory, name));
  }
  console.log(`${folder}: ${sources.length} photos prepared for publication`);
}
