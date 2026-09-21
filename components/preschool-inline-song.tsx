"use client";
import {useEffect,useMemo,useState} from "react";
import type {KidsSong} from "@/lib/music-types";
import styles from "./preschool-inline-song.module.css";
import {playPianoRate,preloadPianoSamples} from "@/lib/piano-sampler";
import {LuwipiPiano,type LuwipiPianoKey} from "@/components/luwipi-piano";

const semitones:Record<string,number>={"Dó":0,"Dó♯":1,"Ré":2,"Ré♯":3,"Mi":4,"Fá":5,"Fá♯":6,"Sol":7,"Sol♯":8,"Lá":9,"Lá♯":10,"Si":11};
function sound(note:string){void playPianoRate(Math.pow(2,(semitones[note]??0)/12));}
export function PreschoolInlineSong({song,lessonNumber}:{song:KidsSong;lessonNumber:number}){
 const phase=(lessonNumber-1)%8;
 const sequence=song.sequence??song.sections?.flatMap(section=>section.notes)??[];
 const max=phase===0?Math.min(7,sequence.length):Math.min(sequence.length,phase<3?7+phase*3:phase<6?14+phase*3:sequence.length);
 const notes=useMemo(()=>sequence.slice(0,max),[sequence,max]);
 const[i,setI]=useState(0); const[pop,setPop]=useState(false);
 useEffect(()=>setI(0),[song.id,lessonNumber]);
 useEffect(()=>{void preloadPianoSamples();},[]);
 function advance(){setI(v=>(v+1)%notes.length);}
 function hit(){if(!notes.length)return;const n=notes[i%notes.length];sound(n);advance();setPop(true);setTimeout(()=>setPop(false),180);}
 function playKey(key:LuwipiPianoKey){if(notes.length&&key.note===notes[i%notes.length])advance();}
 if(phase===0)return <div className={styles.wrap}>
   <div className={styles.kicker}>MÚSICA DO MÊS · PRIMEIRO ENCONTRO</div><h3>{song.title}</h3>
   <p>Cante com a criança. Cada toque no personagem toca a próxima nota. Hoje não mostramos o piano.</p>
   <button className={`${styles.hero} ${pop?styles.pop:""}`} onClick={hit} aria-label="Tocar próxima nota"><span>{song.emoji}</span><b>TOCA AQUI</b><small>{i===0?"Começar":`${i} de ${notes.length}`}</small></button>
   <div className={styles.dots}>{notes.map((_,x)=><i key={x} className={x<i?styles.done:""}/>)}</div>
 </div>;
 return <div className={styles.wrap}>
  <div className={styles.kicker}>MÚSICA DO MÊS · AULA {phase+1} DE 8</div><h3>{song.title}</h3>
  <p>Toque somente o trecho desta aula. A próxima tecla pisca; a criança também pode tocar livremente.</p>
  <div className={styles.scene}><button className={`${styles.miniHero} ${pop?styles.pop:""}`} onClick={hit}>{song.emoji}<small>próxima nota</small></button><div><b>{notes[i%notes.length]}</b><span>{i+1} / {notes.length}</span></div></div>
  <LuwipiPiano compact expected={notes[i%notes.length]} onPress={playKey}/>
  <div className={styles.controls}><button onClick={()=>setI(0)}>↺ RECOMEÇAR TRECHO</button></div>
 </div>;
}
