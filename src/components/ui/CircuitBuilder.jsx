// ============================================================
// CircuitBuilder.jsx — Drag-and-drop quantum circuit builder
// Users can place gates on qubit wires and simulate results
// ============================================================
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, Code2, RotateCcw } from 'lucide-react';
import sfx from '../../utils/soundEngine';

const GATES = [
  { id: 'H', label: 'H', name: 'Hadamard', color: '#00f5ff', desc: 'Creates superposition' },
  { id: 'X', label: 'X', name: 'Pauli-X', color: '#ff00c8', desc: 'Bit flip (NOT)' },
  { id: 'Y', label: 'Y', name: 'Pauli-Y', color: '#fbbf24', desc: 'Bit + phase flip' },
  { id: 'Z', label: 'Z', name: 'Pauli-Z', color: '#a78bfa', desc: 'Phase flip' },
  { id: 'S', label: 'S', name: 'S Gate', color: '#34d399', desc: 'π/2 phase' },
  { id: 'T', label: 'T', name: 'T Gate', color: '#f97316', desc: 'π/4 phase' },
  { id: 'CX', label: 'CX', name: 'CNOT', color: '#ffd700', desc: 'Controlled-NOT', twoQubit: true },
];

const NUM_QUBITS = 3;
const NUM_SLOTS = 8;

// Mock simulation engine
function simulateCircuit(grid, numQubits) {
  let hasH = false, hasX = false, hasCX = false;
  for (let q = 0; q < numQubits; q++) {
    for (let s = 0; s < NUM_SLOTS; s++) {
      const g = grid[q]?.[s];
      if (g === 'H') hasH = true;
      if (g === 'X') hasX = true;
      if (g === 'CX') hasCX = true;
    }
  }

  if (hasCX && hasH) {
    return { shots: 1024, results: [
      { state: '|000⟩', count: 256, color: '#00f5ff' },
      { state: '|011⟩', count: 245, color: '#ffd700' },
      { state: '|100⟩', count: 261, color: '#a78bfa' },
      { state: '|111⟩', count: 262, color: '#ff6b6b' },
    ]};
  }
  if (hasH && hasX) {
    return { shots: 1024, results: [
      { state: '|0⟩', count: 247, color: '#00f5ff' },
      { state: '|1⟩', count: 777, color: '#ff00c8' },
    ]};
  }
  if (hasH) {
    return { shots: 1024, results: [
      { state: '|0⟩', count: 508, color: '#00f5ff' },
      { state: '|1⟩', count: 516, color: '#a78bfa' },
    ]};
  }
  if (hasX) {
    return { shots: 1024, results: [
      { state: '|1⟩', count: 1024, color: '#ff00c8' },
    ]};
  }
  return { shots: 1024, results: [
    { state: '|0⟩', count: 1024, color: '#00f5ff' },
  ]};
}

function generateQiskit(grid, numQubits) {
  let lines = [
    'from qiskit import QuantumCircuit',
    'from qiskit_aer import AerSimulator',
    '',
    `qc = QuantumCircuit(${numQubits}, ${numQubits})`,
    '',
  ];
  for (let s = 0; s < NUM_SLOTS; s++) {
    for (let q = 0; q < numQubits; q++) {
      const g = grid[q]?.[s];
      if (!g) continue;
      if (g === 'H') lines.push(`qc.h(${q})`);
      else if (g === 'X') lines.push(`qc.x(${q})`);
      else if (g === 'Y') lines.push(`qc.y(${q})`);
      else if (g === 'Z') lines.push(`qc.z(${q})`);
      else if (g === 'S') lines.push(`qc.s(${q})`);
      else if (g === 'T') lines.push(`qc.t(${q})`);
      else if (g === 'CX') {
        const tgt = (q + 1) % numQubits;
        lines.push(`qc.cx(${q}, ${tgt})`);
      }
    }
  }
  lines.push('');
  lines.push(`qc.measure(range(${numQubits}), range(${numQubits}))`);
  lines.push('');
  lines.push('sim = AerSimulator()');
  lines.push('result = sim.run(qc, shots=1024).result()');
  lines.push('print(result.get_counts())');
  return lines.join('\n');
}

const CircuitBuilder = ({ onClose }) => {
  const [grid, setGrid] = useState(() => {
    const g = {};
    for (let q = 0; q < NUM_QUBITS; q++) g[q] = {};
    return g;
  });
  const [selectedGate, setSelectedGate] = useState(null);
  const [simResults, setSimResults] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  const placeGate = useCallback((qubit, slot) => {
    if (!selectedGate) return;
    sfx.gatePlaced();
    setGrid(prev => {
      const next = { ...prev };
      next[qubit] = { ...next[qubit] };
      if (next[qubit][slot] === selectedGate) {
        delete next[qubit][slot];
        sfx.gateRemoved();
      } else {
        next[qubit][slot] = selectedGate;
      }
      return next;
    });
    setSimResults(null);
    setSimProgress(0);
  }, [selectedGate]);

  const clearCircuit = () => {
    sfx.gateRemoved();
    const g = {};
    for (let q = 0; q < NUM_QUBITS; q++) g[q] = {};
    setGrid(g);
    setSimResults(null);
    setSimProgress(0);
    setShowCode(false);
  };

  const runSimulation = () => {
    sfx.simStart();
    setSimResults(null);
    setSimProgress(0);
    const start = performance.now();
    const dur = 1400;
    const iv = setInterval(() => {
      const p = Math.min((performance.now() - start) / dur, 1);
      setSimProgress(1 - Math.pow(1 - p, 3));
      if (p >= 1) {
        clearInterval(iv);
        const res = simulateCircuit(grid, NUM_QUBITS);
        setSimResults(res);
        sfx.simComplete();
      }
    }, 16);
  };

  const gateCount = Object.values(grid).reduce((sum, row) => sum + Object.keys(row).length, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(2, 8, 23, 0.92)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 100%)',
          border: '1px solid rgba(0, 245, 255, 0.15)',
          boxShadow: '0 0 60px rgba(0, 245, 255, 0.08)',
          borderRadius: '16px',
          width: '920px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <div>
            <h2 style={{ fontFamily: 'Orbitron', color: '#00f5ff', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              CIRCUIT BUILDER
            </h2>
            <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.72rem', marginTop: '2px' }}>
              Select a gate → Click on a wire position to place it
            </p>
          </div>
          <button onClick={() => { sfx.panelClose(); onClose(); }}
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Gate palette */}
          <div>
            <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 600 }}>
              AVAILABLE GATES
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {GATES.map(g => (
                <button
                  key={g.id}
                  onClick={() => { sfx.click(); setSelectedGate(g.id); }}
                  style={{
                    background: selectedGate === g.id ? `${g.color}22` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedGate === g.id ? g.color : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'all 0.2s',
                    minWidth: '64px',
                  }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 900, color: g.color }}>{g.label}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: '0.55rem', color: '#64748b' }}>{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Circuit grid */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(0,245,255,0.08)',
            padding: '20px',
            overflowX: 'auto',
          }}>
            {Array.from({ length: NUM_QUBITS }).map((_, q) => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', marginBottom: q < NUM_QUBITS - 1 ? '12px' : 0 }}>
                {/* Qubit label */}
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#64748b',
                  minWidth: '40px', textAlign: 'right', marginRight: '12px',
                }}>
                  q{q} |0⟩
                </span>
                {/* Wire + slots */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                  {/* Wire line */}
                  <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0, height: '2px',
                    background: 'rgba(0,245,255,0.15)', transform: 'translateY(-50%)',
                  }} />
                  {Array.from({ length: NUM_SLOTS }).map((_, s) => {
                    const placed = grid[q]?.[s];
                    const gate = placed ? GATES.find(g => g.id === placed) : null;
                    return (
                      <div
                        key={s}
                        onClick={() => placeGate(q, s)}
                        style={{
                          width: '48px', height: '48px',
                          border: `1px ${placed ? 'solid' : 'dashed'} ${gate ? gate.color + '88' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '6px',
                          background: gate ? `${gate.color}15` : 'rgba(0,0,0,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: selectedGate ? 'pointer' : 'default',
                          marginRight: '6px',
                          position: 'relative',
                          zIndex: 2,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          if (selectedGate) e.currentTarget.style.borderColor = '#00f5ff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = gate ? gate.color + '88' : 'rgba(255,255,255,0.08)';
                        }}
                      >
                        {gate && (
                          <span style={{
                            fontFamily: 'JetBrains Mono', fontWeight: 900,
                            fontSize: gate.id === 'CX' ? '0.65rem' : '0.85rem',
                            color: gate.color,
                            textShadow: `0 0 8px ${gate.color}66`,
                          }}>
                            {gate.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {/* Measurement icon */}
                  <div style={{
                    width: '36px', height: '36px', marginLeft: '6px',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '6px', background: 'rgba(52,211,153,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                  }}>
                    📏
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={runSimulation} disabled={gateCount === 0}
              style={{
                background: gateCount > 0 ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.1))' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${gateCount > 0 ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', padding: '10px 20px', cursor: gateCount > 0 ? 'pointer' : 'not-allowed',
                color: gateCount > 0 ? '#00f5ff' : '#334155',
                fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <Play size={14} /> RUN SIMULATION
            </button>
            <button onClick={() => { sfx.click(); setShowCode(!showCode); }}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                color: '#a78bfa', fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <Code2 size={14} /> {showCode ? 'HIDE CODE' : 'EXPORT QISKIT'}
            </button>
            <button onClick={clearCircuit}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                color: '#64748b', fontFamily: 'Inter', fontSize: '0.72rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Qiskit code export */}
          <AnimatePresence>
            {showCode && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <div style={{
                  background: 'rgba(0,0,0,0.4)', borderRadius: '10px',
                  border: '1px solid rgba(124,58,237,0.2)', overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                    borderBottom: '1px solid rgba(124,58,237,0.1)', background: 'rgba(0,0,0,0.3)',
                  }}>
                    <span className="w-2 h-2 rounded-full bg-red-500 opacity-70" /><span className="w-2 h-2 rounded-full bg-yellow-500 opacity-70" /><span className="w-2 h-2 rounded-full bg-green-500 opacity-70" />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#475569', marginLeft: '8px' }}>my_circuit.py</span>
                  </div>
                  <pre style={{
                    padding: '12px', margin: 0, fontFamily: 'JetBrains Mono', fontSize: '0.72rem',
                    color: '#e2e8f0', lineHeight: 1.6, overflowX: 'auto',
                  }}>
                    {generateQiskit(grid, NUM_QUBITS)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulation results */}
          {(simProgress > 0 || simResults) && (
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
              border: '1px solid rgba(0,245,255,0.1)', padding: '16px',
            }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                  SIMULATION RESULTS
                </span>
                <span style={{ color: '#475569', fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}>
                  {simResults ? '1,024/1,024' : `${Math.round(simProgress * 1024)}/1,024`} shots
                </span>
              </div>
              <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${(simResults ? 1 : simProgress) * 100}%`, background: 'linear-gradient(90deg, #00f5ff, #7c3aed)' }} />
              </div>
              {simResults && simResults.results.map(r => {
                const pct = (r.count / simResults.shots) * 100;
                return (
                  <div key={r.state} style={{ marginBottom: '8px' }}>
                    <div className="flex justify-between mb-1" style={{ fontSize: '0.72rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', color: r.color, fontWeight: 700 }}>{r.state}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', color: '#64748b', fontSize: '0.63rem' }}>
                        {r.count} · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: '18px', borderRadius: '6px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{
                          height: '100%', borderRadius: '6px',
                          background: `linear-gradient(90deg, ${r.color}33, ${r.color}88)`,
                          borderRight: `2px solid ${r.color}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {simResults && (
                <div style={{
                  marginTop: '8px', padding: '6px 10px', borderRadius: '6px',
                  background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)',
                  color: '#475569', fontFamily: 'Inter', fontSize: '0.65rem',
                }}>
                  ✓ Simulation complete — 1,024 shots · AerSimulator (mock)
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CircuitBuilder;
