// PROTOTYPE: three different ways to browse the same real playlist collection.
import { useEffect, useMemo, useRef, useState } from 'react';
import './record-shelf.css';

const variants = [
  { key: 'A', name: '唱片墙', title: '随手抽一张，听几首。' },
  { key: 'B', name: '主题唱片箱', title: '翻一箱喜欢的声音。' },
  { key: 'C', name: '聆听角', title: '这一面，留给今天。' },
];
const categoryOrder = ['开车与旅行', '放松与情绪', '风格选集', '华语与粤语', '日韩', '歌手与影视游戏', '日常与运动', '收藏与发现', '年代与节日'];
const words = { 1: '一', 2: '两', 3: '三' };

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
  return <button className="rs-record" onClick={() => onOpen(record.id)} aria-label={`抽出 ${record.name}，查看 ${record.picks.length} 首选曲`}>
    <span className="rs-object" style={{ '--label-color': record.color }}>
      <Disc record={record} />
      <span className="rs-sleeve"><Cover record={record} width="640" height="640" loading={eager ? 'eager' : 'lazy'} alt="" draggable="false" /></span>
    </span>
    <span className="rs-record-title">{record.name}</span>
    <span className="rs-record-caption">{record.tags.slice(0, 2).join(' / ') || record.category} <span>· {record.picks.length} 首</span></span>
  </button>;
}

function TrackList({ record }) {
  return <div className="rs-tracks">
    <div className="rs-side"><span>A SIDE</span><h3>{record.picks.length ? `先听这${words[record.picks.length] || record.picks.length}首` : '选曲还在整理中'}</h3></div>
    <ol>
      {record.picks.map((track, index) => <li key={track.url}>
        <span className="rs-track-no">{String(index + 1).padStart(2, '0')}</span>
        <a href={track.url} target="_blank" rel="noreferrer" aria-label={`在 Apple Music ${track.linkType === 'search' ? '搜索' : '听'} ${track.title}`}>
          <span className="rs-track-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
          <span className="rs-duration">{track.linkType === 'search' ? '搜索 ↗' : track.duration}</span><span className="rs-track-go" aria-hidden="true">↗</span>
        </a>
      </li>)}
    </ol>
    {record.picks.length > 0 && <p className="rs-listen-note">点歌名，在 Apple Music 里听 <span>↗</span></p>}
  </div>;
}

function RecordDetail({ record, inline = false }) {
  return <div className={`rs-detail ${inline ? 'rs-detail-inline' : ''}`}>
    <div className="rs-detail-art"><Disc record={record} /><Cover record={record} className="rs-detail-cover" width="640" height="640" alt={`${record.name} 的唱片封面`} /></div>
    <div className="rs-detail-copy">
      <span className="rs-detail-category">{record.category}</span>
      <h2>{record.name}</h2><p className="rs-record-note">{record.note}</p>
      <div className="rs-detail-tags">{record.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <TrackList record={record} />
      <p className="rs-whole-count">从这张 {record.trackCount} 首的歌单里，先挑 {record.picks.length} 首。</p>
    </div>
  </div>;
}

function RecordDialog({ record, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (record && !dialog.current.open) dialog.current.showModal();
    if (!record && dialog.current.open) dialog.current.close();
  }, [record]);
  return <dialog ref={dialog} className="rs-dialog" aria-label={record?.name || '唱片选曲'} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="rs-dialog-close" onClick={onClose} aria-label="放回唱片，关闭选曲">×</button>
    {record && <RecordDetail record={record} />}
  </dialog>;
}

function Wall({ records, onOpen, columns }) {
  const rows = Array.from({ length: Math.ceil(records.length / columns) }, (_, row) => records.slice(row * columns, (row + 1) * columns));
  return <div className="rs-cabinet" aria-label="全部唱片">
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

export default function RecordShelf({ catalogue, showSwitcher = true }) {
  const [variant, setVariant] = useState('A');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('全部');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [columns, setColumns] = useState(6);
  const search = useRef(null);
  const records = useMemo(() => [...catalogue.records].sort((a, b) => a.featuredRank - b.featuredRank), [catalogue]);
  const visible = useMemo(() => records.filter(record => (tag === '全部' || record.tags.includes(tag) || record.category === tag) && `${record.name} ${record.tags.join(' ')} ${record.category} ${record.picks.map(t => `${t.title} ${t.artist}`).join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [records, query, tag]);
  const groups = categoryOrder.map(category => [category, visible.filter(record => record.category === category)]).filter(([, records]) => records.length);
  const selectedRecord = records.find(record => record.id === selected);
  const cornerRecord = visible.find(record => record.id === selected) || visible[0] || records[0];
  const current = variants.find(item => item.key === variant) || variants[0];
  const pickCount = catalogue.records.reduce((count, record) => count + record.picks.length, 0);

  function changeVariant(key) {
    setVariant(key); setSelected(null);
    const url = new URL(window.location.href); url.searchParams.set('variant', key); window.history.replaceState(null, '', url);
  }
  function cycle(direction) { changeVariant(variants[(variants.findIndex(item => item.key === variant) + direction + variants.length) % variants.length].key); }
  function openRecord(id) {
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

  return <div className={`vinyl-room rs-variant-${variant}`}>
    <div className="rs-room-wrap">
      <header className="rs-room-heading">
        <div><p className="rs-eyebrow">MUSIC / BENJI'S RECORD SHELF</p><h1>{current.title}</h1><p className="rs-intro">全部歌单都在这里。每张挑几首，慢慢翻。</p></div>
        <button className="rs-draw" disabled={!visible.length} onClick={() => openRecord(visible[Math.floor(Math.random() * visible.length)].id)}><span className="rs-draw-disc" aria-hidden="true" /><span>替我抽一张<small>看看今天听什么</small></span><Arrow /></button>
      </header>

      <div className="rs-finding">
        <div className="rs-quick-tags" aria-label="常用分类">{['全部', '驾车', '放松', '粤语', '日系', '夜晚'].map(item => <button key={item} aria-pressed={tag === item} onClick={() => setTag(item)}>{item === '全部' ? '整架唱片' : item}</button>)}<button className="rs-more-filters" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>更多分类 {filtersOpen ? '−' : '+'}</button></div>
        <label className="rs-search"><span aria-hidden="true">⌕</span><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="找歌单、歌或歌手" aria-label="搜索歌单、歌曲或歌手" /></label>
      </div>
      {filtersOpen && <div className="rs-facets">{Object.entries(catalogue.facets).map(([facet, tags]) => <div key={facet}><span>{facet}</span>{tags.map(item => <button key={item} aria-pressed={tag === item} onClick={() => setTag(item)}>{item}</button>)}</div>)}</div>}
      <div className="rs-catalogue-line"><p aria-live="polite">{tag === '全部' ? '整架唱片' : tag} <span>{visible.length} 张</span>{tag !== '全部' && <button onClick={() => setTag('全部')}>查看全部 ×</button>}</p><span>{catalogue.records.length} 张歌单 / {pickCount} 首选曲</span></div>

      {visible.length ? variant === 'A' ? <Wall records={visible} onOpen={openRecord} columns={columns} /> : variant === 'B' ? <Crates groups={groups} onOpen={openRecord} notes={catalogue.categoryNotes} /> : <ListeningCorner groups={groups} record={cornerRecord} onOpen={openRecord} /> : <div className="rs-empty"><p>这一格暂时没有找到。</p><button onClick={() => { setQuery(''); setTag('全部'); search.current.focus(); }}>回到整架唱片</button></div>}

      <p className="rs-bottom-note">把一张唱片抽出来，先听 A 面的几首。</p>
    </div>
    {variant !== 'C' && <RecordDialog record={selectedRecord} onClose={() => setSelected(null)} />}
    {showSwitcher && <div className="rs-prototype-switcher" aria-label="布局预览"><span className="rs-prototype-label">布局预览</span><button onClick={() => cycle(-1)} aria-label="上一种布局"><Arrow direction="left" /></button><span className="rs-variant-label" aria-live="polite">{current.key} · {current.name}</span><button onClick={() => cycle(1)} aria-label="下一种布局"><Arrow /></button></div>}
  </div>;
}
