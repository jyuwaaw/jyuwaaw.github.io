import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RecordShelf from '../../src/components/music-prototype/RecordShelf.jsx';
import './manager.css';

async function request(path, body, signal) {
  const response = await fetch(`/api/${path}`, { signal, ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shelf-Session': document.querySelector('meta[name=shelf-session]').content }, body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || '暂时无法连接，请重试。'), { status: response.status });
  return data;
}
const formatTime = time => time ? new Date(time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '尚未同步';
const selectedCount = p => p.selected.filter(id => p.present && p.tracks.some(t => t.id === id && t.present)).length;

function Manager() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('选择会自动保存');
  const [active, setActive] = useState(null);
  const [playlistQuery, setPlaylistQuery] = useState('');
  const [trackQuery, setTrackQuery] = useState('');
  const [view, setView] = useState('all');
  const guard = useRef(false);
  useEffect(() => {
    const abort = new AbortController();
    request('library', null, abort.signal).then(setData).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    const refresh = () => { if (!guard.current) request('library', null, abort.signal).then(setData).catch(() => {}); };
    window.addEventListener('focus', refresh);
    return () => { abort.abort(); window.removeEventListener('focus', refresh); };
  }, []);
  const playlists = useMemo(() => [...(data?.playlists || [])].sort((a, b) => a.featuredRank - b.featuredRank), [data]);
  const visiblePlaylists = playlists.filter(p => `${p.name} ${p.category}`.toLocaleLowerCase().includes(playlistQuery.trim().toLocaleLowerCase()));
  const playlist = playlists.find(p => p.key === active) || playlists[0];
  const selected = useMemo(() => new Set(playlist?.selected || []), [playlist]);
  const tracks = playlist?.tracks.filter(t => (view === 'all' || view === 'selected' && selected.has(t.id) || view === 'removed' && (!t.present || !playlist.present)) && `${t.title} ${t.artist} ${t.album}`.toLocaleLowerCase().includes(trackQuery.trim().toLocaleLowerCase())) || [];
  async function mutate(path, body, label) {
    if (guard.current) return;
    guard.current = true; setBusy(label); setError('');
    try {
      const result = await request(path, { ...body, revision: data.revision });
      if (result.playlists) setData(result);
      setMessage(result.message || (path === 'sync' ? '同步完成，已有选曲已保留' : '已保存到这台 Mac'));
    } catch (e) {
      setError(e.message);
      if (e.status === 409 || path === 'sync') { try { setData(await request('library')); } catch {} }
    } finally { guard.current = false; setBusy(''); }
  }
  if (!data) return <main className="rm-loading"><h1>唱片架 · 选曲</h1><p role="status">{error || '正在打开歌单…'}</p>{error && <button onClick={() => window.location.reload()}>重新打开</button>}</main>;
  const totalSelected = playlists.reduce((n, p) => n + selectedCount(p), 0);
  const missing = playlist.tracks.filter(t => !t.present || !playlist.present).length;
  return <div className="rm-app">
    <header className="rm-top"><div className="rm-brand"><span className="rm-disc" aria-hidden="true" /><div><small>BENJI'S RECORD SHELF</small><h1>唱片架<span> / 选曲</span></h1></div></div><a className="rm-preview" href="/shelf/" target="_blank" rel="noreferrer">看看唱片架 ↗</a></header>
    <section className="rm-sync" aria-label="同步设置"><div><strong>Mac「音乐」 <span>· {data.source.accountLabel}</span></strong><p>{busy === 'sync' ? '正在读取歌单…' : `上次同步 ${formatTime(data.source.lastSyncAt)}`}<span> · 只读取，不改动原歌单</span></p></div><div className="rm-sync-actions"><label>定期同步 <select aria-label="定期同步" value={data.source.intervalHours} disabled={!!busy} onChange={e => mutate('schedule', { intervalHours: Number(e.target.value) }, 'schedule')}><option value="24">每天</option><option value="6">每 6 小时</option><option value="168">每周</option><option value="0">手动</option></select></label><button disabled={!!busy} onClick={() => mutate('sync', {}, 'sync')}>{busy === 'sync' ? '同步中…' : '立即同步'}</button></div></section>
    <div className="rm-service-note">在这台 Mac 上更新；关机或休眠时，下次运行再同步。<span>{playlists.filter(p => p.present).length} 张歌单 · {totalSelected} 首选曲</span></div>
    {(error || data.source.lastError) && <div className="rm-error" role="alert">{error || data.source.lastError}</div>}
    <div className="rm-layout"><aside className="rm-playlists" aria-label="选择歌单"><label className="rm-field"><span>找歌单</span><input type="search" placeholder="歌单名或分类" aria-label="查找歌单" value={playlistQuery} onChange={e => setPlaylistQuery(e.target.value)} /></label><div className="rm-playlist-list">{visiblePlaylists.map(p => <button key={p.key} className={`rm-playlist ${p.key === playlist.key ? 'is-active' : ''}`} aria-pressed={p.key === playlist.key} onClick={() => { setActive(p.key); setTrackQuery(''); setView('all'); }}>{p.cover ? <img src={p.cover} width="46" height="46" alt="" loading="lazy" /> : <span className="rm-cover-placeholder">♫</span>}<span><strong>{p.name}</strong><small>{!p.present ? '原歌单已移除' : `${p.sourceTrackCount} 首 · 已选 ${selectedCount(p)}`}</small></span></button>)}{!visiblePlaylists.length && <p className="rm-no-playlists">没有找到这张歌单。</p>}</div></aside>
    <main className="rm-editor"><div className="rm-playlist-heading">{playlist.cover && <img src={playlist.cover} width="92" height="92" alt="" />}<div><small>{playlist.category}</small><h2>{playlist.name}</h2><p>勾选的歌曲会放到网站上。<span>已选 {selectedCount(playlist)} 首</span></p></div></div>
    <div className="rm-song-tools"><div role="group" aria-label="筛选曲目">{[['all', '全部曲目'], ['selected', '已选'], ['removed', `已移除${missing ? ` ${missing}` : ''}`]].map(([key, label]) => <button key={key} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}</div><input type="search" placeholder="歌曲或歌手" aria-label="查找歌曲" value={trackQuery} onChange={e => setTrackQuery(e.target.value)} /></div>
    <div className="rm-columns"><span>在网站展示</span><span>歌曲 / 歌手</span><span>时长</span></div>
    <div className="rm-song-list">{tracks.map(t => <div key={t.id} className={`rm-song ${selected.has(t.id) ? 'is-selected' : ''} ${!t.present || !playlist.present ? 'is-removed' : ''}`}><label className="rm-check"><input type="checkbox" aria-label={`展示 ${t.title} — ${t.artist}`} checked={selected.has(t.id)} disabled={!!busy || ((!t.present || !playlist.present) && !selected.has(t.id))} onChange={e => mutate('selection', { playlistKey: playlist.key, trackId: t.id, selected: e.target.checked }, 'save')} /><span className="rm-sr">在网站展示</span></label><div className="rm-song-copy"><strong>{t.title}</strong><small>{t.artist}{!t.present || !playlist.present ? <em>已从原歌单移除，网站暂不展示</em> : !t.url ? <em>新曲目 · 打开 Apple Music 搜索</em> : null}</small></div><span className="rm-time">{t.duration}</span><a href={t.url || `https://music.apple.com/us/search?term=${encodeURIComponent(`${t.title} ${t.artist}`)}`} target="_blank" rel="noreferrer" aria-label={`${t.url ? '试听' : '搜索'} ${t.title}`}>↗</a></div>)}{!tracks.length && <div className="rm-empty">{view === 'selected' ? '还没选曲，回到全部曲目勾几首。' : view === 'removed' ? '没有已移除的歌曲。' : '没有找到这首歌，换个名字试试。'}</div>}</div>
    <p className="rm-footnote">新同步的歌曲默认不勾选。原歌单移除的歌曲会留在「已移除」里，供你核对。</p>
    </main></div>
    <footer className="rm-savebar"><span role="status" aria-live="polite"><i />{busy === 'save' ? '正在保存…' : message}</span><div><a href="/api/backup" download>备份选曲</a><button disabled={!!busy} onClick={() => mutate('export', {}, 'export')}>保存待发布版本</button></div></footer>
  </div>;
}

function ShelfPreview() {
  const [catalogue, setCatalogue] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    const load = () => request('catalogue', null, abort.signal).then(setCatalogue).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    load(); window.addEventListener('focus', load);
    return () => { abort.abort(); window.removeEventListener('focus', load); };
  }, []);
  return <><nav className="rm-preview-nav"><a href="/">← 回到选曲</a><span>网站预览 · A 唱片墙</span></nav>{catalogue ? <RecordShelf catalogue={catalogue} showSwitcher={false} /> : <p className="rm-loading">{error || '正在打开唱片架…'}</p>}</>;
}

createRoot(document.getElementById('root')).render(window.location.pathname === '/shelf/' ? <ShelfPreview /> : <Manager />);
