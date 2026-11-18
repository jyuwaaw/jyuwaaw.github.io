// PROTOTYPE: three different ways to browse the same real playlist collection.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PhotoLikeButton from '../PhotoLikeButton.jsx';
import usePhotoLikes from '../usePhotoLikes.js';
import { openRecordDialog } from './record-motion.js';
import { shelfCopy } from './shelf-copy.js';
import './record-shelf.css';

const variants = [
  { key: 'A', name: '唱片墙', title: '随手抽一张，听几首。' },
  { key: 'B', name: '主题唱片箱', title: '翻一箱喜欢的声音。' },
  { key: 'C', name: '聆听角', title: '这一面，留给今天。' },
];
const categoryOrder = ['开车与旅行', '放松与情绪', '风格选集', '华语与粤语', '日韩', '歌手与影视游戏', '日常与运动', '收藏与发现', '年代与节日'];
const MusicLikes = createContext(null);
const Copy = createContext(shelfCopy.zh);

function Like({ item, song = false, className = '' }) {
  const copy = useContext(Copy);
  const services = useContext(MusicLikes);
  const likes = song ? services?.songs : services?.playlists;
  const value = likes?.likes[item.likeId];
  if (!value) return null;
  return <PhotoLikeButton {...value} className={`rs-like ${className}`} disabled={Boolean(likes.pending[item.likeId])} onToggle={() => likes.toggle(item.likeId)} ariaLabel={copy.like(value.liked, song, item.name || item.title, value.count)} />;
}

function LikeStatus({ includeSongs = false }) {
  const copy = useContext(Copy);
  const services = useContext(MusicLikes);
  const likes = services?.playlists.error ? services.playlists : includeSongs ? services?.songs : services?.playlists;
  if (!likes?.error) return null;
  const storage = likes.error.includes('storage');
  return <p className="rs-like-status" role="status">{storage ? copy.storage : copy.error}<button onClick={likes.retry}>{copy.retry}</button></p>;
}

function Arrow({ direction = 'right' }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={direction === 'left' ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Cover({ record, ...props }) {
  return record.cover ? <img src={record.cover} {...props} /> : <span className="rs-new-cover" aria-hidden="true">♫</span>;
}

function Disc({ record, className = '' }) {
  return <span className={`rs-vinyl ${className}`} aria-hidden="true"><span className="rs-label"><Cover record={record} alt="" loading="lazy" /><i /></span></span>;
}

function Record({ record, onOpen, eager = false }) {
  const copy = useContext(Copy);
  return <div className="rs-record-card"><button className="rs-record" data-record-id={record.id} onClick={event => onOpen(record.id, event.currentTarget)} aria-label={copy.open(record.name, record.picks.length)}>
    <span className="rs-object" style={{ '--label-color': record.color }}>
      <Disc record={record} />
      <span className="rs-sleeve"><Cover record={record} width="640" height="640" loading={eager ? 'eager' : 'lazy'} alt="" draggable="false" /></span>
    </span>
    <span className="rs-record-title">{record.name}</span>
    <span className="rs-record-caption">{record.tags.slice(0, 2).join(' / ') || record.category} <span>· {copy.tracks(record.picks.length)}</span></span>
  </button><Like item={record} className="rs-record-like" /></div>;
}

function TrackList({ record }) {
  const copy = useContext(Copy);
  const complete = record.picks.length >= (record.availableTrackCount ?? record.trackCount);
  return <div className="rs-tracks">
    <div className="rs-side"><span>A SIDE</span><h3>{copy.trackList(record.picks.length, complete)}</h3></div>
    <ol>
      {record.picks.map((track, index) => <li key={track.url}>
        <span className="rs-track-no">{String(index + 1).padStart(2, '0')}</span>
        <a href={track.url} target="_blank" rel="noreferrer" aria-label={copy.trackLink(track.title, track.linkType === 'search')}>
          <span className="rs-track-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
          <span className="rs-duration">{track.linkType === 'search' ? copy.searchTrack : track.duration}</span><span className="rs-track-go" aria-hidden="true">↗</span>
        </a>
        <Like item={track} song className="rs-song-like" />
      </li>)}
    </ol>
    {record.picks.length > 0 && <p className="rs-listen-note">{copy.listen} <span>↗</span></p>}
  </div>;
}

function RecordDetail({ record, inline = false }) {
  const copy = useContext(Copy);
  return <div className={`rs-detail ${inline ? 'rs-detail-inline' : ''}`}>
    <div className="rs-detail-visual">
      <div className="rs-detail-art"><Disc record={record} /><Cover record={record} className="rs-detail-cover" width="640" height="640" alt={copy.cover(record.name)} /></div>
      {record.coverDownload && <a className="rs-cover-download" href={record.coverDownload} download={`${record.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')}-${copy.suffix}.jpg`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" /></svg>{copy.download}<span>{copy.quality}</span></a>}
    </div>
    <div className="rs-detail-copy">
      <span className="rs-detail-category">{record.category}</span>
      <div className="rs-detail-title"><h2>{record.name}</h2><Like item={record} className="rs-detail-like" /></div>
      <p className="rs-record-note">{record.note}</p>
      <div className="rs-detail-tags">{record.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <TrackList record={record} />
      <p className="rs-whole-count">{copy.whole(record.trackCount, record.picks.length)}</p>
      <LikeStatus includeSongs />
    </div>
  </div>;
}

function RecordDialog({ record, origin, onClose }) {
  const copy = useContext(Copy);
  const dialog = useRef(null);
  const motion = useRef(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  useEffect(() => {
    if (!record) return;
    motion.current = openRecordDialog(dialog.current, origin.current, () => closeCallback.current());
    return () => { motion.current?.destroy(); motion.current = null; };
  }, [record?.id]);
  return <dialog ref={dialog} className="rs-dialog" aria-label={record?.name || copy.dialog} onCancel={event => { event.preventDefault(); motion.current?.close(); }} onClick={event => { if (event.target === event.currentTarget) motion.current?.close(); }}>
    <div className="rs-dialog-sheet">
      <button className="rs-dialog-close" onClick={() => motion.current?.close()} aria-label={copy.close}>×</button>
      {record && <RecordDetail record={record} />}
    </div>
    {record && <div className="rs-flight-art" aria-hidden="true"><Disc record={record} /><Cover record={record} className="rs-detail-cover" alt="" /></div>}
  </dialog>;
}

function Wall({ records, onOpen, columns }) {
  const copy = useContext(Copy);
  const rows = Array.from({ length: Math.ceil(records.length / columns) }, (_, row) => records.slice(row * columns, (row + 1) * columns));
  return <div className="rs-cabinet" aria-label={copy.wall}>
    {rows.map((row, index) => <div className="rs-shelf" key={row[0].id} style={{ '--columns': columns }}>
      <div className="rs-shelf-records">{row.map(record => <Record key={record.id} record={record} onOpen={onOpen} eager={index < 2} />)}</div>
      <div className="rs-plank" aria-hidden="true" />
    </div>)}
  </div>;
}

function Crates({ groups, onOpen, notes }) {
  return <div className="rs-crates">{groups.map(([category, records]) => <section className="rs-crate" key={category}>
    <div className="rs-crate-heading"><div><h2>{category}</h2><p>{notes[category]}</p></div><span>{records.length} 张</span></div>
    <div className="rs-crate-inside" role="region" aria-label={`${category}，横向翻找唱片`} tabIndex="0">
      {records.map(record => <Record key={record.id} record={record} onOpen={onOpen} />)}
    </div>
    <div className="rs-crate-front"><span>{category}</span><small>往旁边翻一翻 →</small></div>
  </section>)}</div>;
}

function ListeningCorner({ groups, record, onOpen }) {
  return <div className="rs-corner">
    <aside className="rs-listening-desk" aria-label="抽出的唱片"><RecordDetail record={record} inline /></aside>
    <div className="rs-spine-cabinet">{groups.map(([category, records]) => <section className="rs-spine-shelf" key={category}>
      <h2>{category}<span>{records.length} 张</span></h2>
      <div className="rs-spines">{records.map(item => <button className={`rs-spine ${item.id === record.id ? 'is-out' : ''}`} key={item.id} onClick={() => onOpen(item.id)} title={item.name} aria-label={`抽出 ${item.name}`} aria-pressed={item.id === record.id} style={{ '--spine-color': item.color, '--spine-cover': `url("${item.cover}")` }}>
        <span className="rs-spine-edge"><i />{item.name}</span><img src={item.cover} width="640" height="640" alt="" loading="lazy" />
      </button>)}</div><div className="rs-plank" aria-hidden="true" />
    </section>)}</div>
  </div>;
}

export default function RecordShelf({ catalogue, showSwitcher = true, likesEndpoint, language = 'zh', editions }) {
  const copy = shelfCopy[language];
  const [variant, setVariant] = useState('A');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('全部');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [columns, setColumns] = useState(6);
  const search = useRef(null);
  const origin = useRef(null);
  const records = useMemo(() => [...catalogue.records].sort((a, b) => a.featuredRank - b.featuredRank), [catalogue]);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return records.filter(record => {
      if (tag !== '全部' && tag !== record.category && !record.tags.includes(tag)) return false;
      if (!needle) return true;
      const matches = text => text.toLocaleLowerCase().includes(needle);
      return [record.name, record.category, ...record.tags].some(matches)
        || record.picks.some(track => matches(`${track.title} ${track.artist}`));
    });
  }, [records, query, tag]);
  const groups = categoryOrder.map(copy.term).map(category => [category, visible.filter(record => record.category === category)]).filter(([, records]) => records.length);
  const selectedRecord = records.find(record => record.id === selected);
  const cornerRecord = visible.find(record => record.id === selected) || visible[0] || records[0];
  const playlistLikes = usePhotoLikes(catalogue.records, true, likesEndpoint);
  const songRecord = variant === 'C' ? cornerRecord : selectedRecord;
  const songLikes = usePhotoLikes(songRecord?.picks || [], Boolean(songRecord), likesEndpoint);
  const current = variants.find(item => item.key === variant) || variants[0];
  const pickCount = catalogue.records.reduce((count, record) => count + record.picks.length, 0);

  function changeVariant(key) {
    setVariant(key); setSelected(null);
    const url = new URL(window.location.href); url.searchParams.set('variant', key); window.history.replaceState(null, '', url);
  }
  function cycle(direction) { changeVariant(variants[(variants.findIndex(item => item.key === variant) + direction + variants.length) % variants.length].key); }
  function openRecord(id, trigger) {
    const button = [...document.querySelectorAll('.rs-record[data-record-id]')].find(element => element.dataset.recordId === String(id));
    origin.current = { trigger: trigger || button, button, art: button?.querySelector('.rs-object') };
    setSelected(id);
    if (variant === 'C' && window.innerWidth <= 680) {
      document.querySelector('.rs-listening-desk')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  }

  useEffect(() => {
    const key = new URL(window.location.href).searchParams.get('variant');
    if (showSwitcher && variants.some(item => item.key === key)) setVariant(key);
    function resize() { setColumns(window.innerWidth < 580 ? 2 : window.innerWidth < 900 ? 4 : 6); }
    resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    function onKey(event) {
      if (!showSwitcher || document.querySelector('.rs-dialog[open]') || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(event.key === 'ArrowLeft' ? -1 : 1); }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [variant, showSwitcher]);

  return <Copy.Provider value={copy}><MusicLikes.Provider value={{ playlists: playlistLikes, songs: songLikes }}><div className={`vinyl-room rs-variant-${variant}`}>
    <div className="rs-room-wrap">
      <header className="rs-room-heading">
        <div>
          {editions && <nav className="rs-editions" aria-label={language === 'en' ? 'Playlist language' : '歌单语言'}>
            {editions.map(edition => <a key={edition.lang} href={edition.href} hrefLang={edition.lang} lang={edition.lang} aria-current={edition.lang.startsWith(language) ? 'page' : undefined}>{edition.lang === 'en' ? 'English' : '中文'}</a>)}
          </nav>}
          <h1>{editions ? copy.title : current.title}</h1>
          <p className="rs-intro">{copy.intro}</p>
        </div>
        <button className="rs-draw" disabled={!visible.length} onClick={event => openRecord(visible[Math.floor(Math.random() * visible.length)].id, event.currentTarget)}>
          <span className="rs-draw-disc" aria-hidden="true" /><span>{copy.draw}</span><Arrow />
        </button>
      </header>

      <div className="rs-finding">
        <div className="rs-quick-tags" aria-label={copy.filters}>
          {['全部', '驾车', '放松', '粤语', '日系', '夜晚'].map(copy.term).map(item => (
            <button key={item} aria-pressed={tag === item} onClick={() => setTag(item)}>{item === '全部' ? copy.all : item}</button>
          ))}
          <button className="rs-more-filters" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>{copy.more} {filtersOpen ? '−' : '+'}</button>
        </div>
        <label className="rs-search"><span aria-hidden="true">⌕</span><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.search} aria-label={copy.search} /></label>
      </div>
      {filtersOpen && <div className="rs-facets">{Object.entries(catalogue.facets).map(([facet, tags]) => <div key={facet}><span>{facet}</span>{tags.map(item => <button key={item} aria-pressed={tag === item} onClick={() => setTag(item)}>{item}</button>)}</div>)}</div>}
      <div className="rs-catalogue-line">
        <p aria-live="polite">
          {tag === '全部' && !query.trim() ? copy.totals(catalogue.records.length, pickCount) : copy.playlists(visible.length)}
          {tag !== '全部' && <button onClick={() => setTag('全部')}>{copy.clear} ×</button>}
        </p>
      </div>
      <LikeStatus />

      {visible.length ? variant === 'A' ? <Wall records={visible} onOpen={openRecord} columns={columns} /> : variant === 'B' ? <Crates groups={groups} onOpen={openRecord} notes={catalogue.categoryNotes} /> : <ListeningCorner groups={groups} record={cornerRecord} onOpen={openRecord} /> : <div className="rs-empty"><p>{copy.empty}</p><button onClick={() => { setQuery(''); setTag('全部'); search.current.focus(); }}>{copy.reset}</button></div>}

    </div>
    {variant !== 'C' && <RecordDialog record={selectedRecord} origin={origin} onClose={() => setSelected(null)} />}
    {showSwitcher && <div className="rs-prototype-switcher" aria-label="布局预览"><span className="rs-prototype-label">布局预览</span><button onClick={() => cycle(-1)} aria-label="上一种布局"><Arrow direction="left" /></button><span className="rs-variant-label" aria-live="polite">{current.key} · {current.name}</span><button onClick={() => cycle(1)} aria-label="下一种布局"><Arrow /></button></div>}
  </div></MusicLikes.Provider></Copy.Provider>;
}
