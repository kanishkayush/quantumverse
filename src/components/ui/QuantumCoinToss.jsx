// ============================================================
// QuantumCoinToss.jsx — Quantum superposition-based coin flip
// Animated coin in superposition state that collapses on "measure"
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Zap, History } from 'lucide-react';
import sfx from '../../utils/soundEngine';

const QuantumCoinToss = ({ onClose }) => {
  const [phase, setPhase] = useState('idle'); // idle | superposition | collapsing | result
  const [result, setResult] = useState(null); // 'heads' | 'tails'
  const [history, setHistory] = useState([]);
  const [spinAngle, setSpinAngle] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(0);

  const headsCount = history.filter(h => h === 'heads').length;
  const tailsCount = history.filter(h => h === 'tails').length;

  // Spin animation loop during superposition
  useEffect(() => {
    if (phase !== 'superposition') return;
    let running = true;
    const animate = () => {
      if (!running) return;
      setSpinAngle(prev => prev + 12);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [phase]);

  const measure = () => {
    if (phase === 'superposition' || phase === 'idle') {
      sfx.simStart();
      setPhase('superposition');
      setResult(null);

      // Collapse after 1.5-2.5s
      const delay = 1500 + Math.random() * 1000;
      setTimeout(() => {
        cancelAnimationFrame(animRef.current);
        setPhase('collapsing');
        sfx.collapse();

        const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
        setTimeout(() => {
          setResult(outcome);
          setPhase('result');
          setHistory(prev => [outcome, ...prev].slice(0, 50));
          sfx.simComplete();
        }, 600);
      }, delay);
    }
  };

  const reset = () => {
    sfx.click();
    setPhase('idle');
    setResult(null);
    setSpinAngle(0);
  };

  const clearHistory = () => {
    sfx.gateRemoved();
    setHistory([]);
  };

  const coinGradient = phase === 'superposition'
    ? 'linear-gradient(135deg, #00f5ff, #a78bfa, #ff00c8, #00f5ff)'
    : result === 'heads'
      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      : result === 'tails'
        ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
        : 'linear-gradient(135deg, #334155, #475569)';

  const coinLabel = phase === 'superposition'
    ? '|ψ⟩'
    : phase === 'collapsing'
      ? '...'
      : result === 'heads'
        ? '|0⟩'
        : result === 'tails'
          ? '|1⟩'
          : '?';

  const coinSubLabel = phase === 'superposition'
    ? 'α|0⟩ + β|1⟩'
    : result === 'heads'
      ? 'HEADS'
      : result === 'tails'
        ? 'TAILS'
        : 'READY';

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
          width: '520px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <div>
            <h2 style={{ fontFamily: 'Orbitron', color: '#fbbf24', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              QUANTUM COIN TOSS
            </h2>
            <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.7rem', marginTop: '2px' }}>
              Superposition → Measurement → Collapse
            </p>
          </div>
          <button onClick={() => { sfx.panelClose(); onClose(); }}
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {/* Quantum state display */}
          <div style={{
            padding: '8px 16px', borderRadius: '20px',
            background: phase === 'superposition' ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${phase === 'superposition' ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: '0.72rem',
              color: phase === 'superposition' ? '#00f5ff' : '#64748b',
            }}>
              {phase === 'idle' && 'State: |ψ⟩ = ? — Press MEASURE to create superposition'}
              {phase === 'superposition' && '⚡ State: |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩ — IN SUPERPOSITION'}
              {phase === 'collapsing' && '💥 WAVE FUNCTION COLLAPSING...'}
              {phase === 'result' && `✓ Collapsed to ${result === 'heads' ? '|0⟩ = HEADS' : '|1⟩ = TAILS'}`}
            </span>
          </div>

          {/* The Coin */}
          <motion.div
            animate={{
              rotateY: phase === 'superposition' ? spinAngle : phase === 'collapsing' ? spinAngle + 720 : 0,
              scale: phase === 'collapsing' ? [1, 1.3, 1] : 1,
            }}
            transition={phase === 'collapsing' ? { duration: 0.6, ease: 'easeOut' } : { duration: 0 }}
            style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: coinGradient,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: phase === 'superposition'
                ? '0 0 40px rgba(0,245,255,0.4), 0 0 80px rgba(167,139,250,0.2), inset 0 0 30px rgba(255,255,255,0.1)'
                : result === 'heads'
                  ? '0 0 30px rgba(251,191,36,0.4), inset 0 0 20px rgba(255,255,255,0.15)'
                  : result === 'tails'
                    ? '0 0 30px rgba(167,139,250,0.4), inset 0 0 20px rgba(255,255,255,0.15)'
                    : '0 0 20px rgba(0,0,0,0.3), inset 0 0 15px rgba(255,255,255,0.05)',
              border: phase === 'superposition'
                ? '3px solid rgba(0,245,255,0.5)'
                : '3px solid rgba(255,255,255,0.1)',
              perspective: '600px',
              transformStyle: 'preserve-3d',
            }}
          >
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: '2.2rem', fontWeight: 900,
              color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
              {coinLabel}
            </span>
            <span style={{
              fontFamily: 'Orbitron', fontSize: '0.6rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', marginTop: '4px', letterSpacing: '0.15em',
            }}>
              {coinSubLabel}
            </span>
          </motion.div>

          {/* Measure button */}
          <button
            onClick={measure}
            disabled={phase === 'collapsing'}
            style={{
              background: phase === 'collapsing'
                ? 'rgba(255,255,255,0.03)'
                : 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(124,58,237,0.1))',
              border: `1px solid ${phase === 'collapsing' ? 'rgba(255,255,255,0.05)' : 'rgba(251,191,36,0.4)'}`,
              borderRadius: '10px', padding: '12px 36px',
              cursor: phase === 'collapsing' ? 'not-allowed' : 'pointer',
              color: phase === 'collapsing' ? '#334155' : '#fbbf24',
              fontFamily: 'Orbitron', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Zap size={16} /> {phase === 'result' ? 'MEASURE AGAIN' : 'MEASURE'}
          </button>

          {/* Circuit explanation */}
          <div style={{
            width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)', padding: '14px',
          }}>
            <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 600 }}>
              QUANTUM CIRCUIT
            </span>
            <div style={{
              marginTop: '8px', fontFamily: 'JetBrains Mono', fontSize: '0.78rem',
              color: '#00f5ff', letterSpacing: '0.04em',
            }}>
              |0⟩ ─[H]──📏 → {result ? (result === 'heads' ? '|0⟩' : '|1⟩') : '?'}
            </div>
            <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.68rem', marginTop: '6px', lineHeight: 1.5 }}>
              The Hadamard gate places the qubit in equal superposition. Measurement collapses it to |0⟩ (Heads) or |1⟩ (Tails) with 50/50 probability — true quantum randomness.
            </p>
          </div>

          {/* History & stats */}
          {history.length > 0 && (
            <div style={{
              width: '100%', background: 'rgba(0,0,0,0.25)', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)', padding: '14px',
            }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={12} /> MEASUREMENT HISTORY ({history.length} tosses)
                </span>
                <button onClick={clearHistory} style={{ color: '#334155', fontSize: '0.6rem', fontFamily: 'Inter', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RotateCcw size={12} />
                </button>
              </div>

              {/* Stats bars */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>|0⟩ Heads</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#64748b' }}>
                      {headsCount} ({history.length > 0 ? ((headsCount / history.length) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${history.length > 0 ? (headsCount / history.length) * 100 : 0}%` }}
                      style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #fbbf2433, #fbbf24aa)' }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#a78bfa', fontWeight: 700 }}>|1⟩ Tails</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#64748b' }}>
                      {tailsCount} ({history.length > 0 ? ((tailsCount / history.length) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${history.length > 0 ? (tailsCount / history.length) * 100 : 0}%` }}
                      style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #a78bfa33, #a78bfaaa)' }}
                    />
                  </div>
                </div>
              </div>

              {/* History dots */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {history.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: h === 'heads' ? '#fbbf24' : '#a78bfa',
                      opacity: 0.7 + (0.3 * (1 - i / history.length)),
                      boxShadow: i === 0 ? `0 0 6px ${h === 'heads' ? '#fbbf24' : '#a78bfa'}` : 'none',
                    }}
                    title={`Toss ${history.length - i}: ${h === 'heads' ? '|0⟩ Heads' : '|1⟩ Tails'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuantumCoinToss;
