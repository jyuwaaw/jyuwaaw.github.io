import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { getPhotoSources } from './gallery-sources.mjs';
const exec = promisify(execFile);
const prepare = fileURLToPath(new URL('../scripts/prepare-galleries.mjs', import.meta.url));
const cleanExport = fileURLToPath(new URL('../scripts/clean-gallery-export.mjs', import.meta.url));
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gallery-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'lib/generated'), { recursive: true });
  await fs.mkdir(path.join(root, 'public/photography'), { recursive: true });
  for (const name of ['photography', 'mechanic']) await fs.writeFile(path.join(root, `lib/${name}.json`), '[]');
  return root;
}
const original = (root, name, color = '#234') => sharp({ create: { width: 32, height: 16, channels: 3, background: color } })
  .jpeg().toFile(path.join(root, 'public/photography', name));
const prepareAt = root => exec(process.execPath, [prepare], { cwd: root });
const publishedAt = root => getPhotoSources('photography', { root, publishedOnly: true });

test('a fresh checkout can add one photo without deleting published photos or assets', async t => {
  const root = await fixture(t);
  await original(root, 'first.jpg');
  await original(root, 'second.jpg', '#456');
  await prepareAt(root);
  const before = await publishedAt(root);
  for (const p of before) await fs.unlink(path.join(root, 'public/photography', p.filename));
  await original(root, 'new.jpg', '#789');
  await prepareAt(root);
  const after = await publishedAt(root);
  assert.deepEqual(after.map(p => p.filename), ['first.jpg', 'new.jpg', 'second.jpg']);
  for (const photo of before) {
    assert.deepEqual(after.find(p => p.filename === photo.filename), photo);
    for (const src of [photo.src, photo.fullSrc]) await fs.access(path.join(root, 'public', src));
  }
});

test('touching originals keeps URLs; replacing the same name updates only that photo', async t => {
  const root = await fixture(t);
  await original(root, 'first.jpg');
  await original(root, 'second.jpg', '#456');
  await prepareAt(root);
  const before = await publishedAt(root);
  await fs.utimes(path.join(root, 'public/photography/first.jpg'), new Date(), new Date('2030-01-01'));
  await prepareAt(root);
  assert.deepEqual(await publishedAt(root), before);
  await original(root, 'first.jpg', '#f00');
  await prepareAt(root);
  const after = await publishedAt(root);
  assert.equal(after.length, 2);
  assert.notEqual(after[0].src, before[0].src);
  assert.deepEqual(after[1], before[1]);
  for (const src of [after[0].src, after[0].fullSrc]) {
    const metadata = await sharp(path.join(root, 'public', src)).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.exif, undefined);
  }
});

test('explicit exclusion removes only selected photos, even with originals still present', async t => {
  const root = await fixture(t);
  await original(root, 'first.jpg');
  await original(root, 'second.jpg', '#456');
  await prepareAt(root);
  const before = await publishedAt(root);
  await fs.writeFile(path.join(root, 'lib/photography.json'), JSON.stringify([{ filename: 'first.jpg', exclude: true }]));
  await prepareAt(root);
  assert.deepEqual((await publishedAt(root)).map(p => p.filename), ['second.jpg']);
  await fs.access(path.join(root, 'public/photography/first.jpg'));
  await assert.rejects(fs.access(path.join(root, 'public', before[0].src)), { code: 'ENOENT' });
  await prepareAt(root);
  assert.deepEqual((await publishedAt(root)).map(p => p.filename), ['second.jpg']);
});

test('empty collections and missing export folders succeed; malformed manifests fail', async t => {
  const root = await fixture(t);
  await prepareAt(root);
  assert.deepEqual(await publishedAt(root), []);
  await exec(process.execPath, [cleanExport], { cwd: root });
  await fs.mkdir(path.join(root, 'out/photography/_web'), { recursive: true });
  await fs.writeFile(path.join(root, 'out/photography/original.JPG'), 'original');
  await fs.writeFile(path.join(root, 'out/photography/_web/preview.webp'), 'preview');
  await exec(process.execPath, [cleanExport], { cwd: root });
  await assert.rejects(fs.access(path.join(root, 'out/photography/original.JPG')), { code: 'ENOENT' });
  await fs.access(path.join(root, 'out/photography/_web/preview.webp'));
  await fs.writeFile(path.join(root, 'lib/generated/photography.json'), '{broken');
  await assert.rejects(getPhotoSources('photography', { root }), SyntaxError);
});
