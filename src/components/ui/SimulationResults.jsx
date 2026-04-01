// SimulationResults.jsx — Auto-running quantum simulation histogram
// Replaces the "Run Simulation" button — starts automatically when a concept is selected
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

const SimulationResults = ({ concept }) => {
  const [shotCount, setShotCount]   = useState(0);
  const [progress,  setProgress]    = useState(0);
  const timerRef = useRef(null);

  const sim = concept?.simulation;

  useEffect(() => {
    if (!sim) return;
    // Reset and restart
    setShotCount(0);
    setProgress(0);
    clearInterval(timerRef.current);

    const DURATION = 1600; // ms for the fill animation
    const start    = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setProgress(eased);
      setShotCount(Math.round(eased * sim.shots));
      if (p >= 1) clearInterval(timerRef.current);
    }, 16);

    return () => clearInterval(timerRef.current);
  }, [concept?.id]);

  if (!sim) return null;

  const done = progress >= 1;

  return (
    <section>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity size={13} style={{ color: '#00f5ff' }} />
          <span style={{ color:'#475569', fontFamily:'Inter', fontSize:'0.65rem', letterSpacing:'0.1em', fontWeight:600 }}>
            SIMULATION RESULTS
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!done && (
            <span className="flex items-center gap-1" style={{ color:'#4ade80', fontSize:'0.6rem', fontFamily:'JetBrains Mono' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation:'pulse 1s infinite' }} />
              RUNNING
            </span>
          )}
          <span style={{ color:'#475569', fontFamily:'JetBrains Mono', fontSize:'0.65rem' }}>
            {shotCount.toLocaleString()}/{sim.shots.toLocaleString()} shots
          </span>
        </div>
      </div>

      {/* ── Simulation description ── */}
      {sim.description && (
        <p style={{ color:'#64748b', fontFamily:'Inter', fontSize:'0.7rem', marginBottom:'8px', lineHeight:1.5 }}>
          {sim.description}
        </p>
      )}

      {/* ── Progress strip ── */}
      <div className="h-px mb-3 rounded overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
        <div style={{
          height:'100%',
          width: `${progress * 100}%`,
          background:'linear-gradient(90deg, #00f5ff, #7c3aed)',
          transition:'width 16ms linear',
        }} />
      </div>

      {/* ── Probability bars ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {sim.results.map((r) => {
          const pct     = (r.count / sim.shots) * 100;
          const fillPct = pct * progress;
          const shown   = Math.round(r.count * progress);
          const color   = r.color || '#00f5ff';

          return (
            <div key={r.state}>
              <div className="flex items-center justify-between mb-1" style={{ fontSize:'0.72rem' }}>
                <span style={{ fontFamily:'JetBrains Mono', color, fontWeight:700 }}>{r.state}</span>
                <span style={{ fontFamily:'JetBrains Mono', color:'#64748b', fontSize:'0.63rem' }}>
                  {shown.toLocaleString()} counts &nbsp;
                  <span style={{ color, minWidth:'38px', display:'inline-block', textAlign:'right' }}>
                    {fillPct.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div style={{ height:'20px', borderRadius:'6px', overflow:'hidden', background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                  height:'100%', borderRadius:'6px',
                  width:`${fillPct}%`,
                  background:`linear-gradient(90deg, ${color}22, ${color}77)`,
                  borderRight: shown > 0 ? `2px solid ${color}` : 'none',
                  transition:'width 16ms linear',
                  minWidth: shown > 0 ? '4px' : '0',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Done badge ── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity:0, y:6 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }}
            style={{
              marginTop:'10px', padding:'8px 12px', borderRadius:'8px',
              background:'rgba(0,245,255,0.06)', border:'1px solid rgba(0,245,255,0.12)',
              color:'#475569', fontFamily:'Inter', fontSize:'0.68rem',
            }}
          >
            ✓ Simulation complete — {sim.shots.toLocaleString()} shots · AerSimulator (mock)
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SimulationResults;
