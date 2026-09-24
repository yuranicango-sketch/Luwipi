"use client";
import { useState } from "react";
import { repertoireScores } from "@/lib/repertoire-scores";
import { SheetMusicPlayer } from "@/components/sheet-music-player";
import styles from "./repertoire-catalog.module.css";

export function RepertoireCatalog(){
 const [selected,setSelected]=useState(repertoireScores[0].id);
 const score=repertoireScores.find((item)=>item.id===selected)??repertoireScores[0];
 return <div className={styles.page}><header><span>REPERTÓRIO + PARTITURA</span><h1>Música de verdade, não apenas uma atividade.</h1><p>Partituras interativas próprias para repertório de domínio público. Ouça, pratique em Wait Mode e use a pauta durante a aula.</p></header><div className={styles.layout}><aside>{repertoireScores.map((item)=><button key={item.id} data-active={item.id===selected} onClick={()=>setSelected(item.id)}><span>{item.level}</span><strong>{item.title}</strong><small>{item.methodReferences[0]}</small></button>)}</aside><SheetMusicPlayer score={score}/></div><section className={styles.notice}><strong>Sobre métodos publicados</strong><p>O Luwipi pode guardar “Suzuki Piano School Vol. 1”, Alfred ou outro método como referência do professor. Não copia páginas, dedilhações, gravações ou arranjos protegidos desses livros. As partituras incorporadas aqui são arranjos próprios de repertório legalmente utilizável.</p></section></div>;
}
