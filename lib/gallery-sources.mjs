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
export async function getPhotoSources(folder, { root = process.cwd(), publishedOnly = false } = {}) {
  const directory = path.join(root, 'public', folder);
  const entries = publishedOnly ? [] : (await fs.readdir(directory, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  })).filter(entry => entry.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
  if (!entries.length) {
    try { return JSON.parse(await fs.readFile(path.join(root, 'lib/generated', `${folder}.json`), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  }
  const previews = path.join(directory, '_web');
  await fs.mkdir(previews, { recursive: true });
  const sources = [];
  for (const entry of entries) {
    const source = path.join(directory, entry.name);
    const [stat, metadata, parsed] = await Promise.all([
      fs.stat(source), sharp(source).metadata(),
      exifr.parse(source, {
        pick: ['DateTimeOriginal', 'CreateDate', 'Model', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'City', 'State', 'Country'],
        iptc: true, xmp: true, gps: false, reviveValues: false,
      }).catch(() => ({})),
    ]);
    const key = createHash('sha256').update(`v1:${entry.name}:${stat.size}:${stat.mtimeMs}`).digest('hex').slice(0, 16);
    await Promise.all([
      ensurePreview(source, path.join(previews, `${key}-preview.webp`), 1440, 82),
      ensurePreview(source, path.join(previews, `${key}-full.webp`), 2560, 88),
    ]);
    const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
    sources.push({ filename: entry.name, src: `/${folder}/_web/${key}-preview.webp`,
      fullSrc: `/${folder}/_web/${key}-full.webp`,
      width: rotated ? metadata.height : metadata.width,
      height: rotated ? metadata.width : metadata.height, exif: parsed || {} });
  }
  return sources;
}
