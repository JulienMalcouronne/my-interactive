// Tiny WebAudio synth for the tennis game — no audio assets needed.
// Lives in the tennis folder, which is excluded from unit coverage (browser-only).

let ctx: AudioContext | null = null;
let muted = false;

export function setTennisMuted(value: boolean) {
  muted = value;
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  slideTo?: number
) {
  if (muted) return;
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + duration);
  vol.gain.setValueAtTime(gain, c.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(vol).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const tennisSfx = {
  hit: () => blip(520, 0.06, 'square', 0.05, 720),
  wall: () => blip(300, 0.05, 'triangle', 0.04),
  pointFor: () => blip(660, 0.14, 'triangle', 0.05, 990),
  pointAgainst: () => blip(220, 0.16, 'sawtooth', 0.05, 160),
  win: () => {
    blip(523, 0.12, 'triangle', 0.06);
    setTimeout(() => blip(659, 0.12, 'triangle', 0.06), 110);
    setTimeout(() => blip(784, 0.2, 'triangle', 0.06), 220);
  },
  lose: () => {
    blip(392, 0.16, 'sawtooth', 0.05);
    setTimeout(() => blip(294, 0.24, 'sawtooth', 0.05), 160);
  },
};
