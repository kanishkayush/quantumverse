// ============================================================
// KnowledgePanel.jsx — Right-side sliding info panel
// Shows quantum concept details when user clicks a 3D object
// ============================================================
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Atom, Zap, BookOpen, Code2, FlaskConical, Lightbulb, Cpu, Sparkles } from 'lucide-react';
import CircuitDiagram from './CircuitDiagram';
import SimulationResults from './SimulationResults';

// Panel slide animation variants
const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

const KnowledgePanel = ({ concept, onClose }) => {
  const panelRef = useRef();

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const prevent = (e) => e.stopPropagation();
    el.addEventListener('wheel', prevent);
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  if (!concept) return null;

  const accentColor = concept.color || '#00f5ff';
  const accentRgb = hexToRgb(accentColor);

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        key={concept.id}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 right-0 h-full w-[420px] flex flex-col z-50"
        style={{
          background: `linear-gradient(135deg, rgba(2, 8, 23, 0.97) 0%, rgba(${accentRgb}, 0.04) 100%)`,
          borderLeft: `1px solid ${accentColor}33`,
          boxShadow: `-4px 0 40px rgba(${accentRgb}, 0.15), -1px 0 0 ${accentColor}22`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4"
          style={{ borderBottom: `1px solid rgba(${accentRgb}, 0.15)` }}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.color = accentColor; e.currentTarget.style.background = `rgba(${accentRgb}, 0.15)`; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <X size={18} />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-1 pr-10">
            <span className="text-3xl">{concept.icon}</span>
            <div>
              <h2
                className="text-xl font-bold leading-tight"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: accentColor,
                  textShadow: `0 0 15px ${accentColor}66`,
                }}
              >
                {concept.title}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#64748b', fontFamily: 'Inter' }}>
                {concept.subtitle}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {concept.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `rgba(${accentRgb}, 0.12)`,
                  color: accentColor,
                  border: `1px solid rgba(${accentRgb}, 0.3)`,
                  fontFamily: 'Inter',
                  fontSize: '0.65rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Scrollable content ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Description */}
          <section>
            <SectionLabel icon={<BookOpen size={13} />} label="CONCEPT" color={accentColor} />
            <p className="mt-2 text-sm leading-relaxed" style={{ color: '#cbd5e1', fontFamily: 'Inter' }}>
              {concept.description}
            </p>
          </section>

          {/* Analogy */}
          <section>
            <SectionLabel icon={<Atom size={13} />} label="REAL-WORLD ANALOGY" color={accentColor} />
            <div
              className="mt-2 p-3 rounded-lg text-sm leading-relaxed"
              style={{
                background: `rgba(${accentRgb}, 0.06)`,
                border: `1px solid rgba(${accentRgb}, 0.15)`,
                color: '#94a3b8',
                fontFamily: 'Inter',
              }}
            >
              {concept.analogy}
            </div>
          </section>

          {/* Key Properties */}
          {concept.keyProperties && concept.keyProperties.length > 0 && (
            <section>
              <SectionLabel icon={<Lightbulb size={13} />} label="KEY PROPERTIES" color={accentColor} />
              <ul className="mt-2 space-y-1.5">
                {concept.keyProperties.map((prop, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8', fontFamily: 'Inter' }}>
                    <span style={{ color: accentColor, fontSize: '0.5rem', marginTop: '6px', flexShrink: 0 }}>●</span>
                    <span className="leading-relaxed">{prop}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Math state */}
          {concept.state && (
            <section>
              <SectionLabel icon={<Zap size={13} />} label="QUANTUM STATE" color={accentColor} />
              <div
                className="mt-2 px-3 py-2 rounded-lg font-mono text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid rgba(${accentRgb}, 0.2)`,
                  color: accentColor,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.78rem',
                }}
              >
                {concept.state}
              </div>
            </section>
          )}

          {/* Circuit Diagram */}
          <section>
            <SectionLabel icon={<FlaskConical size={13} />} label="CIRCUIT" color={accentColor} />
            <div className="mt-2">
              <CircuitDiagram type={concept.circuit} />
            </div>
          </section>

          {/* Real-World Applications */}
          {concept.applications && concept.applications.length > 0 && (
            <section>
              <SectionLabel icon={<Cpu size={13} />} label="REAL-WORLD APPLICATIONS" color={accentColor} />
              <div className="mt-2 space-y-1">
                {concept.applications.map((app, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-1.5 rounded-md text-sm"
                    style={{
                      background: i % 2 === 0 ? `rgba(${accentRgb}, 0.04)` : 'transparent',
                      color: '#94a3b8',
                      fontFamily: 'Inter',
                    }}
                  >
                    <span style={{ color: accentColor, fontWeight: 700, fontSize: '0.7rem', marginTop: '2px', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-relaxed">{app}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fun Fact */}
          {concept.funFact && (
            <section>
              <SectionLabel icon={<Sparkles size={13} />} label="FUN FACT" color={accentColor} />
              <div
                className="mt-2 p-3 rounded-lg text-sm leading-relaxed"
                style={{
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(0, 245, 255, 0.05))',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  color: '#c4b5fd',
                  fontFamily: 'Inter',
                  fontStyle: 'italic',
                }}
              >
                💡 {concept.funFact}
              </div>
            </section>
          )}

          {/* Code block */}
          <section>
            <SectionLabel icon={<Code2 size={13} />} label="QISKIT IMPLEMENTATION" color={accentColor} />
            <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid rgba(${accentRgb}, 0.2)` }}>
              <div
                className="flex items-center gap-2 px-3 py-1.5"
                style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid rgba(${accentRgb}, 0.1)` }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
                </div>
                <span className="text-xs ml-2" style={{ color: '#475569', fontFamily: 'JetBrains Mono' }}>
                  quantum_circuit.py
                </span>
              </div>
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '12px',
                  fontSize: '0.72rem',
                  maxHeight: '250px',
                  background: 'rgba(4, 10, 25, 0.95)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                showLineNumbers
                lineNumberStyle={{ color: '#2d3748', fontSize: '0.65rem' }}
              >
                {concept.code}
              </SyntaxHighlighter>
            </div>
          </section>

          {/* Auto-running Simulation Results */}
          <section className="pb-6">
            <SimulationResults concept={concept} />
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Helper components ─────────────────────────────────────
const SectionLabel = ({ icon, label, color }) => (
  <div className="flex items-center gap-1.5">
    <span style={{ color }}>{icon}</span>
    <span
      className="text-xs font-semibold tracking-widest"
      style={{ color: '#475569', fontFamily: 'Inter', letterSpacing: '0.1em' }}
    >
      {label}
    </span>
  </div>
);

// ── Utility ───────────────────────────────────────────────
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 245, 255';
}

export default KnowledgePanel;
