import Link from 'next/link';
import { getAllTags, getPostsByTag, CATEGORY_LABELS } from '@/lib/posts';

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return { title: `#${tag}` };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  return (
    <>
      <section className="page-head wrap">
        <div className="archive-links"><Link href="/blog">← Blog</Link><Link href="/writing">Writing →</Link></div>
        <h1><span className="dim">#</span>{tag}</h1>
        <p>{posts.length} post{posts.length === 1 ? '' : 's'} across Blog and Writing with this tag.</p>
      </section>

      <section className="block wrap" style={{ paddingTop: 48 }}>
        <div className="grid">
          {posts.map((post) => (
            <Link className="card" href={`/blog/${post.slug}`} key={post.slug}>
              <span className="arrow">↗</span>
              <span className="tag">{CATEGORY_LABELS[post.category] ?? post.category}</span>
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
