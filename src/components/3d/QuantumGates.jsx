// ============================================================
// QuantumGates.jsx — 3D interactive gate objects
// Hadamard (H), Pauli-X (X), and CNOT gate representations
// ============================================================
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Shared gate base ──────────────────────────────────────

const GateBase = ({ position, conceptId, label, color, onSelect, isSelected, children, floatSpeed = 1.5 }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle sway
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.15 + (isSelected ? t * 0.5 : 0);
    // Scale pulse
    const s = hovered || isSelected ? 1.15 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.07);
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.2} floatIntensity={0.6} position={position}>
      <group
        ref={groupRef}
        onClick={(e) => { e.stopPropagation(); onSelect(conceptId); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      >
        {children({ hovered, isSelected })}

        {/* Glow light */}
        <pointLight color={color} intensity={isSelected ? 3 : hovered ? 1.5 : 0.4} distance={5} decay={2} />

        {/* Label */}
        <Html position={[0, 0.9, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '10px',
            color,
            textShadow: `0 0 8px ${color}`,
            opacity: hovered || isSelected ? 1 : 0.6,
            letterSpacing: '0.1em',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.3s',
          }}>
            {label}
          </div>
        </Html>
      </group>
    </Float>
  );
};

// ── Hadamard Gate ─────────────────────────────────────────

export const HadamardGate = ({ position, onSelect, isSelected }) => {
  const color = '#00f5ff';
  return (
    <GateBase position={position} conceptId="hadamard" label="H Gate" color={color} onSelect={onSelect} isSelected={isSelected}>
      {({ hovered }) => (
        <>
          {/* Main box */}
          <RoundedBox args={[0.75, 0.75, 0.75]} radius={0.08} smoothness={4}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={hovered || isSelected ? 0.5 : 0.15}
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.85}
              wireframe={false}
            />
          </RoundedBox>

          {/* H letter — using Html to avoid Suspense font-loading issues */}
          <Html position={[0, 0, 0.39]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '22px',
              fontWeight: 900,
              color: hovered || isSelected ? '#ffffff' : color,
              textShadow: `0 0 10px ${color}`,
              lineHeight: 1,
            }}>H</div>
          </Html>

          {/* Edge glow frame */}
          <mesh>
            <boxGeometry args={[0.77, 0.77, 0.77]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={isSelected ? 0.4 : 0.1} />
          </mesh>

          {/* Orbiting particle */}
          <OrbitParticle color={color} radius={0.7} speed={1.5} />
        </>
      )}
    </GateBase>
  );
};

// ── Pauli-X Gate ──────────────────────────────────────────

export const PauliXGate = ({ position, onSelect, isSelected }) => {
  const color = '#ff00c8';
  return (
    <GateBase position={position} conceptId="pauliX" label="Pauli-X" color={color} onSelect={onSelect} isSelected={isSelected} floatSpeed={1.8}>
      {({ hovered }) => (
        <>
          {/* Octahedron shape for X gate */}
          <mesh>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={hovered || isSelected ? 0.6 : 0.2}
              roughness={0.05}
              metalness={0.95}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* X letter */}
          <Html position={[0, 0, 0.52]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '18px',
              fontWeight: 900,
              color: hovered || isSelected ? '#ffffff' : color,
              textShadow: `0 0 10px ${color}`,
              lineHeight: 1,
            }}>X</div>
          </Html>

          {/* Wireframe overlay */}
          <mesh>
            <octahedronGeometry args={[0.55, 0]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={isSelected ? 0.5 : 0.15} />
          </mesh>
        </>
      )}
    </GateBase>
  );
};

// ── CNOT Gate ─────────────────────────────────────────────

export const CnotGate = ({ position, onSelect, isSelected }) => {
  const color = '#ffd700';
  const ctrlRef = useRef();
  const targetRef = useRef();
  const connRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ctrlRef.current) ctrlRef.current.rotation.y = t * 0.8;
    if (targetRef.current) targetRef.current.rotation.y = -t * 0.8;
  });

  return (
    <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.5} position={position}>
      <group
        onClick={(e) => { e.stopPropagation(); onSelect('cnot'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'default'; }}
      >
        {/* Control qubit (sphere) */}
        <mesh ref={ctrlRef} position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.3} roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Connector line */}
        <mesh ref={connRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.7} />
        </mesh>

        {/* Target qubit (torus ⊕ symbol) */}
        <group ref={targetRef} position={[0, -0.55, 0]}>
          <mesh>
            <torusGeometry args={[0.22, 0.04, 8, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.3} roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Cross inside torus */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>

        <pointLight color={color} intensity={isSelected ? 3 : 0.6} distance={5} decay={2} />

        <Html position={[0, 1.1, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '10px',
            color,
            textShadow: `0 0 8px ${color}`,
            opacity: 0.8,
            letterSpacing: '0.1em',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            CNOT
          </div>
        </Html>
      </group>
    </Float>
  );
};

// ── Orbiting particle helper ──────────────────────────────

const OrbitParticle = ({ color, radius = 1, speed = 1 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * 0.3;
    ref.current.position.z = Math.sin(t) * radius;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export default { HadamardGate, PauliXGate, CnotGate };
