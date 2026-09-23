"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { competencyLabels, fallbackBlocks, lessonTemplates, wildcardActivities, type CompetencyId, type LessonBlock, type MasteryLevel } from "@/lib/suzuki-lessons";
import { clearActiveLesson, getActiveLesson, getLocalStudent, getStudentHistory, saveActiveLesson, saveLessonHistory, updateStudentMastery, type ActiveLesson, type LocalStudent } from "@/lib/teacher-store";
import { VirtualPiano } from "@/components/virtual-piano";
import { LessonGuide } from "@/components/lesson-guide";
import { LessonExperience } from "@/components/lesson-experience";
import styles from "./live-lesson.module.css";

const masteryLevels: { id: MasteryLevel; label: string }[] = [
  { id: "emergente", label: "Emergente" },
  { id: "desenvolvimento", label: "Em desenvolvimento" },
  { id: "consolidado", label: "Consolidado" },
  { id: "independente", label: "Independente" },
];

const kindLabels = {
  movement: "CORPO / MOVIMENTO",
  ear: "OUVIDO",
  piano: "PIANO",
  repertoire: "REPERTÓRIO",
  arrival: "CHEGADA",
  closing: "FECHO",
} as const;

function silentVersion(block: LessonBlock) {
  if (block.kind === "ear") return { childCue: "Olha, toca e imita o gesto.", teacherCue: "Substitua o contraste sonoro por duas formas, posições ou movimentos. Mostre um, esconda e peça para a criança reproduzir sem usar áudio." };
  if (block.kind === "repertoire") return { childCue: "Desenha a música com o corpo.", teacherCue: "Conduza o pulso e a direção da frase com gestos, cartões ou toque mudo nas teclas. Preserve a forma da música sem exigir som." };
  if (block.kind === "arrival") return { childCue: "Olá com gesto 👋", teacherCue: "Faça o ritual de chegada por gesto, pulso visual ou toque leve na mesa. Mantenha a mesma previsibilidade da versão sonora." };
  if (block.kind === "piano") return { childCue: "Segue a forma e toca sem som.", teacherCue: "Use o teclado silencioso abaixo ou toque mudo no piano físico. Trabalhe posição, sequência e coordenação sem feedback auditivo." };
  return { childCue: block.childCue, teacherCue: block.teacherCue };
}

function elapsedMinutes(startedAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000));
}

function overlap(a: LessonBlock, b: LessonBlock) {
  return a.competencies.filter((id) => b.competencies.includes(id)).length;
}

export function LiveLesson() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveLesson | null>(null);
  const [student, setStudent] = useState<LocalStudent | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const [wildcard, setWildcard] = useState(false);
  const [swap, setSwap] = useState(false);
  const [finished, setFinished] = useState(false);
  const [note, setNote] = useState("");
  const [mastery, setMastery] = useState<Partial<Record<CompetencyId, MasteryLevel>>>({});
  const [copied, setCopied] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [online, setOnline] = useState(true);
  const [savedOffline, setSavedOffline] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
    const active = getActiveLesson();
    if (!active) { router.replace("/dashboard"); return; }
    const normalized: ActiveLesson = {
      ...active,
      instrumentMode: active.instrumentMode ?? "physical",
      currentBlockIndex: active.currentBlockIndex ?? 0,
      variationApplied: active.variationApplied ?? false,
    };
    setSession(normalized);
    setIndex(Math.min(normalized.currentBlockIndex, normalized.blocks.length - 1));
    setMinutes(elapsedMinutes(normalized.startedAt));
    setOnline(navigator.onLine);
    void Promise.all([getLocalStudent(normalized.studentId), getStudentHistory(normalized.studentId)]).then(([nextStudent, history]) => {
      setStudent(nextStudent);
      setHistoryCount(history.length);
    });
  }, [router]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => setMinutes(elapsedMinutes(session.startedAt)), 60000);
    return () => window.clearInterval(timer);
  }, [session]);

  const block = session?.blocks[index] ?? null;
  const focusCompetencies = useMemo(() => session ? Array.from(new Set(session.blocks.flatMap((item) => item.competencies))).slice(0, 5) : [], [session]);

  if (!session || !block) return <main className={styles.loading}>A preparar a aula…</main>;
  const currentSession = session;
  const displayed = currentSession.instrumentMode === "silent" ? silentVersion(block) : { childCue: block.childCue, teacherCue: block.teacherCue };

  function persist(next: ActiveLesson) {
    setSession(next);
    saveActiveLesson(next);
  }

  function moveTo(nextIndex: number) {
    const safe = Math.max(0, Math.min(nextIndex, currentSession.blocks.length - 1));
    setIndex(safe);
    persist({ ...currentSession, currentBlockIndex: safe });
  }

  function replaceBlock(replacement: LessonBlock) {
    const next = { ...currentSession, blocks: currentSession.blocks.map((item, itemIndex) => itemIndex === index ? replacement : item) };
    persist(next);
    setSwap(false);
  }

  function chooseWildcard(replacement: LessonBlock) {
    const nextBlocks = [...currentSession.blocks];
    nextBlocks.splice(index + 1, 0, replacement);
    const nextIndex = index + 1;
    persist({ ...currentSession, blocks: nextBlocks, currentBlockIndex: nextIndex });
    setWildcard(false);
    setIndex(nextIndex);
  }

  function next() {
    if (index >= currentSession.blocks.length - 1) { setFinished(true); return; }
    moveTo(index + 1);
  }

  const movement = currentSession.blocks.find((item) => item.kind === "movement");
  const piano = currentSession.blocks.find((item) => item.kind === "piano");
  const homePractice = [
    `🎧 Ouvir: ${currentSession.repertoire}`,
    movement ? `👐 Corpo: ${movement.title} por 1–2 minutos` : "👐 Corpo: repetir uma brincadeira curta da aula",
    currentSession.instrumentMode === "physical" && piano ? `🎹 Piano: ${piano.childCue.replace(/[🎹⭐🥁👂]/g, "").trim()}` : currentSession.instrumentMode === "silent" ? "◌ Silencioso: repetir o caminho visual/tátil sem som" : "🎹 Sem piano: repetir o padrão no teclado virtual ou cantar/imitar",
  ];
  const parentSummary = `Hoje ${currentSession.studentName} trabalhou ${currentSession.lessonTitle} e saiu da aula com “${currentSession.repertoire}” como referência musical. 🌱`;
  const shareText = `${parentSummary}\n\nAté à próxima aula:\n${homePractice.join("\n")}\n\nPouco tempo, sem pressão. Pare enquanto ainda está agradável.`;

  async function finishLesson() {
    if (saving) return;
    setSaving(true);
    try {
      await saveLessonHistory({
        id: currentSession.id,
        studentId: currentSession.studentId,
        lessonId: currentSession.lessonId,
        lessonTitle: currentSession.lessonTitle,
        repertoire: currentSession.repertoire,
        state: currentSession.state,
        instrumentMode: currentSession.instrumentMode,
        startedAt: currentSession.startedAt,
        completedAt: new Date().toISOString(),
        competencies: mastery,
        note: note.trim() || undefined,
        parentSummary,
        homePractice,
      });
      await updateStudentMastery(currentSession.studentId, mastery, currentSession.repertoire);
      clearActiveLesson();
      if (navigator.onLine) router.push("/dashboard");
      else {
        setSavedOffline(true);
        setHistoryCount((count) => count + 1);
      }
    } finally {
      setSaving(false);
    }
  }

  if (finished) return <main className={styles.finishPage}>
    <section className={styles.finishCard}>
      <span className={styles.kicker}>AULA CONCLUÍDA</span>
      <h1>Termine simples. Registe só o que observou.</h1>
      <p>Concluir uma atividade não altera domínio automaticamente. A observação do professor continua a ser a fonte da verdade.</p>
      {!online && <div className={styles.offlineBanner}><strong>Sem internet.</strong><span>A aula continua a guardar neste dispositivo.</span></div>}
      {savedOffline && <div className={styles.savedOffline}><strong>Guardado no dispositivo ✓</strong><span>Pode continuar offline. “Hoje” foi pré-carregado enquanto havia rede.</span></div>}
      <div className={styles.garden}><span>🌱</span><div><strong>O jardim de {currentSession.studentName} cresce, nunca murcha.</strong><small>Esta será a aula {historyCount + (savedOffline ? 0 : 1)} guardada neste dispositivo. Sem streaks e sem punição por faltas.</small></div></div>
      <div className={styles.masteryGrid}>{focusCompetencies.map((id) => <div key={id} className={styles.masteryRow}><strong>{competencyLabels[id]}</strong><div>{masteryLevels.map((level) => <button key={level.id} data-active={mastery[id] === level.id} onClick={() => setMastery((current) => ({ ...current, [id]: level.id }))}>{level.label}</button>)}</div></div>)}</div>
      <label className={styles.notes}><span>Nota privada do professor</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Uma observação concreta para a próxima aula…" /></label>
      <div className={styles.homeCard}><span>PARA QUEM ACOMPANHA</span><strong>{currentSession.repertoire}</strong><p>{parentSummary}</p><div className={styles.homeList}>{homePractice.map((item) => <div key={item}>{item}</div>)}</div><small>Pouco tempo, sem pressão. Pare enquanto ainda está agradável.</small><button onClick={async () => { await navigator.clipboard?.writeText(shareText); setCopied(true); }}>{copied ? "Copiado ✓" : "Copiar resumo + prática"}</button></div>
      <div className={styles.finishActions}>{!savedOffline && <button onClick={() => setFinished(false)}>Voltar à aula</button>}{savedOffline ? <button className={styles.primary} onClick={() => router.push("/dashboard")}>Ir para Hoje →</button> : <button className={styles.primary} disabled={saving} onClick={() => void finishLesson()}>{saving ? "A guardar…" : "Guardar e fechar"}</button>}</div>
    </section>
  </main>;

  const swapOptions = [
    ...lessonTemplates.filter((lesson) => lesson.ageBand === currentSession.ageBand).flatMap((lesson) => lesson.blocks).filter((item) => item.kind === block.kind && item.id !== block.id),
    ...(fallbackBlocks[block.kind] ?? []),
  ]
    .filter((item, itemIndex, all) => all.findIndex((candidate) => candidate.title === item.title) === itemIndex)
    .sort((a, b) => (overlap(block, b) * 3 + Number(b.screenMode === block.screenMode)) - (overlap(block, a) * 3 + Number(a.screenMode === block.screenMode)))
    .slice(0, 5);

  const showExperience = block.screenMode !== "off" && block.kind !== "piano";

  return <main className={`${styles.lesson} ${student?.reducedStimulus ? styles.reduced : ""}`} data-age={currentSession.ageBand}>
    <header className={styles.topbar}>
      <div><strong>{currentSession.studentName}</strong><span>{currentSession.lessonTitle}{currentSession.variationApplied ? " · variação leve" : ""}</span></div>
      <div className={styles.progress} aria-label={`Bloco ${index + 1} de ${currentSession.blocks.length}`}>{currentSession.blocks.map((item, itemIndex) => <span key={`${item.id}-${itemIndex}`} data-active={itemIndex === index} data-done={itemIndex < index} />)}</div>
      <div className={styles.topActions}><span className={online ? styles.online : styles.offline}>{online ? "online" : "offline · aula local"}</span><span>{minutes} min</span><button onClick={() => { saveActiveLesson({ ...currentSession, currentBlockIndex: index }); router.push("/dashboard"); }}>Guardar e sair</button></div>
    </header>

    <section className={`${styles.stage} ${block.screenMode === "off" ? styles.screenOff : block.screenMode === "minimal" ? styles.screenMinimal : styles.screenVisual}`}>
      <div className={styles.stageMeta}><span>{kindLabels[block.kind]}</span><b>{block.minutes} min</b></div>
      {block.screenMode === "off" && currentSession.instrumentMode === "physical" && <div className={styles.lookAway}>↑<span>Agora olhe para a criança, não para o ecrã.</span></div>}
      {!(block.screenMode === "off" && currentSession.instrumentMode === "physical") && <LessonGuide ageBand={currentSession.ageBand} kind={block.kind} reduced={student?.reducedStimulus} />}
      <h1>{block.title}</h1>
      {showExperience && <LessonExperience block={block} ageBand={currentSession.ageBand} silent={currentSession.instrumentMode === "silent"} />}
      <p className={styles.childCue}>{displayed.childCue}</p>
      <div className={styles.teacherCue}><span>PARA O PROFESSOR{currentSession.instrumentMode === "silent" ? " · ADAPTAÇÃO SILENCIOSA" : ""}</span><p>{displayed.teacherCue}</p><small>Objetivo: {block.objective}</small></div>
      {block.parentCue && <div className={styles.parentCue}><span>👨‍👩‍👧 PARA QUEM ACOMPANHA</span><p>{block.parentCue}</p></div>}
      {block.kind === "piano" && (currentSession.instrumentMode === "virtual" || currentSession.instrumentMode === "silent") && <VirtualPiano ageBand={currentSession.ageBand} reducedStimulus={student?.reducedStimulus} silent={currentSession.instrumentMode === "silent"} />}
    </section>

    <footer className={styles.controls}>
      <button onClick={() => setSwap(true)}>Trocar</button>
      <button onClick={() => setWildcard(true)}>⚡ Coringa</button>
      <button onClick={() => setPause(true)}>♡ Pausa</button>
      <button className={styles.next} onClick={next}>{index === currentSession.blocks.length - 1 ? "Fechar aula" : "Próximo →"}</button>
    </footer>

    {swap && <div className={styles.overlay}><section className={styles.sheet}><button className={styles.close} onClick={() => setSwap(false)}>×</button><span>TROCAR SÓ ESTE BLOCO</span><h2>Mesmo objetivo, outra forma.</h2><p>As primeiras opções preservam mais competências e modalidade do bloco atual.</p><div className={styles.choices}>{swapOptions.map((item) => <button key={item.id} onClick={() => replaceBlock(item)}><strong>{item.title}</strong><small>{item.minutes} min · {item.objective}</small></button>)}</div></section></div>}

    {wildcard && <div className={styles.overlay}><section className={styles.sheet}><button className={styles.close} onClick={() => setWildcard(false)}>×</button><span>CORINGA · 60–90 SEGUNDOS</span><h2>Quebre o fluxo sem transformar isso numa recompensa.</h2><p>Use para tédio, perda de foco ou pequena falha técnica. Depois volte à aula.</p><div className={styles.choices}>{wildcardActivities[currentSession.ageBand].map((item) => <button key={item.id} onClick={() => chooseWildcard(item)}><strong>{item.title}</strong><small>{item.teacherCue}</small></button>)}</div></section></div>}

    {pause && <div className={`${styles.overlay} ${styles.calmOverlay}`}><section className={styles.calm}><LessonGuide ageBand={currentSession.ageBand} kind="closing" reduced /><span>♡ PAUSA / ACOLHIMENTO</span><h2>Não precisamos continuar agora.</h2><p>Reduza estímulos. Baixe a voz. Dê espaço. A aula pode esperar.</p><div><span>Respirar juntos</span><span>Água / colo / silêncio</span><span>Sem contagem regressiva</span><span>Retomar só quando fizer sentido</span></div><button onClick={() => setPause(false)}>Voltar quando fizer sentido</button></section></div>}
  </main>;
}
