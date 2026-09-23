"use client";

import { useEffect, useMemo, useState } from "react";
import { getGame } from "@/lib/games";
import { noteName, noteRate } from "@/lib/music-library";
import { playPercussionClick, playPianoRate } from "@/lib/piano-sampler";
import styles from "./lesson-mini-game.module.css";

export type LessonNoteEvent={id:number;pitch:string};

const targets:Record<string,string[]>={
 "caca-teclas":["Dó4","Mi4","Sol4","Dó5"],
 "caminho-cores":["Dó4","Mi4","Sol4","Mi4"],
 "ajude-cordeirinho":["Mi4","Ré4","Dó4","Ré4","Mi4"],
 "encontre-do":["Dó4","Dó5","Dó3"],
 "pauta-tecla":["Dó4","Mi4","Sol4","Fá4"],
 "ouca-encontre":["Sol4","Mi4","Dó4","Lá4"],
 "mestre-dedos":["Dó4","Ré4","Mi4","Fá4","Sol4"],
 "complete-melodia":["Dó4","Mi4","Sol4","Mi4","Dó4"],
};
function same(pitch:string,expected:string){return /[3-6]$/.test(expected)?pitch===expected:noteName(pitch)===noteName(expected)}

export function LessonMiniGame({gameId,noteEvent,onComplete,onExpectedChange,onMessage}:{gameId:string;noteEvent:LessonNoteEvent|null;onComplete:()=>void;onExpectedChange:(value:string|string[]|undefined)=>void;onMessage:(value:string)=>void}){
 const game=getGame(gameId);
 const[index,setIndex]=useState(0),[round,setRound]=useState(0),[taps,setTaps]=useState(0),[hits,setHits]=useState<string[]>([]),[measure,setMeasure]=useState<number[]>([]);
 const seq=targets[gameId]??[];
 const chord=useMemo(()=>["Dó4","Mi4","Sol4"],[]);
 const pianoGame=seq.length>0||gameId==="construa-acorde";
 const choice=["elefante-passarinho","leao-coelhinho","legato-staccato"].includes(gameId);
 const rhythm=["siga-tambor","eco-musical","trem-ritmo"].includes(gameId);
 const measureGame=gameId==="construa-compasso";
 const expected=seq[index];

 useEffect(()=>{if(gameId==="construa-acorde")onExpectedChange(chord.filter(item=>!hits.includes(item)));else if(pianoGame)onExpectedChange(expected);else onExpectedChange(undefined);return()=>onExpectedChange(undefined)},[gameId,pianoGame,expected,hits,chord,onExpectedChange]);
 useEffect(()=>{
   if(!noteEvent||!pianoGame)return;
   const pitch=noteEvent.pitch;
   if(gameId==="construa-acorde"){
     if(!chord.includes(pitch)){onMessage("Esse som ainda não faz parte do acorde.");return}
     if(hits.includes(pitch))return;
     const next=[...hits,pitch];setHits(next);onMessage(next.length===3?"Acorde completo.":"Boa. Continue a construir o acorde.");
     if(next.length===3)window.setTimeout(onComplete,250);
     return;
   }
   if(!expected)return;
   if(!same(pitch,expected)){onMessage(`Procure ${noteName(expected)} e tente outra vez.`);return}
   if(index+1>=seq.length){setIndex(v=>v+1);onMessage("Missão completa.");window.setTimeout(onComplete,220)}
   else{setIndex(v=>v+1);onMessage("Certo. Continue.")}
 },[noteEvent?.id]);

 if(!game)return <div className={styles.fallback}><strong>Missão musical</strong><button onClick={onComplete}>CONCLUIR</button></div>;

 async function playChoice(){
   const a=round%2===0;
   if(gameId==="leao-coelhinho")await playPianoRate(1,{gain:a?.82:.18,duration:.75});
   else if(gameId==="legato-staccato")await playPianoRate(1,{gain:.55,duration:a?1.1:.2});
   else await playPianoRate(a?.5:2,{gain:.52,duration:.75});
 }
 function choose(option:"a"|"b"){
   const correct=(round%2===0?"a":"b")===option;
   if(!correct){onMessage("Ouça outra vez antes de escolher.");return}
   if(round>=2){onMessage("Boa escuta. Missão completa.");onComplete()}else{setRound(v=>v+1);onMessage("Certo. Mais uma rodada.")}
 }
 async function tap(){
   await playPercussionClick({frequency:taps===0?175:135,gain:.2});const next=taps+1;
   if(next>=4){setTaps(0);if(round>=2){onMessage("Pulso completo.");onComplete()}else{setRound(v=>v+1);onMessage("Pulso firme. Mais uma volta.")}}
   else{setTaps(next);onMessage(`${next}/4 · mantenha a mesma distância entre as batidas.`)}
 }
 function addBeat(value:number){
   const next=[...measure,value],total=next.reduce((a,b)=>a+b,0);
   if(total>4){onMessage("Passou de quatro tempos. Retire uma figura.");return}
   setMeasure(next);
   if(total===4){if(round>=1){onMessage("Compasso completo.");window.setTimeout(onComplete,220)}else{setRound(v=>v+1);onMessage("Compasso completo. Construa outro.");window.setTimeout(()=>setMeasure([]),320)}}
 }

 if(pianoGame)return <section className={styles.pianoGame}>
   <header><small>JOGO DENTRO DA AULA</small><h2>{game.title}</h2><p>{game.goal}</p></header>
   {gameId==="ouca-encontre"&&expected&&<button className={styles.listen} onClick={()=>void playPianoRate(noteRate(expected),{gain:.55,duration:.72})}>OUVIR NOTA</button>}
   {gameId==="construa-acorde"?<div className={styles.chord}><strong>Dó maior</strong>{chord.map(item=><span key={item} data-on={hits.includes(item)}>{noteName(item)}</span>)}</div>:<div className={styles.route}><i style={{width:`${Math.min(100,index/Math.max(1,seq.length)*100)}%`}}/><div>{seq.map((item,i)=><span key={`${item}-${i}`} data-done={i<index} data-active={i===index}>{gameId==="pauta-tecla"?"NOTA":noteName(item)}</span>)}</div></div>}
   <b className={styles.counter}>{gameId==="construa-acorde"?`${hits.length}/3`:`${Math.min(index+1,seq.length)}/${seq.length}`}</b>
 </section>;

 if(choice)return <section className={styles.choice}><header><small>OUÇA · DECIDA</small><h2>{game.title}</h2></header><button className={styles.listen} onClick={()=>void playChoice()}>OUVIR DESAFIO</button><div>
   <button onClick={()=>choose("a")}><span>{gameId==="leao-coelhinho"?"FORTE":gameId==="legato-staccato"?"LEGATO":"GRAVE"}</span></button>
   <button onClick={()=>choose("b")}><span>{gameId==="leao-coelhinho"?"SUAVE":gameId==="legato-staccato"?"STACCATO":"AGUDO"}</span></button>
 </div><p>Rodada {round+1}/3</p></section>;

 if(rhythm)return <section className={styles.rhythm}><header><small>PULSO · MEMÓRIA</small><h2>{game.title}</h2></header><button onClick={()=>void tap()}><strong>TOCAR NO PULSO</strong><div>{[0,1,2,3].map(i=><i key={i} data-on={i<taps}/>)}</div></button><p>Rodada {round+1}/3</p></section>;

 if(measureGame)return <section className={styles.measure}><header><small>COMPASSO 4/4</small><h2>{game.title}</h2></header><div className={styles.measureBox}>{measure.map((value,i)=><span key={i}>{value===2?"𝅗𝅥":"♩"}</span>)}<b>{measure.reduce((a,b)=>a+b,0)}/4</b></div><div className={styles.actions}><button onClick={()=>addBeat(1)}>♩<small>1 tempo</small></button><button onClick={()=>addBeat(2)}>𝅗𝅥<small>2 tempos</small></button><button onClick={()=>setMeasure(v=>v.slice(0,-1))}>↶<small>retirar</small></button></div></section>;

 return <div className={styles.fallback}><small>MISSÃO CURTA</small><strong>{game.title}</strong><p>{game.goal}</p><button onClick={onComplete}>CONCLUÍMOS</button></div>;
}
