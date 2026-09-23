"use client";
import { useState } from "react";
import { competencyLabels, type AgeBand, type CompetencyId } from "@/lib/suzuki-lessons";
import { spiralMilestones } from "@/lib/spiral-curriculum";
import styles from "./curriculum-map.module.css";

export function CurriculumMap(){
  const [age,setAge]=useState<AgeBand>("2-3");
  const visible=spiralMilestones.filter((m)=>m.ageBand===age);
  return <div className={styles.page}><header><span>CURRÍCULO EM ESPIRAL</span><h1>Não “terminar matérias”. Reencontrá-las com mais profundidade.</h1><p>Os mesmos pilares voltam ao longo dos anos, com exigência crescente. Avanço depende de observação, não de cliques.</p></header><div className={styles.tabs}>{(["2-3","4-5","6-8"] as AgeBand[]).map((item)=><button key={item} data-active={age===item} onClick={()=>setAge(item)}>{item} anos</button>)}</div><section className={styles.map}>{visible.map((m)=><article key={`${m.competency}-${m.ageBand}`}><span>{competencyLabels[m.competency]}</span><h2>{m.title}</h2><p>{m.readyWhen}</p></article>)}</section><section className={styles.all}><span>12 COMPETÊNCIAS RASTREÁVEIS</span><div>{(Object.keys(competencyLabels) as CompetencyId[]).map((id)=><b key={id}>{competencyLabels[id]}</b>)}</div></section></div>;
}
