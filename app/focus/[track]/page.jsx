import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TRACKS, getTrack, postsForTrack } from '@/lib/tracks';
import { projects } from '@/lib/projects';
import { getAllPosts, CATEGORY_LABELS } from '@/lib/posts';

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}

export async function generateMetadata({ params }) {
  const { track: id } = await params;
  const track = getTrack(id);
  return track
    ? { title: `${track.label} — focus`, description: track.blurb }
    : { title: 'Focus' };
}

export default async function TrackPage({ params }) {
  const { track: id } = await params;
  const track = getTrack(id);
  if (!track) notFound();

  const trackProjects = projects.filter((p) => p.tracks?.includes(track.id));
  const trackPosts = postsForTrack(track, getAllPosts());

  return (
    <>
      <section className="page-head wrap">
        <Link className="back-link" href="/">← Home</Link>
        <br />
        <span className="eyebrow"><span className="spark">✦</span> Focus</span>
        <h1>{track.label}<span className="dim">.</span></h1>
        <p>{track.blurb}</p>
        <div className="filters" style={{ marginTop: 20 }}>
          {TRACKS.map((t) => (
            <Link
              key={t.id}
              className={`chip${t.id === track.id ? ' active' : ''}`}
              href={`/focus/${t.id}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      {trackProjects.length > 0 && (
        <section className="block wrap">
          <div className="section-head">
            <span className="eyebrow"><span className="spark">✦</span> Projects · {trackProjects.length}</span>
          </div>
          <div className="grid">
            {trackProjects.map((p) => (
              <a
                className="card"
                href={p.href}
                key={p.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="arrow">↗</span>
                <span className="tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="meta">{p.meta.map((m) => <span key={m}>{m}</span>)}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {trackPosts.length > 0 && (
        <section className="block wrap">
          <div className="section-head">
            <span className="eyebrow"><span className="spark">✦</span> Writing · {trackPosts.length}</span>
          </div>
          <div className="grid">
            {trackPosts.map((post) => (
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
      )}

      {trackProjects.length === 0 && trackPosts.length === 0 && (
        <section className="block wrap">
          <p style={{ color: 'var(--muted)' }}>Nothing filed under this focus yet.</p>
        </section>
      )}
    </>
  );
}
