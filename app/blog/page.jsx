import { getAllPosts, CATEGORIES, CATEGORY_LABELS } from '@/lib/posts';
import BlogIndex from '@/components/BlogIndex';

export const metadata = { title: 'Blog' };

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = CATEGORIES.filter((c) => posts.some((p) => p.category === c));
  return (
    <>
      <section className="page-head wrap">
        <span className="eyebrow"><span className="spark">✦</span> Writing</span>
        <h1>Notes on <span className="dim">building.</span></h1>
        <p>Hardware, software, and the occasional thing I learned the hard way.</p>
      </section>

      <section className="block wrap" style={{ paddingTop: 48 }}>
        <BlogIndex posts={posts} categories={categories} labels={CATEGORY_LABELS} />
      </section>
    </>
  );
}
