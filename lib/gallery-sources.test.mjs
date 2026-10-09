import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { getPhotoSources } from './gallery-sources.mjs';

test('clean checkouts use the published manifest; local selections replace it', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gallery-sources-'));
  try {
    await fs.mkdir(path.join(root, 'lib/generated'), { recursive: true });
    const published = [{ filename: 'published.jpg', width: 20, height: 10, exif: {} }];
    await fs.writeFile(path.join(root, 'lib/generated/photography.json'), JSON.stringify(published));
    assert.deepEqual(await getPhotoSources('photography', { root }), published);
    await fs.mkdir(path.join(root, 'public/photography'), { recursive: true });
    await sharp({ create: { width: 32, height: 16, channels: 3, background: '#234' } }).jpeg()
      .toFile(path.join(root, 'public/photography/local.jpg'));
    const local = await getPhotoSources('photography', { root });
    assert.deepEqual(local.map(p => p.filename), ['local.jpg']);
    assert.equal(local[0].width, 32);
    assert.equal(local[0].height, 16);
    for (const src of [local[0].src, local[0].fullSrc]) {
      const metadata = await sharp(path.join(root, 'public', src)).metadata();
      assert.equal(metadata.format, 'webp');
      assert.equal(metadata.exif, undefined);
    }
    assert.deepEqual(await getPhotoSources('photography', { root, publishedOnly: true }), published);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('missing collections are empty and malformed manifests fail explicitly', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gallery-empty-'));
  try {
    assert.deepEqual(await getPhotoSources('photography', { root }), []);
    await fs.mkdir(path.join(root, 'lib/generated'), { recursive: true });
    await fs.writeFile(path.join(root, 'lib/generated/photography.json'), '{broken');
    await assert.rejects(getPhotoSources('photography', { root }), SyntaxError);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
