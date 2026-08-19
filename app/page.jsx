import Link from 'next/link';
import Marquee from '@/components/Marquee';
import { site } from '@/lib/site';
import { getAllPosts, CATEGORY_LABELS } from '@/lib/posts';
import { featuredProjects } from '@/lib/projects';
import { TRACKS } from '@/lib/tracks';


export default function Home() {
  const posts = getAllPosts().slice(0, 2);

  return (
    <>
      {/* HERO */}
      <section className="hero wrap">
        <span className="eyebrow"><span className="spark">✦</span> Verification · RTL · AI Systems</span>
        <h1>Hardware, software, <span className="dim">shipped.</span></h1>
        <p className="lede">
          Digital design & verification engineer (M.S. ECE, UC Irvine).
          I architect and verify RTL — flexible-precision AI accelerators, UVM testbenches, 
          full RTL-to-GDSII — then build and ship the AI products that run on top of it. 
          I work the whole vertical: from the arithmetic inside an accelerator to the agents it ends up serving.
        </p>
        <div className="cta-row">
          <a className="btn btn-primary" href={`mailto:${site.email}`}>Get in touch</a>
          <a className="btn" href={site.github}>GitHub ↗</a>
          <a className="btn" href={site.linkedin}>LinkedIn ↗</a>
          <a className="btn" href={site.arxiv}>arXiv ↗</a>
        </div>
      </section>

      <Marquee />

      {/* WHOAMI */}
      <section className="block wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="spark">✦</span> whoami</span>
          <h2>A quick <span className="dim">readout.</span></h2>
        </div>
        <div className="terminal">
          <div className="term-bar">
            <span className="dot r" /><span className="dot y" /><span className="dot g" />
            <span className="term-title">~ /yuhua — zsh</span>
          </div>
          <div className="term-body">
            <span className="prompt">$</span> <span className="cmd">whoami</span>
            <span className="out">Yuhua (Benji) Huang — M.S. ECE @ UC Irvine, Digital Design & Verification Engineer.</span>
            <span className="prompt">$</span> <span className="cmd">cat focus.txt</span>
            <span className="out">→ UVM verification — constrained-random, scoreboards, SVA, coverage.</span>
            <span className="out">→ RTL design — AXI4, RISC-V SoC, AHB, CDC, DFT, low-power (UPF/DVFS).</span>
            <span className="out">→ Full RTL-to-GDSII: VCS, Design Compiler, Innovus, IC Compiler II.</span>
            <span className="out">→ AI agent dev — shipped fixo.ink (multimodal auto-diagnosis) & hmls.autos platform.</span>
            <span className="out">→ Research paper "FlexiBit" under review — arbitrary mixed-precision AI accelerator.</span>
            <span className="prompt">$</span> <span className="cmd">echo $LANGUAGES</span>
            <span className="out">Mandarin · Cantonese · English</span>
            <span className="prompt">$</span> <span className="cursor" />
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="block wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="spark">✦</span> Selected work</span>
          <h2>Things I've <span className="dim">built.</span></h2>
          <div className="filters" style={{ marginTop: 18, marginBottom: 0 }} aria-label="Browse by focus">
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', alignSelf: 'center' }}>by focus:</span>
            {TRACKS.map((t) => (
              <Link key={t.id} className="chip" href={`/focus/${t.id}`}>{t.label}</Link>
            ))}
          </div>
        </div>
        <div className="grid">
          {featuredProjects.map((p) => (
            <a className="card" href={p.href} key={p.title} target="_blank" rel="noopener noreferrer">
              <span className="arrow">↗</span>
              <span className="tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="meta">{p.meta.map((m) => <span key={m}>{m}</span>)}</div>
            </a>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: 28 }}>
          <Link className="btn" href="/projects">All projects →</Link>
        </div>
      </section>

      {/* LATEST POSTS */}
      {posts.length > 0 && (
        <section className="block wrap">
          <div className="section-head">
            <span className="eyebrow"><span className="spark">✦</span> Latest writing</span>
            <h2>From the <span className="dim">blog.</span></h2>
          </div>
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
      )}

      {/* CONTACT */}
      <section className="contact wrap">
        <span className="eyebrow"><span className="spark">✦</span> Say hello</span>
        <h2>Let's build <span className="dim">something.</span></h2>
        <p>Open to verification and digital design roles, research collaborations, and good conversations. Fastest way to reach me is email.</p>
        <div className="cta-row">
          <a className="btn btn-primary" href={`mailto:${site.email}`}>Email me</a>
          <a className="btn" href={site.github}>GitHub ↗</a>
          <a className="btn" href={site.linkedin}>LinkedIn ↗</a>
          <a className="btn" href={site.arxiv}>arXiv ↗</a>
        </div>
      </section>
    </>
  );
}
