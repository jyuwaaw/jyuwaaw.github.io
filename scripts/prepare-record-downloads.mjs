import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const manifestPath = process.argv[2];
if (!manifestPath) throw new Error('Provide the original cover manifest path.');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const source = dirname(manifestPath);
const output = fileURLToPath(new URL('../public/music-prototype/downloads/', import.meta.url));
await mkdir(output, { recursive: true });
let index = 0, bytes = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (index < manifest.playlists.length) {
    const playlist = manifest.playlists[index++];
    const original = join(source, playlist.file);
    const metadata = await sharp(original).metadata();
    if (metadata.width !== 1254 || metadata.height !== 1254) throw new Error(`Unexpected cover dimensions: ${playlist.number}`);
    // Full dimensions, broadly compatible JPEG, without publishing 276MB of
    // original PNGs. Original generated files are never changed.
    const image = await sharp(original).jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer();
    await writeFile(join(output, `${String(playlist.number).padStart(3, '0')}.jpg`), image);
    bytes += image.length;
  }
}));
console.log(JSON.stringify({ covers: manifest.playlists.length, dimensions: [1254, 1254], totalMB: +(bytes / 1024 / 1024).toFixed(2) }));
