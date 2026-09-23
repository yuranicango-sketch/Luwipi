"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LearningPlayer } from "@/components/learning-player";
import type { LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import type { DetectedPianoNote, PianoInputSource } from "@/components/piano-input";
import type { AgeGroup } from "@/lib/curriculum";
import { competencySnapshot } from "@/lib/competency-progress";
import { competencyLabels, rankMetrics, type CompetencyId } from "@/lib/learning-intelligence";
import { fetchStudentInsight, recordLearningSession } from "@/lib/learning-client";
import { noteName, noteRate } from "@/lib/music-library";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./adaptive-workout.module.css";

type MissionKind="ear"|"rhythm"|"find"|"finger"|"read"|"create"|"phrase"|"chord"|"coordinate"|"expression";
type Mission={competency:CompetencyId;kind:MissionKind;title:string;instruction:string;notes:string[]};

const NOTES=["Dó4","Ré4","Mi4","Fá4","Sol4","Lá4"];
function missionFor(id:CompetencyId,age:AgeGroup):Mission{
 const young=age==="2-4";
 const map:Record<CompetencyId,Mission>={
  ouvido:{competency:id,kind:"ear",title:"Ouça e encontre",instruction:"Ouça. Depois encontre o mesmo som no piano.",notes:young?["Dó4","Sol4","Mi4"]:["Dó4","Sol4","Ré4","Lá4"]},
  ritmo:{competency:id,kind:"rhythm",title:"Pulso firme",instruction:"Faça quatro batidas com o mesmo espaço entre elas.",notes:[]},
  teclado:{competency:id,kind:"find",title:"Mapa do teclado",instruction:"Encontre as teclas que o LuwiPi pede.",notes:young?["Dó4","Mi4","Sol4"]:["Dó4","Fá4","Dó5","Sol4"]},
  tecnica:{competency:id,kind:"finger",title:"Dedos em ordem",instruction:"Toque devagar, um dedo de cada vez.",notes:["Dó4","Ré4","Mi4","Fá4","Sol4"]},
  leitura:{competency:id,kind:"read",title:"Leia e toque",instruction:"Olhe para a pauta e transforme o símbolo em som.",notes:["Dó4","Mi4","Ré4","Fá4"]},
  criatividade:{competency:id,kind:"create",title:"Crie uma resposta",instruction:"Escolha quatro sons para formar uma pequena ideia.",notes:[]},
  repertorio:{competency:id,kind:"phrase",title:"Frase musical",instruction:"Toque a frase até ao fim sem perder o cursor.",notes:["Dó4","Ré4","Mi4","Sol4","Mi4","Ré4","Dó4"]},
  harmonia:{competency:id,kind:"chord",title:"Construa um acorde",instruction:"Encontre as três partes de Dó maior.",notes:["Dó4","Mi4","Sol4"]},
  coordenacao:{competency:id,kind:"coordinate",title:"Uma mão chama, a outra responde",instruction:"Alterne entre região grave e média.",notes:["Dó3","Dó4","Ré3","Ré4","Mi3","Mi4"]},
  expressao:{competency:id,kind:"expression",title:"Forte ou suave?",instruction:"Ouça a intenção e escolha o contraste certo.",notes:[]},
 };
 return map[id];
}
function pitchMatches(pitch:string,expected:string){return /[3-6]$/.test(expected)?pitch===expected:noteName(pitch)===noteName(expected)}
function stars(accuracy:number){return accuracy>=92?3:accuracy>=76?2:1}

export function AdaptiveWorkout({age,studentId="default"}:{age:AgeGroup;studentId?:string}){
 const[input,setInput]=useState<PianoInputSource>("screen"),[plan,setPlan]=useState<CompetencyId[]>([]),[loading,setLoading]=useState(true);
 const[missionIndex,setMissionIndex]=useState(0),[step,setStep]=useState(0),[hits,setHits]=useState<string[]>([]),[taps,setTaps]=useState(0),[rhythmRound,setRhythmRound]=useState(0);
 const[wrong,setWrong]=useState<string|null>(null),[message,setMessage]=useState("A preparar o treino…"),[correct,setCorrect]=useState(0),[mistakes,setMistakes]=useState(0),[finished,setFinished]=useState(false);
 const startedAt=useRef(Date.now()),recorded=useRef(false);

 useEffect(()=>{void preloadPianoSamples();let alive=true;async function load(){
   const remote=await fetchStudentInsight(studentId,age);
   let selected:CompetencyId[];
   if(remote?.metrics?.length)selected=rankMetrics(remote.metrics).slice(0,3).map(row=>row.competency);
   else{
     const snapshot=competencySnapshot(studentId,age);
     selected=(Object.keys(competencyLabels) as CompetencyId[]).sort((a,b)=>snapshot[a].score-snapshot[b].score).slice(0,3);
   }
   if(alive){setPlan(selected.length?selected:["ouvido","ritmo","teclado"]);setLoading(false);setMessage("Primeira missão pronta.")}
 }void load();return()=>{alive=false}},[studentId,age]);

 const mission=useMemo(()=>plan[missionIndex]?missionFor(plan[missionIndex],age):null,[plan,missionIndex,age]);
 useEffect(()=>{setStep(0);setHits([]);setTaps(0);setRhythmRound(0);setWrong(null);if(mission)setMessage(mission.instruction)},[missionIndex,mission?.competency]);

 const expected=mission?.kind==="chord"?mission.notes.filter(note=>!hits.includes(note)):mission&&["ear","find","finger","read","phrase","coordinate"].includes(mission.kind)?mission.notes[step]:undefined;
 const expectedNote=typeof expected==="string"?expected:undefined;
 const attempts=correct+mistakes,accuracy=attempts?Math.round(correct/attempts*100):100,overall=Math.round(((missionIndex+(finished?1:missionProgress()))/Math.max(1,plan.length))*100);

 function missionProgress(){
   if(!mission)return 0;
   if(mission.kind==="rhythm")return (rhythmRound+taps/4)/2;
   if(mission.kind==="expression")return step/3;
   if(mission.kind==="create")return step/4;
   if(mission.kind==="chord")return hits.length/3;
   return step/Math.max(1,mission.notes.length);
 }
 function nextMission(){
   if(missionIndex+1<plan.length){setMissionIndex(v=>v+1);return}
   setFinished(true);setMessage("Treino concluído.");
   if(!recorded.current){recorded.current=true;void recordLearningSession({studentId,ageGroup:age,sessionType:"workout",contentId:"adaptive-5min",source:input,attempts,correct,mistakes,accuracy,stars:stars(accuracy),durationSeconds:Math.max(1,Math.round((Date.now()-startedAt.current)/1000)),startedAt:new Date(startedAt.current).toISOString(),metadata:{competencies:plan}})}
 }
 function completeMission(text:string){setMessage(text);window.setTimeout(nextMission,430)}
 function receive(pitch:string){
   if(!mission||finished)return;
   if(mission.kind==="create"){setCorrect(v=>v+1);const n=step+1;setStep(n);setMessage(`${n}/4 · continue a sua ideia.`);if(n>=4)completeMission("A ideia ficou pronta.");return}
   if(mission.kind==="chord"){
     if(!mission.notes.includes(pitch)){setMistakes(v=>v+1);setWrong(pitch);setMessage("Esse som não pertence ao acorde.");window.setTimeout(()=>setWrong(null),350);return}
     if(hits.includes(pitch))return;setCorrect(v=>v+1);const next=[...hits,pitch];setHits(next);if(next.length>=3)completeMission("Acorde construído.");else setMessage(`Boa. Falta ${3-next.length}.`);return
   }
   if(!expectedNote)return;
   if(!pitchMatches(pitch,expectedNote)){setMistakes(v=>v+1);setWrong(pitch);setMessage("Quase. Tente novamente.");window.setTimeout(()=>setWrong(null),350);return}
   setCorrect(v=>v+1);setWrong(null);const next=step+1;setStep(next);if(next>=mission.notes.length)completeMission("Missão concluída.");else setMessage(mission.kind==="ear"?"Certo. Ouça o próximo som.":"Certo. Continue.");
 }
 function screenPress(key:LuwipiPianoKey){if(input==="screen")receive(key.pitch)}
 function blackPress(pitch:string){if(input==="screen")receive(pitch)}
 function externalPress(note:DetectedPianoNote){if(input!=="screen"&&note.source===input)receive(note.pitch)}
 async function listenExpected(){if(expectedNote)await playPianoRate(noteRate(expectedNote),{gain:.56,duration:.72})}
 async function tapRhythm(){
   if(!mission||mission.kind!=="rhythm")return;await playPercussionClick({frequency:taps===0?180:137,gain:.2});const n=taps+1;
   if(n<4){setTaps(n);setMessage(`${n}/4 · mantenha o mesmo pulso.`);return}
   setCorrect(v=>v+1);setTaps(0);if(rhythmRound>=1)completeMission("Dois pulsos completos.");else{setRhythmRound(1);setMessage("Muito bem. Mais uma volta.")}
 }
 async function hearExpression(){const target=step%2===0?"forte":"suave";await playPianoRate(1,{gain:target==="forte"?.82:.18,duration:.8})}
 function chooseExpression(choice:"forte"|"suave"){
   const target=step%2===0?"forte":"suave";if(choice!==target){setMistakes(v=>v+1);setMessage("Ouça outra vez.");return}
   setCorrect(v=>v+1);const next=step+1;setStep(next);if(next>=3)completeMission("Você ouviu a intenção.");else setMessage("Certo. Próximo contraste.");
 }

 const toolbar=<>{plan.map((id,index)=><button key={id} data-active={index===missionIndex}>{index<missionIndex?"✓":index+1} · {competencyLabels[id]}</button>)}</>;
 const showCoach=age==="2-4"&&Boolean(expected)&&mission?.kind!=="ear";
 const scoreNotes=mission?.notes??[];

 return <LearningPlayer backHref={`/dashboard?age=${age}&student=${encodeURIComponent(studentId)}`} eyebrow="TREINO ADAPTATIVO · SESSÃO ÚNICA" title={finished?"Treino concluído":mission?.title??"Treino 5 min"} progress={overall} status={finished?`${accuracy}%`:`${missionIndex+1}/${Math.max(1,plan.length)}`} toolbar={toolbar} tone="game" piano={{input,onInputChange:setInput,onExternalNote:externalPress,onPress:screenPress,onBlackPress:blackPress,expected:finished?undefined:expected,wrong,octaves:age==="2-4"?2:3,startOctave:age==="2-4"?4:3,showLabels:age!=="2-4",blackKeysInteractive:true,attentionCue:showCoach,hint:message}}>
   <div className={styles.stage}>
    {loading?<div className={styles.loading}><i/><i/><i/><strong>A analisar o progresso do aluno…</strong></div>:finished?<section className={styles.finish}><div className={styles.finishRing}><b>{accuracy}%</b><span>PRECISÃO</span></div><small>TREINO CONCLUÍDO</small><h1>{stars(accuracy)===3?"Treino muito sólido.":stars(accuracy)===2?"Boa sessão.":"Já sabemos o que reforçar."}</h1><div className={styles.summary}>{plan.map(id=><span key={id}>✓ {competencyLabels[id]}</span>)}</div><button onClick={()=>{setMissionIndex(0);setCorrect(0);setMistakes(0);setFinished(false);recorded.current=false;startedAt.current=Date.now()}}>REPETIR TREINO</button></section>:mission?<section className={styles.mission} data-kind={mission.kind}>
      <header><small>MISSÃO {missionIndex+1} · {competencyLabels[mission.competency]}</small><h1>{mission.title}</h1><p>{message}</p></header>
      {mission.kind==="ear"?<div className={styles.ear}><div className={styles.wave}>{Array.from({length:17},(_,i)=><i key={i} style={{animationDelay:`${i*.04}s`}}/>)}</div><button onClick={()=>void listenExpected()}>OUVIR SOM</button></div>
      :mission.kind==="rhythm"?<button className={styles.rhythm} onClick={()=>void tapRhythm()}><strong>TOQUE NO PULSO</strong><div>{[0,1,2,3].map(i=><i key={i} data-on={i<taps}/>)}</div><span>VOLTA {rhythmRound+1}/2</span></button>
      :mission.kind==="expression"?<div className={styles.expression}><button className={styles.listen} onClick={()=>void hearExpression()}>OUVIR</button><div><button onClick={()=>chooseExpression("forte")}>FORTE</button><button onClick={()=>chooseExpression("suave")}>SUAVE</button></div></div>
      :mission.kind==="chord"?<div className={styles.chord}><strong>Dó maior</strong>{mission.notes.map(note=><span key={note} data-on={hits.includes(note)}>{noteName(note)}</span>)}</div>
      :mission.kind==="read"||mission.kind==="phrase"?<div className={styles.score}><MusicScore notes={scoreNotes} currentIndex={Math.min(step,Math.max(0,scoreNotes.length-1))} wrongIndex={wrong?Math.min(step,scoreNotes.length-1):null} hideLabels={mission.kind==="read"}/></div>
      :<div className={styles.path}>{mission.kind==="create"?Array.from({length:4},(_,i)=><span key={i} data-done={i<step}>{i<step?"✓":i+1}</span>):mission.notes.map((note,i)=><span key={`${note}-${i}`} data-active={i===step} data-done={i<step}>{mission.kind==="finger"?`${i+1}`:mission.kind==="coordinate"?(i%2===0?"ESQ":"DIR"):noteName(note)}</span>)}</div>}
    </section>:null}
   </div>
 </LearningPlayer>;
}
