"use client";

type SamplePoint = {
  semitone: number;
  url: string;
};

const BASE = "/audio/piano/";

// Real Salamander Grand Piano samples spread across the octave.
// Missing notes are pitch-shifted by Web Audio from the nearest real sample.
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

function loadBuffer(context: AudioContext, url: string) {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const promise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load piano sample: ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data));

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

export async function preloadPianoSamples() {
  if (typeof window === "undefined") return;

  const context = getAudioContext();
  if (!context) return;

  await Promise.allSettled(
    SAMPLE_POINTS.map((sample) => loadBuffer(context, sample.url)),
  );
}

export async function playPianoRate(rate: number) {
  if (typeof window === "undefined") return;

  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  // KEYS stores each natural note as its interval above C4.
  const targetSemitone = 12 * Math.log2(rate);
  const sample = nearestSample(targetSemitone);

  try {
    const buffer = await loadBuffer(context, sample.url);
    const source = context.createBufferSource();
    const gain = context.createGain();
    const shift = targetSemitone - sample.semitone;
    const now = context.currentTime;

    source.buffer = buffer;
    // AudioBufferSourceNode changes pitch with playbackRate (unlike HTMLAudio,
    // where browsers can preserve the original pitch).
    source.playbackRate.setValueAtTime(Math.pow(2, shift / 12), now);

    gain.gain.setValueAtTime(0.66, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    source.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    source.stop(now + 1.9);
  } catch {
    // Never teach with a synthetic fallback timbre.
    return;
  }
}
