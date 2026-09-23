"use client";

type SamplePoint = {
  semitone: number;
  url: string;
};

type PianoPlayOptions = {
  gain?: number;
  duration?: number;
};

type PercussionOptions = {
  frequency?: number;
  gain?: number;
  duration?: number;
};

const BASE = "https://tonejs.github.io/audio/salamander/";
const SAMPLE_POINTS: SamplePoint[] = [
  { semitone: 0, url: `${BASE}C4.mp3` },
  { semitone: 3, url: `${BASE}Ds4.mp3` },
  { semitone: 6, url: `${BASE}Fs4.mp3` },
  { semitone: 9, url: `${BASE}A4.mp3` },
];

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer>>();

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextCtor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

  if (!AudioContextCtor) return null;
  audioContext = new AudioContextCtor();
  return audioContext;
}

async function readyContext() {
  const context = getAudioContext();
  if (!context) return null;
  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }
  return context;
}

function loadBuffer(context: AudioContext, url: string) {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const promise = fetch(url, { cache: "force-cache", mode: "cors" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load piano sample: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .catch((error) => {
      bufferCache.delete(url);
      throw error;
    });

  bufferCache.set(url, promise);
  return promise;
}

function nearestSample(targetSemitone: number) {
  return SAMPLE_POINTS.reduce((best, sample) =>
    Math.abs(sample.semitone - targetSemitone) <
    Math.abs(best.semitone - targetSemitone)
      ? sample
      : best,
  );
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) =>
      window.setTimeout(() => reject(new Error("audio_sample_timeout")), milliseconds),
    ),
  ]);
}

function playFallbackPiano(
  context: AudioContext,
  targetSemitone: number,
  gainValue: number,
  duration: number,
) {
  const now = context.currentTime;
  const frequency = 261.625565 * Math.pow(2, targetSemitone / 12);
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(Math.max(0.02, gainValue * 0.72), now + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(compressor);
  compressor.connect(context.destination);

  const partials = [
    { multiplier: 1, level: 1, type: "triangle" as OscillatorType },
    { multiplier: 2, level: 0.24, type: "sine" as OscillatorType },
    { multiplier: 3, level: 0.09, type: "sine" as OscillatorType },
  ];

  partials.forEach(({ multiplier, level, type }) => {
    const oscillator = context.createOscillator();
    const partialGain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency * multiplier, now);
    partialGain.gain.setValueAtTime(level, now);
    oscillator.connect(partialGain);
    partialGain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  });
}

export async function preloadPianoSamples() {
  if (typeof window === "undefined") return;
  const context = getAudioContext();
  if (!context) return;

  await Promise.allSettled(
    SAMPLE_POINTS.map((sample) => loadBuffer(context, sample.url)),
  );
}

export async function playPianoRate(
  rate: number,
  options: PianoPlayOptions = {},
) {
  if (typeof window === "undefined") return false;

  const context = await readyContext();
  if (!context) return false;

  const targetSemitone = 12 * Math.log2(rate);
  const sample = nearestSample(targetSemitone);
  const gainValue = Math.max(0.04, Math.min(1, options.gain ?? 0.66));
  const duration = Math.max(0.09, Math.min(2.4, options.duration ?? 1.35));

  try {
    const buffer = await withTimeout(loadBuffer(context, sample.url), 900);
    const source = context.createBufferSource();
    const gain = context.createGain();
    const shift = targetSemitone - sample.semitone;
    const now = context.currentTime;

    source.buffer = buffer;
    source.playbackRate.setValueAtTime(Math.pow(2, shift / 12), now);
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    source.stop(now + duration + 0.06);
    return true;
  } catch {
    playFallbackPiano(context, targetSemitone, gainValue, duration);
    return true;
  }
}

export async function playPercussionClick(options: PercussionOptions = {}) {
  if (typeof window === "undefined") return false;
  const context = await readyContext();
  if (!context) return false;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const duration = Math.max(0.04, Math.min(0.3, options.duration ?? 0.09));

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(options.frequency ?? 145, now);
  gain.gain.setValueAtTime(Math.max(0.02, Math.min(1, options.gain ?? 0.22)), now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
  return true;
}
