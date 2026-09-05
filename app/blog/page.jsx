import { getAllPosts, CATEGORIES, CATEGORY_LABELS } from '@/lib/posts';
import BlogIndex from '@/components/BlogIndex';
import Link from 'next/link';

export const metadata = { title: 'Blog' };

export default function BlogPage() {
  const posts = getAllPosts('blog');
  const categories = CATEGORIES.filter((c) => posts.some((p) => p.category === c));
  return (
    <>
      <section className="page-head wrap">
        <span className="section-label">Blog</span>
        <h1>A place for <span className="dim">everything.</span></h1>
        <p>Quick notes, things I found, half-formed thoughts. Whatever I feel like keeping.</p>
        <Link className="section-switch" href="/writing">For the longer, worked-through pieces → Writing</Link>
      </section>

      <section className="block wrap" style={{ paddingTop: 48 }}>
        <BlogIndex posts={posts} categories={categories} labels={CATEGORY_LABELS} />
      </section>
    </>
  );
}
