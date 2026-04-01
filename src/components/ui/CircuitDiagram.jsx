// ============================================================
// CircuitDiagram.jsx — SVG-based circuit diagrams for each concept
// ============================================================
import React from 'react';

// ── Shared SVG primitives ──────────────────────────────────
const Wire = ({ x1, y1, x2, y2, color = '#00f5ff' }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} opacity={0.8} />
);

const GateBox = ({ x, y, w = 36, h = 36, label, color = '#00f5ff', fill = 'rgba(0,245,255,0.08)' }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={fill} stroke={color} strokeWidth={1.5} rx={4} />
    <text x={x} y={y + 5} textAnchor="middle" fill={color} fontSize={14} fontWeight="bold" fontFamily="JetBrains Mono">
      {label}
    </text>
  </g>
);

const Ctrl = ({ x, y, color = '#ffd700' }) => (
  <circle cx={x} cy={y} r={6} fill={color} />
);

const Target = ({ x, y, color = '#ffd700' }) => (
  <g>
    <circle cx={x} cy={y} r={12} fill="none" stroke={color} strokeWidth={1.5} />
    <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke={color} strokeWidth={1.5} />
    <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke={color} strokeWidth={1.5} />
  </g>
);

const Qubit0 = ({ y, label = '|0⟩', color = '#64748b' }) => (
  <>
    <text x={14} y={y + 5} fill={color} fontSize={12} fontFamily="JetBrains Mono">{label}</text>
    <Wire x1={44} y1={y} x2={260} y2={y} color={color} />
  </>
);

const MeasureBox = ({ x, y, color = '#34d399' }) => (
  <g>
    <rect x={x - 18} y={y - 18} width={36} height={36} fill="rgba(52,211,153,0.08)" stroke={color} strokeWidth={1.5} rx={4} />
    <path d={`M${x - 8},${y + 6} Q${x},${y - 10} ${x + 8},${y + 6}`} fill="none" stroke={color} strokeWidth={1.5} />
    <line x1={x} y1={y - 2} x2={x + 10} y2={y - 10} stroke={color} strokeWidth={1.5} />
  </g>
);

// ── Individual diagrams ────────────────────────────────────

const DiagramQubit = () => (
  <svg width="280" height="70" viewBox="0 0 280 70">
    <Qubit0 y={35} label="|0⟩" color="#00f5ff" />
    <circle cx={200} cy={35} r={8} fill="#00f5ff" opacity={0.3} />
    <circle cx={200} cy={35} r={4} fill="#00f5ff" />
    <text x={145} y={25} fill="#64748b" fontSize={10} fontFamily="Inter">init state</text>
    <text x={190} y={25} fill="#00f5ff" fontSize={10} fontFamily="JetBrains Mono">|ψ⟩</text>
  </svg>
);

const DiagramSuperposition = () => (
  <svg width="280" height="70" viewBox="0 0 280 70">
    <Qubit0 y={35} label="|0⟩" color="#a78bfa" />
    <GateBox x={110} y={35} label="H" color="#a78bfa" fill="rgba(167,139,250,0.1)" />
    <MeasureBox x={210} y={35} color="#a78bfa" />
    <text x={85} y={20} fill="#64748b" fontSize={9} fontFamily="Inter">Hadamard</text>
    <text x={195} y={20} fill="#a78bfa" fontSize={9} fontFamily="JetBrains Mono">measure</text>
  </svg>
);

const DiagramHadamard = () => (
  <svg width="280" height="70" viewBox="0 0 280 70">
    <Qubit0 y={35} label="|0⟩" color="#00f5ff" />
    <GateBox x={110} y={35} label="H" color="#00f5ff" fill="rgba(0,245,255,0.1)" />
    <text x={200} y={30} fill="#00f5ff" fontSize={11} fontFamily="JetBrains Mono">|+⟩</text>
    <text x={85} y={20} fill="#64748b" fontSize={9} fontFamily="Inter">H gate</text>
    <text x={175} y={20} fill="#64748b" fontSize={9} fontFamily="Inter">output</text>
  </svg>
);

const DiagramPauliX = () => (
  <svg width="280" height="70" viewBox="0 0 280 70">
    <Qubit0 y={35} label="|0⟩" color="#ff00c8" />
    <GateBox x={130} y={35} label="X" color="#ff00c8" fill="rgba(255,0,200,0.1)" />
    <text x={200} y={30} fill="#ff00c8" fontSize={11} fontFamily="JetBrains Mono">|1⟩</text>
    <text x={108} y={20} fill="#64748b" fontSize={9} fontFamily="Inter">NOT flip</text>
    <text x={175} y={20} fill="#64748b" fontSize={9} fontFamily="Inter">output</text>
  </svg>
);

const DiagramCnot = () => (
  <svg width="280" height="100" viewBox="0 0 100 100">
    {/* qubit lines */}
    <line x1={20} y1={30} x2={95} y2={30} stroke="#64748b" strokeWidth={1.5} />
    <line x1={20} y1={70} x2={95} y2={70} stroke="#64748b" strokeWidth={1.5} />
    <text x={2} y={35} fill="#ffd700" fontSize={10} fontFamily="JetBrains Mono">q0</text>
    <text x={2} y={75} fill="#ffd700" fontSize={10} fontFamily="JetBrains Mono">q1</text>
    {/* H gate on q0 */}
    <rect x={28} y={16} width={24} height={24} fill="rgba(0,245,255,0.1)" stroke="#00f5ff" strokeWidth={1.2} rx={3} />
    <text x={40} y={33} textAnchor="middle" fill="#00f5ff" fontSize={12} fontWeight="bold" fontFamily="JetBrains Mono">H</text>
    {/* CNOT */}
    <Ctrl x={72} y={30} color="#ffd700" />
    <line x1={72} y1={30} x2={72} y2={70} stroke="#ffd700" strokeWidth={1.5} />
    <Target x={72} y={70} color="#ffd700" />
  </svg>
);

const DiagramEntanglement = () => (
  <svg width="280" height="100" viewBox="0 0 280 100">
    <line x1={14} y1={30} x2={265} y2={30} stroke="#ff6b6b" strokeWidth={1.5} opacity={0.6} />
    <line x1={14} y1={70} x2={265} y2={70} stroke="#ff6b6b" strokeWidth={1.5} opacity={0.6} />
    <text x={2} y={35} fill="#ff6b6b" fontSize={10} fontFamily="JetBrains Mono">q0</text>
    <text x={2} y={75} fill="#ff6b6b" fontSize={10} fontFamily="JetBrains Mono">q1</text>
    <GateBox x={90} y={30} label="H" color="#ff6b6b" fill="rgba(255,107,107,0.1)" />
    <Ctrl x={160} y={30} color="#ff6b6b" />
    <line x1={160} y1={30} x2={160} y2={70} stroke="#ff6b6b" strokeWidth={1.5} />
    <Target x={160} y={70} color="#ff6b6b" />
    <text x={220} y={27} fill="#ff6b6b" fontSize={9} fontFamily="JetBrains Mono">|Φ+⟩</text>
  </svg>
);

const DiagramMeasurement = () => (
  <svg width="280" height="70" viewBox="0 0 280 70">
    <Qubit0 y={35} label="|ψ⟩" color="#34d399" />
    <GateBox x={100} y={35} label="H" color="#34d399" fill="rgba(52,211,153,0.1)" />
    <MeasureBox x={190} y={35} color="#34d399" />
    <text x={238} y={30} fill="#34d399" fontSize={13} fontFamily="JetBrains Mono">0/1</text>
    <text x={167} y={20} fill="#64748b" fontSize={9} fontFamily="Inter">collapse</text>
  </svg>
);

// ── Dispatcher ────────────────────────────────────────────
const diagrams = {
  qubit: DiagramQubit,
  superposition: DiagramSuperposition,
  hadamard: DiagramHadamard,
  pauliX: DiagramPauliX,
  cnot: DiagramCnot,
  entanglement: DiagramEntanglement,
  measurement: DiagramMeasurement,
};

const CircuitDiagram = ({ type }) => {
  const Diagram = diagrams[type];
  if (!Diagram) return null;
  return (
    <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-medium mb-2" style={{ color: '#64748b', fontFamily: 'Inter' }}>
        CIRCUIT DIAGRAM
      </p>
      <Diagram />
    </div>
  );
};

export default CircuitDiagram;
