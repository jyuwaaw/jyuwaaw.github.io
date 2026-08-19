// ┌──────────────────────────────────────────────────────────────────┐
// │  Professional focus tracks — the recruiter-facing cross-section.  │
// │  One track page (/focus/<id>) aggregates every project (via the   │
// │  `tracks` field in lib/projects.js) and every post (via tag       │
// │  matching below) for that direction.                              │
// └──────────────────────────────────────────────────────────────────┘

export const TRACKS = [
  {
    id: 'verification',
    label: 'Verification',
    blurb: 'UVM environments, constrained-random testing, co-simulation, protocol compliance — proving silicon correct before it exists.',
    matchTags: ['uvm', 'verification', 'sva', 'cosim', 'systemverilog', 'axi4', 'coverage'],
  },
  {
    id: 'hardware',
    label: 'Hardware',
    blurb: 'RTL design, accelerators, low power, analog front-ends — from the arithmetic inside a PE to full RTL-to-GDSII.',
    matchTags: ['rtl', 'verilog', 'vhdl', 'fpga', 'asic', 'hardware', 'silicon', 'soc', 'systolic-array', 'low-power', 'hls'],
  },
  {
    id: 'mcp',
    label: 'MCP & Agents',
    blurb: 'MCP servers, Claude Code skills, and the plumbing that lets AI agents reach software that was never meant to be automated.',
    matchTags: ['mcp', 'agents', 'claude-code', 'skill', 'skills', 'hooks', 'reverse-engineering'],
  },
  {
    id: 'ai',
    label: 'AI Systems',
    blurb: 'AI acceleration research on the silicon side; AI-powered products on the software side.',
    matchTags: ['ai', 'ml', 'llm', 'accelerator', 'accelerators', 'evals'],
  },
];

export function getTrack(id) {
  return TRACKS.find((t) => t.id === id) ?? null;
}

export function postsForTrack(track, posts) {
  return posts.filter((p) => p.tags.some((tag) => track.matchTags.includes(tag)));
}
