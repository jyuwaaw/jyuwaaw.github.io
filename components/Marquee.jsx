const ITEMS = [
  'UVM', 'SystemVerilog', 'Verilog', 'AXI4', 'RISC-V',
  'SVA', 'Design Compiler', 'Innovus', 'VCS', 'Verdi',
  'RTL-to-GDSII', 'C++', 'Python', 'TCL', 'FPGA',
  'Vitis HLS', 'CDC', 'DFT', 'UPF / DVFS', '中文', '粵語',
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i}>{item} ✦</span>
        ))}
      </div>
    </div>
  );
}
