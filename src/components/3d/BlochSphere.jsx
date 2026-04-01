// BlochSphere.jsx — 3D interactive Bloch sphere at scene center
// State vector animates based on selected quantum concept
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

const R = 1.6; // sphere radius

// Target state vector [x, y, z] per concept (length = R)
const TARGETS = {
  qubit:         [0,  R, 0],   // |0⟩ north pole
  superposition: 'equator',    // animated — spin on equator
  hadamard:      [R,  0, 0],   // |+⟩ equator +X
  pauliX:        [0, -R, 0],   // |1⟩ south pole
  cnot:          [R,  0, 0],   // control qubit |+⟩
  entanglement:  [0,  0, R],   // |i⟩ equator +Z
  measurement:   'collapse',   // animated — chaotic → snap
};

// Reusable THREE objects (avoid per-frame allocations)
const _up  = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _q   = new THREE.Quaternion();
const _tgt = new THREE.Vector3();

const StateVector = ({ selectedId, collapseTarget }) => {
  const cylRef  = useRef();
  const coneRef = useRef();
  const current = useRef(new THREE.Vector3(0, R, 0));

  useFrame((state) => {
    if (!cylRef.current || !coneRef.current) return;
    const t  = state.clock.getElapsedTime();
    const id = selectedId || 'qubit';

    // ── Compute target ──────────────────────────────────────
    if (id === 'superposition') {
      _tgt.set(Math.cos(t * 1.4) * R, 0, Math.sin(t * 1.4) * R);
      current.current.copy(_tgt); // instant — always on equator
    } else if (id === 'measurement') {
      if (collapseTarget.current === null) {
        const mx = Math.sin(t * 4.1) * R;
        const my = Math.cos(t * 3.3) * R * 0.4;
        const mz = Math.cos(t * 5.7) * R;
        const mg = Math.sqrt(mx*mx + my*my + mz*mz);
        _tgt.set((mx/mg)*R, (my/mg)*R, (mz/mg)*R);
      } else {
        _tgt.set(0, collapseTarget.current * R, 0);
      }
      current.current.lerp(_tgt, id === 'measurement' && collapseTarget.current !== null ? 0.12 : 0.9);
    } else {
      const arr = TARGETS[id] || [0, R, 0];
      _tgt.set(arr[0], arr[1], arr[2]);
      current.current.lerp(_tgt, 0.045);
    }

    // ── Position cylinder + cone ────────────────────────────
    const cv  = current.current;
    const len = cv.length();
    if (len < 0.01) return;

    _dir.copy(cv).normalize();
    if (_dir.y < -0.9999) _dir.x = 0.0001; // avoid gimbal flip
    _q.setFromUnitVectors(_up, _dir);

    const cylLen = len * 0.82;
    cylRef.current.position.copy(_dir).multiplyScalar(cylLen / 2);
    cylRef.current.quaternion.copy(_q);
    cylRef.current.scale.set(1, cylLen, 1);

    coneRef.current.position.copy(_dir).multiplyScalar(cylLen + 0.1);
    coneRef.current.quaternion.copy(_q);
  });

  return (
    <group>
      {/* Shaft */}
      <mesh ref={cylRef}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      {/* Tip */}
      <mesh ref={coneRef}>
        <coneGeometry args={[0.08, 0.22, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      {/* Origin dot */}
      <mesh>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
    </group>
  );
};

const BlochSphere = ({ selectedId }) => {
  const collapseTarget = useRef(null);
  const timerRef       = useRef(null);

  // Handle measurement collapse timing
  useEffect(() => {
    collapseTarget.current = null;
    clearTimeout(timerRef.current);
    if (selectedId === 'measurement') {
      timerRef.current = setTimeout(() => {
        collapseTarget.current = Math.random() > 0.5 ? 1 : -1;
      }, 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [selectedId]);

  const axisLines = [
    { pts: [[-R*1.3,0,0],[R*1.3,0,0]], color: '#00f5ff' }, // X cyan
    { pts: [[0,-R*1.3,0],[0,R*1.3,0]], color: '#4ade80' }, // Y green
    { pts: [[0,0,-R*1.3],[0,0,R*1.3]], color: '#a78bfa' }, // Z purple
  ];

  const labels = [
    { pos: [0,  R+0.35, 0],  text: '|0⟩', color: '#4ade80' },
    { pos: [0, -R-0.35, 0],  text: '|1⟩', color: '#4ade80' },
    { pos: [R+0.35, 0, 0],   text: '|+⟩', color: '#00f5ff' },
    { pos: [-R-0.35,0, 0],   text: '|−⟩', color: '#00f5ff' },
    { pos: [0, 0, R+0.35],   text: '|i⟩', color: '#a78bfa' },
    { pos: [0, 0, -R-0.35],  text: '|−i⟩',color: '#a78bfa' },
  ];

  const axisDots = [
    [R,0,0],[-R,0,0],[0,R,0],[0,-R,0],[0,0,R],[0,0,-R],
  ];

  return (
    <group>
      {/* Outer shell — transparent */}
      <mesh>
        <sphereGeometry args={[R, 32, 32]} />
        <meshStandardMaterial
          color="#030d22" transparent opacity={0.18}
          side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>

      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[R, 16, 16]} />
        <meshBasicMaterial color="#1e3a5f" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Equator ring */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[R, 0.009, 8, 80]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
      </mesh>

      {/* Axis lines */}
      {axisLines.map((ax, i) => (
        <Line key={i} points={ax.pts} color={ax.color} lineWidth={1} transparent opacity={0.4} />
      ))}

      {/* Axis surface dots */}
      {axisDots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* State vector arrow */}
      <StateVector selectedId={selectedId} collapseTarget={collapseTarget} />

      {/* HTML labels */}
      {labels.map((lb, i) => (
        <Html key={i} position={lb.pos} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px', fontWeight: 700,
            color: lb.color,
            textShadow: `0 0 8px ${lb.color}`,
            whiteSpace: 'nowrap',
          }}>
            {lb.text}
          </div>
        </Html>
      ))}

      {/* Title */}
      <Html position={[0, -R - 0.75, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: '8px',
          color: '#475569', letterSpacing: '0.18em',
        }}>
          BLOCH SPHERE
        </div>
      </Html>

      {/* Soft center glow */}
      <pointLight color="#7c3aed" intensity={1.5} distance={6} decay={2} />
    </group>
  );
};

export default BlochSphere;
