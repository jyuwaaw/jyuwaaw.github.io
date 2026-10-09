'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getDaypart, orderPhotographs, photographGroup, DAYPART_LABELS } from '@/lib/gallery-order.mjs';

const imagePath = (src) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${src}`;

// Justified rows keep the entire photograph visible and follow reading order.
function makeRows(photos) {
  const rows = [];
  let row = [], ratio = 0;
  for (const photo of photos) {
    row.push(photo);
    ratio += photo.width / photo.height;
    if (ratio >= 2.7 || row.length === 3) {
      rows.push(row);
      row = [];
      ratio = 0;
    }
  }
  if (row.length) rows.push(row);
  return rows;
}

function PhotoMetadata({ photo }) {
  return <>
    {photo.location && <span className="photo-location">{photo.location}</span>}
    <span className="photo-capture">{[photo.date || photo.year, photo.camera].filter(Boolean).join(' / ')}</span>
    {photo.settings && <span className="photo-settings">{photo.settings}</span>}
  </>;
}

export default function PhotoGallery({ photos, styleLabel = 'Style', layout = 'gallery', adaptToTime = false }) {
  const [sort, setSort] = useState('style');
  const [active, setActive] = useState(null);
  const dialog = useRef(null);
  const [daypart, setDaypart] = useState(null);
  // Read the visitor's local clock once after hydration. Keep the order stable
  // while browsing, including when the viewer remains open across a boundary.
  useEffect(() => {
    setDaypart(adaptToTime ? getDaypart(new Date().getHours()) : null);
  }, [adaptToTime]);
  const ordered = useMemo(() => orderPhotographs(photos, sort, daypart), [photos, sort, daypart]);
  const groups = useMemo(() => {
    const result = [];
    for (const photo of ordered) {
      const label = photographGroup(photo, sort, daypart);
      if (result.at(-1)?.label !== label) result.push({ label, photos: [] });
      result.at(-1).photos.push(photo);
    }
    return result;
  }, [ordered, sort, daypart]);
  const index = ordered.findIndex((item) => item.id === active);
  const photo = ordered[index];
  const isOpen = Boolean(photo);

  useEffect(() => {
    if (!isOpen) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const move = (step) => setActive(ordered[(index + step + ordered.length) % ordered.length].id);

  if (photos.length === 0) return <p className="photo-empty">The first collection is on its way.</p>;

  return <>
    <div className="photo-toolbar">
      <div className="photo-context"><span className="photo-count">{photos.length} photographs</span>
        {sort === 'style' && daypart && <span className="photo-daypart">{DAYPART_LABELS[daypart]}</span>}</div>
      <div className="photo-sort" role="group" aria-label="Sort photographs">
        <span>Sort by</span>
        <button aria-pressed={sort === 'style'} onClick={() => setSort('style')}>{styleLabel}</button>
        <button aria-label="Date: newest first" aria-pressed={sort === 'date-desc'} onClick={() => setSort('date-desc')}>Date <span aria-hidden="true">↓</span></button>
        <button aria-label="Date: oldest first" aria-pressed={sort === 'date-asc'} onClick={() => setSort('date-asc')}>Date <span aria-hidden="true">↑</span></button>
      </div>
    </div>
    {layout === 'workshop' ? <div className="workshop-grid">
      {ordered.map((item, position) => <figure className="workshop-entry" key={item.id}>
        <div className="workshop-frame">
          <button className="photo-open" onClick={() => setActive(item.id)} aria-label={`View photograph: ${item.title}`}>
            <Image src={imagePath(item.src)} alt={item.alt} width={item.width} height={item.height} />
          </button>
          <div className="photo-metadata"><PhotoMetadata photo={item} /></div>
        </div>
        <figcaption className="workshop-caption">
          {position === 0 && <span className="workshop-feature-label">From the garage</span>}
          <h2>{item.label || item.title}</h2>
          {position === 0 && <p>Maintenance, parts, and the work in between.</p>}
          <span className="workshop-date">{item.date || 'Garage notes'}</span>
        </figcaption>
      </figure>)}
    </div> : <div className="photo-groups">
      {groups.map((group) => <section className="photo-group" aria-label={group.label} key={group.label}>
        <div className="photo-group-heading"><h2>{group.label}</h2><span>{String(group.photos.length).padStart(2, '0')}</span></div>
        <div className="photo-grid">
          {makeRows(group.photos).map((row) => <div className={`photo-row${row.length === 1 ? ' photo-row-single' : ''}`} key={row[0].id}>
            {row.map((item) => <figure style={{ '--photo-ratio': item.width / item.height }} key={item.id}>
              <button className="photo-open" onClick={() => setActive(item.id)} aria-label={`View photograph: ${item.title}`}>
                <Image src={imagePath(item.src)} alt={item.alt} width={item.width} height={item.height} />
              </button>
              <figcaption className="photo-metadata"><PhotoMetadata photo={item} /></figcaption>
            </figure>)}
          </div>)}
        </div>
      </section>)}
    </div>}

    <dialog ref={dialog} className="photo-viewer" aria-label="Photograph viewer"
      onClose={() => setActive(null)}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}>
      <button className="photo-close" onClick={() => dialog.current.close()} aria-label="Close photograph">Close <span aria-hidden="true">×</span></button>
      {photo && <figure className="photo-viewer-content">
        <Image src={imagePath(photo.fullSrc ?? photo.src)} alt={photo.alt} width={photo.width} height={photo.height} />
        <figcaption className="photo-metadata" aria-live="polite"><PhotoMetadata photo={photo} /></figcaption>
      </figure>}
      <div className="photo-controls">
        <button onClick={() => move(-1)} disabled={photos.length < 2} aria-label="Previous photograph">← Previous</button>
        <span>{index + 1} / {photos.length}</span>
        <button onClick={() => move(1)} disabled={photos.length < 2} aria-label="Next photograph">Next →</button>
      </div>
    </dialog>
  </>;
}
