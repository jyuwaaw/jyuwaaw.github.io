import { mkdir, readFile, writeFile, rename, copyFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';

export const repo = process.env.RECORD_SHELF_REPO || fileURLToPath(new URL('../../', import.meta.url));
export const dataDirectory = process.env.RECORD_SHELF_DATA || join(homedir(), 'Library', 'Application Support', 'Benji Record Shelf');
export const statePath = join(dataDirectory, 'library.json');
const exec = promisify(execFile);

export async function atomicJSON(path, value) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  await rename(temp, path);
}
export const loadState = () => readFile(statePath, 'utf8').then(JSON.parse);
export async function saveState(next) {
  const backups = join(dataDirectory, 'backups');
  await mkdir(backups, { recursive: true, mode: 0o700 });
  const day = new Date().toISOString().slice(0, 10);
  try { await copyFile(statePath, join(backups, `library-${day}.json`), constants.COPYFILE_EXCL); } catch (error) { if (!['ENOENT', 'EEXIST'].includes(error.code)) throw error; }
  // Full daily recovery copy plus small revisioned choices, rather than copying
  // thousands of songs again for every individual checkbox click.
  const previous = await loadState();
  await atomicJSON(join(backups, `choices-${previous.revision}.json`), { revision: previous.revision, playlists: previous.playlists.map(p => ({ key: p.key, selected: p.selected })) });
  await atomicJSON(statePath, next);
}
export async function readMusic() {
  if (process.platform !== 'darwin') throw new Error('自动读取需要在这台 Mac 上运行。');
  const source = fileURLToPath(new URL('./collector.swift', import.meta.url));
  const hash = createHash('sha256').update(await readFile(source)).digest('hex').slice(0, 12);
  const binary = join(dataDirectory, `music-reader-${hash}`);
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  try { await readFile(binary); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await exec('/usr/bin/xcrun', ['swiftc', source, '-o', binary], { timeout: 120000, maxBuffer: 2_000_000 });
  }
  const { stdout } = await exec(binary, [], { timeout: 45000, maxBuffer: 64_000_000 });
  return JSON.parse(stdout);
}
