// ============================================================
// Qubit.jsx — 3D interactive qubit sphere with superposition animation
// Clicking this object opens the concept panel
// ============================================================
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

const Qubit = ({ position = [0, 0, 0], conceptId = 'qubit', label = 'Qubit', color = '#00f5ff', onSelect, isSelected }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animate: rotate + pulse glow
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Gentle float rotation
    meshRef.current.rotation.y = t * 0.4;
    meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;

    // Pulse scale on hover/selected
    const targetScale = hovered || isSelected ? 1.2 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    // Outer glow ring rotation
    if (glowRef.current) {
      glowRef.current.rotation.y = -t * 0.6;
      glowRef.current.rotation.x = t * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8} position={position}>
      <group>
        {/* Outer glow ring (torus) */}
        <mesh ref={glowRef}>
          <torusGeometry args={[0.75, 0.015, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.9 : hovered ? 0.6 : 0.25} />
        </mesh>

        {/* Inner orbital ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.01, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>

        {/* Main qubit sphere */}
        <Sphere
          ref={meshRef}
          args={[0.45, 64, 64]}
          onClick={(e) => { e.stopPropagation(); onSelect(conceptId); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
        >
          <MeshDistortMaterial
            color={color}
            distort={hovered || isSelected ? 0.45 : 0.2}
            speed={2.5}
            roughness={0.1}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={hovered || isSelected ? 0.5 : 0.15}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Point light for local glow */}
        <pointLight
          color={color}
          intensity={isSelected ? 3 : hovered ? 1.5 : 0.5}
          distance={4}
          decay={2}
        />

        {/* Label floating above */}
        <Html
          position={[0, 0.75, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '10px',
              color: color,
              textShadow: `0 0 8px ${color}`,
              whiteSpace: 'nowrap',
              opacity: hovered || isSelected ? 1 : 0.6,
              letterSpacing: '0.1em',
              fontWeight: 600,
              transition: 'opacity 0.3s',
            }}
          >
            {label}
          </div>
        </Html>

        {/* Selection ring pulse */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[0.8, 0.85, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </Float>
  );
};

export default Qubit;
