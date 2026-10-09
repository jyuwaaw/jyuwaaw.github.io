import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import exifr from 'exifr';

async function ensurePreview(source, destination, edge, quality) {
  try {
    await fs.access(destination);
  } catch {
    // A unique temporary file keeps concurrent dev requests from serving partial images.
    const temporary = `${destination}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    try {
      await sharp(source).rotate().resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
        .webp({ quality }).toFile(temporary);
      await fs.rename(temporary, destination);
    } finally {
      await fs.rm(temporary, { force: true });
    }
  }
}

// Originals stay local. Clean checkouts read the committed, GPS-free manifest.
export async function getPhotoSources(folder, { root = process.cwd(), publishedOnly = false, exclude = [] } = {}) {
  const removed = new Set(exclude);
  let published = [];
  try { published = JSON.parse(await fs.readFile(path.join(root, 'lib/generated', `${folder}.json`), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const sources = new Map(published.filter(photo => !removed.has(photo.filename)).map(photo => [photo.filename, photo]));
  const directory = path.join(root, 'public', folder);
  const entries = publishedOnly ? [] : (await fs.readdir(directory, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  })).filter(entry => entry.isFile() && !removed.has(entry.name) && /\.(jpe?g|png|webp|avif)$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
  if (!entries.length) return [...sources.values()];
  const previews = path.join(directory, '_web');
  await fs.mkdir(previews, { recursive: true });
  for (const entry of entries) {
    const source = path.join(directory, entry.name);
    const [stat, metadata, parsed, bytes] = await Promise.all([
      fs.stat(source), sharp(source).metadata(),
      exifr.parse(source, {
        pick: ['DateTimeOriginal', 'CreateDate', 'Model', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'City', 'State', 'Country'],
        iptc: true, xmp: true, gps: false, reviveValues: false,
      }).catch(() => ({})),
      fs.readFile(source),
    ]);
    const sourceHash = createHash('sha256').update(bytes).digest('hex');
    const previous = sources.get(entry.name);
    const legacyKey = createHash('sha256').update(`v1:${entry.name}:${stat.size}:${stat.mtimeMs}`).digest('hex').slice(0, 16);
    // Adopt existing previews once; later filesystem timestamp changes do not
    // produce new binaries or new URLs when the original bytes are unchanged.
    const reusable = previous?.sourceHash === sourceHash || (!previous?.sourceHash && previous?.src === `/${folder}/_web/${legacyKey}-preview.webp`);
    const key = createHash('sha256').update(`v2:${sourceHash}`).digest('hex').slice(0, 16);
    const src = reusable ? previous.src : `/${folder}/_web/${key}-preview.webp`;
    const fullSrc = reusable ? previous.fullSrc : `/${folder}/_web/${key}-full.webp`;
    await Promise.all([
      ensurePreview(source, path.join(root, 'public', src), 1440, 82),
      ensurePreview(source, path.join(root, 'public', fullSrc), 2560, 88),
    ]);
    const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
    sources.set(entry.name, { filename: entry.name, sourceHash, src, fullSrc,
      width: rotated ? metadata.height : metadata.width,
      height: rotated ? metadata.width : metadata.height, exif: parsed || {} });
  }
  return [...sources.values()].sort((a, b) => a.filename.localeCompare(b.filename, 'en', { numeric: true }));
}
