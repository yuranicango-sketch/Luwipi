"use client";
import { useRef, useState } from "react";
import { playPianoSemitone } from "@/lib/piano-sampler";
import type { RepertoireScore } from "@/lib/repertoire-scores";
import styles from "./sheet-music-player.module.css";

const keyboard=[{name:"Dó",midi:60},{name:"Ré",midi:62},{name:"Mi",midi:64},{name:"Fá",midi:65},{name:"Sol",midi:67},{name:"Lá",midi:69},{name:"Si",midi:71},{name:"Dó",midi:72}];

export function SheetMusicPlayer({score,compact=false}:{score:RepertoireScore;compact?:boolean}){
 const [active,setActive]=useState(0),[practice,setPractice]=useState(false),[playing,setPlaying]=useState(false),[message,setMessage]=useState("Ouve primeiro ou pratica nota por nota.");
 const run=useRef(0);
 const width=Math.max(720,score.notes.length*48+110);
 const xFor=(index:number)=>100+index*48;
 const yFor=(step:number)=>140-step*10;

 async function listen(){
   const id=++run.current;setPlaying(true);setPractice(false);setMessage("A tocar a melodia…");
   for(let i=0;i<score.notes.length;i+=1){
     if(id!==run.current)break;
     setActive(i);
     const note=score.notes[i];
     await playPianoSemitone(note.midi-60,{duration:note.beats===2?1.05:.68});
     await new Promise((resolve)=>setTimeout(resolve,note.beats===2?720:470));
   }
   if(id===run.current){setPlaying(false);setActive(0);setMessage("Agora podes praticar no teu tempo.")}
 }
 function beginPractice(){run.current+=1;setPlaying(false);setPractice(true);setActive(0);setMessage("A primeira nota está à espera. Sem cronómetro.")}
 async function press(midi:number){
   await playPianoSemitone(midi-60,{duration:.58});
   if(!practice)return;
   const target=score.notes[active];
   if(midi!==target.midi){setMessage("Experimenta outra vez. A nota continua à espera.");return}
   if(active===score.notes.length-1){setMessage("Chegaste ao fim da frase 🌱");setPractice(false);return}
   setActive((value)=>value+1);setMessage("Boa. A próxima nota espera por ti.");
 }

 return <section className={`${styles.player} ${compact?styles.compact:""}`}>
   <div className={styles.head}><div><span>PARTITURA GUIADA</span><strong>{score.title}</strong><small>{score.subtitle}</small></div><div><button disabled={playing} onClick={()=>void listen()}>▶ Ouvir</button><button data-active={practice} onClick={beginPractice}>◎ Praticar</button></div></div>
   <div className={styles.scoreScroll}><svg viewBox={`0 0 ${width} 210`} style={{width}} role="img" aria-label={`Partitura simplificada de ${score.title}`}>
     <text x="24" y="128" className={styles.clef}>𝄞</text>
     {[60,80,100,120,140].map((y)=><line key={y} x1="76" x2={width-24} y1={y} y2={y} className={styles.staffLine}/>)}
     {score.notes.map((note,index)=>{const x=xFor(index),y=yFor(note.staffStep),current=index===active;return <g key={index} data-current={current||undefined}>
       {note.staffStep<=-2&&<line x1={x-17} x2={x+17} y1={160} y2={160} className={styles.ledger}/>}
       <ellipse cx={x} cy={y} rx="11" ry="7.5" className={current?styles.activeNote:styles.note}/>
       <line x1={x+9} x2={x+9} y1={y} y2={y-39} className={current?styles.activeStem:styles.stem}/>
       {note.beats===2&&<circle cx={x} cy={y} r="3.6" className={styles.hollow}/>}
       <text x={x} y="190" textAnchor="middle" className={current?styles.activeLabel:styles.label}>{note.name}</text>
     </g>})}
     <line x1={xFor(active)-22} x2={xFor(active)-22} y1="44" y2="169" className={styles.cursor}/>
   </svg></div>
   <p className={styles.message} role="status">{message}</p>
   {practice&&<div className={styles.keyboard}>{keyboard.map((key,index)=><button key={`${key.name}-${index}`} onClick={()=>void press(key.midi)}><b>{key.name}</b><small>{["●","▲","■","◆","★","⬟","♥","●"][index]}</small></button>)}</div>}
   {!compact&&<div className={styles.meta}><span>{score.level}</span><p>{score.source}</p>{score.methodReferences.map((reference)=><small key={reference}>{reference}</small>)}</div>}
 </section>;
}
