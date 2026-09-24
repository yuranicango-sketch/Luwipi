"use client";

import { useState } from "react";
import { playPianoSemitone } from "@/lib/piano-sampler";
import styles from "./mini-games-panel.module.css";

type GameId = "echo" | "direction" | "location";

const games = [
  {id:"echo" as const,title:"Eco de 3 sons",note:"Ouve e repete. Sem pontuação."},
  {id:"direction" as const,title:"Sobe ou desce?",note:"Reconhece a direção pelo ouvido."},
  {id:"location" as const,title:"Onde mora o som?",note:"Grave ou agudo, sem pressa."},
];

const echoPattern=[0,2,4];
const directionPairs=[{a:0,b:4,answer:"up"},{a:5,b:2,answer:"down"},{a:2,b:2,answer:"same"}] as const;
const locationQuestions=[{note:-12,answer:"low"},{note:12,answer:"high"},{note:-7,answer:"low"},{note:9,answer:"high"}] as const;
const wait=(ms:number)=>new Promise((resolve)=>window.setTimeout(resolve,ms));

export function MiniGamesPanel(){
  const [game,setGame]=useState<GameId>("echo");
  const [echoStep,setEchoStep]=useState(0);
  const [directionIndex,setDirectionIndex]=useState(0);
  const [locationIndex,setLocationIndex]=useState(0);
  const [message,setMessage]=useState("Escolhe uma atividade e começa quando quiseres.");

  async function playEcho(){
    setEchoStep(0);
    for(const note of echoPattern){await playPianoSemitone(note,{duration:.55});await wait(390)}
    setMessage("Agora responde um som de cada vez.");
  }
  async function echoPress(note:number){
    await playPianoSemitone(note,{duration:.55});
    if(note===echoPattern[echoStep]){
      if(echoStep===echoPattern.length-1){setEchoStep(0);setMessage("Eco completo 🌱 Podes repetir quando quiseres.");}
      else{setEchoStep((value)=>value+1);setMessage("Continua. A música espera.");}
    } else setMessage("Ouve outra vez e experimenta de novo.");
  }
  async function hearDirection(){
    const q=directionPairs[directionIndex];
    await playPianoSemitone(q.a,{duration:.65});await wait(450);await playPianoSemitone(q.b,{duration:.65});
    setMessage("Para onde foi o segundo som?");
  }
  function answerDirection(answer:"up"|"down"|"same"){
    const q=directionPairs[directionIndex];
    if(answer===q.answer){setMessage("Encontraste a direção 🌱");setDirectionIndex((value)=>(value+1)%directionPairs.length);}
    else setMessage("Ouve outra vez. A resposta continua à tua espera.");
  }
  async function hearLocation(){
    await playPianoSemitone(locationQuestions[locationIndex].note,{duration:.9});
    setMessage("Esse som mora mais em baixo ou mais em cima?");
  }
  function answerLocation(answer:"low"|"high"){
    const q=locationQuestions[locationIndex];
    if(answer===q.answer){setMessage("Encontraste a região 🌱");setLocationIndex((value)=>(value+1)%locationQuestions.length);}
    else setMessage("Experimenta outra vez. Primeiro ouve, depois escolhe.");
  }

  return <div className={styles.page}>
    <header><span>JOGOS SOLTOS</span><h1>Atividades de 1–3 minutos, sem substituir a aula.</h1><p>Use quando quiser praticar ouvido, memória ou atenção fora de uma aula pronta. Não há XP, streak ou “game over”.</p></header>
    <div className={styles.tabs}>{games.map((item)=><button key={item.id} data-active={game===item.id} onClick={()=>{setGame(item.id);setMessage(item.note)}}><strong>{item.title}</strong><small>{item.note}</small></button>)}</div>
    <section className={styles.stage}>
      <div className={styles.message} role="status">{message}</div>
      {game==="echo"&&<div className={styles.echo}>
        <button className={styles.listen} onClick={()=>void playEcho()}>▶ Ouvir o eco</button>
        <div className={styles.threeKeys}>{[{n:0,l:"Dó"},{n:2,l:"Ré"},{n:4,l:"Mi"}].map((item)=><button key={item.n} onClick={()=>void echoPress(item.n)}><b>{item.l}</b><span>{item.n===0?"●":item.n===2?"▲":"■"}</span></button>)}</div>
        <small>Passo atual: {echoStep+1} de {echoPattern.length}. Sem cronómetro.</small>
      </div>}
      {game==="direction"&&<div className={styles.direction}>
        <button className={styles.listen} onClick={()=>void hearDirection()}>▶ Ouvir dois sons</button>
        <div><button onClick={()=>answerDirection("up")}>↗ Sobe</button><button onClick={()=>answerDirection("same")}>→ Repete</button><button onClick={()=>answerDirection("down")}>↘ Desce</button></div>
      </div>}
      {game==="location"&&<div className={styles.location}>
        <button className={styles.listen} onClick={()=>void hearLocation()}>▶ Ouvir o som</button>
        <div><button onClick={()=>answerLocation("low")}><span>●</span><strong>Grave</strong><small>mais em baixo</small></button><button onClick={()=>answerLocation("high")}><span>✦</span><strong>Agudo</strong><small>mais em cima</small></button></div>
      </div>}
    </section>
  </div>;
}
