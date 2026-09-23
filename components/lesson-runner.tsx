"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { LessonVisual } from "@/components/lesson-visual";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";
import { PianoInputDock, type DetectedPianoNote, type PianoInputSource } from "@/components/piano-input";
import { PreschoolInlineSong } from "@/components/preschool-inline-song";
import type { AgeGroup } from "@/lib/curriculum";
import type { CurriculumVariant, EnhancedLesson, EnhancedModule } from "@/lib/curriculum-v3";
import { completeLesson, readCurriculumProgress, saveLessonStep, type MasteryState } from "@/lib/curriculum-progress";
import { buildLessonSteps } from "@/lib/lesson-engine";
import { getSong } from "@/lib/music-library";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./lesson-runner.module.css";

type Props = { age: AgeGroup; module: EnhancedModule; lesson: EnhancedLesson; variant: CurriculumVariant; studentId: string };
type InteractionKind = "note" | "piano" | "rhythm" | "listen" | "physical";
type ListenMode = "pitch" | "dynamics" | "generic";
const NATURAL = /(Dó|Ré|Mi|Fá|Sol|Lá|Si)/;

function classify(action: string): { kind: InteractionKind; expected?: string; listenMode?: ListenMode } {
  const expected = action.match(NATURAL)?.[1];
  if (expected && /(toqu|encontr|tecla|nota|piano)/i.test(action)) return { kind: "note", expected };
  if (/(ritmo|pulso|palma|tambor|batid|compasso|tempo)/i.test(action)) return { kind: "rhythm" };
  if (/(grave|agudo)/i.test(action)) return { kind: "listen", listenMode: "pitch" };
  if (/(forte|suave|intensidade|dinâmic)/i.test(action)) return { kind: "listen", listenMode: "dynamics" };
  if (/(escut|ouç|ouvir|som)/i.test(action)) return { kind: "listen", listenMode: "generic" };
  if (/(piano|tecla|toqu|tocar|dedo|mão|acorde|escala)/i.test(action)) return { kind: "piano" };
  return { kind: "physical" };
}

function LessonInteraction({ action, age }: { action: string; age: AgeGroup }) {
  const spec = useMemo(() => classify(action), [action]);
  const [input, setInput] = useState<PianoInputSource>("screen");
  const [message, setMessage] = useState("Experimente agora.");
  const [wrong, setWrong] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);

  useEffect(() => {
    setInput("screen"); setMessage("Experimente agora."); setWrong(null); setTaps(0); setDone(false); setHeard(null);
    void preloadPianoSamples();
  }, [action]);

  function checkNote(name: string, octave: number) {
    if (!spec.expected) return;
    if (name === spec.expected) {
      setDone(true); setWrong(null); setMessage("✓ Isso! Encontrou a nota certa.");
    } else {
      setWrong(`${name}${octave}`); setMessage(`Quase. Procure ${spec.expected}.`);
      window.setTimeout(() => setWrong(null), 380);
    }
  }

  function freeNote(name: string, octave: number) { setHeard(`${name}${octave}`); setDone(true); setMessage(`✓ Ouvi ${name}${octave}. Continue a experiência.`); }
  function screenPress(key: LuwipiPianoKey) { if (input === "screen") spec.kind === "note" ? checkNote(key.note, key.octave) : freeNote(key.note, key.octave); }
  function externalPress(note: DetectedPianoNote) { if (input !== "screen" && note.source === input) spec.kind === "note" ? checkNote(note.name, note.octave) : freeNote(note.name, note.octave); }
  async function demo(option: "a" | "b") {
    if (spec.listenMode === "dynamics") {
      await playPianoRate(1, { gain: option === "a" ? .82 : .2, duration: .85 });
      setMessage(option === "a" ? "Este exemplo soa forte." : "Este exemplo soa suave.");
      return;
    }
    if (spec.listenMode === "pitch") {
      await playPianoRate(option === "a" ? .5 : 2, { gain: .58, duration: .8 });
      setMessage(option === "a" ? "Este é o lado grave." : "Este é o lado agudo.");
      return;
    }
    await playPianoRate(option === "a" ? 1 : Math.pow(2, 7 / 12), { gain: .5, duration: .72 });
    setMessage(option === "a" ? "Ouça o primeiro som." : "Agora compare com o segundo.");
  }
  async function tap() {
    await playPercussionClick({ frequency: taps === 0 ? 170 : 135 });
    const next = Math.min(4, taps + 1); setTaps(next);
    if (next >= 4) { setDone(true); setMessage("✓ Quatro pulsos firmes."); }
  }

  if (spec.kind === "note") return <div className={styles.interaction}>
    <div className={styles.interactionHead}><div><small>DESAFIO NO PIANO</small><strong>{message}</strong></div><span className={done ? styles.successBadge : styles.waitBadge}>{done ? "CERTO" : `PROCURE ${spec.expected}`}</span></div>
    <PianoInputDock source={input} onSourceChange={setInput} onNote={externalPress} compact />
    {input === "screen"
      ? <LuwipiPiano compact octaves={1} expected={done ? undefined : spec.expected} wrong={wrong} onPress={screenPress} showLabels />
      : <div className={styles.realInput}><span>🎹</span><div><b>Toque {spec.expected} no piano real</b><p>{input === "midi" ? "A nota chega diretamente pelo MIDI." : "Toque uma nota clara e espere o LuwiPi reconhecer."}</p></div></div>}
  </div>;

  if (spec.kind === "piano") return <div className={styles.interaction}>
    <div className={styles.interactionHead}><div><small>PIANO INTERATIVO</small><strong>{heard ? `Ouvi ${heard}` : message}</strong></div><span className={done ? styles.successBadge : styles.waitBadge}>{done ? "FEITO" : "TOQUE"}</span></div>
    <PianoInputDock source={input} onSourceChange={setInput} onNote={externalPress} compact />
    {input === "screen"
      ? <LuwipiPiano compact octaves={age === "2-4" ? 1 : 2} onPress={screenPress} showLabels={age !== "2-4"} />
      : <div className={styles.realInput}><span>🎹</span><div><b>Toque no piano real</b><p>{input === "midi" ? "O LuwiPi responde a cada tecla enviada pelo MIDI." : "Toque uma nota clara; o LuwiPi mostra o que ouviu."}</p></div></div>}
  </div>;

  if (spec.kind === "rhythm") return <div className={styles.interaction}>
    <div className={styles.interactionHead}><div><small>RITMO</small><strong>{message}</strong></div><span className={done ? styles.successBadge : styles.waitBadge}>{taps}/4</span></div>
    <button type="button" className={styles.rhythmPad} onClick={() => void tap()}><span>🥁</span><b>TOQUE NO PULSO</b><i>{[0,1,2,3].map((n) => <em key={n} data-on={n < taps}/>)}</i></button>
  </div>;

  if (spec.kind === "listen") return <div className={styles.interaction}>
    <div className={styles.interactionHead}><div><small>OUVIR + COMPARAR</small><strong>{message}</strong></div></div>
    <div className={styles.soundButtons}><button type="button" onClick={() => void demo("a")}><span>{spec.listenMode === "dynamics" ? "🦁" : spec.listenMode === "pitch" ? "🐘" : "①"}</span><b>{spec.listenMode === "dynamics" ? "FORTE" : spec.listenMode === "pitch" ? "GRAVE" : "OUVIR A"}</b></button><button type="button" onClick={() => void demo("b")}><span>{spec.listenMode === "dynamics" ? "🐇" : spec.listenMode === "pitch" ? "🐦" : "②"}</span><b>{spec.listenMode === "dynamics" ? "SUAVE" : spec.listenMode === "pitch" ? "AGUDO" : "OUVIR B"}</b></button></div>
    <button type="button" className={done ? styles.didItDone : styles.didIt} onClick={() => { setDone(true); setMessage("✓ Comparação concluída."); }}>{done ? "✓ FEITO" : "JÁ OUVIMOS E COMPARAMOS"}</button>
  </div>;

  return <div className={styles.interaction}>
    <div className={styles.physicalCard}><span>{age === "2-4" ? "✨" : "🎯"}</span><div><small>FAÇA AGORA</small><strong>{action}</strong><p>O professor observa; a criança executa. Sem texto extra no caminho.</p></div></div>
    <button type="button" className={done ? styles.didItDone : styles.didIt} onClick={() => { setDone(true); setMessage("✓ Ação concluída."); }}>{done ? "✓ FEITO" : "MARCAR COMO FEITO"}</button>
  </div>;
}

export function LessonRunner({ age, module, lesson, variant, studentId }: Props) {
  const router = useRouter();
  const steps = useMemo(() => buildLessonSteps({ age, module, lesson, variant }), [age, module, lesson, variant]);
  const [stepIndex, setStepIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  const [mastery, setMastery] = useState<MasteryState>(null);
  const [showGuide, setShowGuide] = useState(false);
  const step = steps[stepIndex];
  const actionCount = Math.max(1, step.actions.length);
  const currentAction = step.actions[Math.min(actionIndex, actionCount - 1)] ?? "Explore esta ideia com a criança.";
  const isLastAction = actionIndex >= actionCount - 1;
  const isLastStep = stepIndex >= steps.length - 1;
  const lessonSong = step.songId ? getSong(step.songId) : undefined;
  const totalUnits = steps.reduce((sum, item) => sum + Math.max(1, item.actions.length), 0);
  const completeUnits = steps.slice(0, stepIndex).reduce((sum, item) => sum + Math.max(1, item.actions.length), 0) + actionIndex;
  const percent = Math.round((completeUnits / Math.max(1, totalUnits)) * 100);

  useEffect(() => {
    const saved = readCurriculumProgress(studentId, age)[String(lesson.number)];
    if (!saved || saved.completed) return;
    const safeStep = Math.max(0, Math.min(steps.length - 1, saved.step ?? 0));
    setStepIndex(safeStep);
    setActionIndex(Math.max(0, Math.min(Math.max(0, steps[safeStep].actions.length - 1), saved.action ?? 0)));
  }, [studentId, age, lesson.number, steps]);

  function go(stepValue: number, actionValue = 0) {
    const safeStep = Math.max(0, Math.min(steps.length - 1, stepValue));
    const safeAction = Math.max(0, Math.min(Math.max(0, steps[safeStep].actions.length - 1), actionValue));
    setStepIndex(safeStep); setActionIndex(safeAction); setMastery(null); setShowGuide(false);
    saveLessonStep(studentId, age, lesson.number, safeStep, safeAction);
  }

  function next() {
    if (!isLastAction) return go(stepIndex, actionIndex + 1);
    if (!isLastStep) return go(stepIndex + 1, 0);
  }

  function previous() {
    if (actionIndex > 0) return go(stepIndex, actionIndex - 1);
    if (stepIndex > 0) return go(stepIndex - 1, Math.max(0, steps[stepIndex - 1].actions.length - 1));
  }

  function finish() {
    if (!mastery) return;
    completeLesson(studentId, age, lesson.number, mastery);
    router.push(`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}&current=${Math.min(48, lesson.number + 1)}`);
  }

  return <section className={styles.shell} style={{ "--accent": module.accent, "--soft": module.surface } as CSSProperties}>
    <header className={styles.topbar}>
      <Link href={`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}`}>←</Link>
      <div className={styles.lessonIdentity}><small>AULA {lesson.number} DE 48</small><strong>{lesson.title}</strong></div>
      <div className={styles.progress}><i style={{ width: `${percent}%` }}/></div>
      <button type="button" onClick={() => setShowGuide(true)}>GUIA</button>
    </header>

    <main className={styles.workspace}>
      <section className={styles.visualStage}>
        <div className={styles.stepMeta}><span>{step.icon}</span><div><small>ETAPA {stepIndex + 1} DE {steps.length}</small><h1>{step.title}</h1></div><b>{step.duration}</b></div>
        <div className={styles.visual}><LessonVisual stepId={step.id} icon={step.icon} title={step.title} age={age} accent={module.accent} instruction={currentAction}/></div>
        <div className={styles.prompt}><small>FAÇA SÓ ISTO AGORA</small><h2>{currentAction}</h2><div>{Array.from({ length: actionCount }).map((_, index) => <i key={index} data-done={index < actionIndex} data-active={index === actionIndex}/>)}</div></div>
      </section>

      <section className={styles.actionStage}>
        {lessonSong && step.id === "repertoire" ? <div className={styles.repertoire}>
          <div className={styles.repertoireHead}><span>{lessonSong.emoji}</span><div><small>MÚSICA DA AULA</small><h2>{lessonSong.title}</h2><p>Abra o modo de partitura: o LuwiPi espera pela nota certa e pode ouvir MIDI ou microfone.</p></div></div>
          {age === "2-4"
            ? <PreschoolInlineSong song={lessonSong} lessonNumber={lesson.number}/>
            : <><div className={styles.scorePreview}>𝄞 <span>♪ ♪ ♩ ♪</span></div><Link className={styles.openSong} href={`/musicas/${lessonSong.id}`}>ABRIR MODO PIANO →</Link></>}
        </div> : <LessonInteraction key={`${step.id}-${actionIndex}`} action={currentAction} age={age}/>}
        <div className={styles.observe}><span>◉</span><div><small>OBSERVE</small><strong>{step.childDoes}</strong><p>Avance quando: {step.success}</p></div></div>
      </section>
    </main>

    <footer className={styles.controls}>
      <button type="button" className={styles.secondary} onClick={previous} disabled={stepIndex === 0 && actionIndex === 0}>VOLTAR</button>
      <span>{stepIndex + 1}.{actionIndex + 1}</span>
      {!isLastStep || !isLastAction
        ? <button type="button" className={styles.primary} onClick={next}>FEITO · PRÓXIMO →</button>
        : <button type="button" className={styles.primary} onClick={() => setShowGuide(true)}>TERMINAR AULA →</button>}
    </footer>

    {showGuide && <div className={styles.overlay} onClick={() => setShowGuide(false)}><aside className={styles.guide} onClick={(event) => event.stopPropagation()}>
      <button className={styles.close} type="button" onClick={() => setShowGuide(false)}>×</button>
      <small>GUIA DO PROFESSOR</small><h2>{step.title}</h2><p className={styles.goal}>{step.goal}</p>
      {step.say && <div><b>DIGA ASSIM</b><p>“{step.say}”</p></div>}
      {step.example && <div><b>EXEMPLO</b><p>{step.example}</p></div>}
      {step.tip && <div><b>DICA</b><p>{step.tip}</p></div>}
      {step.actionHref && step.actionLabel && <Link href={step.actionHref}>{step.actionLabel}</Link>}
      {isLastStep && isLastAction && <section className={styles.mastery}>
        <h3>Como terminou?</h3>
        <button type="button" data-selected={mastery === "mastered"} onClick={() => setMastery("mastered")}>✓ Conseguiu</button>
        <button type="button" data-selected={mastery === "reinforce"} onClick={() => setMastery("reinforce")}>↻ Precisa reforçar</button>
        <button type="button" className={styles.finishButton} disabled={!mastery} onClick={finish}>CONCLUIR AULA</button>
      </section>}
    </aside></div>}
  </section>;
}
