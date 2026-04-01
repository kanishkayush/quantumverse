// ============================================================
// EntanglementViz.jsx — Two entangled qubits with a glowing link
// Shows "spooky action" — both spheres pulse in sync
// ============================================================
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Html, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

const COLOR = '#ff6b6b';

const EntanglementViz = ({ position = [0, 0, 0], onSelect, isSelected }) => {
  const leftRef = useRef();
  const rightRef = useRef();
  const linkRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Synchronized pulsing — they always beat together
    const pulse = 0.38 + Math.abs(Math.sin(t * 1.2)) * 0.12;
    if (leftRef.current) {
      leftRef.current.scale.setScalar(pulse);
      leftRef.current.rotation.y = t * 0.5;
    }
    if (rightRef.current) {
      rightRef.current.scale.setScalar(pulse);      // same scale — entangled!
      rightRef.current.rotation.y = -t * 0.5;
    }

    // Sway the whole group
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect('entanglement');
  };

  const handleOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handleOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={position} ref={groupRef}>
      {/* Left qubit */}
      <group position={[-0.9, 0, 0]}>
        <Sphere
          ref={leftRef}
          args={[1, 32, 32]}
          onClick={handleClick}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
        >
          <MeshDistortMaterial
            color={COLOR}
            distort={0.35}
            speed={3}
            emissive={COLOR}
            emissiveIntensity={isSelected ? 0.6 : 0.2}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
        <pointLight color={COLOR} intensity={isSelected ? 2 : hovered ? 1 : 0.3} distance={3} decay={2} />
      </group>

      {/* Entanglement link — bezier curve */}
      <QuadraticBezierLine
        ref={linkRef}
        start={[-0.5, 0, 0]}
        end={[0.5, 0, 0]}
        mid={[0, 0.4, 0.2]}
        color={COLOR}
        lineWidth={isSelected ? 3 : hovered ? 2 : 1}
        transparent
        opacity={isSelected ? 0.9 : hovered ? 0.6 : 0.35}
        dashed={!isSelected}
        dashScale={20}
      />

      {/* Right qubit */}
      <group position={[0.9, 0, 0]}>
        <Sphere
          ref={rightRef}
          args={[1, 32, 32]}
          onClick={handleClick}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
        >
          <MeshDistortMaterial
            color={COLOR}
            distort={0.35}
            speed={3}
            emissive={COLOR}
            emissiveIntensity={isSelected ? 0.6 : 0.2}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
        <pointLight color={COLOR} intensity={isSelected ? 2 : hovered ? 1 : 0.3} distance={3} decay={2} />
      </group>

      {/* Central label */}
      <Html position={[0, 0.75, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '10px',
          color: COLOR,
          textShadow: `0 0 8px ${COLOR}`,
          opacity: hovered || isSelected ? 1 : 0.6,
          letterSpacing: '0.1em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          transition: 'opacity 0.3s',
        }}>
          ENTANGLEMENT
        </div>
      </Html>
    </group>
  );
};

export default EntanglementViz;
