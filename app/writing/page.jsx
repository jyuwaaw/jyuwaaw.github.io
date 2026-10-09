import Link from 'next/link';
import { getAllPosts, CATEGORY_LABELS } from '@/lib/posts';

export const metadata = {
  title: 'Writing',
  description: 'Essays, technical deep dives, and things I have worked through.',
};

export default function Writing() {
  const posts = getAllPosts('writing');
  return (
    <>
      <section className="page-head wrap">
        <span className="section-label">Writing</span>
        <h1>Ideas, <span className="dim">worked through.</span></h1>
        <p>Essays and technical deep dives. A little more time, a little more thought.</p>
        <Link className="section-switch" href="/blog">For quick notes and everything else → Blog</Link>
      </section>
      <section className="block wrap" style={{ paddingTop: 48 }} aria-label="Articles">
        <div className="writing-list">
          {posts.map((post) => (
            <Link className="writing-entry" href={`/blog/${post.slug}`} key={post.slug}>
              <div className="writing-meta">
                <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
                <time dateTime={post.date}>{post.date}</time>
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <span className="writing-read">Read article <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p className="empty-posts">No articles yet. In the meantime, there are notes on the <Link href="/blog">blog</Link>.</p>}
      </section>
    </>
  );
}
