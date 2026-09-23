"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./piano-input.module.css";

export type PianoInputSource = "screen" | "midi" | "microphone";
export type DetectedPianoNote = {
  midi: number;
  name: string;
  octave: number;
  pitch: string;
  frequency?: number;
  source: "midi" | "microphone";
};

const NOTE_NAMES = ["Dó", "Dó♯", "Ré", "Ré♯", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Lá♯", "Si"];

export function midiToPianoNote(midi: number, source: DetectedPianoNote["source"], frequency?: number): DetectedPianoNote {
  const safe = Math.max(0, Math.min(127, Math.round(midi)));
  const name = NOTE_NAMES[safe % 12];
  const octave = Math.floor(safe / 12) - 1;
  return { midi: safe, name, octave, pitch: `${name}${octave}`, frequency, source };
}

function frequencyToMidi(frequency: number) {
  return 69 + 12 * Math.log2(frequency / 440);
}

function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (let i = 0; i < buffer.length; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.025) return null;

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / 1100);
  const maxOffset = Math.min(Math.floor(sampleRate / 55), buffer.length - 2);
  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - offset; i += 1) correlation += buffer[i] * buffer[i + offset];
    correlation /= buffer.length - offset;
    if (correlation > bestCorrelation) { bestCorrelation = correlation; bestOffset = offset; }
  }
  if (bestOffset < 0 || bestCorrelation < 0.012) return null;
  return sampleRate / bestOffset;
}

export function usePianoInput(onNote: (note: DetectedPianoNote) => void) {
  const callbackRef = useRef(onNote);
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastMicMidiRef = useRef<number | null>(null);
  const candidateMidiRef = useRef<number | null>(null);
  const candidateFramesRef = useRef(0);
  const silenceFramesRef = useRef(0);
  const [midiState, setMidiState] = useState<"idle" | "connecting" | "connected" | "unsupported" | "error">("idle");
  const [midiName, setMidiName] = useState<string | null>(null);
  const [micState, setMicState] = useState<"idle" | "connecting" | "listening" | "unsupported" | "error">("idle");

  useEffect(() => { callbackRef.current = onNote; }, [onNote]);

  const stopMicrophone = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (micContextRef.current) void micContextRef.current.close();
    micContextRef.current = null;
    lastMicMidiRef.current = null;
    candidateMidiRef.current = null;
    candidateFramesRef.current = 0;
    silenceFramesRef.current = 0;
    setMicState("idle");
  }, []);

  const detachMidi = useCallback(() => {
    const access = midiAccessRef.current;
    if (access) {
      for (const input of access.inputs.values()) input.onmidimessage = null;
      access.onstatechange = null;
    }
    midiAccessRef.current = null;
    setMidiState("idle");
    setMidiName(null);
  }, []);

  useEffect(() => () => { detachMidi(); stopMicrophone(); }, [detachMidi, stopMicrophone]);

  const attachMidiInputs = useCallback((access: MIDIAccess) => {
    const inputs = Array.from(access.inputs.values());
    setMidiName(inputs[0]?.name ?? "Teclado MIDI");
    for (const input of inputs) {
      input.onmidimessage = (event) => {
        const data = event.data;
        if (!data || data.length < 3) return;
        const status = Number(data[0]) & 0xf0;
        const midi = Number(data[1]);
        const velocity = Number(data[2]);
        if (status === 0x90 && velocity > 0) callbackRef.current(midiToPianoNote(midi, "midi"));
      };
    }
  }, []);

  const connectMidi = useCallback(async () => {
    if (!navigator.requestMIDIAccess) { setMidiState("unsupported"); return false; }
    setMidiState("connecting");
    try {
      const access = await navigator.requestMIDIAccess();
      midiAccessRef.current = access;
      attachMidiInputs(access);
      access.onstatechange = () => attachMidiInputs(access);
      setMidiState("connected");
      return true;
    } catch { setMidiState("error"); return false; }
  }, [attachMidiInputs]);

  const startMicrophone = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setMicState("unsupported"); return false; }
    stopMicrophone();
    setMicState("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const Context = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) throw new Error("AudioContext unavailable");
      const context = new Context();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.1;
      source.connect(analyser);
      mediaStreamRef.current = stream;
      micContextRef.current = context;
      const buffer = new Float32Array(analyser.fftSize);
      setMicState("listening");

      const loop = () => {
        analyser.getFloatTimeDomainData(buffer);
        const frequency = autoCorrelate(buffer, context.sampleRate);
        if (frequency && frequency >= 55 && frequency <= 1200) {
          silenceFramesRef.current = 0;
          const midi = Math.round(frequencyToMidi(frequency));
          if (candidateMidiRef.current === midi) candidateFramesRef.current += 1;
          else { candidateMidiRef.current = midi; candidateFramesRef.current = 1; }
          if (candidateFramesRef.current >= 2 && midi !== lastMicMidiRef.current) {
            lastMicMidiRef.current = midi;
            callbackRef.current(midiToPianoNote(midi, "microphone", frequency));
          }
        } else {
          candidateMidiRef.current = null;
          candidateFramesRef.current = 0;
          silenceFramesRef.current += 1;
          if (silenceFramesRef.current >= 3) lastMicMidiRef.current = null;
        }
        animationRef.current = requestAnimationFrame(loop);
      };
      loop();
      return true;
    } catch {
      stopMicrophone();
      setMicState("error");
      return false;
    }
  }, [stopMicrophone]);

  return { midiState, midiName, micState, connectMidi, detachMidi, startMicrophone, stopMicrophone };
}

export function PianoInputDock({ source, onSourceChange, onNote, compact = false }: {
  source: PianoInputSource;
  onSourceChange: (source: PianoInputSource) => void;
  onNote: (note: DetectedPianoNote) => void;
  compact?: boolean;
}) {
  const { midiState, midiName, micState, connectMidi, detachMidi, startMicrophone, stopMicrophone } = usePianoInput(onNote);

  async function choose(next: PianoInputSource) {
    if (next === "screen") { detachMidi(); stopMicrophone(); onSourceChange("screen"); return; }
    if (next === "midi") {
      stopMicrophone();
      const ok = midiState === "connected" || await connectMidi();
      if (ok) onSourceChange("midi");
      return;
    }
    detachMidi();
    const ok = micState === "listening" || await startMicrophone();
    if (ok) onSourceChange("microphone");
  }

  const status = source === "midi"
    ? midiState === "connected" ? `Ligado · ${midiName ?? "MIDI"}` : midiState === "unsupported" ? "MIDI não suportado neste navegador" : midiState === "error" ? "Não foi possível ligar o MIDI" : "A ligar MIDI…"
    : source === "microphone"
      ? micState === "listening" ? "A ouvir uma nota de cada vez pelo microfone" : micState === "unsupported" ? "Microfone indisponível" : micState === "error" ? "Permissão de microfone necessária" : "A preparar microfone…"
      : "Toque no piano da tela";

  return <div className={styles.dock} data-compact={compact ? "true" : "false"}>
    <div className={styles.modes}>
      <button type="button" className={source === "screen" ? styles.active : ""} onClick={() => void choose("screen")}>Tela</button>
      <button type="button" className={source === "midi" ? styles.active : ""} onClick={() => void choose("midi")}>🎹 MIDI</button>
      <button type="button" className={source === "microphone" ? styles.active : ""} onClick={() => void choose("microphone")}>🎙 Microfone</button>
    </div>
    <span className={styles.status}><i className={source === "screen" || (source === "midi" && midiState === "connected") || (source === "microphone" && micState === "listening") ? styles.live : ""}/>{status}</span>
  </div>;
}
