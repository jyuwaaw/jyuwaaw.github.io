import Link from 'next/link';
import { getAllSlugs, getPost, getSeriesPosts, CATEGORY_LABELS } from '@/lib/posts';
import PostBody from '@/components/PostBody';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post.title };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  const seriesPosts = post.series ? getSeriesPosts(post.series) : [];
  return (
    <article className="post wrap">
      <Link className="back-link" href="/blog">← All posts</Link>
      <div className="post-meta">
        {CATEGORY_LABELS[post.category] ?? post.category} · {post.date}
      </div>
      <PostBody
        title={post.title}
        titleZh={post.titleZh}
        html={post.html}
        htmlZh={post.htmlZh}
      />
      {post.tags.length > 0 && (
        <div className="tag-row">
          {post.tags.map((t) => (
            <Link className="tag-pill" key={t} href={`/blog/tag/${t}`}>#{t}</Link>
          ))}
        </div>
      )}
      {post.source && (
        <p className="post-source">
          Source: <a href={post.source} target="_blank" rel="noreferrer">{post.source}</a>
        </p>
      )}
      {seriesPosts.length > 1 && (
        <aside className="series-box">
          <h4>Series · {post.series}</h4>
          <ol>
            {seriesPosts.map((p) => (
              <li key={p.slug}>
                {p.slug === post.slug
                  ? <span>{p.title}</span>
                  : <Link href={`/blog/${p.slug}`}>{p.title}</Link>}
              </li>
            ))}
          </ol>
        </aside>
      )}
    </article>
  );
}
