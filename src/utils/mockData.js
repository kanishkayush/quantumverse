// ============================================================
// mockData.js — All quantum concepts, descriptions, analogies,
// circuit diagrams, Qiskit code snippets, and simulation data.
// ============================================================

export const quantumConcepts = {

  // ─── QUBIT ─────────────────────────────────────────────────
  qubit: {
    id: 'qubit',
    title: 'Qubit',
    subtitle: 'The Quantum Bit',
    color: '#00f5ff',
    icon: '⚛️',
    description:
      'A qubit (quantum bit) is the fundamental unit of quantum information. ' +
      'Unlike a classical bit which is either 0 or 1, a qubit can exist in a ' +
      'superposition of both states simultaneously — until it is measured. ' +
      'Physically, qubits can be realized using photon polarization, electron spin, ' +
      'trapped ions, or superconducting circuits (used by IBM and Google).',
    analogy:
      '🪙 Think of a classical bit as a coin lying flat — either heads (1) or tails (0). ' +
      'A qubit is like a spinning coin: it is simultaneously heads AND tails until ' +
      'you catch it (measure it), and only then does it "choose" a definite state.',
    keyProperties: [
      'Represented as a point on the Bloch Sphere',
      'Obeys the normalization constraint: |α|² + |β|² = 1',
      'Can be physically realized using superconducting circuits, trapped ions, or photons',
      'Forms the building block of all quantum algorithms',
    ],
    applications: [
      'Quantum key distribution (QKD) for unbreakable encryption',
      'Building blocks for quantum processors (IBM Eagle: 127 qubits)',
      'Quantum random number generation',
      'Quantum sensing and metrology',
    ],
    funFact: 'Google\'s Sycamore processor achieved "quantum supremacy" in 2019 with just 53 qubits, performing a task in 200 seconds that would take a classical supercomputer 10,000 years.',
    circuit: 'qubit',
    state: '|ψ⟩ = α|0⟩ + β|1⟩  where |α|² + |β|² = 1',
    tags: ['Fundamental', 'Superposition', 'Linear Algebra'],
    simulation: {
      shots: 1024,
      description: 'Measuring a qubit initialized in |0⟩ without any gates — always collapses to 0.',
      results: [
        { state: '|0⟩', count: 1024, color: '#00f5ff' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a quantum circuit with 1 qubit and 1 classical bit
qc = QuantumCircuit(1, 1)

# The qubit starts in state |0⟩ by default
# Let's measure it immediately
qc.measure(0, 0)

# Simulate the circuit
simulator = AerSimulator()
job = simulator.run(qc, shots=1024)
result = job.result()
counts = result.get_counts()

print("Qubit measurement results:", counts)
# Output: {'0': 1024} — always 0 without any gates`,
  },

  // ─── SUPERPOSITION ────────────────────────────────────────
  superposition: {
    id: 'superposition',
    title: 'Superposition',
    subtitle: 'Being in Two States at Once',
    color: '#a78bfa',
    icon: '🌀',
    description:
      'Superposition is the quantum principle where a qubit can exist in a combination ' +
      'of |0⟩ and |1⟩ simultaneously. The qubit is described by a wave function with ' +
      'complex probability amplitudes. Only when measured does the wave function "collapse" ' +
      'to a definite value, according to the Born Rule — the probability of measuring |0⟩ ' +
      'is |α|² and the probability of measuring |1⟩ is |β|².',
    analogy:
      '🎭 Imagine an actor who is both the hero and the villain simultaneously ' +
      'until the audience observes them in a scene. The observation itself forces ' +
      'the actor to "pick" a role. Before measurement — all possibilities co-exist.',
    keyProperties: [
      'Created by applying a Hadamard gate (H) to a basis state',
      'Enables quantum parallelism — processing many inputs at once',
      'Destroyed irreversibly by measurement (wave function collapse)',
      'Represented on the Bloch sphere as any point on the equator',
      'Mathematically described using complex probability amplitudes',
    ],
    applications: [
      'Quantum parallelism in Shor\'s Algorithm (factor large numbers)',
      'Grover\'s Search Algorithm (√N speedup over classical search)',
      'Quantum walks for graph traversal',
      'Quantum machine learning feature encoding',
    ],
    funFact: 'Schrödinger\'s Cat thought experiment was designed to show how absurd superposition would be at macroscopic scales — a cat simultaneously alive and dead until observed.',
    circuit: 'superposition',
    state: '|+⟩ = (|0⟩ + |1⟩) / √2',
    tags: ['Core Principle', 'Wave Function', 'Probability'],
    simulation: {
      shots: 1024,
      description: 'Applying H gate → creates equal superposition → measurement gives ~50/50 split.',
      results: [
        { state: '|0⟩', count: 507, color: '#a78bfa' },
        { state: '|1⟩', count: 517, color: '#c4b5fd' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a circuit with 1 qubit, 1 classical bit
qc = QuantumCircuit(1, 1)

# Apply Hadamard gate to put qubit in superposition
# |0⟩ → (|0⟩ + |1⟩) / √2
qc.h(0)

# Measure the qubit — collapses superposition
qc.measure(0, 0)

# Run the simulation 1024 times
simulator = AerSimulator()
job = simulator.run(qc, shots=1024)
result = job.result()
counts = result.get_counts()

print("Superposition results:", counts)
# Output: {'0': ~512, '1': ~512} — roughly 50/50!`,
  },

  // ─── HADAMARD GATE ─────────────────────────────────────────
  hadamard: {
    id: 'hadamard',
    title: 'Hadamard Gate',
    subtitle: 'The Superposition Creator',
    color: '#00f5ff',
    icon: '〔H〕',
    description:
      'The Hadamard gate (H) is one of the most important single-qubit quantum gates. ' +
      'It creates an equal superposition from a definite state: H|0⟩ = |+⟩ and H|1⟩ = |−⟩. ' +
      'It is self-inverse (H² = I, applying it twice returns the original state). ' +
      'The Hadamard gate is essential in almost every quantum algorithm — from Deutsch-Jozsa ' +
      'to Grover\'s Search to Quantum Fourier Transform.',
    analogy:
      '🪄 The Hadamard gate is like a magic blender. Pour in a definite state ' +
      '(like plain water), and out comes a perfectly balanced mixture of two ' +
      'possibilities. Apply it again, and the mixture reverses back to the original!',
    keyProperties: [
      'Self-inverse: H·H = Identity (applying twice undoes the transformation)',
      'Maps computational basis to Hadamard basis: |0⟩↔|+⟩, |1⟩↔|−⟩',
      'Part of the Clifford group of quantum gates',
      'Combined with T gate, achieves universal quantum computation',
      'Matrix: (1/√2) · [[1,1],[1,-1]]',
    ],
    applications: [
      'First step of nearly every quantum algorithm',
      'Deutsch-Jozsa Algorithm — determines if a function is constant or balanced',
      'Quantum teleportation protocol',
      'Quantum Fourier Transform (building block)',
    ],
    funFact: 'Jacques Hadamard was a French mathematician (1865-1963) who invented the Hadamard matrix long before quantum computing existed. His matrix turned out to be perfect for quantum gates!',
    circuit: 'hadamard',
    state: 'H|0⟩ = |+⟩,  H|1⟩ = |−⟩',
    matrix: '1/√2 · [[1, 1], [1, -1]]',
    tags: ['Single Qubit', 'Unitary', 'Reversible'],
    simulation: {
      shots: 2048,
      description: 'H gate on |0⟩ → superposition → measurement gives ~50/50 distribution.',
      results: [
        { state: '|0⟩', count: 1019, color: '#00f5ff' },
        { state: '|1⟩', count: 1029, color: '#67e8f9' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram

# Create a 1-qubit, 1-classical-bit circuit
qc = QuantumCircuit(1, 1)

# Start: |0⟩
# Apply Hadamard → puts qubit in superposition
qc.h(0)  # Now qubit is in state |+⟩ = (|0⟩ + |1⟩) / √2

# Measure: collapses to 0 or 1 with 50% probability each
qc.measure(0, 0)

# Simulate
simulator = AerSimulator()
job = simulator.run(qc, shots=2048)
result = job.result()
counts = result.get_counts()

print("Hadamard Gate Results:", counts)
# Expected: {'0': ~1024, '1': ~1024}`,
  },

  // ─── PAULI-X GATE ──────────────────────────────────────────
  pauliX: {
    id: 'pauliX',
    title: 'Pauli-X Gate',
    subtitle: 'The Quantum NOT Gate',
    color: '#ff00c8',
    icon: '〔X〕',
    description:
      'The Pauli-X gate is the quantum equivalent of the classical NOT gate. ' +
      'It flips the state of a qubit: |0⟩ → |1⟩ and |1⟩ → |0⟩. ' +
      'Geometrically, it is a rotation of π radians (180°) around the X-axis of the Bloch sphere. ' +
      'It belongs to the Pauli group along with Y and Z gates. Together with the Hadamard gate, ' +
      'the Pauli gates form the foundation of single-qubit operations.',
    analogy:
      '💡 Think of the Pauli-X gate as a light switch. If the light is OFF (|0⟩), ' +
      'flipping the switch turns it ON (|1⟩). If it was ON, it becomes OFF. ' +
      'Simple, deterministic — but its quantum power shines in superposition!',
    keyProperties: [
      'Equivalent to classical NOT gate on basis states',
      'Self-inverse: X·X = Identity (applying twice gives original state)',
      'π rotation around X-axis of the Bloch sphere',
      'Part of the Pauli group: {I, X, Y, Z}',
      'Matrix: [[0,1],[1,0]]',
      'Eigenvalues: +1 (eigenvector |+⟩) and -1 (eigenvector |−⟩)',
    ],
    applications: [
      'Bit-flip error correction in quantum error-correcting codes',
      'Quantum NOT operation in arithmetic circuits',
      'State preparation (initializing qubits to |1⟩)',
      'Pauli twirling for noise characterization',
    ],
    funFact: 'Wolfgang Pauli won the Nobel Prize in 1945 for the "exclusion principle." The Pauli matrices he developed for spin-1/2 particles became the foundation of quantum gates decades later.',
    circuit: 'pauliX',
    state: 'X|0⟩ = |1⟩,  X|1⟩ = |0⟩',
    matrix: '[[0, 1], [1, 0]]',
    tags: ['NOT Gate', 'Single Qubit', 'Pauli Group'],
    simulation: {
      shots: 1024,
      description: 'X gate on |0⟩ → deterministic flip to |1⟩ → measurement always gives 1.',
      results: [
        { state: '|1⟩', count: 1024, color: '#ff00c8' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a 1-qubit circuit
qc = QuantumCircuit(1, 1)

# Start in |0⟩, apply Pauli-X to flip to |1⟩
qc.x(0)  # X gate: |0⟩ → |1⟩

qc.measure(0, 0)

# Simulate
simulator = AerSimulator()
job = simulator.run(qc, shots=1024)
result = job.result()
counts = result.get_counts()

print("Pauli-X Gate Results:", counts)
# Output: {'1': 1024} — always 1 after the X gate!

# Try applying X twice — returns to original state
qc2 = QuantumCircuit(1, 1)
qc2.x(0)  # |0⟩ → |1⟩
qc2.x(0)  # |1⟩ → |0⟩ (identity)
qc2.measure(0, 0)
job2 = simulator.run(qc2, shots=1024)
print("Double X:", job2.result().get_counts())  # {'0': 1024}`,
  },

  // ─── CNOT GATE ─────────────────────────────────────────────
  cnot: {
    id: 'cnot',
    title: 'CNOT Gate',
    subtitle: 'Controlled-NOT — The Entangler',
    color: '#ffd700',
    icon: '⊕',
    description:
      'The CNOT (Controlled-NOT) gate is the most important two-qubit gate. ' +
      'It operates on a control qubit and a target qubit: if the control is |1⟩, ' +
      'the target is flipped (XOR operation). When combined with a Hadamard gate, ' +
      'the CNOT creates quantum entanglement — the Bell state (|00⟩ + |11⟩)/√2. ' +
      'The CNOT gate, together with all single-qubit gates, forms a universal gate set — ' +
      'meaning ANY quantum computation can be built from these gates.',
    analogy:
      '🔗 Imagine two light switches where switch B is "slaved" to switch A. ' +
      'If switch A (control) is ON, switch B (target) automatically flips its state. ' +
      'If switch A is OFF, switch B does nothing. The CNOT creates quantum correlation!',
    keyProperties: [
      'Two-qubit gate: requires a control and a target qubit',
      'Performs XOR: target is flipped only if control is |1⟩',
      'Creates entanglement when combined with Hadamard: H + CNOT → Bell State',
      'Part of the universal gate set (any quantum circuit can be built with CNOT + single-qubit gates)',
      'Not self-inverse when control is in superposition',
      'Equivalent to classical XOR gate on basis states',
    ],
    applications: [
      'Creating Bell states and GHZ states (multi-qubit entanglement)',
      'Quantum teleportation protocol (essential step)',
      'Quantum error correction (syndrome extraction)',
      'Building blocks for Toffoli and Fredkin gates',
    ],
    funFact: 'The CNOT gate is so fundamental that any quantum algorithm can be decomposed into just CNOT gates plus single-qubit rotations. This is the quantum Church-Turing thesis in action!',
    circuit: 'cnot',
    state: 'CNOT|00⟩=|00⟩, CNOT|10⟩=|11⟩, CNOT|01⟩=|01⟩, CNOT|11⟩=|10⟩',
    tags: ['Two-Qubit', 'Entanglement', 'Universal Gate'],
    simulation: {
      shots: 1024,
      description: 'H on q0 → CNOT(q0,q1) → creates Bell state → only |00⟩ and |11⟩ appear.',
      results: [
        { state: '|00⟩', count: 511, color: '#ffd700' },
        { state: '|11⟩', count: 513, color: '#fbbf24' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# CNOT Gate: Creates Entanglement (Bell State)
qc = QuantumCircuit(2, 2)

# Put control qubit (qubit 0) in superposition
qc.h(0)  # |0⟩ → (|0⟩ + |1⟩)/√2

# Apply CNOT — control: qubit 0, target: qubit 1
# Creates the Bell state: (|00⟩ + |11⟩)/√2
qc.cx(0, 1)

# Measure both qubits
qc.measure([0, 1], [0, 1])

# Simulate
simulator = AerSimulator()
job = simulator.run(qc, shots=1024)
counts = job.result().get_counts()

print("Bell State (Entanglement):", counts)
# Output: {'00': ~512, '11': ~512}
# NEVER '01' or '10' — the qubits are perfectly correlated!`,
  },

  // ─── ENTANGLEMENT ──────────────────────────────────────────
  entanglement: {
    id: 'entanglement',
    title: 'Quantum Entanglement',
    subtitle: 'Spooky Action at a Distance',
    color: '#ff6b6b',
    icon: '🔗',
    description:
      'Quantum entanglement is a phenomenon where two or more qubits become correlated ' +
      'in such a way that the quantum state of each cannot be described independently. ' +
      'Measuring one qubit INSTANTLY determines the state of the other — regardless of ' +
      'the distance between them. Einstein famously called this "spooky action at a ' +
      'distance." In 2022, Alain Aspect, John Clauser, and Anton Zeilinger won the Nobel ' +
      'Prize in Physics for experiments proving entanglement is real and violates Bell\'s inequality.',
    analogy:
      '🎲 Imagine two magic dice. No matter where you separate them in the universe, ' +
      'whenever you roll one and get "3", the other always shows "3" instantly — ' +
      'even if they are galaxies apart. Einstein called this "spooky action at a distance."',
    keyProperties: [
      'Created using H + CNOT (Hadamard followed by Controlled-NOT)',
      'Cannot be explained by classical hidden variables (Bell\'s theorem)',
      'Measurement of one qubit instantly determines the other',
      'Does NOT allow faster-than-light communication (no-signaling theorem)',
      'Four Bell States: |Φ+⟩, |Φ−⟩, |Ψ+⟩, |Ψ−⟩',
      'Monogamy of entanglement: a qubit maximally entangled with one qubit cannot be entangled with another',
    ],
    applications: [
      'Quantum Key Distribution / BB84 protocol (security guaranteed by physics)',
      'Quantum teleportation (transferring quantum state without moving the qubit)',
      'Superdense coding (send 2 classical bits using 1 qubit)',
      'Quantum networks and quantum internet infrastructure',
      'Entanglement-based quantum computing (cluster states)',
    ],
    funFact: 'In 2017, Chinese scientists used the Micius satellite to demonstrate entanglement over 1,200 km. Measuring one photon on Earth instantly correlated with its partner in space!',
    circuit: 'entanglement',
    state: '|Φ+⟩ = (|00⟩ + |11⟩) / √2   (Bell State)',
    tags: ['Correlation', 'Non-local', 'Bell State', 'EPR Paradox'],
    simulation: {
      shots: 2048,
      description: 'Bell state circuit: H + CNOT → entangled pair → only correlated outcomes |00⟩ and |11⟩.',
      results: [
        { state: '|00⟩', count: 1031, color: '#ff6b6b' },
        { state: '|11⟩', count: 1017, color: '#fca5a5' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a maximally entangled Bell state
qc = QuantumCircuit(2, 2)

# Step 1: Hadamard on qubit 0 — create superposition
qc.h(0)

# Step 2: CNOT with qubit 0 as control, qubit 1 as target
# This creates the entangled Bell state |Φ+⟩
qc.cx(0, 1)

# Measure both qubits
qc.measure([0, 1], [0, 1])

# Simulate many times
simulator = AerSimulator()
job = simulator.run(qc, shots=2048)
counts = job.result().get_counts()

print("Entangled Bell State Results:", counts)
# You will ONLY see '00' and '11'!
# The qubits are entangled — measuring one determines the other.
# {'00': ~1024, '11': ~1024}`,
  },

  // ─── MEASUREMENT ───────────────────────────────────────────
  measurement: {
    id: 'measurement',
    title: 'Quantum Measurement',
    subtitle: 'Wave Function Collapse',
    color: '#34d399',
    icon: '📏',
    description:
      'Quantum measurement is the act of observing a qubit\'s state. Before measurement, ' +
      'a qubit can be in superposition of |0⟩ and |1⟩ with probability amplitudes α and β. ' +
      'Measurement causes the wave function to "collapse" — the qubit must "choose" 0 or 1. ' +
      'The probability of each outcome is given by the Born Rule: P(0) = |α|², P(1) = |β|². ' +
      'This process is IRREVERSIBLE — after measurement, the superposition is permanently destroyed ' +
      'and the qubit is left in the measured state.',
    analogy:
      '📷 Think of a blurry photograph that can show multiple exposures simultaneously. ' +
      'The moment you print or "observe" the photo, it snaps into a single clear image. ' +
      'Once measured, the quantum state is gone — the superposition is permanently destroyed.',
    keyProperties: [
      'Irreversible process: superposition is destroyed forever after measurement',
      'Probabilistic: outcome governed by the Born Rule (|amplitude|²)',
      'Projective measurement: qubit collapses to the measured eigenstate',
      'No-cloning theorem: you cannot copy a quantum state before measuring',
      'Measurement basis matters: measuring in X-basis vs Z-basis gives different results',
      'Repeated measurement of same qubit gives same result (post-collapse)',
    ],
    applications: [
      'Readout of quantum computation results',
      'Quantum random number generation (truly random, not pseudo-random)',
      'Measurement-based quantum computing (one-way quantum computation)',
      'Quantum error syndrome measurement',
      'Quantum key distribution (detecting eavesdroppers)',
    ],
    funFact: 'The "measurement problem" is one of the deepest mysteries in physics. The Many-Worlds interpretation says measurement doesn\'t collapse the wave function — instead, the universe splits into parallel branches, one for each possible outcome!',
    circuit: 'measurement',
    state: 'Prob(0) = |α|², Prob(1) = |β|²',
    tags: ['Wave Collapse', 'Probability', 'Irreversible', 'Born Rule'],
    simulation: {
      shots: 4096,
      description: 'Measuring a qubit in superposition → Born Rule gives ~50/50 collapse.',
      results: [
        { state: '|0⟩', count: 2043, color: '#34d399' },
        { state: '|1⟩', count: 2053, color: '#6ee7b7' },
      ],
    },
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Demonstrating quantum measurement and wave function collapse
qc = QuantumCircuit(1, 1)

# Create superposition first
qc.h(0)  # Qubit is now in (|0⟩ + |1⟩)/√2

# Measurement causes wave function collapse
qc.measure(0, 0)

# After measurement, the qubit is in a definite state
# Further operations would act on this collapsed state

simulator = AerSimulator()

# Run 4096 shots to see the probability distribution
job = simulator.run(qc, shots=4096)
counts = job.result().get_counts()

print("Measurement Collapse Results:", counts)
# Approximately 50% '0' and 50% '1'
# Each individual shot collapses to exactly 0 or 1
total = sum(counts.values())
for state, count in counts.items():
    prob = count / total * 100
    print(f"  State |{state}⟩: {prob:.1f}% ({count} shots)")`,
  },
};

// ─── Navigation items for HUD ────────────────────────────────
export const hudItems = [
  { id: 'qubit', label: 'Qubit', color: '#00f5ff' },
  { id: 'superposition', label: 'Superposition', color: '#a78bfa' },
  { id: 'hadamard', label: 'H Gate', color: '#00f5ff' },
  { id: 'pauliX', label: 'Pauli-X', color: '#ff00c8' },
  { id: 'cnot', label: 'CNOT', color: '#ffd700' },
  { id: 'entanglement', label: 'Entanglement', color: '#ff6b6b' },
  { id: 'measurement', label: 'Measurement', color: '#34d399' },
];
