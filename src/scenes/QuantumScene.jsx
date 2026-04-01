// ============================================================
// QuantumScene.jsx — The main Three.js scene
// Places all 3D objects in a circular layout with lighting
// ============================================================
import React from 'react';
import { OrbitControls, Environment, Sparkles, Stars } from '@react-three/drei';
import Qubit from '../components/3d/Qubit';
import { HadamardGate, PauliXGate, CnotGate } from '../components/3d/QuantumGates';
import EntanglementViz from '../components/3d/EntanglementViz';
import MeasurementViz from '../components/3d/MeasurementViz';
import StarField from '../components/3d/StarField';
import BlochSphere from '../components/3d/BlochSphere';

// Layout: arrange objects in a ring around center
// Index: 0=qubit, 1=superposition, 2=hadamard, 3=pauliX, 4=cnot, 5=entanglement, 6=measurement

const RING_RADIUS = 6.2;
const getPos = (index, total, y = 0) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * RING_RADIUS, y, Math.sin(angle) * RING_RADIUS];
};

const TOTAL = 7;

const QuantumScene = ({ selectedId, onSelect }) => {
  return (
    <>
      {/* ── Lighting ───────────────────────────────── */}
      <ambientLight intensity={0.15} color="#0a0a2e" />

      {/* Key lights for drama */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-10, 5, 5]}  intensity={2} color="#00f5ff" distance={30} decay={2} />
      <pointLight position={[10, -5, -5]} intensity={1.5} color="#7c3aed" distance={30} decay={2} />
      <pointLight position={[0, 10, 0]}   intensity={0.8} color="#ff00c8" distance={25} decay={2} />

      {/* ── Background ─────────────────────────────── */}
      <StarField count={1500} />
      <Stars radius={80} depth={60} count={800} factor={4} saturation={0} fade speed={0.5} />
      <fog attach="fog" args={['#020817', 30, 70]} />

      {/* ── Sparkle ambient particles ──────────────── */}
      <Sparkles
        count={120}
        scale={18}
        size={1.5}
        speed={0.25}
        color="#00f5ff"
        opacity={0.4}
      />
      <Sparkles
        count={60}
        scale={18}
        size={2}
        speed={0.15}
        color="#a78bfa"
        opacity={0.3}
      />

      {/* ── Camera controls ────────────────────────── */}
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.75}
        autoRotate
        autoRotateSpeed={0.4}
      />

      {/* ── 3D Objects ─────────────────────────────── */}

      {/* 0 — Qubit (basic) */}
      <Qubit
        position={getPos(0, TOTAL, 0)}
        conceptId="qubit"
        label="QUBIT"
        color="#00f5ff"
        onSelect={onSelect}
        isSelected={selectedId === 'qubit'}
      />

      {/* 1 — Superposition Qubit */}
      <Qubit
        position={getPos(1, TOTAL, 0.3)}
        conceptId="superposition"
        label="SUPERPOSITION"
        color="#a78bfa"
        onSelect={onSelect}
        isSelected={selectedId === 'superposition'}
      />

      {/* 2 — Hadamard Gate */}
      <HadamardGate
        position={getPos(2, TOTAL, -0.2)}
        onSelect={onSelect}
        isSelected={selectedId === 'hadamard'}
      />

      {/* 3 — Pauli-X Gate */}
      <PauliXGate
        position={getPos(3, TOTAL, 0.1)}
        onSelect={onSelect}
        isSelected={selectedId === 'pauliX'}
      />

      {/* 4 — CNOT Gate */}
      <CnotGate
        position={getPos(4, TOTAL, 0)}
        onSelect={onSelect}
        isSelected={selectedId === 'cnot'}
      />

      {/* 5 — Entanglement */}
      <EntanglementViz
        position={getPos(5, TOTAL, -0.1)}
        onSelect={onSelect}
        isSelected={selectedId === 'entanglement'}
      />

      {/* 6 — Measurement */}
      <MeasurementViz
        position={getPos(6, TOTAL, 0.2)}
        onSelect={onSelect}
        isSelected={selectedId === 'measurement'}
      />

      {/* ── Bloch Sphere at center ─────────────────── */}
      <BlochSphere selectedId={selectedId} />
    </>
  );
};

export default QuantumScene;
