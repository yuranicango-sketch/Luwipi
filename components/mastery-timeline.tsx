"use client";
import { useMemo, useState } from "react";
import { competencyLabels, type CompetencyId, type MasteryLevel } from "@/lib/suzuki-lessons";
import type { LessonHistory } from "@/lib/teacher-local-v2";
import styles from "./mastery-timeline.module.css";

const levelLabels: Record<MasteryLevel,string>={emergente:"Emergente",desenvolvimento:"Em desenvolvimento",consolidado:"Consolidado",independente:"Independente"};
const ranks: Record<MasteryLevel,number>={emergente:1,desenvolvimento:2,consolidado:3,independente:4};

export function MasteryTimeline({history}:{history:LessonHistory[]}){
  const available=useMemo(()=>(Object.keys(competencyLabels) as CompetencyId[]).filter((id)=>history.some((item)=>item.competencies[id])),[history]);
  const [selected,setSelected]=useState<CompetencyId | "">("");
  const competency=(selected && available.includes(selected)) ? selected : available[0];
  const points=competency ? history.filter((item)=>item.competencies[competency]).slice().sort((a,b)=>a.completedAt.localeCompare(b.completedAt)).slice(-12) : [];

  return <section className={styles.timeline}>
    <div className={styles.head}><div><span>LINHA DO TEMPO DE DOMÍNIO</span><strong>Veja a espiral acontecer ao longo das aulas.</strong></div>{available.length>0&&<select value={competency??""} onChange={(event)=>setSelected(event.target.value as CompetencyId)}>{available.map((id)=><option key={id} value={id}>{competencyLabels[id]}</option>)}</select>}</div>
    {competency&&points.length?<><div className={styles.rail}>{points.map((item,index)=>{const level=item.competencies[competency] as MasteryLevel;return <article key={item.id} data-level={level}><div className={styles.dot}>{ranks[level]}</div>{index<points.length-1&&<i/>}<strong>{levelLabels[level]}</strong><span>{new Date(item.completedAt).toLocaleDateString("pt-PT",{day:"2-digit",month:"short"})}</span></article>})}</div><p>Os pontos são observações do professor em aulas reais; o Luwipi não promove domínio sozinho.</p></>:<div className={styles.empty}>Ainda não há duas observações suficientes para desenhar uma evolução. Continue a avaliar apenas quando houver algo concreto a registar.</div>}
  </section>;
}
