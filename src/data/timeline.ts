// The About page's "path so far". `when` is the display string.
export const timeline = [
  {
    title: 'B.E. Integrated Circuit Design — Harbin University of Science and Technology',
    when: 'HUST · June 2023 · GPA 3.8',
    body: 'Built the hardware foundation: VLSI design, FPGA, SoC design, computer architecture, DFT, and digital/analog IC design. Created open-source course repositories that together earned 10+ GitHub stars from classmates.',
  },
  {
    title: 'Digital IC Engineer Intern — Cosemi Tech (Shanghai)',
    when: 'Jun 2022 – Dec 2022',
    body: 'Designed a 4-channel automotive ABS controller in Verilog: ≥1 MHz wheel-period capture, 2nd-fastest-wheel speed reference, 1 kHz control loop, 2 kHz PWM valve drivers. Also built CDC synchronizers, lost-pulse timeouts, valve interlocks, and diagnostics counters; wrote SystemVerilog wheel-dynamics testbench and AXI-Lite hooks for FPGA bring-up.',
  },
  {
    title: 'M.S. Electrical & Computer Engineering — UC Irvine',
    when: 'UC Irvine · June 2025 · GPA 3.6',
    body: 'Focused on ASIC verification and digital design. Completed coursework spanning SoC design, DL accelerator design, low-power design, DFT, and heterogeneous integration.',
  },
  {
    title: 'Lab Research Assistant / Grader — UC Irvine',
    when: 'Feb 2024 – June 2025',
    body: 'Migrated lab flow from FPGA to ASIC using Synopsys and Cadence physical-design toolchains. Authored TCL/Perl/CSH synthesis and P&R scripts for hardware/software co-design projects. Designed and graded Verilog lab assignments covering synthesis, simulation, and timing analysis.',
  },
  {
    title: 'Research — FlexiBit Accelerator (In Review)',
    when: '2024 – Present',
    body: 'Proposed a novel arbitrary-precision floating-point matrix-multiplication architecture (e.g., FP6) at near-full utilization. Designed the precision unit in Verilog/SystemVerilog, verified in VCS, and ran full RTL-to-layout (Design Compiler → Innovus P&R, 14 nm library), achieving latency reductions and improved performance-per-area vs. traditional accelerators.',
  },
  {
    title: 'Electrical System R&D & AI Engineer — HMLS Auto Service LLC',
    when: 'Jun 2025 – Jun 2026 · Orange County & San Jose, CA',
    body: 'Researched and proposed improvements to automotive electrical systems across a range of vehicle makes and models. Led AI agent development — architected and shipped Fixo (fixo.ink), a multimodal auto-diagnosis agent that accepts photos, audio clips, OBD-II codes, and text descriptions to produce severity ratings, repair-cost estimates, and mechanic-ready PDF reports in ~30 seconds. Also built and maintained the full HMLS service platform (hmls.autos): Next.js frontend, Deno/Hono backend, Supabase (PostgreSQL + Drizzle ORM), Stripe payments, and provider-scheduling workflows — handling the complete order lifecycle from AI-generated estimates through booking and completion.',
  },
  {
    title: 'Independent Verification & RTL Projects',
    when: 'June 2025 – Present · San Jose, CA',
    body: 'Self-directed deep-dives: complete UVM environments for AXI4 SRAM controllers and RISC-V SoC accelerators, constrained-random stimulus, SVA assertions, and golden C++ models — all targeting 100% functional coverage.',
  },
];

// The same path as a timing diagram. Dates are the ones stated in `timeline`
// above. `from`/`to`/`at` are 'YYYY-MM'; a year-only `from` ('2024') means the
// start month is not known and is drawn as an uncertain transition. `to: null`
// means the signal is still high today.
export const WAVE_START = '2022-01';

export type Span = { from: string; to: string | null; label: string };
export type Signal =
  | { name: string; kind: 'level'; spans: Span[] }
  | { name: string; kind: 'events'; events: { at: string; label: string }[] };

export const signals: Signal[] = [
  {
    name: 'degree',
    kind: 'events',
    events: [
      { at: '2023-06', label: 'B.E. · HUST' },
      { at: '2025-06', label: 'M.S. · UC Irvine' },
    ],
  },
  {
    name: 'rtl',
    kind: 'level',
    spans: [
      { from: '2022-06', to: '2022-12', label: 'Cosemi · ABS controller' },
      { from: '2024-02', to: '2025-06', label: 'UCI lab · ASIC flow' },
      { from: '2025-06', to: null, label: 'UVM & RTL projects' },
    ],
  },
  {
    name: 'research',
    kind: 'level',
    spans: [{ from: '2024', to: null, label: 'FlexiBit accelerator' }],
  },
  {
    name: 'agents',
    kind: 'level',
    spans: [{ from: '2025-06', to: null, label: 'Fixo, HMLS, MCP & skills' }],
  },
];

export const skills = [
  {
    group: 'Verification',
    items: 'UVM, SystemVerilog testbenches, constrained-random stimulus, functional coverage, SVA assertions, self-checking scoreboards, C++ golden models, CDC checks, protocol compliance',
  },
  {
    group: 'Languages & HDL',
    items: 'Verilog, SystemVerilog, VHDL, C++, Python, TypeScript, TCL, Perl, Makefile, SystemC, SpecC, HLS',
  },
  {
    group: 'Protocols & Methodology',
    items: 'AXI4, AXI-Lite, AHB, RISC-V, DFT, low-power (UPF, clock-gating, power-gating, DVFS)',
  },
  {
    group: 'EDA Tools',
    items: 'VCS, Verdi, Verilator, Yosys, Design Compiler, PrimeTime, IC Compiler II, Innovus, Virtuoso, Vivado, Vitis HLS, MATLAB',
  },
  {
    group: 'Software & AI',
    items: 'Next.js, Deno, Hono, Supabase, Drizzle ORM, Stripe, AI agent development, multimodal LLM APIs, REST APIs, PostgreSQL',
  },
  {
    group: 'Automotive',
    items: 'OBD-II diagnostics, automotive electrical systems (ABS, CDC, power management), AXI-Lite FPGA bring-up, vehicle fault analysis',
  },
];
