"use client";
import { useMemo, useRef, useState } from "react";
import { playPianoSemitone } from "@/lib/piano-sampler";
import type { RepertoireScore, ScoreNote } from "@/lib/repertoire-scores";
import styles from "./sheet-music-player.module.css";

const rightKeyboard=[
  {name:"Dó",midi:60,shape:"●"},{name:"Ré",midi:62,shape:"▲"},{name:"Mi",midi:64,shape:"■"},{name:"Fá",midi:65,shape:"◆"},
  {name:"Sol",midi:67,shape:"★"},{name:"Lá",midi:69,shape:"⬟"},{name:"Si",midi:71,shape:"♥"},{name:"Dó",midi:72,shape:"●"},
];
const leftKeyboard=[
  {name:"Dó",midi:48,shape:"●"},{name:"Ré",midi:50,shape:"▲"},{name:"Mi",midi:52,shape:"■"},{name:"Fá",midi:53,shape:"◆"},
  {name:"Sol",midi:55,shape:"★"},{name:"Lá",midi:57,shape:"⬟"},{name:"Si",midi:59,shape:"♥"},{name:"Dó",midi:60,shape:"●"},
];

function phraseBounds(notes: ScoreNote[], active: number) {
  let start = 0;
  for (let i = active - 1; i >= 0; i -= 1) {
    if (notes[i].phraseEnd) { start = i + 1; break; }
  }
  let end = notes.length - 1;
  for (let i = active; i < notes.length; i += 1) {
    if (notes[i].phraseEnd) { end = i; break; }
  }
  return { start, end };
}

export function SheetMusicPlayer({score,compact=false}:{score:RepertoireScore;compact?:boolean}){
 const [active,setActive]=useState(0),[practice,setPractice]=useState(false),[playing,setPlaying]=useState(false),[message,setMessage]=useState("Ouve primeiro ou pratica nota por nota.");
 const run=useRef(0);
 const width=Math.max(760,score.notes.length*52+120);
 const xFor=(index:number)=>105+index*52;
 const yFor=(step:number)=>140-step*10;
 const keyboard=score.hand==="left"?leftKeyboard:rightKeyboard;
 const handLabel=score.hand==="left"?"Mão esquerda":score.hand==="right"?"Mão direita":"Qualquer mão";
 const clef=score.clef==="bass"?"𝄢":"𝄞";
 const bounds=useMemo(()=>phraseBounds(score.notes,active),[score.notes,active]);

 async function playRange(start:number,end:number,label:string){
   const id=++run.current;setPlaying(true);setPractice(false);setMessage(label);
   for(let i=start;i<=end;i+=1){
     if(id!==run.current)break;
     setActive(i);
     const note=score.notes[i];
     await playPianoSemitone(note.midi-60,{duration:note.beats===2?1.05:.68});
     await new Promise((resolve)=>setTimeout(resolve,note.beats===2?720:470));
   }
   if(id===run.current){setPlaying(false);setActive(start);setMessage("Agora podes praticar no teu tempo.")}
 }

 function beginPractice(){run.current+=1;setPlaying(false);setPractice(true);setActive(0);setMessage("A primeira nota está à espera. Sem cronómetro.")}
 async function press(midi:number){
   await playPianoSemitone(midi-60,{duration:.58});
   if(!practice)return;
   const target=score.notes[active];
   if(midi!==target.midi){setMessage("Experimenta outra vez. A nota continua à espera.");return}
   if(active===score.notes.length-1){setMessage("Chegaste ao fim 🌱");setPractice(false);return}
   setActive((value)=>value+1);setMessage(target.phraseEnd?"Frase fechada. A próxima começa quando quiseres.":"Boa. A próxima nota espera por ti.");
 }

 return <section className={styles.player + (compact ? " " + styles.compact : "")}>
   <div className={styles.head}><div><span>PARTITURA GUIADA · {handLabel.toUpperCase()}</span><strong>{score.title}</strong><small>{score.subtitle}</small></div><div><button disabled={playing} onClick={()=>void playRange(0,score.notes.length-1,"A tocar a peça…")}>▶ Ouvir</button><button disabled={playing} onClick={()=>void playRange(bounds.start,bounds.end,"A tocar esta frase…")}>♫ Frase</button><button data-active={practice} onClick={beginPractice}>◎ Praticar</button></div></div>
   <div className={styles.scoreScroll}><svg viewBox={"0 0 " + width + " 230"} style={{width}} role="img" aria-label={"Partitura pedagógica de " + score.title}>
     <text x="20" y="132" className={styles.clef}>{clef}</text>
     {[60,80,100,120,140].map((y)=><line key={y} x1="78" x2={width-24} y1={y} y2={y} className={styles.staffLine}/>)}
     {score.notes.map((note,index)=>{const x=xFor(index),y=yFor(note.staffStep),current=index===active;return <g key={index} data-current={current||undefined}>
       {note.measureStart&&index>0&&<line x1={x-26} x2={x-26} y1="58" y2="142" className={styles.barLine}/>}
       {note.staffStep<=-2&&<line x1={x-17} x2={x+17} y1={160} y2={160} className={styles.ledger}/>}
       {note.finger&&<text x={x} y={Math.max(42,y-50)} textAnchor="middle" className={current?styles.activeFinger:styles.finger}>{note.finger}</text>}
       <ellipse cx={x} cy={y} rx="11" ry="7.5" className={current?styles.activeNote:styles.note}/>
       <line x1={x+9} x2={x+9} y1={y} y2={y-39} className={current?styles.activeStem:styles.stem}/>
       {note.beats===2&&<circle cx={x} cy={y} r="3.6" className={styles.hollow}/>}
       <text x={x} y="194" textAnchor="middle" className={current?styles.activeLabel:styles.label}>{note.name}</text>
       {note.phraseEnd&&<line x1={x+24} x2={x+24} y1="48" y2="169" className={styles.phraseMark}/>}
     </g>})}
     <line x1={xFor(active)-22} x2={xFor(active)-22} y1="44" y2="169" className={styles.cursor}/>
     <text x="82" y="218" className={styles.legend}>{score.clef==="bass"?"Clave de fá":"Clave de sol"} · números = dedilhação sugerida pelo Luwipi</text>
   </svg></div>
   <p className={styles.message} role="status">{message}</p>
   {practice&&<div className={styles.keyboard}>{keyboard.map((key)=><button key={key.name+"-"+key.midi} onClick={()=>void press(key.midi)}><b>{key.name}</b><small>{key.shape}</small></button>)}</div>}
   {!compact&&<div className={styles.meta}><span>{score.level}</span><span>{score.kind==="study"?"Estudo preparatório":"Repertório"}</span><span>{handLabel}</span><p>{score.source}</p>{score.methodReferences.map((reference)=><small key={reference}>{reference}</small>)}</div>}
 </section>;
}
