"use client";

type PianoPlayOptions = { gain?: number; duration?: number };
type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

let audioContext: AudioContext | null = null;

function getContext() {
  if (audioContext) return audioContext;
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return null;
  audioContext = new Ctor();
  return audioContext;
}

async function readyContext() {
  const ctx = getContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    try { await ctx.resume(); } catch { return null; }
  }
  return ctx;
}

function pianoEnvelope(ctx: AudioContext, semitone: number, gainValue: number, duration: number) {
  const now = ctx.currentTime;
  const frequency = 261.625565 * Math.pow(2, semitone / 12);
  const master = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  const lowpass = ctx.createBiquadFilter();

  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(Math.min(5600, 2500 + frequency * 2), now);
  lowpass.Q.setValueAtTime(0.7, now);

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(Math.max(0.025, gainValue), now + 0.006);
  master.gain.exponentialRampToValueAtTime(Math.max(0.012, gainValue * 0.36), now + Math.min(0.18, duration * 0.25));
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  master.connect(lowpass);
  lowpass.connect(compressor);
  compressor.connect(ctx.destination);

  const partials = [
    { multiplier: 1, level: 1, type: "triangle" as OscillatorType, detune: 0 },
    { multiplier: 2, level: 0.24, type: "sine" as OscillatorType, detune: -2 },
    { multiplier: 3, level: 0.09, type: "sine" as OscillatorType, detune: 3 },
    { multiplier: 4, level: 0.035, type: "sine" as OscillatorType, detune: -4 },
  ];

  for (const partial of partials) {
    const osc = ctx.createOscillator();
    const partialGain = ctx.createGain();
    osc.type = partial.type;
    osc.frequency.setValueAtTime(frequency * partial.multiplier, now);
    osc.detune.setValueAtTime(partial.detune, now);
    partialGain.gain.setValueAtTime(partial.level, now);
    partialGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(partialGain);
    partialGain.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.04);
  }

  const noiseBuffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.025)), ctx.sampleRate);
  const noise = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noise.length; i += 1) noise[i] = (Math.random() * 2 - 1) * (1 - i / noise.length);
  const noiseSource = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  noiseSource.buffer = noiseBuffer;
  noiseGain.gain.setValueAtTime(Math.max(0.002, gainValue * 0.055), now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  noiseSource.connect(noiseGain);
  noiseGain.connect(master);
  noiseSource.start(now);
}

export async function playPianoSemitone(semitone: number, options: PianoPlayOptions = {}) {
  if (typeof window === "undefined") return false;
  const ctx = await readyContext();
  if (!ctx) return false;
  const gainValue = Math.max(0.04, Math.min(0.8, options.gain ?? 0.44));
  const duration = Math.max(0.22, Math.min(2.4, options.duration ?? 1.25));
  pianoEnvelope(ctx, semitone, gainValue, duration);
  return true;
}
