'use client';

import { useState } from 'react';

// In-place track filter over project cards — same interaction as BlogIndex.
// "All" shows the curated featured set when `defaultFeatured` (home);
// picking a track widens to every project in that direction.
export default function ProjectGrid({ projects, tracks, defaultFeatured = false }) {
  const [track, setTrack] = useState('all');
  const shown =
    track === 'all'
      ? defaultFeatured
        ? projects.filter((p) => p.featured)
        : projects
      : projects.filter((p) => p.tracks?.includes(track));
  return (
    <>
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
      <div className="grid">
        {shown.map((p) => (
          <a className="card" href={p.href} key={p.title} target="_blank" rel="noopener noreferrer">
            <span className="arrow">↗</span>
            <span className="tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
            <div className="meta">{p.meta.map((m) => <span key={m}>{m}</span>)}</div>
          </a>
        ))}
      </div>
    </>
  );
}
