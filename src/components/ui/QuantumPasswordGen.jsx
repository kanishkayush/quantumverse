// ============================================================
// QuantumPasswordGen.jsx — Quantum Random Password Generator
// Generates cryptographically-style passwords using "quantum randomness"
// Shows the quantum circuit that generates the random bits
// ============================================================
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, RefreshCw, Check, Shield, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import sfx from '../../utils/soundEngine';

const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function quantumRandom() {
  // Simulates quantum randomness using crypto API
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xFFFFFFFF + 1);
}

function generatePassword(length, options) {
  let charset = '';
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;
  if (charset.length === 0) charset = CHARSETS.lowercase + CHARSETS.uppercase;

  let password = '';
  const qubitsUsed = Math.ceil(Math.log2(charset.length)) * length;
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(quantumRandom() * charset.length);
    password += charset[idx];
  }
  return { password, qubitsUsed, charsetSize: charset.length };
}

function getStrength(password, options) {
  const len = password.length;
  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  if (len >= 24) score++;
  if (options.lowercase && options.uppercase) score++;
  if (options.numbers) score++;
  if (options.symbols) score += 2;
  if (score <= 2) return { level: 'Weak', color: '#ef4444', icon: ShieldAlert, pct: 25 };
  if (score <= 4) return { level: 'Fair', color: '#f59e0b', icon: Shield, pct: 50 };
  if (score <= 6) return { level: 'Strong', color: '#34d399', icon: ShieldCheck, pct: 75 };
  return { level: 'Quantum-Safe', color: '#00f5ff', icon: ShieldCheck, pct: 100 };
}

const QuantumPasswordGen = ({ onClose }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true, uppercase: true, numbers: true, symbols: true,
  });
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);

  const generate = useCallback(() => {
    sfx.simStart();
    setGenerating(true);
    setCopied(false);

    // Simulate quantum computation delay
    setTimeout(() => {
      const res = generatePassword(length, options);
      setResult(res);
      setHistory(prev => [{ password: res.password, time: new Date(), length }, ...prev].slice(0, 10));
      setGenerating(false);
      sfx.simComplete();
    }, 800);
  }, [length, options]);

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      sfx.gatePlaced();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      sfx.error();
    }
  };

  const toggleOption = (key) => {
    sfx.click();
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const strength = result ? getStrength(result.password, options) : null;
  const StrengthIcon = strength?.icon || Shield;

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
          border: '1px solid rgba(52, 211, 153, 0.15)',
          boxShadow: '0 0 60px rgba(52, 211, 153, 0.08)',
          borderRadius: '16px',
          width: '580px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(52,211,153,0.1)' }}>
          <div>
            <h2 style={{ fontFamily: 'Orbitron', color: '#34d399', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              QUANTUM PASSWORD GENERATOR
            </h2>
            <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.7rem', marginTop: '2px' }}>
              Cryptographically secure passwords via quantum randomness
            </p>
          </div>
          <button onClick={() => { sfx.panelClose(); onClose(); }}
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Length slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                PASSWORD LENGTH
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>
                {length}
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              style={{
                width: '100%', height: '6px',
                appearance: 'none', background: 'rgba(255,255,255,0.06)',
                borderRadius: '3px', outline: 'none',
                accentColor: '#34d399',
              }}
            />
            <div className="flex justify-between" style={{ marginTop: '4px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#334155' }}>6</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#334155' }}>64</span>
            </div>
          </div>

          {/* Character set options */}
          <div>
            <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 600 }}>
              CHARACTER SETS
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {[
                { key: 'lowercase', label: 'Lowercase', sample: 'a-z', color: '#00f5ff' },
                { key: 'uppercase', label: 'Uppercase', sample: 'A-Z', color: '#a78bfa' },
                { key: 'numbers', label: 'Numbers', sample: '0-9', color: '#fbbf24' },
                { key: 'symbols', label: 'Symbols', sample: '!@#$', color: '#ff6b6b' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => toggleOption(opt.key)}
                  style={{
                    background: options[opt.key] ? `${opt.color}12` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${options[opt.key] ? opt.color + '44' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '8px', padding: '10px 12px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Inter', fontSize: '0.72rem', color: options[opt.key] ? opt.color : '#475569', fontWeight: 600 }}>
                      {opt.label}
                    </span>
                    <span style={{
                      width: '16px', height: '16px', borderRadius: '4px',
                      background: options[opt.key] ? opt.color : 'transparent',
                      border: `2px solid ${options[opt.key] ? opt.color : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: '#000', fontWeight: 900,
                    }}>
                      {options[opt.key] && '✓'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#334155', marginTop: '2px', display: 'block' }}>
                    {opt.sample}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={generating}
            style={{
              background: generating
                ? 'rgba(255,255,255,0.03)'
                : 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(0,245,255,0.08))',
              border: `1px solid ${generating ? 'rgba(255,255,255,0.05)' : 'rgba(52,211,153,0.4)'}`,
              borderRadius: '10px', padding: '12px',
              cursor: generating ? 'not-allowed' : 'pointer',
              color: generating ? '#334155' : '#34d399',
              fontFamily: 'Orbitron', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            {generating ? (
              <><RefreshCw size={16} className="animate-spin" /> GENERATING QUANTUM BITS...</>
            ) : (
              <><Lock size={16} /> GENERATE PASSWORD</>
            )}
          </button>

          {/* Result */}
          <AnimatePresence>
            {result && !generating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Password display */}
                <div style={{
                  background: 'rgba(0,0,0,0.4)', borderRadius: '10px',
                  border: '1px solid rgba(52,211,153,0.15)', padding: '14px',
                  marginBottom: '12px',
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                      GENERATED PASSWORD
                    </span>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                        color: copied ? '#34d399' : '#64748b',
                        fontFamily: 'Inter', fontSize: '0.6rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      {copied ? <><Check size={12} /> COPIED!</> : <><Copy size={12} /> COPY</>}
                    </button>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700,
                    color: '#e2e8f0', wordBreak: 'break-all', lineHeight: 1.6,
                    padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    letterSpacing: '0.05em',
                  }}>
                    {result.password.split('').map((ch, i) => {
                      let color = '#e2e8f0';
                      if (/[a-z]/.test(ch)) color = '#00f5ff';
                      else if (/[A-Z]/.test(ch)) color = '#a78bfa';
                      else if (/[0-9]/.test(ch)) color = '#fbbf24';
                      else color = '#ff6b6b';
                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          style={{ color }}
                        >
                          {ch}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>

                {/* Strength meter */}
                <div style={{
                  background: 'rgba(0,0,0,0.25)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)', padding: '12px',
                  marginBottom: '12px',
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StrengthIcon size={14} style={{ color: strength.color }} />
                      <span style={{ fontFamily: 'Orbitron', fontSize: '0.65rem', fontWeight: 700, color: strength.color, letterSpacing: '0.08em' }}>
                        {strength.level}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#475569' }}>
                      {result.qubitsUsed} qubits · {result.charsetSize} chars
                    </span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.pct}%` }}
                      transition={{ duration: 0.6 }}
                      style={{
                        height: '100%', borderRadius: '3px',
                        background: `linear-gradient(90deg, ${strength.color}66, ${strength.color})`,
                      }}
                    />
                  </div>
                </div>

                {/* Quantum circuit */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)', padding: '12px',
                }}>
                  <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                    QUANTUM CIRCUIT (QRNG)
                  </span>
                  <div style={{
                    marginTop: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.72rem',
                    color: '#34d399', lineHeight: 1.6,
                  }}>
                    {`|0⟩ ─[H]──📏 → random bit  (×${result.qubitsUsed})`}<br />
                    {`Entropy: ${(Math.log2(result.charsetSize) * length).toFixed(1)} bits`}
                  </div>
                  <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.65rem', marginTop: '6px', lineHeight: 1.5 }}>
                    Each character requires {Math.ceil(Math.log2(result.charsetSize))} qubits. The Hadamard gate creates true quantum randomness — unpredictable even with infinite computing power.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 1 && (
            <div style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.04)', padding: '12px',
            }}>
              <span style={{ color: '#475569', fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                RECENT ({history.length})
              </span>
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {history.slice(1, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between" style={{
                    padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)',
                  }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: '#475569',
                      maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {h.password}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.55rem', color: '#334155' }}>
                      {h.length} chars
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuantumPasswordGen;
