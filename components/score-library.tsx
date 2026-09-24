"use client";

import { useMemo, useState } from "react";
import { playPianoSemitone } from "@/lib/piano-sampler";
import { scoreCatalog, scoreNoteLabels, type ScoreNoteName } from "@/lib/score-catalog";
import styles from "./score-library.module.css";

const staffY: Record<ScoreNoteName, number> = {C4:112,D4:104,E4:96,F4:88,G4:80,A4:72,B4:64,C5:56};
const wait=(ms:number)=>new Promise((resolve)=>window.setTimeout(resolve,ms));

export function ScoreLibrary(){
  const [pieceId,setPieceId]=useState(scoreCatalog[0].id);
  const [step,setStep]=useState(0);
  const [message,setMessage]=useState("Começa quando quiseres. A partitura espera por ti.");
  const piece=scoreCatalog.find((item)=>item.id===pieceId) ?? scoreCatalog[0];
  const windowStart=Math.floor(step/8)*8;
  const visible=useMemo(()=>piece.notes.slice(windowStart,windowStart+8),[piece,windowStart]);
  const target=piece.notes[Math.min(step,piece.notes.length-1)];

  function choose(id:string){
    setPieceId(id);
    setStep(0);
    setMessage("Nova peça pronta. Ouve a primeira nota ou começa pelo teclado.");
  }

  async function hearTarget(){
    await playPianoSemitone(target.semitone,{duration:.8});
    setMessage("Agora encontra a mesma nota. Sem cronómetro.");
  }

  async function hearPhrase(){
    const phrase=piece.notes.slice(step,Math.min(piece.notes.length,step+4));
    for(const note of phrase){await playPianoSemitone(note.semitone,{duration:.5});await wait(note.beats===2?520:360)}
    setMessage("A frase fica à tua espera. Podes tentar nota por nota.");
  }

  async function press(name:ScoreNoteName){
    const note=piece.notes.find((item)=>item.name===name) ?? {name,semitone:0,beats:1 as const};
    await playPianoSemitone(note.semitone,{duration:.65});
    if(name===target.name){
      if(step>=piece.notes.length-1){
        setMessage("Chegaste ao fim da peça 🌱 Toca outra vez quando quiseres.");
      } else {
        setStep((value)=>value+1);
        setMessage("Boa escuta. A próxima nota já está destacada.");
      }
    } else setMessage("Ouve a nota destacada e experimenta outra vez.");
  }

  return <div className={styles.page}>
    <header><span>PARTITURAS INTERATIVAS</span><h1>Ver, ouvir e tocar — sem correr atrás do ecrã.</h1><p>As edições abaixo são próprias do Luwipi e usam melodias em domínio público. O modo de acompanhamento espera pela nota certa em vez de impor tempo.</p></header>

    <div className={styles.layout}>
      <aside className={styles.catalog}>{scoreCatalog.map((item)=><button key={item.id} data-active={item.id===piece.id} onClick={()=>choose(item.id)}><strong>{item.title}</strong><small>{item.level==="primeiros-passos"?"Primeiros passos":"Iniciante"}</small></button>)}</aside>

      <section className={styles.viewer}>
        <div className={styles.meta}><div><span>REPERTÓRIO</span><h2>{piece.title}</h2><p>{piece.source}</p></div><b>{step+1}/{piece.notes.length}</b></div>
        {piece.pedagogicalReference&&<div className={styles.reference}><strong>Referência pedagógica</strong><span>{piece.pedagogicalReference}</span></div>}

        <div className={styles.staff} aria-label={"Partitura de "+piece.title}>
          <svg viewBox="0 0 720 150" role="img">
            {[40,56,72,88,104].map((y)=><line key={y} x1="62" x2="690" y1={y} y2={y} className={styles.staffLine}/>)}
            <text x="14" y="101" className={styles.clef}>𝄞</text>
            {visible.map((note,index)=>{
              const absolute=windowStart+index;
              const x=112+index*72;
              const y=staffY[note.name];
              return <g key={absolute} className={styles.note} data-current={absolute===step||undefined} data-done={absolute<step||undefined}>
                {note.name==="C4"&&<line x1={x-18} x2={x+18} y1="112" y2="112" className={styles.ledger}/>}
                <ellipse cx={x} cy={y} rx="12" ry="8"/>
                <line x1={x+10} x2={x+10} y1={y} y2={y-42}/>
                <text x={x} y="137" textAnchor="middle">{scoreNoteLabels[note.name]}</text>
              </g>;
            })}
          </svg>
        </div>

        <div className={styles.message} role="status">{message}</div>
        <div className={styles.actions}><button onClick={()=>void hearTarget()}>▶ Ouvir nota</button><button onClick={()=>void hearPhrase()}>♫ Ouvir 4 notas</button><button onClick={()=>{setStep(0);setMessage("Voltámos ao início. Sem pressa.");}}>↺ Recomeçar</button></div>

        <div className={styles.keyboard}>{(["C4","D4","E4","F4","G4","A4","B4","C5"] as ScoreNoteName[]).map((name)=><button key={name} data-target={name===target.name||undefined} onClick={()=>void press(name)}><strong>{scoreNoteLabels[name]}</strong><small>{name}</small></button>)}</div>
        <p className={styles.note}>A nota diferente não fica vermelha e não tira pontos. O Luwipi apenas mantém a nota atual à espera.</p>
      </section>
    </div>
  </div>;
}
