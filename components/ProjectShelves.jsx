'use client';

import { useState } from 'react';

// Era-grouped project shelves with an in-place track filter (BlogIndex-style).
// Filtering narrows the cards inside each shelf; a shelf with no match hides.
export default function ProjectShelves({ eras, tracks }) {
  const [track, setTrack] = useState('all');
  const shelves = eras
    .map((era) => ({
      ...era,
      projects:
        track === 'all'
          ? era.projects
          : era.projects.filter((p) => p.tracks?.includes(track)),
    }))
    .filter((era) => era.projects.length > 0);
  return (
    <>
      <section className="block wrap" style={{ paddingBottom: 0 }}>
        <div className="filters" role="group" aria-label="Filter projects by focus">
          {[{ id: 'all', label: 'All' }, ...tracks].map((t) => (
            <button
              key={t.id}
              className={`chip${track === t.id ? ' active' : ''}`}
              onClick={() => setTrack(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>
      {shelves.map((era) => (
        <section className="block wrap" key={era.id}>
          <div className="section-head">
            <span className="eyebrow"><span className="spark">✦</span> {era.label}</span>
            <p style={{ color: 'var(--muted)', maxWidth: 560 }}>{era.blurb}</p>
          </div>
          <div className="grid">
            {era.projects.map((p) => (
              <a
                className="card"
                href={p.href}
                key={p.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="arrow">↗</span>
                <span className="tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="meta">{p.meta.map((m) => <span key={m}>{m}</span>)}</div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
