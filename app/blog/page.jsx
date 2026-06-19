import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: 'Blog' };

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <>
      <section className="page-head wrap">
        <span className="eyebrow"><span className="spark">✦</span> Writing</span>
        <h1>Notes on <span className="dim">building.</span></h1>
        <p>Hardware, software, and the occasional thing I learned the hard way.</p>
      </section>

      <section className="block wrap" style={{ paddingTop: 48 }}>
        <div className="grid">
          {posts.map((post) => (
            <Link className="card" href={`/blog/${post.slug}`} key={post.slug}>
              <span className="arrow">↗</span>
              <span className="tag">{post.tag}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="meta"><span>{post.date}</span></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
