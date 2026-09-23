"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import { PianoInputDock, type DetectedPianoNote, type PianoInputSource } from "@/components/piano-input";
import { noteName, noteOctave, noteRate, type KidsSong } from "@/lib/music-library";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./song-practice.module.css";

type PracticeMode = "learn" | "practice" | "perform";
type Tempo = 60 | 75 | 100;

type Section = { label: string; notes: string[] };

function buildSections(song: KidsSong): Section[] {
  return song.sections?.length ? song.sections : [{ label: "Música", notes: song.sequence ?? [] }];
}

function samePitch(name: string, octave: number, expected: string, octaveAware: boolean) {
  if (name !== noteName(expected)) return false;
  return !octaveAware || octave === noteOctave(expected);
}

function starsForAccuracy(accuracy: number) {
  if (accuracy >= 95) return 3;
  if (accuracy >= 80) return 2;
  return 1;
}

function metronomeClick(strong: boolean) {
  void playPercussionClick({ frequency: strong ? 180 : 135, gain: strong ? .2 : .14, duration: .07 });
}

export function SongPractice({ song }: { song: KidsSong }) {
  const sections = useMemo(() => buildSections(song), [song]);
  const fullSequence = useMemo(() => sections.flatMap((section) => section.notes), [sections]);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<PracticeMode>("practice");
  const [input, setInput] = useState<PianoInputSource>("screen");
  const [tempo, setTempo] = useState<Tempo>(75);
  const [metronome, setMetronome] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("Ouça. Encontre. Toque.");
  const [listening, setListening] = useState(false);
  const [finished, setFinished] = useState(false);
  const listenToken = useRef(0);
  const transitionLock = useRef(false);

  const activeSection = mode === "perform" ? { label: "Música completa", notes: fullSequence } : sections[sectionIndex] ?? sections[0];
  const sequence = activeSection?.notes ?? [];
  const expected = sequence[noteIndex];
  const octaveAware = (song.pianoOctaves ?? 1) === 2;
  const progress = sequence.length ? Math.round((noteIndex / sequence.length) * 100) : 0;
  const attempts = correct + mistakes;
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 100;

  useEffect(() => { void preloadPianoSamples(); }, []);

  useEffect(() => {
    if (!metronome || !started || finished) return;
    let beat = 0;
    const delay = 60000 / (92 * tempo / 100);
    metronomeClick(true);
    const id = window.setInterval(() => { beat = (beat + 1) % (song.timeSignature === "3/4" ? 3 : 4); metronomeClick(beat === 0); }, delay);
    return () => window.clearInterval(id);
  }, [metronome, started, finished, tempo, song.timeSignature]);

  function restart(selectedMode = mode) {
    listenToken.current += 1;
    transitionLock.current = false;
    setMode(selectedMode);
    setSectionIndex(0);
    setNoteIndex(0);
    setCorrect(0);
    setMistakes(0);
    setWrongIndex(null);
    setMessage(selectedMode === "learn" ? "As notas ficam iluminadas. Vá sem pressa." : selectedMode === "perform" ? "Sem pistas extras. Toque do começo ao fim." : "A partitura espera pela nota certa.");
    setListening(false);
    setFinished(false);
    setStarted(true);
  }

  function finishSection() {
    if (mode === "perform" || sectionIndex >= sections.length - 1) {
      setFinished(true);
      setMessage("Música concluída!");
      return;
    }
    setSectionIndex((value) => value + 1);
    setNoteIndex(0);
    setMessage("Nova parte. Primeiro devagar.");
  }

  function receive(name: string, octave: number) {
    if (!started || finished || listening || transitionLock.current || !expected) return;
    if (!samePitch(name, octave, expected, octaveAware)) {
      setMistakes((value) => value + 1);
      setWrongIndex(noteIndex);
      setMessage(`Quase. A partitura está à espera de ${noteName(expected)}.`);
      window.setTimeout(() => setWrongIndex(null), 420);
      return;
    }
    setCorrect((value) => value + 1);
    setWrongIndex(null);
    setMessage("Certo! Continue.");
    if (noteIndex + 1 >= sequence.length) {
      transitionLock.current = true;
      window.setTimeout(() => { transitionLock.current = false; finishSection(); }, 220);
    }
    else setNoteIndex((value) => value + 1);
  }

  function screenPress(key: LuwipiPianoKey) {
    if (input !== "screen") return;
    receive(key.note, key.octave);
  }

  function externalPress(note: DetectedPianoNote) {
    if (input === "screen" || note.source !== input) return;
    receive(note.name, note.octave);
  }

  async function listen() {
    if (listening || !sequence.length) return;
    const id = ++listenToken.current;
    const resumeAt = noteIndex;
    setListening(true);
    setMessage("Ouça esta parte.");
    const delay = 520 * (100 / tempo);
    for (let index = 0; index < sequence.length; index += 1) {
      if (listenToken.current !== id) return;
      setNoteIndex(index);
      await playPianoRate(noteRate(sequence[index]), { gain: .62, duration: Math.max(.45, delay / 1000 * .8) });
      await new Promise<void>((resolve) => window.setTimeout(resolve, delay));
    }
    if (listenToken.current === id) {
      setNoteIndex(Math.min(resumeAt, Math.max(0, sequence.length - 1)));
      setListening(false);
      setMessage(resumeAt > 0 ? "Continue de onde parou." : "Agora é a sua vez.");
    }
  }

  if (!started) return <section className={styles.intro}>
    <Link className={styles.back} href="/musicas">← Biblioteca</Link>
    <div className={styles.introArt}><span>{song.emoji}</span><i>♪</i></div>
    <small>MODO PIANO · PARTITURA INTERATIVA</small>
    <h1>{song.title}</h1>
    <p>{song.story}</p>
    <div className={styles.modeCards}>
      <button type="button" onClick={() => restart("learn")}><b>1</b><strong>Aprender</strong><span>Notas iluminadas, ouvir por partes e tocar sem pressa.</span></button>
      <button type="button" className={styles.recommended} onClick={() => restart("practice")}><b>2</b><strong>Praticar</strong><span>A partitura para e espera até tocar a nota correta.</span><em>RECOMENDADO</em></button>
      <button type="button" onClick={() => restart("perform")}><b>3</b><strong>Tocar inteira</strong><span>Menos pistas, música completa e resultado no final.</span></button>
    </div>
  </section>;

  if (finished) {
    const stars = starsForAccuracy(accuracy);
    return <section className={styles.finish}>
      <div className={styles.finishStars}>{[1, 2, 3].map((star) => <span key={star} data-on={star <= stars}>★</span>)}</div>
      <small>SESSÃO CONCLUÍDA</small><h1>{song.title}</h1>
      <div className={styles.finishStats}><div><b>{accuracy}%</b><span>precisão</span></div><div><b>{correct}</b><span>notas certas</span></div><div><b>{mistakes}</b><span>tentativas a rever</span></div></div>
      <div className={styles.finishActions}><button type="button" onClick={() => restart(mode)}>TOCAR DE NOVO</button><Link href={`/professor/tarefas?song=${encodeURIComponent(song.id)}`}>ENVIAR COMO TAREFA</Link><Link href="/musicas">OUTRA MÚSICA</Link></div>
    </section>;
  }

  return <section className={styles.player}>
    <header className={styles.topbar}>
      <Link href="/musicas">←</Link>
      <div className={styles.songTitle}><span>{song.emoji}</span><div><small>{mode === "learn" ? "APRENDER" : mode === "perform" ? "TOCAR INTEIRA" : "PRATICAR"}</small><strong>{song.title}</strong></div></div>
      <div className={styles.globalProgress}><i style={{ width: `${mode === "perform" ? progress : Math.round(((sectionIndex + progress / 100) / sections.length) * 100)}%` }}/></div>
      <span className={styles.accuracy}>{accuracy}%</span>
    </header>

    <div className={styles.workspace}>
      <aside className={styles.tools}>
        <div><small>PARTE</small><strong>{mode === "perform" ? "Completa" : `${sectionIndex + 1}/${sections.length}`}</strong><span>{activeSection?.label}</span></div>
        <label><span>Velocidade</span><select value={tempo} onChange={(event) => setTempo(Number(event.target.value) as Tempo)}><option value={60}>60%</option><option value={75}>75%</option><option value={100}>100%</option></select></label>
        <button type="button" className={metronome ? styles.toolActive : ""} onClick={() => setMetronome((value) => !value)}>♩ Metrónomo</button>
        <button type="button" onClick={() => void listen()} disabled={listening}>{listening ? "A tocar…" : "▶ Ouvir parte"}</button>
        <button type="button" onClick={() => { setNoteIndex(0); setWrongIndex(null); setMessage("Recomeçamos esta parte."); }}>↺ Recomeçar</button>
      </aside>

      <main className={styles.stage}>
        <div className={styles.instruction}><div><small>{input === "screen" ? "PIANO NA TELA" : "PIANO REAL"}</small><h2>{message}</h2></div>{expected && <div className={styles.nextNote}><span>AGORA</span><b>{mode === "perform" ? "♪" : `${noteName(expected)}${octaveAware ? noteOctave(expected) : ""}`}</b></div>}</div>
        <MusicScore notes={sequence} currentIndex={noteIndex} wrongIndex={wrongIndex} timeSignature={song.timeSignature ?? "4/4"} hideLabels={mode === "perform"} />
        <PianoInputDock source={input} onSourceChange={setInput} onNote={externalPress} compact />
        <div className={styles.pianoArea}>
          {input === "screen" ? <LuwipiPiano octaves={song.pianoOctaves ?? 1} expected={mode === "perform" ? undefined : expected} wrong={wrongIndex === noteIndex && expected ? `${noteName(expected)}${noteOctave(expected)}` : null} onPress={screenPress} showLabels={mode !== "perform"} compact /> : <div className={styles.realPiano}><span>🎹</span><div><strong>Toque no seu piano</strong><p>{input === "midi" ? "O LuwiPi recebe cada nota diretamente do teclado MIDI." : "O LuwiPi está a ouvir o piano pelo microfone. Toque uma nota de cada vez com clareza."}</p></div></div>}
        </div>
      </main>
    </div>
  </section>;
}
