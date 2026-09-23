"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameWorldScene } from "@/components/game-world";
import { LearningPlayer } from "@/components/learning-player";
import type { LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import type { DetectedPianoNote, PianoInputSource } from "@/components/piano-input";
import type { LuwipiGame } from "@/lib/games";
import { recordLearningSession } from "@/lib/learning-client";
import { noteName, noteRate } from "@/lib/music-library";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./universal-game-player.module.css";

const FINGERS=["1 · polegar","2 · indicador","3 · médio","4 · anelar","5 · mínimo"];
function matches(pitch:string,expected:string){return /[3-6]$/.test(expected)?pitch===expected:noteName(pitch)===noteName(expected)}
function stars(accuracy:number){return accuracy>=92?3:accuracy>=75?2:1}
function wait(ms:number){return new Promise<void>(resolve=>window.setTimeout(resolve,ms))}

function notesFor(game:LuwipiGame,level:number){
 const d=level+1;
 const map:Record<string,string[][]>={
  "caca-teclas":[["Dó4","Mi4","Sol4","Dó4"],["Dó4","Sol4","Fá4","Mi4","Dó5"],["Dó4","Fá4","Lá4","Ré4","Sol4","Dó5"]],
  "caminho-cores":[["Dó4","Mi4","Dó4","Sol4"],["Dó4","Mi4","Sol4","Ré4","Fá4"],["Dó4","Mi4","Sol4","Lá4","Fá4","Ré4"]],
  "ajude-cordeirinho":[["Mi4","Ré4","Dó4","Ré4"],["Mi4","Ré4","Dó4","Ré4","Mi4"],["Mi4","Mi4","Ré4","Dó4","Ré4","Mi4"]],
  "encontre-do":[["Dó4","Dó4","Dó4","Dó4"],["Dó4","Dó5","Dó4","Dó5","Dó4"],["Dó3","Dó5","Dó4","Dó3","Dó5","Dó4"]],
  "pauta-tecla":[["Dó4","Ré4","Mi4","Dó4"],["Dó4","Mi4","Sol4","Fá4","Ré4"],["Dó4","Ré4","Mi4","Fá4","Sol4","Lá4"]],
  "ouca-encontre":[["Dó4","Sol4","Mi4","Dó4"],["Dó4","Ré4","Fá4","Sol4","Mi4"],["Ré4","Mi4","Fá4","Sol4","Lá4","Mi4"]],
  "mestre-dedos":[["Dó4","Ré4","Mi4","Fá4"],["Sol3","Fá3","Mi3","Ré3","Dó3"],["Dó3","Dó4","Ré3","Ré4","Mi3","Mi4"]],
  "complete-melodia":[["Dó4","Mi4","Sol4","Mi4"],["Ré4","Fá4","Lá4","Sol4","Mi4"],["Dó4","Ré4","Mi4","Sol4","Lá4","Sol4"]],
 };
 return (map[game.id]?.[level]??["Dó4","Mi4","Sol4"]).slice(0,Math.max(2,game.levels[level].rounds+(d===3?0:0)));
}
function chordFor(level:number){return level===0?["Dó4","Mi4","Sol4"]:level===1?["Fá4","Lá4","Dó5"]:["Sol4","Si4","Ré5"]}

export function UniversalGamePlayer({game,story,studentId="default"}:{game:LuwipiGame;story:string;studentId?:string}){
 const[input,setInput]=useState<PianoInputSource>("screen"),[started,setStarted]=useState(false),[levelIndex,setLevelIndex]=useState(0),[round,setRound]=useState(0),[correct,setCorrect]=useState(0),[mistakes,setMistakes]=useState(0),[levelMistakes,setLevelMistakes]=useState(0);
 const[wrong,setWrong]=useState<string|null>(null),[message,setMessage]=useState(game.goal),[reaction,setReaction]=useState<"idle"|"success"|"wrong">("idle"),[levelComplete,setLevelComplete]=useState(false),[finished,setFinished]=useState(false);
 const[tapCount,setTapCount]=useState(0),[tapTimes,setTapTimes]=useState<number[]>([]),[measure,setMeasure]=useState<number[]>([]),[chordHits,setChordHits]=useState<string[]>([]),[memoryVisible,setMemoryVisible]=useState(true);
 const startedAt=useRef(Date.now()),recorded=useRef(false);
 const level=game.levels[levelIndex],targets=useMemo(()=>notesFor(game,levelIndex),[game,levelIndex]),chord=useMemo(()=>chordFor(levelIndex),[levelIndex]);
 const pianoEngine=["piano_path","memory_notes","score_hunt","listen_find","finger_path","melody_build"].includes(game.engine),chordEngine=game.engine==="chord_build";
 const expected=pianoEngine?targets[round]:chordEngine?chord.filter(note=>!chordHits.includes(note)):undefined;
 const expectedNote=typeof expected==="string"?expected:undefined;
 const attempts=correct+mistakes,accuracy=attempts?Math.round(correct/attempts*100):100;
 const progress=finished?100:Math.round(((levelIndex+(levelComplete?1:Math.min(1,round/Math.max(1,level.rounds))))/3)*100);

 useEffect(()=>{void preloadPianoSamples()},[]);
 useEffect(()=>{setRound(0);setLevelMistakes(0);setWrong(null);setReaction("idle");setLevelComplete(false);setTapCount(0);setTapTimes([]);setMeasure([]);setChordHits([]);setMemoryVisible(true);setMessage(level.subtitle);if(game.engine==="memory_notes"){const id=window.setTimeout(()=>setMemoryVisible(false),1800-levelIndex*250);return()=>window.clearTimeout(id)}},[levelIndex,game.id]);

 function react(kind:"success"|"wrong"){setReaction(kind);window.setTimeout(()=>setReaction("idle"),430)}
 function finishGame(){
   setFinished(true);setMessage("Três níveis concluídos.");
   if(!recorded.current){recorded.current=true;void recordLearningSession({studentId,ageGroup:game.age,sessionType:"game",contentId:game.id,source:input,attempts,correct,mistakes,accuracy,stars:stars(accuracy),durationSeconds:Math.max(1,Math.round((Date.now()-startedAt.current)/1000)),startedAt:new Date(startedAt.current).toISOString(),metadata:{competency:game.competency,levels:3,title:game.title,world:game.world}})}
 }
 function finishLevel(){setLevelComplete(true);react("success");setMessage(`Nível ${levelIndex+1} concluído.`)}
 function nextLevel(){if(levelIndex>=2){finishGame();return}setLevelIndex(v=>v+1)}
 function correctRound(text="Certo. Continue."){
   setCorrect(v=>v+1);setWrong(null);react("success");const next=round+1;setRound(next);setMessage(text);if(next>=level.rounds)window.setTimeout(finishLevel,250)
 }
 function miss(text="Tente outra vez."){setMistakes(v=>v+1);setLevelMistakes(v=>v+1);react("wrong");setMessage(text)}

 function receive(pitch:string){
  if(!started||finished||levelComplete)return;
  if(chordEngine){
   if(!chord.includes(pitch)){setWrong(pitch);miss("Esse som não pertence a este acorde.");window.setTimeout(()=>setWrong(null),350);return}
   if(chordHits.includes(pitch))return;setCorrect(v=>v+1);react("success");const next=[...chordHits,pitch];setChordHits(next);
   if(next.length===chord.length){const r=round+1;setRound(r);setChordHits([]);if(r>=level.rounds)window.setTimeout(finishLevel,250);else setMessage("Acorde completo. Construa outra vez.")}else setMessage(`Boa. Falta ${chord.length-next.length}.`);return
  }
  if(game.engine==="melody_build"&&levelIndex===2){
   setCorrect(v=>v+1);react("success");const next=round+1;setRound(next);setMessage(`${next}/${level.rounds} · continue a sua ideia.`);
   if(next>=level.rounds)window.setTimeout(finishLevel,250);return
  }
  if(!pianoEngine||!expectedNote)return;
  if(!matches(pitch,expectedNote)){setWrong(pitch);miss(game.engine==="score_hunt"?"Volte à pauta e tente novamente.":"Quase. Procure novamente.");window.setTimeout(()=>setWrong(null),360);return}
  correctRound(game.engine==="memory_notes"?"Sequência certa. Continue de memória.":"Certo. Próximo.");
 }
 function screenPress(key:LuwipiPianoKey){if(input==="screen")receive(key.pitch)}
 function blackPress(pitch:string){if(input==="screen")receive(pitch)}
 function externalPress(note:DetectedPianoNote){if(input!=="screen"&&note.source===input)receive(note.pitch)}

 async function playChoice(){
  const a=round%2===0;
  if(game.id==="leao-coelhinho"){const contrast=levelIndex===0?.75:levelIndex===1?.52:.36;await playPianoRate(1,{gain:a?.86:contrast,duration:.72});return}
  if(game.id==="legato-staccato"){
    const duration=a?(levelIndex===2?.42:.55):(levelIndex===2?.16:.2),gap=a?80:280;
    await playPianoRate(1,{gain:.55,duration});await wait(gap);await playPianoRate(Math.pow(2,2/12),{gain:.55,duration});return
  }
  const lowRate=levelIndex===0?.5:levelIndex===1?Math.pow(2,-5/12):Math.pow(2,-3/12),highRate=levelIndex===0?2:levelIndex===1?Math.pow(2,5/12):Math.pow(2,3/12);
  await playPianoRate(a?lowRate:highRate,{gain:.52,duration:.72});
 }
 function choose(which:"a"|"b"){
  const target=round%2===0?"a":"b";if(which!==target){miss("Ouça novamente antes de decidir.");return}correctRound("Boa escuta.");
 }

 async function playEcho(){
   const count=game.engine==="rhythm_echo"?2+levelIndex:4+levelIndex;
   for(let i=0;i<count;i++){await playPercussionClick({frequency:i===0?182:136,gain:.18});await wait(game.id==="trem-ritmo"?(levelIndex===0?520:levelIndex===1?370:260):420)}
   setMessage(`Agora devolva ${count} batidas.`);
 }
 async function rhythmTap(){
   const target=game.engine==="rhythm_echo"?2+levelIndex:4+levelIndex,now=performance.now(),nextTimes=[...tapTimes,now],next=tapCount+1;
   await playPercussionClick({frequency:next===1?180:136,gain:.18});setTapCount(next);setTapTimes(nextTimes);
   if(next<target){setMessage(`${next}/${target} · continue.`);return}
   let stable=true;if(nextTimes.length>=3){const intervals=nextTimes.slice(1).map((t,i)=>t-nextTimes[i]);const avg=intervals.reduce((a,b)=>a+b,0)/intervals.length;const spread=Math.max(...intervals.map(v=>Math.abs(v-avg)));stable=spread<Math.max(190,avg*.38)}
   setTapCount(0);setTapTimes([]);
   if(!stable&&game.engine==="rhythm_pulse"){miss("O pulso ficou irregular. Tente a volta outra vez.");return}
   correctRound("Pulso completo.");
 }

 function addBeat(value:number){
   const target=4,next=[...measure,value],sum=next.reduce((a,b)=>a+Math.abs(b),0);
   if(sum>target){miss("Passou do limite do compasso.");return}
   setMeasure(next);
   if(sum===target){setCorrect(v=>v+1);react("success");const r=round+1;setRound(r);window.setTimeout(()=>setMeasure([]),250);if(r>=level.rounds)window.setTimeout(finishLevel,300);else setMessage("Compasso completo. Construa outro.")}
 }
 async function listenExpected(){if(expectedNote)await playPianoRate(noteRate(expectedNote),{gain:.56,duration:.72})}
 function start(){setStarted(true);startedAt.current=Date.now();setMessage(level.subtitle)}
 function reset(){setStarted(false);setLevelIndex(0);setRound(0);setCorrect(0);setMistakes(0);setLevelMistakes(0);setFinished(false);setLevelComplete(false);recorded.current=false;setMessage(game.goal)}

 const micHint=chordEngine&&input==="microphone"?"Microfone assistido: toque as notas do acorde uma a uma. MIDI e tela aceitam o acorde diretamente.":message;
 const hiddenCoach=["listen_find","score_hunt","listen_choose","articulation"].includes(game.engine);
 const attention=game.age==="2-4"&&!hiddenCoach&&Boolean(expected)&&(levelIndex===0||levelMistakes>=2);
 const coachExpected=hiddenCoach?undefined:expected;
 const finger=FINGERS[round%5];
 const levelProgress=Math.round(Math.min(1,round/Math.max(1,level.rounds))*100);

 let content;
 if(!started)content=<section className={styles.intro}><small>{game.skill} · {game.session}</small><h1>{game.title}</h1><p>{story}</p><div className={styles.levelMap}>{game.levels.map((item,index)=><div key={item.label}><span>{index+1}</span><strong>{item.label}</strong><p>{item.subtitle}</p></div>)}</div><button onClick={start}>COMEÇAR JOGO</button></section>;
 else if(finished)content=<section className={styles.finish}><div className={styles.resultRing}><b>{accuracy}%</b><span>PRECISÃO</span></div><small>3 NÍVEIS CONCLUÍDOS</small><h1>{game.title}</h1><div className={styles.stars}>{[1,2,3].map(n=><b key={n} data-on={n<=stars(accuracy)}>★</b>)}</div><p>{correct} acertos · {mistakes} tentativas a rever</p><div className={styles.finishActions}><button onClick={reset}>JOGAR OUTRA VEZ</button><a href="/jogos">BIBLIOTECA DE JOGOS</a></div></section>;
 else if(levelComplete)content=<section className={styles.levelDone}><small>NÍVEL {levelIndex+1}/3</small><h1>{level.label} concluído</h1><p>{levelIndex<2?game.levels[levelIndex+1].subtitle:"A última missão terminou."}</p><div className={styles.levelScore}><span>{Math.max(0,level.rounds-levelMistakes)}</span><b>respostas sólidas</b></div><button onClick={nextLevel}>{levelIndex<2?"ENTRAR NO PRÓXIMO NÍVEL":"VER RESULTADO"}</button></section>;
 else content=<section className={styles.challenge} data-engine={game.engine}><header><small>NÍVEL {levelIndex+1}/3 · {level.label}</small><h1>{game.title}</h1><p>{message}</p></header>
   {game.engine==="listen_choose"||game.engine==="articulation"?<div className={styles.listenChoice}><button className={styles.listenButton} onClick={()=>void playChoice()}>OUVIR DESAFIO</button><div><button onClick={()=>choose("a")}>{game.id==="leao-coelhinho"?"FORTE":game.id==="legato-staccato"?"LEGATO":"GRAVE"}</button><button onClick={()=>choose("b")}>{game.id==="leao-coelhinho"?"SUAVE":game.id==="legato-staccato"?"STACCATO":"AGUDO"}</button></div></div>
   :game.engine==="rhythm_pulse"||game.engine==="rhythm_echo"?<div className={styles.rhythmZone}>{game.engine==="rhythm_echo"&&<button className={styles.listenButton} onClick={()=>void playEcho()}>OUVIR PADRÃO</button>}<button className={styles.rhythmPad} onClick={()=>void rhythmTap()}><strong>TOCAR NO PULSO</strong><div>{Array.from({length:game.engine==="rhythm_echo"?2+levelIndex:4+levelIndex},(_,i)=><i key={i} data-on={i<tapCount}/>)}</div></button></div>
   :game.engine==="measure_build"?<div className={styles.measure}><div className={styles.measureLine}>{measure.map((beat,i)=><span key={i}>{beat===2?"𝅗𝅥":beat===-1?"𝄽":"♩"}</span>)}<b>{measure.reduce((a,b)=>a+Math.abs(b),0)}/4</b></div><div className={styles.beatButtons}><button onClick={()=>addBeat(1)}>♩<small>1 tempo</small></button><button onClick={()=>addBeat(2)}>𝅗𝅥<small>2 tempos</small></button>{levelIndex>0&&<button onClick={()=>addBeat(-1)}>𝄽<small>pausa</small></button>}<button onClick={()=>setMeasure(v=>v.slice(0,-1))}>↶<small>retirar</small></button></div></div>
   :chordEngine?<div className={styles.chord}><strong>{levelIndex===0?"Dó":levelIndex===1?"Fá":"Sol"} maior</strong>{chord.map(note=><span key={note} data-on={chordHits.includes(note)}>{noteName(note)}</span>)}</div>
   :game.engine==="score_hunt"?<div className={styles.score}><MusicScore notes={[expectedNote??"Dó4"]} currentIndex={0} wrongIndex={wrong?0:null} hideLabels/></div>
   :game.engine==="listen_find"?<div className={styles.earZone}><div className={styles.soundWave}>{Array.from({length:15},(_,i)=><i key={i} style={{animationDelay:`${i*.04}s`}}/>)}</div><button className={styles.listenButton} onClick={()=>void listenExpected()}>OUVIR NOTA</button></div>
   :game.engine==="memory_notes"?<div className={styles.memory}>{targets.slice(0,level.rounds).map((note,i)=><span key={`${note}-${i}`} data-active={i===round} data-done={i<round}>{memoryVisible||i<round?noteName(note):"?"}</span>)}</div>
   :<div className={styles.path}>{targets.slice(0,level.rounds).map((note,i)=><span key={`${note}-${i}`} data-active={i===round} data-done={i<round}>{game.engine==="finger_path"?FINGERS[i%5]:game.engine==="melody_build"&&levelIndex===2?"♪":noteName(note)}</span>)}</div>}
   <div className={styles.roundBar}><i style={{width:`${levelProgress}%`}}/><span>{Math.min(round+1,level.rounds)}/{level.rounds}</span></div>
 </section>;

 return <LearningPlayer backHref="/jogos" eyebrow={started?`${game.skill} · NÍVEL ${Math.min(3,levelIndex+1)}/3`:"JOGO LUWIPI"} title={game.title} progress={progress} status={started?`${accuracy}%`:"3 níveis"} tone="game" piano={{input,onInputChange:setInput,onExternalNote:externalPress,onPress:screenPress,onBlackPress:blackPress,expected:finished||levelComplete?undefined:coachExpected,wrong,octaves:game.age==="2-4"?2:3,startOctave:game.age==="2-4"?4:3,showLabels:game.age!=="2-4",blackKeysInteractive:true,attentionCue:attention,hint:micHint}}>
   <div className={styles.stage}><GameWorldScene world={game.world} progress={progress} reaction={reaction} level={levelIndex}/><div className={styles.content}>{content}</div></div>
 </LearningPlayer>;
}
