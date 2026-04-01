// ============================================================
// StarField.jsx — Animated background particle field
// Creates the deep space / quantum universe atmosphere
// ============================================================
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarField = ({ count = 1800 }) => {
  const pointsRef = useRef();
  const gridRef = useRef();

  // Pre-compute star positions
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#00f5ff'),  // cyan
      new THREE.Color('#a78bfa'),  // purple
      new THREE.Color('#ffffff'),  // white
      new THREE.Color('#ff6b6b'),  // red accent
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, colors };
  }, [count]);

  // Pre-compute grid positions
  const gridPositions = useMemo(() => {
    const pts = [];
    const size = 30;
    const step = 2.5;

    // Horizontal lines
    for (let x = -size; x <= size; x += step) {
      pts.push(x, -0.01, -size, x, -0.01, size);
    }
    // Vertical lines
    for (let z = -size; z <= size; z += step) {
      pts.push(-size, -0.01, z, size, -0.01, z);
    }

    return new Float32Array(pts);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.01;
      pointsRef.current.rotation.x = Math.sin(t * 0.005) * 0.05;
    }
    if (gridRef.current) {
      // Subtle pulse on grid opacity
      gridRef.current.material.opacity = 0.04 + Math.sin(t * 0.5) * 0.01;
    }
  });

  return (
    <>
      {/* Star points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Infinite grid plane */}
      <lineSegments ref={gridRef} position={[0, -4, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={gridPositions.length / 3} array={gridPositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#00f5ff" transparent opacity={0.05} />
      </lineSegments>

      {/* Subtle fog at bottom */}
      <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#000510"
          transparent
          opacity={0.6}
        />
      </mesh>
    </>
  );
};

export default StarField;
