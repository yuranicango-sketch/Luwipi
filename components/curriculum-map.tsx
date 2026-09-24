"use client";
import { useState } from "react";
import { competencyLabels, lessonTemplates, type AgeBand, type CompetencyId } from "@/lib/suzuki-lessons";
import { lessonPathMeta } from "@/lib/lesson-path";
import { spiralMilestones } from "@/lib/spiral-curriculum";
import styles from "./curriculum-map.module.css";

export function CurriculumMap(){
  const [age,setAge]=useState<AgeBand>("2-3");
  const visible=spiralMilestones.filter((milestone)=>milestone.ageBand===age);
  const lessons=lessonTemplates.filter((lesson)=>lesson.ageBand===age).slice().sort((a,b)=>lessonPathMeta(a.id).sequence-lessonPathMeta(b.id).sequence);

  return <div className={styles.page}>
    <header><span>CURRÍCULO EM ESPIRAL</span><h1>Não “terminar matérias”. Reencontrá-las com mais profundidade.</h1><p>Os mesmos pilares voltam ao longo dos anos, com exigência crescente. Avanço depende de observação, não de cliques.</p></header>
    <div className={styles.tabs}>{(["2-3","4-5","6-8"] as AgeBand[]).map((item)=><button key={item} data-active={age===item} onClick={()=>setAge(item)}>{item} anos</button>)}</div>

    <section className={styles.lessonPath}>
      <div className={styles.pathHead}><div><span>CAMINHO DAS AULAS PRONTAS</span><h2>Uma sequência que sabe quando revisar.</h2></div><p>Os pré-requisitos ajudam a ordenar sugestões. O professor pode repetir, atrasar ou avançar quando a observação real pedir.</p></div>
      <div className={styles.pathRail}>{lessons.map((lesson,index)=>{
        const meta=lessonPathMeta(lesson.id);
        const prerequisites=Object.keys(meta.prerequisites) as CompetencyId[];
        return <article key={lesson.id}><b>{index+1}</b><div><strong>{lesson.title}</strong><small>{lesson.repertoire}</small><p>{prerequisites.length?<>Antes: {prerequisites.map((id)=>competencyLabels[id]).join(" · ")}</>:<>Entrada do caminho</>}</p></div></article>
      })}</div>
    </section>

    <section className={styles.intent}><span>COBERTURA ASSIMÉTRICA É INTENCIONAL</span><div><article><b>2–3</b><strong>Som antes de símbolo</strong><p>Direção, memória, pulso e exploração preparam a leitura; pauta formal não é meta nesta fase.</p></article><article><b>4–5</b><strong>Ponte visual</strong><p>Padrões, direção e símbolos simples aparecem depois de a criança já ouvir, cantar e tocar.</p></article><article><b>6–8</b><strong>Leitura progressiva</strong><p>A pauta entra como representação de música já conhecida, junto com técnica, frase e repertório.</p></article></div></section>

    <section className={styles.map}>{visible.map((milestone)=><article key={`${milestone.competency}-${milestone.ageBand}`}><span>{competencyLabels[milestone.competency]}</span><h2>{milestone.title}</h2><p>{milestone.readyWhen}</p></article>)}</section>
    <section className={styles.all}><span>12 COMPETÊNCIAS RASTREÁVEIS</span><div>{(Object.keys(competencyLabels) as CompetencyId[]).map((id)=><b key={id}>{competencyLabels[id]}</b>)}</div></section>
  </div>;
}
