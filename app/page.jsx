import Link from 'next/link';
import Marquee from '@/components/Marquee';
import { site } from '@/lib/site';
import { getAllPosts } from '@/lib/posts';

const projects = [
  {
    tag: 'AI Agent',
    title: 'Fixo — AI Vehicle Diagnostics',
    desc: 'Multimodal auto-diagnosis agent: analyzes photos, audio clips, OBD-II codes, and text descriptions to deliver severity ratings, cost estimates, and mechanic-ready reports in ~30 s. Covers 18+ brands and all 1996+ OBD-II vehicles.',
    meta: ['AI Agent', 'TypeScript', 'Next.js', 'Deno'],
    href: 'https://fixo.ink',
  },
  {
    tag: 'Full-Stack',
    title: 'HMLS — Mobile Mechanic Platform',
    desc: 'End-to-end service platform for a mobile mechanic business in Orange County & San Jose: AI-powered chat → instant estimates → Stripe payments → provider scheduling. Built and maintained the full stack (Next.js, Deno/Hono, Supabase, Drizzle).',
    meta: ['Next.js', 'Deno', 'Supabase', 'Stripe'],
    href: 'https://hmls.autos',
  },
  {
    tag: 'Verification',
    title: 'AXI4-Compliant SRAM Controller with UVM',
    desc: 'Full UVM environment — AXI agents, self-checking scoreboard, constrained-random sequences — achieving 100% AXI4 protocol compliance across AW/W/B and AR/R channels with bursts up to 256 beats.',
    meta: ['UVM', 'SystemVerilog', 'AXI4'],
    href: 'https://github.com/jyuwaaw',
  },
  {
    tag: 'SoC Design',
    title: 'Flexible-Bit AI Accelerator on RISC-V SoC',
    desc: 'AXI4-integrated RISC-V accelerator verified with a UVM testbench. Supports FP6–FP8 and INT2–8 tensor ops with parameterized FBRT multipliers and flexible-bit adders over AXI4.',
    meta: ['Verilog', 'UVM', 'RISC-V', 'AXI4'],
    href: 'https://github.com/jyuwaaw',
  },
  {
    tag: 'HLS / FPGA',
    title: 'SoC-based MatMul & DNN Accelerator',
    desc: 'HLS-based SoC accelerators on AMD KR260 (PYNQ) cutting DNN inference runtime from 4612 s to 44 s while maintaining 98% accuracy. Resources: 16K FFs, 11.9K LUTs, 80 DSPs.',
    meta: ['Vitis HLS', 'FPGA', 'VHDL', 'C++'],
    href: 'https://github.com/jyuwaaw/SoC-based-MatMul-Accelerator-and-DNN-Accelerator',
  },
  {
    tag: 'Low Power',
    title: 'Low-Power Accelerator via NN Error-Resilience',
    desc: 'Data-reordering algorithm minimizing bit flips to exploit timing slack; combined with clock-gating, power-gating, and DVFS in a 3-domain UPF. Reduced clock from 1 GHz to 297 MHz at 85.7% accuracy.',
    meta: ['Python', 'UPF', 'DVFS', 'ASIC'],
    href: 'https://github.com/jyuwaaw/Low_Power_Accelerator_Design_based_on_Neural_Network_Error_Resilience',
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 2);

  return (
    <>
      {/* HERO */}
      <section className="hero wrap">
        <span className="eyebrow"><span className="spark">✦</span> Verification · RTL · AI Systems</span>
        <h1>I build things <span className="dim">that actually ship.</span></h1>
        <p className="lede">
          {site.role} — M.S. ECE, UC Irvine. I design RTL, build UVM testbenches, and ship full-stack
          AI systems. From 14 nm ASIC tape-out to production AI agents — I like working the full stack.
        </p>
        <div className="cta-row">
          <a className="btn btn-primary" href={`mailto:${site.email}`}>Get in touch</a>
          <a className="btn" href={site.github}>GitHub ↗</a>
          <a className="btn" href={site.linkedin}>LinkedIn ↗</a>
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
        </div>
        <div className="grid">
          {projects.map((p) => (
            <a className="card" href={p.href} key={p.title} target="_blank" rel="noopener noreferrer">
              <span className="arrow">↗</span>
              <span className="tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="meta">{p.meta.map((m) => <span key={m}>{m}</span>)}</div>
            </a>
          ))}
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
                <span className="tag">{post.tag}</span>
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
        </div>
      </section>
    </>
  );
}
