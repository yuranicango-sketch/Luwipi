"use client";
import { useMemo, useState } from "react";
import { lessonTemplates, type AgeBand, type BlockKind } from "@/lib/suzuki-lessons";
import styles from "./library-panel.module.css";

const kinds: {id:"all"|BlockKind;label:string}[]=[{id:"all",label:"Tudo"},{id:"movement",label:"Corpo"},{id:"ear",label:"Ouvido"},{id:"piano",label:"Piano"},{id:"repertoire",label:"Repertório"},{id:"closing",label:"Fecho"}];
export function LibraryPanel(){
 const [age,setAge]=useState<"all"|AgeBand>("all"),[kind,setKind]=useState<"all"|BlockKind>("all"),[query,setQuery]=useState("");
 const blocks=useMemo(()=>lessonTemplates.flatMap((lesson)=>lesson.blocks.map((block)=>({lesson,block}))).filter(({lesson,block})=>(age==="all"||lesson.ageBand===age)&&(kind==="all"||block.kind===kind)&&`${lesson.title} ${lesson.repertoire} ${block.title} ${block.objective}`.toLowerCase().includes(query.toLowerCase())),[age,kind,query]);
 return <div className={styles.page}><header><span>BIBLIOTECA</span><h1>Blocos para ensinar. Não um arcade separado da aula.</h1><p>Procure um bloco, veja o objetivo e use-o para substituir uma parte da sessão em segundos.</p></header><div className={styles.filters}><input value={query} onChange={(e:any)=>setQuery(e.target.value)} placeholder="Procurar por objetivo, música ou atividade…"/><select value={age} onChange={(e:any)=>setAge(e.target.value)}><option value="all">Todas as idades</option><option value="2-3">2–3</option><option value="4-5">4–5</option><option value="6-8">6–8</option></select></div><div className={styles.kinds}>{kinds.map((item)=><button key={item.id} data-active={kind===item.id} onClick={()=>setKind(item.id)}>{item.label}</button>)}</div><section className={styles.grid}>{blocks.slice(0,36).map(({lesson,block})=><article key={`${lesson.id}-${block.id}`}><div><span>{lesson.ageBand} · {block.minutes} min</span><em>{block.screenMode==="off"?"sem ecrã":block.screenMode==="minimal"?"ecrã mínimo":"visual"}</em></div><h2>{block.title}</h2><p>{block.objective}</p><small>Dentro de: <strong>{lesson.title}</strong> · {lesson.repertoire}</small></article>)}</section></div>;
}
