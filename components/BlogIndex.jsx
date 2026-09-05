'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BlogIndex({ posts, categories, labels }) {
  const [cat, setCat] = useState('all');
  const shown = cat === 'all' ? posts : posts.filter((p) => p.category === cat);
  return (
    <>
      {categories.length > 1 && <div className="filters" role="group" aria-label="Filter posts by category">
        {['all', ...categories].map((c) => (
          <button
            key={c}
            className={`chip${cat === c ? ' active' : ''}`}
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
          >
            {c === 'all' ? 'All' : labels[c] ?? c}
          </button>
        ))}
      </div>}
      <div className="note-list">
        {shown.map((post) => (
          <Link className="note" href={`/blog/${post.slug}`} key={post.slug}>
            <time dateTime={post.date}>{post.date}</time>
            <div className="note-content">
              <h2>{post.title}</h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              {post.tags.length > 0 && <span className="note-tags">{post.tags.map((t) => `#${t}`).join(' ')}</span>}
            </div>
            <span className="note-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      {shown.length === 0 && <p className="empty-posts">No notes here yet.</p>}
    </>
  );
}
