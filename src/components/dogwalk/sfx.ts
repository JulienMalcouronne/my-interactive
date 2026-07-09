// Tiny WebAudio synth for the game's sound effects — no audio assets needed.
// Lives in the dogwalk folder, which is excluded from unit coverage (browser-only APIs).

let ctx: AudioContext | null = null;
let muted = false;

export function setSfxMuted(value: boolean) {
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

export const sfx = {
  treat: () => blip(660, 0.1, 'square', 0.05, 990),
  bad: () => blip(180, 0.22, 'sawtooth', 0.06, 90),
  power: () => {
    blip(440, 0.1, 'square', 0.05);
    setTimeout(() => blip(660, 0.1, 'square', 0.05), 90);
    setTimeout(() => blip(880, 0.14, 'square', 0.05), 180);
  },
  win: () => {
    blip(523, 0.12, 'triangle', 0.06);
    setTimeout(() => blip(659, 0.12, 'triangle', 0.06), 110);
    setTimeout(() => blip(784, 0.2, 'triangle', 0.06), 220);
  },
  over: () => {
    blip(392, 0.16, 'sawtooth', 0.05);
    setTimeout(() => blip(311, 0.18, 'sawtooth', 0.05), 150);
    setTimeout(() => blip(233, 0.3, 'sawtooth', 0.05), 320);
  },
};
