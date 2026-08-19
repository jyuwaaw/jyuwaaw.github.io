// ┌────────────────────────────────────────────────────────────────┐
// │  Single source of truth for project cards.                      │
// │  Home shows entries with `featured: true`; /projects shows all, │
// │  grouped by era (display order = ERAS order, then array order). │
// └────────────────────────────────────────────────────────────────┘
import { site } from '@/lib/site';

export const ERAS = [
  {
    id: 'agents',
    label: 'AI & Agents',
    blurb: 'MCP servers, Claude Code skills, and agent-first product work — teaching AI tools to reach the software people actually use.',
  },
  {
    id: 'silicon',
    label: 'Silicon & Systems',
    blurb: 'RTL design, UVM verification, and accelerator research — from arithmetic units to full RTL-to-GDSII.',
  },
];

export const projects = [
  // ── AI & Agents ────────────────────────────────────────────────
  {
    era: 'agents',
    featured: true,
    tag: 'MCP',
    title: 'mindnode-mcp — MCP server for MindNode',
    tracks: ['mcp'],
    desc: 'MindNode Next ships no API, no AppleScript, and no files. Reverse-engineered its SQLite/CRDT library (protobuf + Apple LZ4) so Claude and any MCP client can read mind maps as Markdown and create new ones.',
    meta: ['TypeScript', 'MCP', 'reverse engineering', 'macOS'],
    href: 'https://github.com/jyuwaaw/mindnode-mcp',
  },
  {
    era: 'agents',
    featured: true,
    tag: 'Claude Code skill',
    title: '点破 dianpo — mental-model explainer',
    tracks: ['mcp'],
    desc: 'A Claude Code skill that pinpoints the non-obvious mental model behind any technical mechanism — whose token is it, who verifies whom, why the design has this shape. Built with a trigger-eval suite.',
    meta: ['skill', 'prompt engineering', 'evals'],
    href: 'https://github.com/jyuwaaw/dianpo-skill',
  },
  {
    era: 'agents',
    featured: true,
    tag: 'Pipeline',
    title: 'learnlog — daily notes to bilingual posts',
    tracks: ['mcp'],
    desc: 'The pipeline behind this site: a skill that turns a day\'s distilled learning note into an English/Chinese post with inline-SVG diagrams, verifies the static build, and opens the PR.',
    meta: ['skill', 'Next.js', 'automation'],
    href: 'https://github.com/jyuwaaw/jyuwaaw.github.io',
  },
  {
    era: 'agents',
    tag: 'Workflow',
    title: 'vibecoding shortcuts & icons',
    tracks: ['mcp'],
    desc: 'Stream Dock M3 shortcut profiles and transparent icon packs for driving Claude Desktop and Claude Code with physical keys.',
    meta: ['Stream Dock', 'macOS'],
    href: 'https://github.com/jyuwaaw/vibecoding-shortcuts-icons',
  },
  {
    era: 'agents',
    tag: 'Full-Stack',
    title: 'HMLS — mobile mechanic platform',
    tracks: ['ai'],
    desc: 'End-to-end service platform for a mobile mechanic business in Orange County & San Jose: AI-powered chat → instant estimates → Stripe payments → provider scheduling. Built and maintained the full stack.',
    meta: ['Next.js', 'Deno', 'Supabase', 'Stripe'],
    href: 'https://hmls.autos',
  },

  // ── Silicon & Systems ──────────────────────────────────────────
  {
    era: 'silicon',
    featured: true,
    tag: 'Research',
    title: 'FlexiBit — fully flexible precision bit-parallel accelerator',
    tracks: ['hardware', 'ai'],
    desc: 'Novel architecture for arbitrary mixed-precision AI (FP6, FP5, INT3…) at near-full utilization. Designed in Verilog/SystemVerilog, verified in VCS, taped out RTL-to-layout at 14 nm (Design Compiler → Innovus). Paper in review.',
    meta: ['Verilog', 'SystemVerilog', 'VCS', '14 nm'],
    href: site.arxiv,
  },
  {
    era: 'silicon',
    featured: true,
    tag: 'Low Power',
    title: 'Low-power accelerator via NN error-resilience',
    tracks: ['hardware', 'ai'],
    desc: 'Data-reordering algorithm minimizing bit flips to exploit timing slack; combined with clock-gating, power-gating, and DVFS in a 3-domain UPF. Reduced clock from 1 GHz to 297 MHz at 85.7% accuracy.',
    meta: ['Python', 'UPF', 'DVFS', 'ASIC'],
    href: 'https://github.com/jyuwaaw/Low_Power_Accelerator_Design_based_on_Neural_Network_Error_Resilience',
  },
  {
    era: 'silicon',
    featured: true,
    tag: 'HLS / FPGA',
    title: 'SoC-based MatMul & DNN accelerator',
    tracks: ['hardware', 'ai'],
    desc: 'HLS-based SoC accelerators on AMD KR260 (PYNQ) cutting DNN inference runtime from 4612 s to 44 s while maintaining 98% accuracy. Resources: 16K FFs, 11.9K LUTs, 80 DSPs.',
    meta: ['Vitis HLS', 'FPGA', 'VHDL', 'C++'],
    href: 'https://github.com/jyuwaaw/SoC-based-MatMul-Accelerator-and-DNN-Accelerator',
  },
  {
    era: 'silicon',
    tag: 'Verification',
    title: 'AXI4-compliant SRAM controller with UVM',
    tracks: ['verification'],
    desc: 'Full UVM environment — AXI agents, self-checking scoreboard, constrained-random sequences — achieving 100% AXI4 protocol compliance across AW/W/B and AR/R channels with bursts up to 256 beats.',
    meta: ['UVM', 'SystemVerilog', 'AXI4'],
    href: site.github,
  },
  {
    era: 'silicon',
    tag: 'SoC Design',
    title: 'Flexible-bit AI accelerator on RISC-V SoC',
    tracks: ['hardware', 'verification'],
    desc: 'AXI4-integrated RISC-V accelerator verified with a UVM testbench. Supports FP6–FP8 and INT2–8 tensor ops with parameterized FBRT multipliers and flexible-bit adders over AXI4.',
    meta: ['Verilog', 'UVM', 'RISC-V', 'AXI4'],
    href: site.github,
  },
  {
    era: 'silicon',
    tag: 'RTL',
    title: 'Systolic array — FP16 / FP8 / INT8',
    tracks: ['hardware'],
    desc: 'Parameterized systolic-array matrix engine with mixed-precision PEs in synthesizable Verilog.',
    meta: ['Verilog', 'systolic array'],
    href: 'https://github.com/jyuwaaw/Systolic_Array_fp16_fp8_int8',
  },
  {
    era: 'silicon',
    tag: 'Co-simulation',
    title: 'Ibex RISC-V co-simulation',
    tracks: ['verification'],
    desc: 'Instruction-level co-simulation flow for the lowRISC Ibex core against a golden ISS.',
    meta: ['RISC-V', 'Python', 'verification'],
    href: 'https://github.com/jyuwaaw/ibex_cosim',
  },
  {
    era: 'silicon',
    tag: 'Analog / Mixed',
    title: '10 Gbps TIA in 45 nm CMOS',
    tracks: ['hardware'],
    desc: 'Design and simulation of a 10 Gbps transimpedance amplifier front-end for optical receivers in 45 nm.',
    meta: ['CMOS', 'analog'],
    href: 'https://github.com/jyuwaaw/10Gbps-TIA-in-45nm-CMOS',
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function projectsByEra() {
  return ERAS.map((era) => ({
    ...era,
    projects: projects.filter((p) => p.era === era.id),
  }));
}
