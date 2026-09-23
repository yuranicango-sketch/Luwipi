"use client";

import { useEffect, useMemo, useState } from "react";
import { competencyLabels, type AgeBand, type CompetencyId, type MasteryLevel } from "@/lib/suzuki-lessons";
import { repertoireFocusLabels, type RepertoireFocus } from "@/lib/repertoire";
import { createLocalStudent, getLessonHistory, getLocalStudents, saveLocalStudent, updateLocalStudent, type LessonHistory, type LocalStudent } from "@/lib/teacher-store";
import { imageFileToLocalAvatar } from "@/lib/local-image";
import { ProgressGarden } from "@/components/progress-garden";
import styles from "./students-panel.module.css";

const masteryLabels: Record<MasteryLevel, string> = { emergente: "Emergente", desenvolvimento: "Em desenvolvimento", consolidado: "Consolidado", independente: "Independente" };

export function StudentsPanel() {
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [history, setHistory] = useState<LessonHistory[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("4-5");
  const [level, setLevel] = useState<LocalStudent["level"]>("iniciante");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [method, setMethod] = useState("");
  const [piece, setPiece] = useState("");
  const [focus, setFocus] = useState<RepertoireFocus>("ear-memory");
  const [busy, setBusy] = useState(false);

  async function refresh(preferred?: string) {
    const [nextStudents, nextHistory] = await Promise.all([getLocalStudents(), getLessonHistory()]);
    setStudents(nextStudents);
    setHistory(nextHistory);
    setSelectedId((current) => preferred ?? (nextStudents.some((student) => student.id === current) ? current : nextStudents[0]?.id ?? ""));
  }

  useEffect(() => { void refresh(); }, []);

  const selected = students.find((student) => student.id === selectedId) ?? null;
  const studentHistory = useMemo(() => selected ? history.filter((item) => item.studentId === selected.id) : [], [history, selected]);
  const activeExternal = selected?.externalRepertoire.find((item) => item.active) ?? null;

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const student = createLocalStudent({ name, parentName, ageBand, level, photoDataUrl });
      await saveLocalStudent(student);
      setName(""); setParentName(""); setPhotoDataUrl(undefined); setCreating(false);
      await refresh(student.id);
    } finally {
      setBusy(false);
    }
  }

  async function patch(patchValue: Partial<Omit<LocalStudent, "id" | "createdAt">>) {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const next = await updateLocalStudent(selected.id, patchValue);
      if (next) await refresh(next.id);
    } finally {
      setBusy(false);
    }
  }

  async function addExternalRepertoire() {
    if (!selected || !method.trim() || !piece.trim() || busy) return;
    const item = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `rep-${Date.now()}`,
      method: method.trim(),
      piece: piece.trim(),
      focus,
      active: true,
      createdAt: new Date().toISOString(),
    };
    await patch({ externalRepertoire: [item, ...selected.externalRepertoire.map((entry) => ({ ...entry, active: false }))] });
    setMethod("");
    setPiece("");
  }

  async function activateExternal(id: string) {
    if (!selected) return;
    await patch({ externalRepertoire: selected.externalRepertoire.map((entry) => ({ ...entry, active: entry.id === id })) });
  }

  async function removeExternal(id: string) {
    if (!selected) return;
    const removing = selected.externalRepertoire.find((entry) => entry.id === id);
    let next = selected.externalRepertoire.filter((entry) => entry.id !== id);
    if (removing?.active && next.length) next = next.map((entry, index) => ({ ...entry, active: index === 0 }));
    await patch({ externalRepertoire: next });
  }

  return <div className={styles.page}>
    <header className={styles.hero}><div><span>ALUNOS</span><h1>Conheça a criança, não apenas a aula.</h1><p>Perfil, repetição, repertório, domínio e histórico ficam neste dispositivo.</p></div><button onClick={() => setCreating((value) => !value)}>+ Adicionar aluno</button></header>

    {creating && <section className={styles.create}>
      <label className={styles.photoPick}>{photoDataUrl ? <img src={photoDataUrl} alt="Pré-visualização local"/> : <span>+ Foto</span>}<input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setPhotoDataUrl(await imageFileToLocalAvatar(file)); }}/></label>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome ou identificação" autoFocus/>
      <select value={ageBand} onChange={(event) => setAgeBand(event.target.value as AgeBand)}><option value="2-3">2–3 anos</option><option value="4-5">4–5 anos</option><option value="6-8">6–8 anos</option></select>
      <select value={level} onChange={(event) => setLevel(event.target.value as LocalStudent["level"])}><option value="iniciante">Iniciante</option><option value="em-progresso">Em progresso</option><option value="avancado">Avançado</option></select>
      <input value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Encarregado (opcional)"/>
      <button disabled={!name.trim() || busy} onClick={() => void create()}>{busy ? "A guardar…" : "Guardar localmente"}</button>
    </section>}

    <div className={styles.layout}>
      <aside className={styles.list}>{students.length ? students.map((student) => {
        const count = history.filter((item) => item.studentId === student.id).length;
        return <button key={student.id} data-active={student.id === selectedId} onClick={() => setSelectedId(student.id)}>
          <b>{student.photoDataUrl ? <img src={student.photoDataUrl} alt="" /> : student.name.slice(0,1).toUpperCase()}</b>
          <span><strong>{student.name}</strong><small>{student.ageBand} anos · {count} {count === 1 ? "aula registada" : "aulas registadas"}</small></span>
        </button>;
      }) : <div className={styles.empty}>Ainda não há alunos neste dispositivo.</div>}</aside>

      {selected && <section className={styles.profile}>
        <div className={styles.profileHead}><div><span>{selected.ageBand} ANOS</span><h2>{selected.name}</h2>{selected.parentName && <small>Encarregado: {selected.parentName}</small>}</div><select value={selected.level} disabled={busy} onChange={(event) => void patch({ level: event.target.value as LocalStudent["level"] })}><option value="iniciante">Iniciante</option><option value="em-progresso">Em progresso</option><option value="avancado">Avançado</option></select></div>

        <ProgressGarden lessons={studentHistory.length} repertoire={selected.repertoire.length + selected.externalRepertoire.length} />

        <div className={styles.settings}>
          <label><div><strong>Variações leves ao repetir</strong><small>Desligada por padrão para respeitar repetição consciente Suzuki.</small></div><input type="checkbox" checked={selected.repeatVariation} disabled={busy} onChange={(event) => void patch({ repeatVariation: event.target.checked })}/></label>
          <label><div><strong>Reduzir estímulos</strong><small>Remove animações e simplifica a interface durante a aula.</small></div><input type="checkbox" checked={selected.reducedStimulus} disabled={busy} onChange={(event) => void patch({ reducedStimulus: event.target.checked })}/></label>
        </div>

        <div className={styles.sectionTitle}><div><span>PEÇA / MÉTODO ATUAL</span><h3>O que esta criança está realmente a tocar?</h3></div><p>Registamos apenas a referência — não copiamos o material publicado.</p></div>
        <div className={styles.externalForm}>
          <input value={method} onChange={(event) => setMethod(event.target.value)} placeholder="Método, ex.: Suzuki Piano School Vol. 1"/>
          <input value={piece} onChange={(event) => setPiece(event.target.value)} placeholder="Peça atual"/>
          <select value={focus} onChange={(event) => setFocus(event.target.value as RepertoireFocus)}>{Object.entries(repertoireFocusLabels).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select>
          <button disabled={!method.trim() || !piece.trim() || busy} onClick={() => void addExternalRepertoire()}>Associar peça</button>
        </div>
        <div className={styles.externalList}>{selected.externalRepertoire.length ? selected.externalRepertoire.map((entry) => <article key={entry.id} data-active={entry.active}>
          <div><span>{entry.active ? "PEÇA ATUAL" : "REFERÊNCIA"}</span><strong>{entry.piece}</strong><small>{entry.method} · {repertoireFocusLabels[entry.focus]}</small></div>
          <div>{!entry.active && <button disabled={busy} onClick={() => void activateExternal(entry.id)}>Tornar atual</button>}<button className={styles.remove} disabled={busy} onClick={() => void removeExternal(entry.id)}>Remover</button></div>
        </article>) : <p className={styles.muted}>Nenhum método externo associado. Pode usar o repertório incorporado normalmente.</p>}</div>
        {activeExternal && <p className={styles.activeNote}>As sugestões de aula agora favorecem competências que apoiam <strong>{activeExternal.piece}</strong>.</p>}

        <div className={styles.sectionTitle}><div><span>DOMÍNIO REAL</span><h3>Competências observadas</h3></div><p>O Luwipi nunca sobe estes níveis sozinho.</p></div>
        <div className={styles.competencies}>{(Object.keys(competencyLabels) as CompetencyId[]).map((id) => <div key={id}><strong>{competencyLabels[id]}</strong><span data-level={selected.competencies[id] ?? "none"}>{selected.competencies[id] ? masteryLabels[selected.competencies[id]!] : "Ainda sem avaliação"}</span></div>)}</div>

        <div className={styles.sectionTitle}><div><span>REPERTÓRIO DO LUWIPI</span><h3>Músicas que já fazem parte da jornada</h3></div><p>{studentHistory.length} aulas guardadas no IndexedDB local.</p></div>
        <div className={styles.repertoire}>{selected.repertoire.length ? selected.repertoire.map((song) => <span key={song}>♪ {song}</span>) : <p>O repertório aparece aqui depois das aulas concluídas.</p>}</div>

        <div className={styles.sectionTitle}><div><span>HISTÓRICO</span><h3>Últimas aulas e notas privadas</h3></div><p>Guardado apenas neste dispositivo.</p></div>
        <div className={styles.history}>{studentHistory.length ? studentHistory.slice(0,6).map((item) => <article key={item.id}><div><strong>{item.lessonTitle}</strong><span>{new Date(item.completedAt).toLocaleDateString("pt-PT")}</span></div><small>{item.repertoire}</small>{item.note && <p>{item.note}</p>}</article>) : <p>Ainda não há aulas concluídas.</p>}</div>
      </section>}
    </div>
  </div>;
}
