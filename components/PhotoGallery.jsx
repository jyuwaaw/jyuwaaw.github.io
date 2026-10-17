'use client';

import Image from 'next/image';
import { createGalleryNavigation } from '@/lib/gallery-link.mjs';
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
  const navigation = useRef(null);
  const [shareStatus, setShareStatus] = useState(null);
  useEffect(() => {
    const controller = createGalleryNavigation(window, photos, setActive, crypto.randomUUID());
    navigation.current = controller;
    return () => { controller.dispose(); navigation.current = null; };
  }, [photos]);
  const openPhoto = (id) => navigation.current?.open(id);
  const closePhoto = () => navigation.current?.close();
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

  useEffect(() => {
    if (!isOpen) return;
    // On mobile, navigation sits below the photograph in a scrolling dialog.
    // Reveal each new frame (including reopened/shared frames) without scrolling
    // the underlying gallery or moving keyboard focus away from its controls.
    dialog.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [active, isOpen]);

  const move = (step) => openPhoto(ordered[(index + step + ordered.length) % ordered.length].id);

  const copyLink = async () => {
    const url = window.location.href;
    const photoId = photo.id;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus({ photoId, message: 'Link copied' });
    } catch {
      setShareStatus({ photoId, message: 'Copy this link to share', url });
    }
  };

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
      {makeRows(ordered).map((row) => <div className="workshop-row" key={row[0].id}>
        {row.map((item) => <figure className="workshop-entry" style={{ '--photo-ratio': item.width / item.height }} key={item.id}>
          <div className="workshop-frame">
            <button className="photo-open" onClick={() => openPhoto(item.id)} aria-label={`View photograph: ${item.title}`}>
              <Image src={imagePath(item.src)} alt={item.alt} width={item.width} height={item.height} />
            </button>
          </div>
          <figcaption className="workshop-caption">
            <h2>{item.label || 'Garage notes'}</h2>
            <div className="workshop-details"><PhotoMetadata photo={item} /></div>
          </figcaption>
        </figure>)}
      </div>)}
    </div> : <div className="photo-groups">
      {groups.map((group) => <section className="photo-group" aria-label={group.label} key={group.label}>
        <div className="photo-group-heading"><h2>{group.label}</h2><span>{String(group.photos.length).padStart(2, '0')}</span></div>
        <div className="photo-grid">
          {makeRows(group.photos).map((row) => <div className={`photo-row${row.length === 1 ? ' photo-row-single' : ''}`} key={row[0].id}>
            {row.map((item) => <figure style={{ '--photo-ratio': item.width / item.height }} key={item.id}>
              <button className="photo-open" onClick={() => openPhoto(item.id)} aria-label={`View photograph: ${item.title}`}>
                <Image src={imagePath(item.src)} alt={item.alt} width={item.width} height={item.height} />
              </button>
              <figcaption className="photo-metadata"><PhotoMetadata photo={item} /></figcaption>
            </figure>)}
          </div>)}
        </div>
      </section>)}
    </div>}

    <dialog ref={dialog} className="photo-viewer" aria-label="Photograph viewer"
      onCancel={(event) => { event.preventDefault(); closePhoto(); }}
      onClick={(event) => { if (event.target === event.currentTarget) closePhoto(); }}
      onKeyDown={(event) => {
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}>
      <div className="photo-viewer-topbar">
        <span className="photo-viewer-collection">{layout === 'workshop' ? "Benji’s Garage" : 'Photography'} <span>/ Gallery view</span></span>
        <button className="photo-close" onClick={closePhoto} aria-label="Close photograph">
          <span>Close</span><kbd>Esc</kbd>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      {photo && <figure className="photo-viewer-layout">
        <div className="photo-viewer-stage">
          <Image key={photo.id} src={imagePath(photo.fullSrc ?? photo.src)} alt={photo.alt} width={photo.width} height={photo.height} />
        </div>
        <figcaption className="photo-viewer-sidebar">
          <div className="photo-viewer-info" aria-live="polite" aria-atomic="true">
            <div className="photo-viewer-position"><span>Frame</span><span><strong>{String(index + 1).padStart(3, '0')}</strong> / {String(photos.length).padStart(3, '0')}</span></div>
            <h2>{photo.location || photo.label || 'Photograph'}</h2>
            {photo.label && photo.location && <p className="photo-viewer-note">{photo.label}</p>}
            <dl className="photo-viewer-details">
              {(photo.date || photo.year) && <div><dt>Captured</dt><dd>{photo.date || photo.year}</dd></div>}
              {photo.camera && <div><dt>Camera</dt><dd>{photo.camera}</dd></div>}
            </dl>
            {photo.captureSettings?.length > 0 && <dl className="photo-viewer-settings">
              {photo.captureSettings.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>}
          </div>
          <div className="photo-viewer-navigation">
            <div className="photo-share">
              <button type="button" onClick={copyLink} aria-label="Copy link to this photograph">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" /></svg>
                <span>Copy link</span>
              </button>
              <span role="status">{shareStatus?.photoId === photo.id ? shareStatus.message : ''}</span>
              {shareStatus?.photoId === photo.id && shareStatus.url && <input aria-label="Photograph share link" readOnly value={shareStatus.url} onFocus={(event) => event.target.select()} />}
            </div>
            <div className="photo-controls">
              <button onClick={() => move(-1)} disabled={photos.length < 2} aria-label="Previous photograph">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7" /></svg><span>Previous</span>
              </button>
              <button onClick={() => move(1)} disabled={photos.length < 2} aria-label="Next photograph">
                <span>Next</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" /></svg>
              </button>
            </div>
            <p className="photo-viewer-keyboard"><span aria-hidden="true">← →</span> Use arrow keys to explore</p>
          </div>
        </figcaption>
      </figure>}
    </dialog>
  </>;
}
