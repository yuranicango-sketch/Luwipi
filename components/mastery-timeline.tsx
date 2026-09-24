"use client";

import { useMemo, useState } from "react";
import { competencyLabels, type CompetencyId, type MasteryLevel } from "@/lib/suzuki-lessons";
import type { LessonHistory } from "@/lib/teacher-local-v2";
import styles from "./mastery-timeline.module.css";

const levelLabels: Record<MasteryLevel,string> = {
  emergente:"Emergente",
  desenvolvimento:"Em desenvolvimento",
  consolidado:"Consolidado",
  independente:"Independente",
};

export function MasteryTimeline({ history }: { history: LessonHistory[] }) {
  const available = useMemo(() => {
    const set = new Set<CompetencyId>();
    history.forEach((entry) => (Object.keys(entry.competencies) as CompetencyId[]).forEach((id) => set.add(id)));
    return (Object.keys(competencyLabels) as CompetencyId[]).filter((id) => set.has(id));
  }, [history]);
  const [selected,setSelected] = useState<CompetencyId | null>(null);
  const active = selected && available.includes(selected) ? selected : available[0] ?? null;

  const events = useMemo(() => {
    if (!active) return [];
    let previous: MasteryLevel | undefined;
    return history.slice().sort((a,b)=>a.completedAt.localeCompare(b.completedAt)).flatMap((entry)=>{
      const level=entry.competencies[active];
      if (!level || level===previous) return [];
      previous=level;
      return [{id:entry.id,date:entry.completedAt,level,lesson:entry.lessonTitle}];
    }).slice(-10);
  }, [history,active]);

  return <section className={styles.timeline}>
    <div className={styles.head}><div><span>LINHA DO TEMPO DE DOMÍNIO</span><strong>Como a competência mudou ao longo das aulas</strong></div>{active&&<b>{competencyLabels[active]}</b>}</div>
    {available.length?<><div className={styles.picker}>{available.map((id)=><button key={id} data-active={id===active} onClick={()=>setSelected(id)}>{competencyLabels[id]}</button>)}</div>
      <div className={styles.rail}>{events.map((event,index)=><article key={event.id}><div className={styles.dot} data-level={event.level}>{index+1}</div><span>{new Date(event.date).toLocaleDateString("pt-PT",{month:"short",year:"2-digit"})}</span><strong>{levelLabels[event.level]}</strong><small>{event.lesson}</small></article>)}</div>
    </>:<p className={styles.empty}>A linha do tempo aparece quando o professor começar a validar competências no final das aulas.</p>}
  </section>;
}
