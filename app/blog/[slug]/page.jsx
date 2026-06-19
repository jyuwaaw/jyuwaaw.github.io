import Link from 'next/link';
import { getAllSlugs, getPost } from '@/lib/posts';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  return { title: post.title };
}

export default function Post({ params }) {
  const post = getPost(params.slug);
  return (
    <article className="post wrap">
      <Link className="back-link" href="/blog">← All posts</Link>
      <div className="post-meta">{post.tag} · {post.date}</div>
      <h1 className="post-title">{post.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
