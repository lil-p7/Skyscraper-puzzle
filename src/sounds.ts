// ─── Web Audio Sound Engine ───────────────────────────────────────────────────

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume = 0.3,
  delay = 0
) {
  const context = getCtx();
  const osc     = context.createOscillator();
  const gain    = context.createGain();

  osc.connect(gain);
  gain.connect(context.destination);

  osc.type      = type;
  osc.frequency.setValueAtTime(frequency, context.currentTime + delay);

  gain.gain.setValueAtTime(0, context.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, context.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + duration);

  osc.start(context.currentTime + delay);
  osc.stop(context.currentTime + delay + duration);
}

// ─── Sound Effects ────────────────────────────────────────────────────────────

// Soft click when placing a number
export function playPlace() {
  playTone(520, "sine", 0.08, 0.15);
}

// Error buzz when a mistake is made
export function playError() {
  playTone(180, "sawtooth", 0.15, 0.2);
  playTone(150, "sawtooth", 0.15, 0.15, 0.08);
}

// Soft pop when a hint is revealed
export function playHint() {
  playTone(660, "sine", 0.1,  0.15);
  playTone(880, "sine", 0.1,  0.12, 0.1);
}

// Clear click when erasing a cell
export function playClear() {
  playTone(300, "sine", 0.07, 0.1);
}

// Navigation click when moving between cells
export function playNav() {
  playTone(440, "sine", 0.05, 0.06);
}

// Victory fanfare when puzzle is solved
export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, "sine", 0.3, 0.2, i * 0.12);
  });
  // Add a sparkle layer on top
  const sparkle = [1047, 1319, 1568];
  sparkle.forEach((freq, i) => {
    playTone(freq, "triangle", 0.2, 0.1, 0.5 + i * 0.1);
  });
}