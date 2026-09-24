"use client";
import { useMemo, useState } from "react";
import { repertoireScores } from "@/lib/repertoire-scores";
import { volumeOnePath } from "@/lib/volume-one-path";
import { SheetMusicPlayer } from "@/components/sheet-music-player";
import styles from "./repertoire-catalog.module.css";

export function RepertoireCatalog(){
 const [selected,setSelected]=useState(repertoireScores[0].id);
 const score=repertoireScores.find((item)=>item.id===selected)??repertoireScores[0];
 const studies=useMemo(()=>repertoireScores.filter((item)=>item.kind==="study"),[]);
 const repertoire=useMemo(()=>repertoireScores.filter((item)=>item.kind==="repertoire"),[]);

 return <div className={styles.page}>
   <header><span>REPERTÓRIO + PARTITURA</span><h1>Do exercício preparatório à música inteira.</h1><p>O percurso técnico segue a lógica observada no Volume 1: mãos separadas, tonalização, canção conhecida e só depois leitura/repertório mais contínuo.</p></header>

   <section className={styles.path}>
     <div className={styles.pathHead}><span>PERCURSO INICIAL · REFERÊNCIA PEDAGÓGICA VOLUME 1</span><p>Estrutura inspirada no método; exercícios e arranjos abaixo são próprios do Luwipi.</p></div>
     <div className={styles.pathGrid}>{volumeOnePath.map((stage)=><article key={stage.id}><b>{stage.order}</b><div><strong>{stage.title}</strong><small>{stage.subtitle}</small><p>{stage.goal}</p><div>{stage.scoreIds.map((id)=>{const item=repertoireScores.find((candidate)=>candidate.id===id);return item?<button key={id} data-active={selected===id} onClick={()=>setSelected(id)}>{item.kind==="study"?"Estudo":"Peça"} · {item.title}</button>:null})}</div></div></article>)}</div>
   </section>

   <div className={styles.layout}><aside>
     <span className={styles.groupLabel}>ESTUDOS PREPARATÓRIOS</span>
     {studies.map((item)=><button key={item.id} data-active={item.id===selected} onClick={()=>setSelected(item.id)}><span>{item.hand==="left"?"MÃO ESQUERDA":"MÃO DIREITA"}</span><strong>{item.title}</strong><small>{item.subtitle}</small></button>)}
     <span className={styles.groupLabel}>REPERTÓRIO</span>
     {repertoire.map((item)=><button key={item.id} data-active={item.id===selected} onClick={()=>setSelected(item.id)}><span>{item.level}</span><strong>{item.title}</strong><small>{item.methodReferences[0]}</small></button>)}
   </aside><SheetMusicPlayer score={score}/></div>

   <section className={styles.notice}><strong>Sobre o material Suzuki enviado</strong><p>O Luwipi usa os livros como referência de sequência pedagógica, organização e nível de exigência. Não copia páginas, dedilhações, gravações ou arranjos da edição. Quando a obra é de domínio público, o Luwipi cria a sua própria partitura e dedilhação pedagógica.</p></section>
 </div>;
}
