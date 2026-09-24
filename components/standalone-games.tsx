"use client";
import { useMemo, useState } from "react";
import { playPianoSemitone } from "@/lib/piano-sampler";
import styles from "./standalone-games.module.css";

type GameId="direction"|"location"|"echo";
const games:{id:GameId;title:string;description:string}[]=[
 {id:"direction",title:"Sobe ou desce?",description:"Ouça dois sons e mostre a direção."},
 {id:"location",title:"Onde está o som?",description:"Grave ou agudo, sem olhar para o teclado."},
 {id:"echo",title:"Eco de 3 sons",description:"Ouça um caminho curto e reproduza-o."},
];

const sequences=[[0,2,4],[4,2,0],[0,4,2],[2,4,0]];

export function StandaloneGames(){
 const [game,setGame]=useState<GameId>("direction");
 const [round,setRound]=useState(0);
 const [message,setMessage]=useState("Toca em Ouvir quando estiverem prontos.");
 const [echoStep,setEchoStep]=useState(0);
 const seq=sequences[round%sequences.length];
 const pair=useMemo(()=>round%2===0?[0,7]:[7,2],[round]);

 async function playNotes(notes:number[]){
   for(const semitone of notes){await playPianoSemitone(semitone,{duration:.65});await new Promise((resolve)=>setTimeout(resolve,520))}
 }
 async function listen(){
   setMessage("Escuta primeiro 👂");
   if(game==="direction") await playNotes(pair);
   else if(game==="location") await playNotes([round%2===0?-12:12]);
   else await playNotes(seq);
   setMessage(game==="echo"?"Agora encontra o caminho.":"Agora responde.");
 }
 function next(){setRound((value)=>value+1);setEchoStep(0);setMessage("Outra vez, sem pressa.")}
 function chooseDirection(choice:"up"|"down"){
   const correct=(pair[1]>pair[0]?"up":"down")===choice;
   if(correct){setMessage("É isso 🌱");setTimeout(next,450)} else setMessage("Ouve outra vez e experimenta de novo.");
 }
 function chooseLocation(choice:"low"|"high"){
   const correct=(round%2===0?"low":"high")===choice;
   if(correct){setMessage("Encontraste 🌱");setTimeout(next,450)} else setMessage("Experimenta outra vez. O som continua à espera.");
 }
 async function echo(note:number){
   await playPianoSemitone(note,{duration:.55});
   if(note===seq[echoStep]){
     if(echoStep===seq.length-1){setMessage("O eco ficou completo 🌱");setTimeout(next,550)}
     else {setEchoStep((value)=>value+1);setMessage("Continua…")}
   } else setMessage("Experimenta outra vez a partir deste som.");
 }

 return <div className={styles.page}><header><span>ATIVIDADES SOLTAS</span><h1>Três jogos curtos. Sem pontos, sem streaks.</h1><p>Use quando quiser trabalhar uma competência isolada fora de uma aula pronta.</p></header><div className={styles.tabs}>{games.map((item)=><button key={item.id} data-active={game===item.id} onClick={()=>{setGame(item.id);setEchoStep(0);setMessage("Toca em Ouvir quando estiverem prontos.")}}><strong>{item.title}</strong><small>{item.description}</small></button>)}</div><section className={styles.stage}><button className={styles.listen} onClick={()=>void listen()}>▶ Ouvir</button><p role="status">{message}</p>{game==="direction"&&<div className={styles.bigChoices}><button onClick={()=>chooseDirection("up")}>↗<strong>Sobe</strong></button><button onClick={()=>chooseDirection("down")}>↘<strong>Desce</strong></button></div>}{game==="location"&&<div className={styles.bigChoices}><button onClick={()=>chooseLocation("low")}>●<strong>Grave</strong></button><button onClick={()=>chooseLocation("high")}>✦<strong>Agudo</strong></button></div>}{game==="echo"&&<div className={styles.keys}>{[0,2,4].map((note,index)=><button key={note} onClick={()=>void echo(note)}><b>{["Dó","Ré","Mi"][index]}</b><small>{["●","▲","■"][index]}</small></button>)}</div>}<small className={styles.note}>Pare depois de 2–4 rondas ou antes, se a criança perder interesse.</small></section></div>;
}
