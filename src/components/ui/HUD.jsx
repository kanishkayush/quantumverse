// ============================================================
// HUD.jsx — Heads-Up Display overlay
// Shows the app title, concept navigation, and instructions
// ============================================================
import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ChevronRight, Wrench, GitBranch } from 'lucide-react';
import { hudItems } from '../../utils/mockData';
import sfx from '../../utils/soundEngine';

const HUD = ({ selectedId, onSelect, onOpenCircuitBuilder, onOpenAlgorithm }) => {
  return (
    <>
      {/* ── Top-left branding ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="fixed top-6 left-6 z-40 flex items-center gap-3"
      >
        {/* Logo icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(124, 58, 237, 0.15))',
            border: '1px solid rgba(0, 245, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
          }}
        >
          <Cpu size={20} color="#00f5ff" />
        </div>

        {/* Title */}
        <div>
          <h1
            className="text-xl font-black leading-none tracking-widest"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              background: 'linear-gradient(90deg, #00f5ff, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            QUANTUMVERSE
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'Inter', letterSpacing: '0.15em' }}>
            3D LEARNING PLATFORM
          </p>
        </div>
      </motion.div>

      {/* ── Bottom instruction bar ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="fixed bottom-6 left-1/2 z-40 flex items-center gap-6 px-6 py-3 rounded-full"
        style={{
          transform: 'translateX(-50%)',
          background: 'rgba(2, 8, 23, 0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <span className="text-xs" style={{ color: '#475569', fontFamily: 'Inter' }}>
          🖱️ Drag to orbit
        </span>
        <span className="w-px h-3 bg-white opacity-10"></span>
        <span className="text-xs" style={{ color: '#475569', fontFamily: 'Inter' }}>
          🖱️ Scroll to zoom
        </span>
        <span className="w-px h-3 bg-white opacity-10"></span>
        <span className="text-xs" style={{ color: '#475569', fontFamily: 'Inter' }}>
          👆 Click objects to explore
        </span>
      </motion.div>

      {/* ── Left sidebar nav ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="fixed left-6 top-1/2 z-40 flex flex-col gap-2"
        style={{ transform: 'translateY(-50%)' }}
      >
        {hudItems.map((item, i) => {
          const isSelected = selectedId === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              onClick={() => { sfx.navigate(); onSelect(item.id); }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200"
              style={{
                background: isSelected
                  ? `rgba(${hexToRgb(item.color)}, 0.15)`
                  : 'rgba(2, 8, 23, 0.5)',
                border: `1px solid ${isSelected ? item.color + '55' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: isSelected ? `0 0 15px rgba(${hexToRgb(item.color)}, 0.2)` : 'none',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                minWidth: '130px',
              }}
            >
              {/* Active indicator dot */}
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: item.color,
                  boxShadow: isSelected ? `0 0 6px ${item.color}` : 'none',
                  opacity: isSelected ? 1 : 0.3,
                }}
              />
              <span
                className="text-xs font-medium"
                style={{
                  fontFamily: 'Inter',
                  color: isSelected ? item.color : '#475569',
                }}
              >
                {item.label}
              </span>
              {isSelected && (
                <ChevronRight size={12} style={{ color: item.color, marginLeft: 'auto' }} />
              )}
            </motion.button>
          );
        })}

        {/* Separator */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

        {/* Tool buttons */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
          onClick={() => { sfx.panelOpen(); onOpenCircuitBuilder?.(); }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200"
          style={{
            background: 'rgba(0, 245, 255, 0.06)',
            border: '1px solid rgba(0, 245, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            minWidth: '130px',
          }}
        >
          <Wrench size={12} style={{ color: '#00f5ff' }} />
          <span className="text-xs font-medium" style={{ fontFamily: 'Inter', color: '#00f5ff' }}>
            Circuit Builder
          </span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => { sfx.panelOpen(); onOpenAlgorithm?.(); }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200"
          style={{
            background: 'rgba(167, 139, 250, 0.06)',
            border: '1px solid rgba(167, 139, 250, 0.15)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            minWidth: '130px',
          }}
        >
          <GitBranch size={12} style={{ color: '#a78bfa' }} />
          <span className="text-xs font-medium" style={{ fontFamily: 'Inter', color: '#a78bfa' }}>
            Algorithms
          </span>
        </motion.button>
      </motion.div>

      {/* ── Quantum stats strip (top-right) ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="fixed top-6 right-6 z-40 flex items-center gap-4 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(2, 8, 23, 0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <StatItem label="Qubits" value="7" color="#00f5ff" />
        <span className="w-px h-4 bg-white opacity-10" />
        <StatItem label="Gates" value="3" color="#ff00c8" />
        <span className="w-px h-4 bg-white opacity-10" />
        <StatItem label="Concepts" value="7" color="#a78bfa" />
      </motion.div>
    </>
  );
};

const StatItem = ({ label, value, color }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs font-bold" style={{ color, fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
      {value}
    </span>
    <span className="text-xs" style={{ color: '#475569', fontFamily: 'Inter' }}>
      {label}
    </span>
  </div>
);

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 245, 255';
}

export default HUD;
