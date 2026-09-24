"use client";

import { useMemo, useState } from "react";
import type { AgeBand } from "@/lib/suzuki-lessons";
import { playPianoSemitone } from "@/lib/piano-sampler";
import styles from "./virtual-piano.module.css";

type NoteName = "C4"|"D4"|"E4"|"F4"|"G4"|"A4"|"B4"|"C5";
const notes: {name:NoteName;label:string;semitone:number;shape:string;staffStep:number}[] = [
  {name:"C4",label:"Dó",semitone:0,shape:"●",staffStep:-2},{name:"D4",label:"Ré",semitone:2,shape:"▲",staffStep:-1},{name:"E4",label:"Mi",semitone:4,shape:"■",staffStep:0},{name:"F4",label:"Fá",semitone:5,shape:"◆",staffStep:1},
  {name:"G4",label:"Sol",semitone:7,shape:"★",staffStep:2},{name:"A4",label:"Lá",semitone:9,shape:"⬟",staffStep:3},{name:"B4",label:"Si",semitone:11,shape:"♥",staffStep:4},{name:"C5",label:"Dó",semitone:12,shape:"●",staffStep:5},
];
const patterns: Record<AgeBand, NoteName[][]> = {
  "2-3": [["C4","D4"],["D4","E4"],["C4","C4","D4"]],
  "4-5": [["C4","D4","E4"],["E4","D4","C4"],["C4","E4","D4"]],
  "6-8": [["C4","D4","E4","F4"],["G4","E4","F4","D4"],["C4","E4","G4","E4"]],
};

export function VirtualPiano({ageBand,reducedStimulus=false,silent=false}:{ageBand:AgeBand;reducedStimulus?:boolean;silent?:boolean}){
  const [patternIndex,setPatternIndex]=useState(0),[step,setStep]=useState(0),[message,setMessage]=useState(silent?"Segue a forma. Um toque de cada vez.":"Ouve primeiro. Depois encontra a nota."),[completed,setCompleted]=useState(false);
  const pattern=patterns[ageBand][patternIndex%patterns[ageBand].length];
  const target=pattern[step] ?? pattern[0];
  const visible=useMemo(()=>ageBand==="2-3"?notes.slice(0,3):ageBand==="4-5"?notes.slice(0,5):notes,[ageBand]);

  async function hearTarget(){if(silent){setMessage("Olha para a forma atual e encontra a tecla correspondente.");return;}const n=notes.find((item)=>item.name===target);if(n){await playPianoSemitone(n.semitone);setMessage("Agora encontra esse som. Sem pressa.")}}
  async function press(note:typeof notes[number]){
    if(!silent)await playPianoSemitone(note.semitone); else if("vibrate" in navigator) navigator.vibrate?.(18);
    if(note.name===target){
      if(step>=pattern.length-1){setCompleted(true);setMessage("Chegaste ao fim 🌱")}
      else{setStep((s)=>s+1);setMessage(silent?"O caminho espera. Segue a próxima forma quando quiseres.":"O caminho espera. Ouve a próxima quando quiseres.")}
    } else setMessage(silent?"Experimenta outra vez. A forma continua à espera.":"Ouve outra vez 👂 e experimenta de novo.");
  }
  function nextPattern(){setPatternIndex((i)=>i+1);setStep(0);setCompleted(false);setMessage("Novo caminho. Ouve primeiro.")}

  return <section className={`${styles.wrap} ${reducedStimulus?styles.reduced:""}`} aria-label="Piano virtual com Wait Mode">
    <div className={styles.head}><div><span>{silent?"MODO SILENCIOSO":"WAIT MODE"}</span><strong>{silent?"Sem áudio. Forma + toque + vibração opcional.":"Sem cronómetro. A música espera pela criança."}</strong></div><button onClick={()=>void hearTarget()}>{silent?"◎ Ver pista":"▶ Ouvir alvo"}</button></div>
    <div className={styles.message}>{message}</div>
    {ageBand==="6-8"&&<div className={styles.staffPreview}><svg viewBox="0 0 460 145" role="img" aria-label="Pauta simples do padrão atual">{[40,58,76,94,112].map((y)=><line key={y} x1="48" x2="440" y1={y} y2={y}/>)}<text x="5" y="101">𝄞</text>{pattern.map((name,i)=>{const note=notes.find((item)=>item.name===name)!;const x=90+i*78,y=112-note.staffStep*9;return <g key={`${name}-staff-${i}`} data-current={i===step&&!completed||undefined}>{note.staffStep<=-2&&<line x1={x-14} x2={x+14} y1="130" y2="130"/>}<ellipse cx={x} cy={y} rx="10" ry="7"/><line x1={x+8} x2={x+8} y1={y} y2={y-34}/></g>})}</svg><small>Som → nome → pauta</small></div>}
    <div className={styles.path}>{pattern.map((name,i)=>{const note=notes.find((item)=>item.name===name)!;return <span key={`${name}-${i}`} data-done={i<step||completed} data-current={i===step&&!completed}>{silent&&i===step&&!completed?note.shape:ageBand==="2-3"?note.shape:ageBand==="4-5"?`${note.shape} ${note.label}`:note.label}</span>})}</div>
    <div className={styles.keyboard}>{visible.map((note)=><button key={note.name} aria-label={`Tocar ${note.label}`} onClick={()=>void press(note)}><b>{ageBand==="2-3"?note.shape:note.label}</b>{ageBand==="6-8"&&<small>{note.name}</small>}</button>)}</div>
    <p className={styles.help}>{silent?"Nenhum som é necessário. Forma, posição e toque substituem o feedback auditivo.":"Uma tecla diferente não gera vermelho, ❌ nem pontuação. O sistema apenas continua à espera do alvo."}</p>
    {completed&&<button className={styles.nextPattern} onClick={nextPattern}>Outro caminho →</button>}
  </section>
}
