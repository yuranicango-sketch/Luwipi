"use client";
import {useEffect,useMemo,useState} from "react";
import type {KidsSong} from "@/lib/music-types";
import styles from "./preschool-inline-song.module.css";

const freq:Record<string,number>={"Dó":261.63,"Ré":293.66,"Mi":329.63,"Fá":349.23,"Sol":392,"Lá":440,"Si":493.88};
function sound(note:string){
 const Ctx=window.AudioContext||((window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext);
 const ctx=new Ctx(),o=ctx.createOscillator(),g=ctx.createGain(); o.type="sine";o.frequency.value=freq[note]??330;
 g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.22,ctx.currentTime+.015);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.65);
 o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.7);o.onended=()=>ctx.close();
}
export function PreschoolInlineSong({song,lessonNumber}:{song:KidsSong;lessonNumber:number}){
 const phase=(lessonNumber-1)%8;
 const max=phase===0?Math.min(7,song.sequence.length):Math.min(song.sequence.length,phase<3?7+phase*3:phase<6?14+phase*3:song.sequence.length);
 const notes=useMemo(()=>song.sequence.slice(0,max),[song,max]);
 const[i,setI]=useState(0); const[pop,setPop]=useState(false);
 useEffect(()=>setI(0),[song.id,lessonNumber]);
 function hit(){const n=notes[i%notes.length];sound(n);setI(v=>(v+1)%notes.length);setPop(true);setTimeout(()=>setPop(false),180);}
 if(phase===0)return <div className={styles.wrap}>
   <div className={styles.kicker}>MÚSICA DO MÊS · PRIMEIRO ENCONTRO</div><h3>{song.title}</h3>
   <p>Cante com a criança. Cada toque no personagem toca a próxima nota. Hoje não mostramos o piano.</p>
   <button className={`${styles.hero} ${pop?styles.pop:""}`} onClick={hit} aria-label="Tocar próxima nota"><span>{song.emoji}</span><b>TOCA AQUI</b><small>{i===0?"Começar":`${i} de ${notes.length}`}</small></button>
   <div className={styles.dots}>{notes.map((_,x)=><i key={x} className={x<i?styles.done:""}/>)}</div>
 </div>;
 const white=["Dó","Ré","Mi","Fá","Sol","Lá","Si"];
 return <div className={styles.wrap}>
  <div className={styles.kicker}>MÚSICA DO MÊS · AULA {phase+1} DE 8</div><h3>{song.title}</h3>
  <p>Toque somente o trecho desta aula. A próxima tecla pisca; a criança também pode tocar livremente.</p>
  <div className={styles.scene}><button className={`${styles.miniHero} ${pop?styles.pop:""}`} onClick={hit}>{song.emoji}<small>próxima nota</small></button><div><b>{notes[i%notes.length]}</b><span>{i+1} / {notes.length}</span></div></div>
  <div className={styles.piano}>{white.map(n=><button key={n} onClick={()=>sound(n)} className={n===notes[i%notes.length]?styles.next:""}><span>{n}</span></button>)}</div>
  <div className={styles.controls}><button onClick={()=>setI(0)}>↺ RECOMEÇAR TRECHO</button><button onClick={hit}>▶ PRÓXIMA NOTA</button></div>
 </div>;
}
