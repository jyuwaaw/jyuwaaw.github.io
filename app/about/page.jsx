import { site } from '@/lib/site';

export const metadata = { title: 'About — Yuhua (Benji) Huang' };

const timeline = [
  {
    num: '01',
    title: 'B.E. Integrated Circuit Design — Harbin University of Science and Technology',
    when: 'HUST · June 2023 · GPA 3.8',
    body: 'Built the hardware foundation: VLSI design, FPGA, SoC design, computer architecture, DFT, and digital/analog IC design. Created open-source course repositories that together earned 10+ GitHub stars from classmates.',
  },
  {
    num: '02',
    title: 'Digital IC Engineer Intern — Cosemi Tech (Shanghai)',
    when: 'Jun 2022 – Dec 2022',
    body: 'Designed a 4-channel automotive ABS controller in Verilog: ≥1 MHz wheel-period capture, 2nd-fastest-wheel speed reference, 1 kHz control loop, 2 kHz PWM valve drivers. Also built CDC synchronizers, lost-pulse timeouts, valve interlocks, and diagnostics counters; wrote SystemVerilog wheel-dynamics testbench and AXI-Lite hooks for FPGA bring-up.',
  },
  {
    num: '03',
    title: 'M.S. Electrical & Computer Engineering — UC Irvine',
    when: 'UC Irvine · June 2025 · GPA 3.6',
    body: 'Focused on ASIC verification and digital design. Completed coursework spanning SoC design, DL accelerator design, low-power design, DFT, and heterogeneous integration.',
  },
  {
    num: '04',
    title: 'Lab Research Assistant / Grader — UC Irvine',
    when: 'Feb 2024 – June 2025',
    body: 'Migrated lab flow from FPGA to ASIC using Synopsys and Cadence physical-design toolchains. Authored TCL/Perl/CSH synthesis and P&R scripts for hardware/software co-design projects. Designed and graded Verilog lab assignments covering synthesis, simulation, and timing analysis.',
  },
  {
    num: '05',
    title: 'Research — FlexiBit Accelerator (In Review)',
    when: '2024 – Present',
    body: 'Proposed a novel arbitrary-precision floating-point matrix-multiplication architecture (e.g., FP6) at near-full utilization. Designed the precision unit in Verilog/SystemVerilog, verified in VCS, and ran full RTL-to-layout (Design Compiler → Innovus P&R, 14 nm library), achieving latency reductions and improved performance-per-area vs. traditional accelerators.',
  },
  {
    num: '06',
    title: 'Independent Verification & RTL Projects',
    when: 'June 2025 – Present · San Jose, CA',
    body: 'Self-directed deep-dives: complete UVM environments for AXI4 SRAM controllers and RISC-V SoC accelerators, constrained-random stimulus, SVA assertions, and golden C++ models — all targeting 100% functional coverage.',
  },
];

export default function About() {
  return (
    <>
      <section className="page-head wrap">
        <span className="eyebrow"><span className="spark">✦</span> About</span>
        <h1>Hi, I'm Benji. <span className="dim">Nice to meet you.</span></h1>
        <p>
          Digital design & verification engineer with an M.S. in ECE from UC Irvine.
          I build UVM testbenches, design RTL, and take chips from spec to GDSII.
          Trilingual (Mandarin, Cantonese, English) — I learn fastest by shipping.
        </p>
      </section>

      <section className="block wrap" style={{ paddingTop: 56 }}>
        <div className="section-head">
          <span className="eyebrow"><span className="spark">✦</span> Path so far</span>
          <h2>How I got <span className="dim">here.</span></h2>
        </div>
        <ol className="timeline">
          {timeline.map((t) => (
            <li className="step" key={t.num}>
              <span className="num">{t.num}</span>
              <div>
                <h3>{t.title}</h3>
                <div className="when">{t.when}</div>
                <p>{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="block wrap" style={{ paddingTop: 24 }}>
        <div className="section-head">
          <span className="eyebrow"><span className="spark">✦</span> Technical skills</span>
          <h2>The <span className="dim">toolbox.</span></h2>
        </div>
        <div className="skills-grid">
          <div className="skill-group">
            <h4>Verification</h4>
            <p>UVM, SystemVerilog testbenches, constrained-random stimulus, functional coverage, SVA assertions, self-checking scoreboards, C++ golden models, CDC checks, protocol compliance</p>
          </div>
          <div className="skill-group">
            <h4>Languages & HDL</h4>
            <p>Verilog, SystemVerilog, VHDL, C++, Python, TCL, Perl, Makefile, SystemC, SpecC, HLS</p>
          </div>
          <div className="skill-group">
            <h4>Protocols & Methodology</h4>
            <p>AXI4, AXI-Lite, AHB, RISC-V, DFT, low-power (UPF, clock-gating, power-gating, DVFS)</p>
          </div>
          <div className="skill-group">
            <h4>EDA Tools</h4>
            <p>VCS, Verdi, Verilator, Yosys, Design Compiler, PrimeTime, IC Compiler II, Innovus, Virtuoso, Vivado, Vitis HLS, MATLAB</p>
          </div>
        </div>
      </section>

      <section className="contact wrap">
        <h2>Want to talk? <span className="dim">Reach out.</span></h2>
        <div className="cta-row">
          <a className="btn btn-primary" href={`mailto:${site.email}`}>Email me</a>
          <a className="btn" href={site.github}>GitHub ↗</a>
          <a className="btn" href={site.linkedin}>LinkedIn ↗</a>
        </div>
      </section>
    </>
  );
}
