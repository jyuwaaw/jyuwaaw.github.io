// Explicit one-time import from the existing verified backup + merge report.
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { bindLibrary, normal, artistKey } from './model.mjs';
import { repo, statePath, atomicJSON, readMusic } from './storage.mjs';

const [manifestPath, backupDirectory] = process.argv.slice(2);
if (!manifestPath || !backupDirectory) throw new Error('Provide cover manifest and backup directory.');
try { await access(statePath); throw new Error('Existing selections found. Bootstrap will not overwrite them.'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const readJSON = path => readFile(path, 'utf8').then(JSON.parse);
const [manifest, backup, mergeReport, catalogue] = await Promise.all([
  readJSON(manifestPath), readJSON(join(backupDirectory, 'jyuwaaw 歌单备份.json')),
  readJSON(join(backupDirectory, '歌单整理进度.json')),
  readJSON(join(repo, 'src/data/prototypes/records.json')),
]);
const byURL = new Map(backup.playlists.map(p => [p.url, p]));
for (const m of mergeReport.merges) {
  const tracks = [...new Map([...m.target.tracks, ...m.source.tracks].map(t => [t.url, t])).values()];
  byURL.set(m.target.url, { ...m.target, tracks });
}
const playlists = catalogue.records.map(record => {
  const source = manifest.playlists.find(p => p.number === record.id && p.name === record.name);
  const backup = byURL.get(source?.url);
  if (!backup || backup.tracks.length !== source.trackCount) throw new Error(`Backup verification failed: ${record.name}`);
  const tracks = [...new Map(backup.tracks.map(track => {
    const artist = track.text.slice(track.title.length).trim().split(/ {2,}/)[0].trim();
    const rest = track.text.slice(track.title.length).trim().slice(artist.length).trim();
    const album = rest.startsWith(artist) ? rest.slice(artist.length).trim().replace(/\s+\d+:\d{2}\s*$/, '').trim() : '';
    const duration = track.text.match(/(\d+):(\d{2})\s*$/);
    if (!duration || !artist) throw new Error(`Missing song metadata: ${track.title}`);
    const id = `catalog:${new URL(track.url).pathname.split('/').pop()}`;
    return [id, { id, title: track.title, artist, album, durationMs: (+duration[1] * 60 + +duration[2]) * 1000, duration: `${duration[1]}:${duration[2]}`, url: track.url, present: true }];
  })).values()];
  const { picks, trackCount, ...metadata } = record;
  const selected = picks.map(pick => {
    const id = `catalog:${new URL(pick.url).pathname.split('/').pop()}`;
    if (tracks.some(t => t.id === id)) return id;
    const [minutes, seconds] = pick.duration.split(':').map(Number);
    const matches = tracks.filter(t => normal(t.title) === normal(pick.title) && artistKey(t.artist) === artistKey(pick.artist) && Math.abs(t.durationMs - (minutes * 60 + seconds) * 1000) < 2100);
    if (matches.length !== 1) throw new Error(`Cannot safely restore selection: ${record.name} / ${pick.title}`);
    return matches[0].id;
  });
  return { ...metadata, key: `backup:${record.id}`, tracks, sourceOrder: backup.tracks.map(t => `catalog:${new URL(t.url).pathname.split('/').pop()}`), present: true, sourceTrackCount: trackCount, selected };
});
const { records, ...publicConfig } = catalogue;
const seed = { formatVersion: 1, revision: 0, publicConfig, source: { accountLabel: 'jyuwaaw' }, playlists };
const state = bindLibrary(seed, await readMusic());
await atomicJSON(statePath, state);
console.log(JSON.stringify({ playlists: state.playlists.length, tracks: state.playlists.reduce((n, p) => n + p.tracks.filter(t => t.present).length, 0), selections: state.playlists.reduce((n, p) => n + p.selected.length, 0), selectedMissing: state.playlists.flatMap(p => p.tracks.filter(t => !t.present && p.selected.includes(t.id)).map(t => ({ playlist: p.name, title: t.title }))) }, null, 2));
