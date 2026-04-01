// ============================================================
// AlgorithmVisualizer.jsx — Step-through quantum algorithm animations
// Deutsch-Jozsa and Grover's Search with circuit builds + state tracking
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, RotateCcw, ChevronRight } from 'lucide-react';
import sfx from '../../utils/soundEngine';

// ── Algorithm definitions ────────────────────────────────
const ALGORITHMS = {
  deutschJozsa: {
    id: 'deutschJozsa',
    title: 'Deutsch-Jozsa Algorithm',
    subtitle: 'Is the function constant or balanced?',
    color: '#00f5ff',
    description: 'Determines whether a Boolean function f(x) is constant (same output for all inputs) or balanced (different outputs for half the inputs). Classically requires 2^(n-1)+1 evaluations; quantum needs just ONE.',
    steps: [
      {
        title: 'Initialize Qubits',
        desc: 'Start with input qubits in |0⟩ and ancilla qubit in |1⟩.',
        circuit: ['|0⟩ ────', '|0⟩ ────', '|1⟩ ────'],
        stateVec: '|0⟩|0⟩|1⟩',
        highlight: 'All qubits initialized to their starting states.',
      },
      {
        title: 'Apply Hadamard to All',
        desc: 'Apply H gate to every qubit — creates equal superposition on inputs and |−⟩ on ancilla.',
        circuit: ['|0⟩ ─[H]─', '|0⟩ ─[H]─', '|1⟩ ─[H]─'],
        stateVec: '|+⟩|+⟩|−⟩ = (1/2)(|00⟩+|01⟩+|10⟩+|11⟩)|−⟩',
        highlight: 'Superposition enables quantum parallelism — all inputs evaluated at once.',
      },
      {
        title: 'Apply Oracle Uf',
        desc: 'The quantum oracle encodes the function f(x). It flips the ancilla if f(x)=1. This creates phase kickback.',
        circuit: ['|+⟩ ─[H]──┤Uf├─', '|+⟩ ─[H]──┤  ├─', '|−⟩ ─[H]──┤  ├─'],
        stateVec: 'Σ (-1)^f(x) |x⟩|−⟩',
        highlight: 'Phase kickback: the function information is encoded in the PHASE of the input qubits, not in the ancilla.',
      },
      {
        title: 'Apply Hadamard Again',
        desc: 'Apply H gate to input qubits again. Interference causes all amplitudes to cancel (balanced) or add up (constant).',
        circuit: ['──┤Uf├─[H]──📏', '──┤  ├─[H]──📏', '──┤  ├───────'],
        stateVec: 'Constant: |00⟩  |  Balanced: ≠ |00⟩',
        highlight: 'Constructive/destructive interference reveals the answer without looking at f(x) directly.',
      },
      {
        title: 'Measure',
        desc: 'Measure input qubits. If ALL are |0⟩ → function is CONSTANT. Otherwise → BALANCED.',
        circuit: ['──[H]──📏 → |0⟩ ✓', '──[H]──📏 → |0⟩ ✓', '──────────────'],
        stateVec: 'Result: |00⟩ → CONSTANT ✓',
        highlight: '🎉 One quantum evaluation vs 2^(n-1)+1 classical queries! Exponential speedup!',
      },
    ],
  },
  grover: {
    id: 'grover',
    title: "Grover's Search Algorithm",
    subtitle: 'Finding a needle in a quantum haystack',
    color: '#a78bfa',
    description: 'Searches an unsorted database of N items in O(√N) time instead of O(N). For a database of 1 million items, Grover needs only ~1000 queries instead of 500,000.',
    steps: [
      {
        title: 'Initialize Superposition',
        desc: 'Apply Hadamard to all qubits — creates uniform superposition over all N states.',
        circuit: ['|0⟩ ─[H]─', '|0⟩ ─[H]─'],
        stateVec: '|s⟩ = (1/2)(|00⟩+|01⟩+|10⟩+|11⟩)',
        highlight: 'Every item in the database has equal probability (1/N) of being measured.',
        amplitudes: [
          { state: '|00⟩', value: 0.5, isTarget: false },
          { state: '|01⟩', value: 0.5, isTarget: false },
          { state: '|10⟩', value: 0.5, isTarget: true },
          { state: '|11⟩', value: 0.5, isTarget: false },
        ],
      },
      {
        title: 'Apply Oracle (Phase Flip)',
        desc: 'The Oracle marks the target state |10⟩ by flipping its amplitude sign: |10⟩ → -|10⟩.',
        circuit: ['─[H]──┤Oracle├─', '─[H]──┤      ├─'],
        stateVec: '(1/2)(|00⟩+|01⟩-|10⟩+|11⟩)',
        highlight: 'The target state |10⟩ now has NEGATIVE amplitude — but measurement probabilities remain equal.',
        amplitudes: [
          { state: '|00⟩', value: 0.5, isTarget: false },
          { state: '|01⟩', value: 0.5, isTarget: false },
          { state: '|10⟩', value: -0.5, isTarget: true },
          { state: '|11⟩', value: 0.5, isTarget: false },
        ],
      },
      {
        title: 'Diffusion Operator',
        desc: 'Reflect all amplitudes about the mean. This BOOSTS the target amplitude while suppressing others.',
        circuit: ['─┤Oracle├──[H][X]─●─[X][H]─', '─┤      ├──[H][X]─●─[X][H]─'],
        stateVec: '|10⟩ amplitude ≈ 1.0, others ≈ 0',
        highlight: '"Inversion about the mean" — the target amplitude grows while non-targets shrink!',
        amplitudes: [
          { state: '|00⟩', value: 0.0, isTarget: false },
          { state: '|01⟩', value: 0.0, isTarget: false },
          { state: '|10⟩', value: 1.0, isTarget: true },
          { state: '|11⟩', value: 0.0, isTarget: false },
        ],
      },
      {
        title: 'Measure',
        desc: 'Measure all qubits. With high probability, the result is the TARGET state |10⟩.',
        circuit: ['─[Diffusion]──📏 → |1⟩', '─[Diffusion]──📏 → |0⟩'],
        stateVec: 'Result: |10⟩ with ~100% probability!',
        highlight: '🎉 Found the target in √N steps! For N=4, just 1 iteration. For N=1M, only ~1000 iterations.',
        amplitudes: [
          { state: '|00⟩', value: 0.0, isTarget: false },
          { state: '|01⟩', value: 0.0, isTarget: false },
          { state: '|10⟩', value: 1.0, isTarget: true },
          { state: '|11⟩', value: 0.0, isTarget: false },
        ],
      },
    ],
  },
};

const AmplitudeChart = ({ amplitudes, color }) => {
  if (!amplitudes) return null;
  const maxAbs = Math.max(...amplitudes.map(a => Math.abs(a.value)), 0.01);
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)',
      borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)',
      marginTop: '10px',
    }}>
      {amplitudes.map(a => {
        const h = Math.abs(a.value) / maxAbs * 80;
        const isNeg = a.value < 0;
        return (
          <div key={a.state} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#64748b' }}>
              {a.value.toFixed(2)}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                width: '32px', borderRadius: '4px 4px 0 0',
                background: a.isTarget
                  ? `linear-gradient(180deg, ${color}, ${color}66)`
                  : isNeg ? 'linear-gradient(180deg, #ef4444, #ef444466)' : 'linear-gradient(180deg, #334155, #33415566)',
                border: `1px solid ${a.isTarget ? color : isNeg ? '#ef4444' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: a.isTarget ? `0 0 12px ${color}44` : 'none',
              }}
            />
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: '0.6rem',
              color: a.isTarget ? color : '#64748b', fontWeight: a.isTarget ? 700 : 400,
            }}>
              {a.state}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const AlgorithmVisualizer = ({ onClose }) => {
  const [algoId, setAlgoId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const algo = algoId ? ALGORITHMS[algoId] : null;
  const step = algo ? algo.steps[currentStep] : null;

  useEffect(() => {
    if (!playing || !algo) return;
    timerRef.current = setTimeout(() => {
      sfx.step();
      if (currentStep < algo.steps.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        setPlaying(false);
        sfx.simComplete();
      }
    }, 2500);
    return () => clearTimeout(timerRef.current);
  }, [playing, currentStep, algo]);

  const selectAlgo = (id) => {
    sfx.click();
    setAlgoId(id);
    setCurrentStep(0);
    setPlaying(false);
  };

  const nextStep = () => {
    if (!algo || currentStep >= algo.steps.length - 1) return;
    sfx.step();
    setCurrentStep(s => s + 1);
  };

  const reset = () => {
    sfx.click();
    setCurrentStep(0);
    setPlaying(false);
  };

  // ── Algorithm selection screen ──
  if (!algo) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(2, 8, 23, 0.92)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, #0a0f1e, #0d1528)', borderRadius: '16px',
            border: '1px solid rgba(0,245,255,0.12)', padding: '40px', maxWidth: '600px',
            boxShadow: '0 0 60px rgba(0,245,255,0.08)',
          }}>
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontFamily: 'Orbitron', color: '#a78bfa', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              ALGORITHM VISUALIZER
            </h2>
            <button onClick={() => { sfx.panelClose(); onClose(); }}
              style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontFamily: 'Inter', fontSize: '0.82rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Watch quantum algorithms execute step-by-step with animated state vectors and circuit construction.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.values(ALGORITHMS).map(a => (
              <button key={a.id} onClick={() => selectAlgo(a.id)}
                style={{
                  background: `rgba(${a.color === '#00f5ff' ? '0,245,255' : '167,139,250'}, 0.06)`,
                  border: `1px solid ${a.color}33`,
                  borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; sfx.hover(); }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = a.color + '33'; }}
              >
                <div style={{ fontFamily: 'Orbitron', color: a.color, fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  {a.title}
                </div>
                <div style={{ color: '#64748b', fontFamily: 'Inter', fontSize: '0.72rem' }}>{a.subtitle}</div>
                <div style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.68rem', marginTop: '6px', lineHeight: 1.5 }}>
                  {a.description}
                </div>
                <div style={{
                  marginTop: '8px', color: a.color, fontFamily: 'JetBrains Mono', fontSize: '0.6rem',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {a.steps.length} steps <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── Step-through view ──
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(2, 8, 23, 0.92)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0a0f1e, #0d1528)', borderRadius: '16px',
          border: `1px solid ${algo.color}22`, width: '780px', maxHeight: '85vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: `0 0 60px ${algo.color}15`,
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${algo.color}15` }}>
          <div>
            <h2 style={{ fontFamily: 'Orbitron', color: algo.color, fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.08em' }}>
              {algo.title}
            </h2>
            <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.68rem', marginTop: '2px' }}>{algo.subtitle}</p>
          </div>
          <button onClick={() => { sfx.panelClose(); onClose(); }}
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step progress */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {algo.steps.map((_, i) => (
              <React.Fragment key={i}>
                <div
                  onClick={() => { sfx.step(); setCurrentStep(i); }}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i <= currentStep ? `${algo.color}22` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${i === currentStep ? algo.color : i < currentStep ? algo.color + '55' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono', fontSize: '0.65rem', fontWeight: 700,
                    color: i <= currentStep ? algo.color : '#334155',
                    cursor: 'pointer', transition: 'all 0.3s',
                    boxShadow: i === currentStep ? `0 0 12px ${algo.color}44` : 'none',
                  }}>
                  {i + 1}
                </div>
                {i < algo.steps.length - 1 && (
                  <div style={{
                    flex: 1, height: '2px',
                    background: i < currentStep ? algo.color + '55' : 'rgba(255,255,255,0.05)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step title + description */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'Orbitron', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700 }}>
                  Step {currentStep + 1}: {step.title}
                </h3>
                <p style={{ color: '#94a3b8', fontFamily: 'Inter', fontSize: '0.78rem', marginTop: '6px', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>

              {/* Circuit visualization */}
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
                border: `1px solid ${algo.color}15`, padding: '16px', fontFamily: 'JetBrains Mono',
              }}>
                <span style={{ color: '#475569', fontSize: '0.6rem', letterSpacing: '0.1em' }}>CIRCUIT</span>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {step.circuit.map((wire, i) => (
                    <div key={i} style={{ color: algo.color, fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                      {wire}
                    </div>
                  ))}
                </div>
              </div>

              {/* State vector */}
              <div style={{
                marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)', border: `1px solid ${algo.color}15`,
              }}>
                <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.1em' }}>STATE VECTOR</span>
                <div style={{
                  marginTop: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.78rem',
                  color: algo.color, lineHeight: 1.5,
                }}>
                  {step.stateVec}
                </div>
              </div>

              {/* Amplitude chart (Grover's) */}
              {step.amplitudes && <AmplitudeChart amplitudes={step.amplitudes} color={algo.color} />}

              {/* Insight highlight */}
              <div style={{
                marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
                background: `linear-gradient(135deg, rgba(124,58,237,0.08), ${algo.color}08)`,
                border: '1px solid rgba(124,58,237,0.15)',
              }}>
                <span style={{
                  color: '#c4b5fd', fontFamily: 'Inter', fontSize: '0.75rem',
                  fontStyle: 'italic', lineHeight: 1.5,
                }}>
                  💡 {step.highlight}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', paddingBottom: '8px' }}>
            <button onClick={reset}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                color: '#64748b', fontFamily: 'Inter', fontSize: '0.72rem',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={() => { sfx.click(); setPlaying(!playing); }}
              style={{
                background: `linear-gradient(135deg, ${algo.color}20, ${algo.color}08)`,
                border: `1px solid ${algo.color}55`, borderRadius: '8px', padding: '8px 24px',
                cursor: 'pointer', color: algo.color,
                fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              {playing ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> AUTO-PLAY</>}
            </button>
            <button onClick={nextStep} disabled={!algo || currentStep >= algo.steps.length - 1}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${currentStep < algo.steps.length - 1 ? algo.color + '44' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '8px', padding: '8px 16px',
                cursor: currentStep < algo.steps.length - 1 ? 'pointer' : 'not-allowed',
                color: currentStep < algo.steps.length - 1 ? algo.color : '#334155',
                fontFamily: 'Inter', fontSize: '0.72rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
              Next <SkipForward size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AlgorithmVisualizer;
