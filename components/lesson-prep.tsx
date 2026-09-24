"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { applySafeRepeatVariation, competencyLabels, lessonTemplates, stateLabel, totalMinutes, type AgeBand, type StudentState } from "@/lib/suzuki-lessons";
import { clearActiveLesson, createLocalStudent, getActiveLesson, getLessonHistory, getLocalStudents, saveActiveLesson, saveLocalStudent, updateLocalStudent, type ActiveLesson, type LessonHistory, type LocalStudent } from "@/lib/teacher-local-v2";
import { recommendLessons } from "@/lib/lesson-recommender";
import { lessonPathMeta } from "@/lib/lesson-path";
import styles from "./lesson-prep.module.css";

const states: { id: StudentState; emoji: string; description: string }[] = [
  { id: "electric", emoji: "⚡", description: "Começar pelo corpo e reduzir espera" },
  { id: "steady", emoji: "🙂", description: "Sequência equilibrada" },
  { id: "tired", emoji: "🌙", description: "Menos exigência, mais escuta" },
  { id: "sensitive", emoji: "🤍", description: "Entrada suave e previsível" },
];

export function LessonPrep() {
  const router = useRouter();
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [studentId, setStudentId] = useState("");
  const [state, setState] = useState<StudentState>("steady");
  const [instrumentMode, setInstrumentMode] = useState<"physical" | "virtual" | "silent">("physical");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [active, setActive] = useState<ActiveLesson | null>(null);
  const [history, setHistory] = useState<LessonHistory[]>([]);
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("4-5");
  const [level, setLevel] = useState<LocalStudent["level"]>("iniciante");

  useEffect(() => {
    void Promise.all([getLocalStudents(), getLessonHistory()]).then(([local, nextHistory]) => {
      setStudents(local);
      setHistory(nextHistory);
      if (local[0]) setStudentId(local[0].id);
      else router.replace("/onboarding");
      setActive(getActiveLesson());
    });
  }, [router]);

  const student = students.find((item) => item.id === studentId) ?? null;
  const recommendations = useMemo(() => student ? recommendLessons(student, state, history) : [], [student, state, history]);
  const selectedRecommendation = recommendations.find((item) => item.lesson.id === selectedLessonId) ?? recommendations[0] ?? null;
  const suggested = selectedRecommendation?.lesson ?? null;
  const candidates = recommendations.map((item) => item.lesson);
  const lessonUses = student && suggested ? history.filter((item) => item.studentId === student.id && item.lessonId === suggested.id).length : 0;
  const pathMeta = suggested ? lessonPathMeta(suggested.id) : null;
  const nextLessonTitles = pathMeta?.next.map((id) => lessonTemplates.find((lesson) => lesson.id === id)?.title).filter(Boolean) as string[] | undefined;

  useEffect(() => { setSelectedLessonId(""); }, [studentId, state]);

  async function createStudent() {
    if (!name.trim()) return;
    const created = createLocalStudent({ name, parentName, ageBand, level });
    await saveLocalStudent(created);
    const next = [created, ...students];
    setStudents(next);
    setStudentId(created.id);
    setName(""); setParentName(""); setShowCreate(false);
  }

  async function setPreference(patch: Partial<LocalStudent>) {
    if (!student) return;
    const updated = await updateLocalStudent(student.id, patch);
    if (!updated) return;
    setStudents((current) => current.map((item) => item.id === updated.id ? updated : item));
  }

  function startLesson() {
    if (!student || !suggested) return;
    const repeated = history.filter((item) => item.studentId === student.id && item.lessonId === suggested.id).length;
    const variation = student.repeatVariation ? applySafeRepeatVariation(suggested.blocks, repeated) : { blocks: suggested.blocks, applied: false };
    saveActiveLesson({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lesson-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      ageBand: student.ageBand,
      state,
      lessonId: suggested.id,
      lessonTitle: suggested.title,
      repertoire: student.currentRepertoire?.pieceTitle || suggested.repertoire,
      blocks: variation.blocks,
      instrumentMode,
      currentBlockIndex: 0,
      variationApplied: variation.applied,
      startedAt: new Date().toISOString(),
    });
    if (typeof navigator !== "undefined" && !navigator.onLine) window.location.assign("/offline-aula");
    else router.push("/aula");
  }

  return <div className={styles.workspace}>
    <section className={styles.intro}>
      <div><span>HOJE</span><h1>Quem vamos ensinar agora?</h1><p>Escolha a criança, diga como ela chegou e comece. O resto já vem organizado.</p></div>
      <button className={styles.addStudent} onClick={() => router.push("/onboarding")}>+ Novo aluno</button>
    </section>

    {active && <section className={styles.resume}>
      <div><span>AULA EM ANDAMENTO</span><strong>{active.studentName} · {active.lessonTitle}</strong><small>Parou no bloco {active.currentBlockIndex + 1} de {active.blocks.length}. Nada foi perdido.</small></div>
      <div><button onClick={() => { clearActiveLesson(); setActive(null); }}>Descartar</button><button className={styles.resumePrimary} onClick={() => router.push("/aula")}>Retomar aula →</button></div>
    </section>}

    {showCreate && <section className={styles.createCard}>
      <div><strong>Novo aluno</strong><span>Menos de 30 segundos · dados só neste dispositivo</span></div>
      <input value={name} onChange={(event: any) => setName(event.target.value)} placeholder="Nome ou identificação" autoFocus />
      <select value={ageBand} onChange={(event: any) => setAgeBand(event.target.value as AgeBand)}><option value="2-3">2–3 anos</option><option value="4-5">4–5 anos</option><option value="6-8">6–8 anos</option></select>
      <select value={level} onChange={(event: any) => setLevel(event.target.value as LocalStudent["level"])}><option value="iniciante">Iniciante</option><option value="em-progresso">Em progresso</option><option value="avancado">Avançado</option></select>
      <input value={parentName} onChange={(event: any) => setParentName(event.target.value)} placeholder="Encarregado (opcional)" />
      <button onClick={() => void createStudent()} disabled={!name.trim()}>Adicionar</button>
    </section>}

    {students.length > 0 && <>
      <section className={styles.step}>
        <div className={styles.stepNumber}>1</div><div className={styles.stepBody}><div className={styles.stepTitle}><strong>Escolha o aluno</strong><span>{students.length} neste dispositivo</span></div>
        <div className={styles.students}>{students.map((item) => <button key={item.id} onClick={() => { setStudentId(item.id); setShowPreferences(false); }} data-active={item.id === studentId}><span className={styles.avatar}>{item.photoDataUrl ? <img src={item.photoDataUrl} alt="" /> : item.name.slice(0, 1).toUpperCase()}</span><span><strong>{item.name}</strong><small>{item.ageBand} anos · {item.level.replace("-", " ")}</small></span></button>)}</div>
        {student && <div className={styles.studentMeta}><span>{student.repeatVariation ? "Variação leve ligada" : "Repetição consciente"}</span><span>{student.reducedStimulus ? "Estímulos reduzidos" : "Estímulos normais"}</span>{student.currentRepertoire?.pieceTitle && <span>♪ {student.currentRepertoire.pieceTitle}</span>}<button onClick={() => setShowPreferences((value) => !value)}>Preferências</button></div>}
        {student && showPreferences && <div className={styles.preferences}>
          <label><div><strong>Variações leves ao repetir</strong><small>Desligado = repetir a mesma estrutura. Ligado = o sistema muda apenas uma ação segura, sem trocar o objetivo.</small></div><input type="checkbox" checked={student.repeatVariation} onChange={(event: any) => void setPreference({ repeatVariation: event.target.checked })} /></label>
          <label><div><strong>Reduzir estímulos e animações</strong><small>Para crianças que beneficiam de uma interface mais calma.</small></div><input type="checkbox" checked={student.reducedStimulus} onChange={(event: any) => void setPreference({ reducedStimulus: event.target.checked })} /></label>
        </div>}
        </div>
      </section>

      {student && <section className={styles.step}>
        <div className={styles.stepNumber}>2</div><div className={styles.stepBody}><div className={styles.stepTitle}><strong>Como {student.name} chegou hoje?</strong><span>Um toque. Sem diagnóstico.</span></div>
        <div className={styles.states}>{states.map((item) => <button key={item.id} onClick={() => setState(item.id)} data-active={state === item.id}><b>{item.emoji}</b><strong>{stateLabel(item.id)}</strong><small>{item.description}</small></button>)}</div></div>
      </section>}

      {student && suggested && <section className={`${styles.step} ${styles.recommendationStep}`}>
        <div className={styles.stepNumber}>3</div><div className={styles.stepBody}>
          <div className={styles.stepTitle}><strong>Aula sugerida</strong><span>Faixa + domínio + histórico + estado de hoje.</span></div>
          <article className={styles.lessonCard}>
            <div className={styles.lessonHead}><div><span className={styles.suggested}>RECOMENDADA PARA HOJE</span><h2>{suggested.title}</h2><p>{suggested.repertoire}</p>{selectedRecommendation?.reasons?.length ? <div className={styles.reasons}>{selectedRecommendation.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div> : null}{selectedRecommendation && !selectedRecommendation.ready ? <p className={styles.prerequisiteWarning}>Pré-requisitos ainda em construção: {selectedRecommendation.unmet.map((id) => competencyLabels[id]).join(" · ")}</p> : null}{lessonUses > 0 && <small className={styles.repeatNote}>{student.repeatVariation ? `Já usada ${lessonUses}x · desta vez entra uma variação leve` : `Já usada ${lessonUses}x · repetição consciente mantida`}</small>}</div><div className={styles.duration}><b>{totalMinutes(suggested.blocks)}</b><span>min</span></div></div>
            <div className={styles.blocks}>{suggested.blocks.map((block, index) => <div key={block.id}><span>{index + 1}</span><div><strong>{block.title}</strong><small>{block.minutes} min · {block.objective}</small></div><em>{block.screenMode === "off" ? "sem ecrã" : block.screenMode === "minimal" ? "ecrã mínimo" : "visual"}</em></div>)}</div>
            <div className={styles.instrument}><span>Instrumento hoje</span><div><button data-active={instrumentMode === "physical"} onClick={() => setInstrumentMode("physical")}>🎹 Piano físico</button><button data-active={instrumentMode === "virtual"} onClick={() => setInstrumentMode("virtual")}>▤ Piano virtual</button><button data-active={instrumentMode === "silent"} onClick={() => setInstrumentMode("silent")}>◌ Modo silencioso</button></div></div>
            <div className={styles.lessonActions}><button className={styles.swap} onClick={() => { const next = candidates.find((lesson) => lesson.id !== suggested.id); if (next) setSelectedLessonId(next.id); }}>Trocar aula</button><button className={styles.start} onClick={startLesson}>Começar aula →</button></div>
          </article>
        </div>
      </section>}
    </>}
  </div>;
}
