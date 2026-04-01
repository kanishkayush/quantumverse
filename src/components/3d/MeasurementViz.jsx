// ============================================================
// MeasurementViz.jsx — Shows wavefunction collapse animation
// A glowing sphere that snaps between 0 and 1 states
// ============================================================
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

const COLOR = '#34d399';

const MeasurementViz = ({ position = [0, 0, 0], onSelect, isSelected }) => {
  const meshRef = useRef();
  const [collapsed, setCollapsed] = useState(null); // null = superposition, '0' or '1'
  const [hovered, setHovered] = useState(false);
  const collapseTimer = useRef(null);

  // Auto-cycle between superposition and collapse states
  useEffect(() => {
    const cycle = () => {
      setCollapsed(null); // back to superposition
      setTimeout(() => {
        setCollapsed(Math.random() > 0.5 ? '1' : '0');
      }, 2000);
    };

    collapseTimer.current = setInterval(cycle, 4500);
    return () => clearInterval(collapseTimer.current);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    if (collapsed === null) {
      // Superposition: chaotic wiggle + scale oscillation
      meshRef.current.rotation.x = Math.sin(t * 3.5) * 0.4;
      meshRef.current.rotation.y = t * 1.2;
      meshRef.current.rotation.z = Math.cos(t * 2.1) * 0.3;
      const s = 0.42 + Math.sin(t * 4) * 0.08;
      meshRef.current.scale.setScalar(s);
    } else {
      // Collapsed: snap to clean sphere
      meshRef.current.rotation.x *= 0.85; // damp rotation
      meshRef.current.rotation.z *= 0.85;
      const targetScale = 0.4;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.5} position={position}>
      <group
        onClick={(e) => { e.stopPropagation(); onSelect('measurement'); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <Sphere ref={meshRef} args={[1, 32, 32]}>
          <meshStandardMaterial
            color={collapsed === null ? '#7c3aed' : COLOR}
            emissive={collapsed === null ? '#7c3aed' : COLOR}
            emissiveIntensity={collapsed === null ? 0.4 : isSelected ? 0.7 : 0.25}
            roughness={collapsed === null ? 0.05 : 0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Collapsed state label */}
        <Html position={[0, 0, 0.5]} center style={{ pointerEvents: 'none' }}>
          {collapsed !== null && (
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '20px',
              color: COLOR,
              textShadow: `0 0 15px ${COLOR}, 0 0 30px ${COLOR}`,
              fontWeight: '900',
              lineHeight: 1,
            }}>
              |{collapsed}⟩
            </div>
          )}
        </Html>

        <pointLight color={collapsed === null ? '#7c3aed' : COLOR} intensity={isSelected ? 2.5 : hovered ? 1.5 : 0.4} distance={4} decay={2} />

        {/* Top label */}
        <Html position={[0, 0.85, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '10px',
            color: COLOR,
            textShadow: `0 0 8px ${COLOR}`,
            opacity: hovered || isSelected ? 1 : 0.6,
            letterSpacing: '0.1em',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {collapsed === null ? 'SUPERPOSITION' : 'COLLAPSED'}
          </div>
        </Html>
      </group>
    </Float>
  );
};

export default MeasurementViz;
