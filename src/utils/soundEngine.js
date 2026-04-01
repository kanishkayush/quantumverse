// ============================================================
// soundEngine.js — Procedural sci-fi sound effects using Web Audio API
// No external audio files needed — everything is synthesized
// ============================================================

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ── Helper: play a note with envelope ────────────────────
function playTone(freq, duration, type = 'sine', volume = 0.15, detune = 0) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

// ── Helper: white noise burst ────────────────────────────
function noiseBurst(duration = 0.05, volume = 0.04) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * volume;
  }
  const source = c.createBufferSource();
  const gain = c.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  source.connect(gain);
  gain.connect(c.destination);
  source.start();
}

// ═══════════════════════════════════════════════════════════
// PUBLIC SOUND EFFECTS
// ═══════════════════════════════════════════════════════════

export const sfx = {
  // Soft click — for button press and object selection
  click() {
    playTone(880, 0.08, 'sine', 0.1);
    playTone(1320, 0.06, 'sine', 0.06);
    noiseBurst(0.03, 0.02);
  },

  // Hover — subtle ascending tone
  hover() {
    playTone(660, 0.06, 'sine', 0.04);
  },

  // Panel open — sweeping upward
  panelOpen() {
    playTone(220, 0.15, 'sine', 0.08);
    setTimeout(() => playTone(440, 0.12, 'sine', 0.07), 40);
    setTimeout(() => playTone(660, 0.10, 'sine', 0.05), 80);
    noiseBurst(0.08, 0.03);
  },

  // Panel close — sweeping downward
  panelClose() {
    playTone(660, 0.10, 'sine', 0.06);
    setTimeout(() => playTone(330, 0.12, 'sine', 0.05), 30);
    noiseBurst(0.06, 0.02);
  },

  // Gate placed — confirmation beep
  gatePlaced() {
    playTone(523, 0.08, 'square', 0.06);
    setTimeout(() => playTone(784, 0.1, 'square', 0.05), 60);
  },

  // Gate removed
  gateRemoved() {
    playTone(440, 0.08, 'sawtooth', 0.04);
    setTimeout(() => playTone(220, 0.1, 'sawtooth', 0.03), 50);
  },

  // Simulation start — ascending sci-fi whoosh
  simStart() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playTone(200 + i * 120, 0.12, 'sine', 0.04);
      }, i * 40);
    }
    noiseBurst(0.15, 0.03);
  },

  // Simulation complete — success chord
  simComplete() {
    playTone(523, 0.3, 'sine', 0.08);
    setTimeout(() => playTone(659, 0.25, 'sine', 0.07), 80);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.08), 160);
  },

  // Algorithm step — data processing tick
  step() {
    playTone(1047, 0.04, 'square', 0.05);
    noiseBurst(0.02, 0.02);
  },

  // Error / warning
  error() {
    playTone(200, 0.15, 'sawtooth', 0.08);
    setTimeout(() => playTone(180, 0.2, 'sawtooth', 0.06), 100);
  },

  // Quantum collapse — dramatic descending + noise
  collapse() {
    playTone(1200, 0.3, 'sine', 0.1);
    setTimeout(() => playTone(600, 0.2, 'sine', 0.08), 50);
    setTimeout(() => playTone(300, 0.25, 'sine', 0.06), 120);
    noiseBurst(0.2, 0.05);
  },

  // Navigate / switch concept
  navigate() {
    playTone(740, 0.06, 'sine', 0.06);
    setTimeout(() => playTone(880, 0.06, 'sine', 0.05), 40);
  },
};

export default sfx;
