import { mkdir, writeFile, readFile, unlink, copyFile, cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { repo, dataDirectory } from './storage.mjs';
import { build } from 'esbuild';

const exec = promisify(execFile);
const label = 'com.benji.record-shelf';
const domain = `gui/${process.getuid()}`;
const directory = join(homedir(), 'Library', 'LaunchAgents');
const plistPath = join(directory, `${label}.plist`);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const action = process.argv[2];
if (process.platform !== 'darwin') throw new Error('This service runs on macOS.');
if (action === 'install') {
  await mkdir(directory, { recursive: true }); await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const installed = join(dataDirectory, 'service');
  const assets = join(dataDirectory, 'app');
  const covers = join(dataDirectory, 'covers');
  try {
    const existing = await readFile(plistPath, 'utf8');
    if (!existing.includes(escape(join(repo, 'tools/record-shelf/server.mjs'))) && !existing.includes(escape(join(installed, 'server.mjs')))) throw new Error('An existing service points elsewhere. Review it before replacing.');
    try { await exec('/bin/launchctl', ['bootout', `${domain}/${label}`]); } catch (e) { if (!String(e.stderr).includes('Could not find service') && !String(e.stderr).includes('No such process')) throw e; }
  } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await mkdir(installed, { recursive: true, mode: 0o700 });
  for (const file of ['server.mjs', 'storage.mjs', 'model.mjs', 'collector.swift']) await copyFile(join(repo, 'tools/record-shelf', file), join(installed, file));
  await cp(join(repo, 'public/music-prototype/covers'), covers, { recursive: true });
  await build({ entryPoints: [join(repo, 'tools/record-shelf/client.jsx')], bundle: true, minify: true, jsx: 'automatic', outdir: assets, entryNames: 'app', define: { 'process.env.NODE_ENV': '"production"' } });
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>/usr/bin/env</string><string>node</string><string>${escape(join(installed, 'server.mjs'))}</string></array>
<key>WorkingDirectory</key><string>${escape(dataDirectory)}</string>
<key>EnvironmentVariables</key><dict><key>RECORD_SHELF_DATA</key><string>${escape(dataDirectory)}</string><key>RECORD_SHELF_REPO</key><string>${escape(repo)}</string><key>RECORD_SHELF_ASSETS</key><string>${escape(assets)}</string><key>RECORD_SHELF_COVERS</key><string>${escape(covers)}</string><key>PATH</key><string>${escape(dirname(process.execPath))}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>30</integer>
<key>StandardOutPath</key><string>${escape(join(dataDirectory, 'service.log'))}</string>
<key>StandardErrorPath</key><string>${escape(join(dataDirectory, 'service-error.log'))}</string>
</dict></plist>`;
  await writeFile(plistPath, body, { mode: 0o600 });
  await exec('/bin/launchctl', ['bootstrap', domain, plistPath]);
  console.log('已开启：登录 Mac 后运行唱片架，按管理页设置的频率同步。');
} else if (action === 'uninstall') {
  try { await exec('/bin/launchctl', ['bootout', `${domain}/${label}`]); } catch (e) { if (!String(e.stderr).includes('No such process')) throw e; }
  await unlink(plistPath);
  console.log('已关闭后台运行。歌单和选曲备份保留。');
} else if (action === 'status') {
  try { const { stdout } = await exec('/bin/launchctl', ['print', `${domain}/${label}`]); console.log(stdout); } catch { console.log('后台服务未启动。'); }
} else throw new Error('Use install, uninstall, or status.');
