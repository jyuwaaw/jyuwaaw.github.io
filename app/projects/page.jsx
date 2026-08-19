import Link from 'next/link';
import { projectsByEra } from '@/lib/projects';
import { TRACKS } from '@/lib/tracks';

export const metadata = {
  title: 'Projects',
  description:
    'Things I built — MCP servers, Claude Code skills, and agent tooling on one shelf; RTL, UVM verification, and accelerator research on the other.',
};

export default function ProjectsPage() {
  const eras = projectsByEra();
  return (
    <>
      <section className="page-head wrap">
        <span className="eyebrow"><span className="spark">✦</span> Projects</span>
        <h1>Two shelves, <span className="dim">one vertical.</span></h1>
        <p>
          I used to make chips run AI; now I make AI run tools. Same instinct both
          times — find the interface everyone says doesn't exist.
        </p>
        <div className="filters" style={{ marginTop: 20 }} aria-label="Browse by focus">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', alignSelf: 'center' }}>focus:</span>
          {TRACKS.map((t) => (
            <Link key={t.id} className="chip" href={`/focus/${t.id}`}>{t.label}</Link>
          ))}
        </div>
      </section>

      {eras.map((era) => (
        <section className="block wrap" key={era.id}>
          <div className="section-head">
            <span className="eyebrow"><span className="spark">✦</span> {era.label}</span>
            <p style={{ color: 'var(--muted)', maxWidth: 560 }}>{era.blurb}</p>
          </div>
          <div className="grid">
            {era.projects.map((p) => (
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
      ))}
    </>
  );
}
