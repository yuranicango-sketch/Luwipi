"use client";
import { useMemo, useState } from "react";
import { repertoireScores } from "@/lib/repertoire-scores";
import { volumeOnePath } from "@/lib/volume-one-path";
import { methodVolumePaths } from "@/lib/method-volume-paths";
import { SheetMusicPlayer } from "@/components/sheet-music-player";
import styles from "./repertoire-catalog.module.css";

type VolumeNumber = 1 | 2 | 3 | 4 | 5;

export function RepertoireCatalog(){
 const [volume,setVolume]=useState<VolumeNumber>(1);
 const [selected,setSelected]=useState(repertoireScores[0].id);
 const score=repertoireScores.find((item)=>item.id===selected)??repertoireScores[0];

 const path=volume===1
   ? {title:"Fundação: mãos separadas, tonalização e canção conhecida",summary:"A base organiza mão direita, tonalização, mão esquerda, ouvido e repertório antes de aumentar a leitura.",stages:volumeOnePath}
   : methodVolumePaths.find((item)=>item.volume===volume)!;

 const visibleScores=useMemo(()=>repertoireScores.filter((item)=>(item.volumeReference??1)===volume),[volume]);
 const studies=visibleScores.filter((item)=>item.kind==="study");
 const repertoire=visibleScores.filter((item)=>item.kind==="repertoire");

 function chooseVolume(next:VolumeNumber){
   setVolume(next);
   const nextPath=next===1?volumeOnePath:methodVolumePaths.find((item)=>item.volume===next)?.stages??[];
   const firstScore=nextPath.flatMap((stage)=>stage.scoreIds).map((id)=>repertoireScores.find((item)=>item.id===id)).find(Boolean);
   const fallback=repertoireScores.find((item)=>(item.volumeReference??1)===next);
   if(firstScore)setSelected(firstScore.id);
   else if(fallback)setSelected(fallback.id);
 }

 return <div className={styles.page}>
   <header><span>REPERTÓRIO + PARTITURA</span><h1>Dos primeiros sons ao repertório de concerto.</h1><p>Os cinco volumes agora funcionam como uma referência de progressão: o Luwipi preserva a lógica pedagógica e cria os seus próprios estudos, partituras e exercícios interativos.</p></header>

   <div className={styles.volumeTabs}>{([1,2,3,4,5] as VolumeNumber[]).map((item)=><button key={item} data-active={volume===item} onClick={()=>chooseVolume(item)}>Vol. {item}</button>)}</div>

   <section className={styles.path}>
     <div className={styles.pathHead}><div><span>PERCURSO DE TREINO · REFERÊNCIA VOLUME {volume}</span><strong>{path.title}</strong></div><p>{path.summary}</p></div>
     <div className={styles.pathGrid}>{path.stages.map((stage)=><article key={stage.id}><b>{stage.order}</b><div><strong>{stage.title}</strong><small>{stage.subtitle}</small><p>{stage.goal}</p>
       {"repertoireReferences" in stage && stage.repertoireReferences.length>0&&<div className={styles.references}><span>Referências do livro:</span><small>{stage.repertoireReferences.join(" · ")}</small></div>}
       <div className={styles.scoreLinks}>{stage.scoreIds.map((id)=>{const item=repertoireScores.find((candidate)=>candidate.id===id);return item?<button key={id} data-active={selected===id} onClick={()=>setSelected(id)}>{item.kind==="study"?"Estudo":"Peça"} · {item.title}</button>:null})}</div>
     </div></article>)}</div>
   </section>

   <div className={styles.layout}><aside>
     <span className={styles.groupLabel}>ESTUDOS Luwipi · VOL. {volume}</span>
     {studies.length?studies.map((item)=><button key={item.id} data-active={item.id===selected} onClick={()=>setSelected(item.id)}><span>{item.hand==="both"?"DUAS MÃOS":item.hand==="left"?"MÃO ESQUERDA":"MÃO DIREITA"}</span><strong>{item.title}</strong><small>{item.subtitle}</small></button>):<p className={styles.empty}>Este volume usa os estudos ligados diretamente às etapas acima.</p>}
     {repertoire.length>0&&<><span className={styles.groupLabel}>REPERTÓRIO DIGITAL</span>{repertoire.map((item)=><button key={item.id} data-active={item.id===selected} onClick={()=>setSelected(item.id)}><span>{item.level}</span><strong>{item.title}</strong><small>{item.methodReferences[0]}</small></button>)}</>}
   </aside><SheetMusicPlayer score={score}/></div>

   <section className={styles.notice}><strong>O que vem dos PDFs — e o que é Luwipi</strong><p>Dos PDFs vêm a ordem pedagógica, os tipos de desafio e as obras usadas como referência de nível. As páginas, dedilhações editoriais e arranjos não são copiados. Os estudos digitais incorporados são originais do Luwipi; obras de domínio público só entram com uma edição própria.</p></section>
 </div>;
}
