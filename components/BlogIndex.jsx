'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BlogIndex({ posts, categories, labels }) {
  const [cat, setCat] = useState('all');
  const shown = cat === 'all' ? posts : posts.filter((p) => p.category === cat);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter posts by category">
        {['all', ...categories].map((c) => (
          <button
            key={c}
            className={`chip${cat === c ? ' active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c === 'all' ? 'All' : labels[c] ?? c}
          </button>
        ))}
      </div>
      <div className="grid">
        {shown.map((post) => (
          <Link className="card" href={`/blog/${post.slug}`} key={post.slug}>
            <span className="arrow">↗</span>
            <span className="tag">{labels[post.category] ?? post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="meta">
              <span>{post.date}</span>
              {post.tags.length > 0 && (
                <span>{post.tags.map((t) => `#${t}`).join(' ')}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
