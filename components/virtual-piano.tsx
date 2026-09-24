"use client";

import { useMemo, useState } from "react";
import type { AgeBand } from "@/lib/suzuki-lessons";
import { playPianoSemitone } from "@/lib/piano-sampler";
import styles from "./virtual-piano.module.css";

type NoteName = "C4"|"D4"|"E4"|"F4"|"G4"|"A4"|"B4"|"C5";
const notes: {name:NoteName;label:string;semitone:number;shape:string}[] = [
  {name:"C4",label:"Dó",semitone:0,shape:"●"},{name:"D4",label:"Ré",semitone:2,shape:"▲"},{name:"E4",label:"Mi",semitone:4,shape:"■"},{name:"F4",label:"Fá",semitone:5,shape:"◆"},
  {name:"G4",label:"Sol",semitone:7,shape:"★"},{name:"A4",label:"Lá",semitone:9,shape:"⬟"},{name:"B4",label:"Si",semitone:11,shape:"♥"},{name:"C5",label:"Dó",semitone:12,shape:"●"},
];
const patterns: Record<AgeBand, NoteName[][]> = {
  "2-3": [["C4","D4"],["D4","E4"],["C4","C4","D4"]],
  "4-5": [["C4","D4","E4"],["E4","D4","C4"],["C4","E4","D4"]],
  "6-8": [["C4","D4","E4","F4"],["G4","E4","F4","D4"],["C4","E4","G4","E4"]],
};

const staffY: Record<NoteName, number> = {C4:105,D4:97.5,E4:90,F4:82.5,G4:75,A4:67.5,B4:60,C5:52.5};

function SimpleStaff({pattern,step,completed}:{pattern:NoteName[];step:number;completed:boolean}){
  return <div className={styles.staffWrap} aria-label="Pauta simples do padrão atual">
    <svg viewBox="0 0 560 125" role="img" aria-label="Pauta em clave de sol com as notas do padrão">
      {[30,45,60,75,90].map((y)=><line key={y} x1="58" x2="540" y1={y} y2={y} className={styles.staffLine}/>)}
      <text x="12" y="86" className={styles.clef}>𝄞</text>
      {pattern.map((name,index)=>{
        const x=110+index*95;
        const y=staffY[name];
        const current=index===step&&!completed;
        const done=index<step||completed;
        return <g key={name+"-staff-"+index} data-current={current||undefined} data-done={done||undefined} className={styles.staffNote}>
          {name==="C4"&&<line x1={x-19} x2={x+19} y1="105" y2="105" className={styles.ledger}/>}
          <ellipse cx={x} cy={y} rx="13" ry="9"/>
          <line x1={x+11} x2={x+11} y1={y} y2={y-46}/>
          <text x={x} y="121" textAnchor="middle">{notes.find((note)=>note.name===name)?.label}</text>
        </g>;
      })}
    </svg>
    <span>Ouve → encontra → vê na pauta</span>
  </div>;
}

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
    <div className={styles.path}>{pattern.map((name,i)=>{const note=notes.find((item)=>item.name===name)!;return <span key={`${name}-${i}`} data-done={i<step||completed} data-current={i===step&&!completed}>{silent&&i===step&&!completed?note.shape:ageBand==="2-3"?note.shape:ageBand==="4-5"?`${note.shape} ${note.label}`:note.label}</span>})}</div>
    {ageBand==="6-8"&&<SimpleStaff pattern={pattern} step={step} completed={completed}/>}
    <div className={styles.keyboard}>{visible.map((note)=><button key={note.name} aria-label={`Tocar ${note.label}`} onClick={()=>void press(note)}><b>{ageBand==="2-3"?note.shape:note.label}</b>{ageBand==="6-8"&&<small>{note.name}</small>}</button>)}</div>
    <p className={styles.help}>{silent?"Nenhum som é necessário. Forma, posição e toque substituem o feedback auditivo.":"Uma tecla diferente não gera vermelho, ❌ nem pontuação. O sistema apenas continua à espera do alvo."}</p>
    {completed&&<button className={styles.nextPattern} onClick={nextPattern}>Outro caminho →</button>}
  </section>
}
