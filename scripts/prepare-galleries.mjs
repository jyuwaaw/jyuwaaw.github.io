import fs from 'node:fs/promises';
import path from 'node:path';
import { getPhotoSources } from '../lib/gallery-sources.mjs';

await fs.mkdir('lib/generated', { recursive: true });
for (const folder of ['photography', 'Mechanic']) {
  const captions = JSON.parse(await fs.readFile(`lib/${folder.toLowerCase()}.json`, 'utf8'));
  const sources = await getPhotoSources(folder, { exclude: captions.filter(photo => photo.exclude).map(photo => photo.filename) });
  const keep = new Set(sources.flatMap(p => [path.basename(p.src), path.basename(p.fullSrc)]));
  for (const photo of sources) for (const src of [photo.src, photo.fullSrc]) {
    await fs.access(path.join('public', src));
  }
  const manifest = `lib/generated/${folder}.json`;
  const temporary = `${manifest}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(sources, null, 2) + '\n');
  await fs.rename(temporary, manifest);
  const directory = path.join('public', folder, '_web');
  for (const name of await fs.readdir(directory).catch(error => { if (error.code === 'ENOENT') return []; throw error; })) {
    if (/^[a-f0-9]{16}-(preview|full)\.webp$/.test(name) && !keep.has(name)) await fs.unlink(path.join(directory, name));
  }
  console.log(`${folder}: ${sources.length} photos prepared for publication`);
}
