"use client";

import { useEffect, useState } from "react";
import { competencyLabels, type AgeBand, type CompetencyId, type MasteryLevel } from "@/lib/suzuki-lessons";
import { createLocalStudent, getLessonHistory, getLocalStudents, saveLocalStudent, updateLocalStudent, type LessonHistory, type LocalStudent, type RepertoireStatus } from "@/lib/teacher-local-v2";
import { nextCompetencyFocus } from "@/lib/lesson-recommender";
import { repertoireFocusLabels, type RepertoireFocus } from "@/lib/repertoire";
import { imageFileToLocalAvatar } from "@/lib/local-image";
import { ProgressGarden } from "@/components/progress-garden";
import { MasteryTimeline } from "@/components/mastery-timeline";
import styles from "./students-panel.module.css";

const masteryLabels: Record<MasteryLevel, string> = { emergente: "Emergente", desenvolvimento: "Em desenvolvimento", consolidado: "Consolidado", independente: "Independente" };

export function StudentsPanel() {
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [allHistory, setAllHistory] = useState<LessonHistory[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("4-5");
  const [level, setLevel] = useState<LocalStudent["level"]>("iniciante");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [methodTitle, setMethodTitle] = useState("");
  const [pieceTitle, setPieceTitle] = useState("");
  const [repertoireStatus, setRepertoireStatus] = useState<RepertoireStatus>("learning");
  const [repertoireFocus, setRepertoireFocus] = useState<RepertoireFocus>("ear-memory");

  async function refresh(preferred?: string) {
    const [next, nextHistory] = await Promise.all([getLocalStudents(), getLessonHistory()]);
    setStudents(next);
    setAllHistory(nextHistory);
    setSelectedId((current) => preferred ?? (next.some((s) => s.id === current) ? current : next[0]?.id ?? ""));
  }
  useEffect(() => { void refresh(); }, []);

  const selected = students.find((student) => student.id === selectedId) ?? null;
  const history = selected ? allHistory.filter((item) => item.studentId === selected.id) : [];
  const nextFocus = selected ? nextCompetencyFocus(selected) : [];

  useEffect(() => {
    setMethodTitle(selected?.currentRepertoire?.methodTitle ?? "");
    setPieceTitle(selected?.currentRepertoire?.pieceTitle ?? "");
    setRepertoireStatus(selected?.currentRepertoire?.status ?? "learning");
    setRepertoireFocus(selected?.currentRepertoire?.focus ?? "ear-memory");
  }, [selectedId]);

  async function create() {
    if (!name.trim()) return;
    const student = createLocalStudent({ name, parentName, ageBand, level, photoDataUrl });
    await saveLocalStudent(student); setName(""); setParentName(""); setPhotoDataUrl(undefined); setCreating(false); await refresh(student.id);
  }

  async function patch(patchValue: Partial<LocalStudent>) {
    if (!selected) return;
    const next = await updateLocalStudent(selected.id, patchValue);
    if (next) await refresh(next.id);
  }

  function saveCurrentRepertoire() {
    if (!selected || !pieceTitle.trim()) return;
    void patch({
      currentRepertoire: {
        methodTitle: methodTitle.trim() || undefined,
        pieceTitle: pieceTitle.trim(),
        status: repertoireStatus,
        focus: repertoireFocus,
      },
    });
  }

  function clearCurrentRepertoire() {
    if (!selected) return;
    setMethodTitle("");
    setPieceTitle("");
    setRepertoireStatus("learning");
    setRepertoireFocus("ear-memory");
    void patch({ currentRepertoire: undefined });
  }

  return <div className={styles.page}>
    <header className={styles.hero}><div><span>ALUNOS</span><h1>Conheça a criança, não apenas a aula.</h1><p>Perfil, repetição, necessidades sensoriais, repertório e domínio ficam neste dispositivo.</p></div><button onClick={() => setCreating((v) => !v)}>+ Adicionar aluno</button></header>

    {creating && <section className={styles.create}><label className={styles.photoPick}>{photoDataUrl ? <img src={photoDataUrl} alt="Pré-visualização local"/> : <span>+ Foto</span>}<input type="file" accept="image/*" onChange={async (e:any)=>{const file=e.target.files?.[0];if(file)setPhotoDataUrl(await imageFileToLocalAvatar(file));}}/></label><input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Nome ou identificação" autoFocus/><select value={ageBand} onChange={(e: any) => setAgeBand(e.target.value as AgeBand)}><option value="2-3">2–3 anos</option><option value="4-5">4–5 anos</option><option value="6-8">6–8 anos</option></select><select value={level} onChange={(e:any)=>setLevel(e.target.value as LocalStudent["level"])}><option value="iniciante">Iniciante</option><option value="em-progresso">Em progresso</option><option value="avancado">Avançado</option></select><input value={parentName} onChange={(e:any)=>setParentName(e.target.value)} placeholder="Encarregado (opcional)"/><button disabled={!name.trim()} onClick={() => void create()}>Guardar localmente</button></section>}

    <div className={styles.layout}>
      <aside className={styles.list}>{students.length ? students.map((student) => { const count=allHistory.filter((item)=>item.studentId===student.id).length; return <button key={student.id} data-active={student.id === selectedId} onClick={() => setSelectedId(student.id)}><b>{student.name.slice(0,1).toUpperCase()}</b><span><strong>{student.name}</strong><small>{student.ageBand} anos · {count} {count===1?"aula registada":"aulas registadas"}</small></span></button> }) : <div className={styles.empty}>Ainda não há alunos neste dispositivo.</div>}</aside>

      {selected && <section className={styles.profile}>
        <div className={styles.profileHead}><div><span>{selected.ageBand} ANOS</span><h2>{selected.name}</h2>{selected.parentName&&<small>Encarregado: {selected.parentName}</small>}</div><select value={selected.level} onChange={(e: any) => void patch({ level: e.target.value as LocalStudent["level"] })}><option value="iniciante">Iniciante</option><option value="em-progresso">Em progresso</option><option value="avancado">Avançado</option></select></div>

        <ProgressGarden lessons={history.length} repertoire={selected.repertoire.length} competencies={selected.competencies} />

        <div className={styles.settings}>
          <label><div><strong>Variações leves ao repetir</strong><small>Desligada por padrão para respeitar repetição consciente Suzuki.</small></div><input type="checkbox" checked={selected.repeatVariation} onChange={(e: any) => void patch({ repeatVariation: e.target.checked })}/></label>
          <label><div><strong>Reduzir estímulos</strong><small>Remove animações e simplifica a interface durante a aula.</small></div><input type="checkbox" checked={selected.reducedStimulus} onChange={(e: any) => void patch({ reducedStimulus: e.target.checked })}/></label>
        </div>

        <div className={styles.sectionTitle}><div><span>PRÓXIMO FOCO</span><h3>Onde vale a pena insistir agora</h3></div><p>É uma sugestão. O professor decide.</p></div>
        <div className={styles.focusStrip}>{nextFocus.map((item) => <div key={item.id}><strong>{item.label}</strong><span>{item.level ? masteryLabels[item.level] : "Ainda sem avaliação"}</span></div>)}</div>

        <div className={styles.sectionTitle}><div><span>DOMÍNIO REAL</span><h3>Competências observadas</h3></div><p>O Luwipi nunca sobe estes níveis sozinho.</p></div>
        <div className={styles.competencies}>{(Object.keys(competencyLabels) as CompetencyId[]).map((id) => <div key={id}><strong>{competencyLabels[id]}</strong><span data-level={selected.competencies[id] ?? "none"}>{selected.competencies[id] ? masteryLabels[selected.competencies[id]!] : "Ainda sem avaliação"}</span></div>)}</div>
        <div style={{marginTop:12}}><MasteryTimeline history={history}/></div>

        <div className={styles.sectionTitle}><div><span>REPERTÓRIO ATUAL</span><h3>A peça que está a orientar as próximas aulas</h3></div><p>Referência externa; o Luwipi não copia o método.</p></div>
        <div className={styles.repertoireEditor}>
          <label><span>Método / fonte</span><input value={methodTitle} onChange={(e:any)=>setMethodTitle(e.target.value)} placeholder="Ex.: Suzuki Piano School Vol. 1" /></label>
          <label><span>Peça atual</span><input value={pieceTitle} onChange={(e:any)=>setPieceTitle(e.target.value)} placeholder="Nome da peça" /></label>
          <label><span>Estado</span><select value={repertoireStatus} onChange={(e:any)=>setRepertoireStatus(e.target.value as RepertoireStatus)}><option value="listening">A ouvir</option><option value="learning">A aprender</option><option value="review">Em revisão</option></select></label><label><span>Foco pedagógico</span><select value={repertoireFocus} onChange={(e:any)=>setRepertoireFocus(e.target.value as RepertoireFocus)}>{Object.entries(repertoireFocusLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
          <div className={styles.repertoireActions}><button disabled={!pieceTitle.trim()} onClick={saveCurrentRepertoire}>Guardar referência</button>{selected.currentRepertoire?.pieceTitle && <button className={styles.clearRepertoire} onClick={clearCurrentRepertoire}>Limpar</button>}</div>
        </div>

        <div className={styles.sectionTitle}><div><span>REPERTÓRIO APRENDIDO</span><h3>Músicas que já fazem parte da jornada</h3></div><p>{history.length} aulas guardadas localmente.</p></div>
        <div className={styles.repertoire}>{selected.repertoire.length ? selected.repertoire.map((song) => <span key={song}>♪ {song}</span>) : <p>O repertório aparece aqui depois das aulas concluídas.</p>}</div>

        <div className={styles.sectionTitle}><div><span>HISTÓRICO</span><h3>Últimas aulas e notas privadas</h3></div><p>Guardado apenas neste dispositivo.</p></div>
        <div className={styles.history}>{history.length ? history.slice(0,6).map((item)=><article key={item.id}><div><strong>{item.lessonTitle}</strong><span>{new Date(item.completedAt).toLocaleDateString("pt-PT")}</span></div><small>{item.repertoire}</small>{item.note&&<p>{item.note}</p>}</article>) : <p>Ainda não há aulas concluídas.</p>}</div>
      </section>}
    </div>
  </div>;
}
