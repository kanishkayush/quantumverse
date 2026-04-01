// ============================================================
// App.jsx — Root application component
// Three.js Canvas fills the full screen as background
// UI overlay components sit on top using fixed positioning
// ============================================================
import React, { useState, useCallback, Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import QuantumScene from './scenes/QuantumScene';
import KnowledgePanel from './components/ui/KnowledgePanel';
import HUD from './components/ui/HUD';
import { quantumConcepts } from './utils/mockData';

// ── Error boundary to catch 3D rendering errors ──────────
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('3D Scene Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <>
          <ambientLight intensity={0.5} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </>
      );
    }
    return this.props.children;
  }
}

// ── Main App ──────────────────────────────────────────────
const App = () => {
  const [selectedId, setSelectedId] = useState(null);
  const selectedConcept = selectedId ? quantumConcepts[selectedId] : null;

  const handleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleClose = useCallback(() => setSelectedId(null), []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#020817' }}>

      {/* ── Decorative overlays ─────────────────────── */}
      <div className="grid-overlay" />
      <div className="scan-line" />

      {/* ── 3D Canvas ──────────────────────────────── */}
      <Canvas
        camera={{ position: [0, 2, 12], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#020817', 1);
        }}
      >
        <SceneErrorBoundary>
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial color="#00f5ff" wireframe />
            </mesh>
          }>
            <QuantumScene
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </Suspense>
        </SceneErrorBoundary>
      </Canvas>

      {/* ── HUD / UI overlay ─────────────────────── */}
      <HUD selectedId={selectedId} onSelect={handleSelect} />

      {/* ── Knowledge panel (slides in from right) ── */}
      <AnimatePresence mode="wait">
        {selectedConcept && (
          <KnowledgePanel
            key={selectedId}
            concept={selectedConcept}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

