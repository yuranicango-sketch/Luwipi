"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LearningPlayer } from "@/components/learning-player";
import type { LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import type { DetectedPianoNote, PianoInputSource } from "@/components/piano-input";
import type { LuwipiGame } from "@/lib/games";
import { noteName, noteRate } from "@/lib/music-library";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./universal-game-player.module.css";

const PIANO_TARGETS:Record<string,string[]>={
 "caca-teclas":["Dó4","Mi4","Sol4","Dó5","Fá4"],
 "caminho-cores":["Dó4","Mi4","Sol4","Mi4","Dó4"],
 "ajude-cordeirinho":["Mi4","Ré4","Dó4","Ré4","Mi4"],
 "encontre-do":["Dó4","Dó5","Dó3","Dó4"],
 "pauta-tecla":["Dó4","Mi4","Sol4","Fá4","Ré4"],
 "ouca-encontre":["Sol4","Mi4","Dó4","Lá4"],
 "mestre-dedos":["Dó4","Ré4","Mi4","Fá4","Sol4"],
 "complete-melodia":["Dó4","Mi4","Sol4","Mi4","Dó4"],
};
const FINGERS=["1 · polegar","2 · indicador","3 · médio","4 · anelar","5 · mínimo"];
function matches(pitch:string,expected:string){return /[3-6]$/.test(expected)?pitch===expected:noteName(pitch)===noteName(expected)}

export function UniversalGamePlayer({game,story}:{game:LuwipiGame;story:string}){
 const[input,setInput]=useState<PianoInputSource>("screen"),[index,setIndex]=useState(0),[correct,setCorrect]=useState(0),[mistakes,setMistakes]=useState(0),[wrong,setWrong]=useState<string|null>(null),[message,setMessage]=useState("Comece a missão."),[finished,setFinished]=useState(false),[taps,setTaps]=useState(0),[round,setRound]=useState(0),[chordHits,setChordHits]=useState<string[]>([]),[measure,setMeasure]=useState<number[]>([]);
 const targets=PIANO_TARGETS[game.id]??[];
 const pianoMode=targets.length>0||game.id==="construa-acorde";
 const expected=targets[index];
 const chord=["Dó4","Mi4","Sol4"];
 const accuracy=correct+mistakes?Math.round(correct/(correct+mistakes)*100):100;
 const progress=finished?100:pianoMode?(game.id==="construa-acorde"?chordHits.length/chord.length*100:index/Math.max(1,targets.length)*100):Math.min(96,(round/4)*100+(taps/4)*20);
 useEffect(()=>{void preloadPianoSamples()},[]);
 useEffect(()=>{setMessage(game.goal)},[game.goal]);

 function complete(){setFinished(true);setMessage("Missão concluída!")}
 function receive(pitch:string){
  if(finished)return;
  if(game.id==="construa-acorde"){
    if(!chord.includes(pitch)){setMistakes(v=>v+1);setWrong(pitch);setMessage("Esse som não pertence ao acorde de Dó maior.");window.setTimeout(()=>setWrong(null),350);return}
    if(chordHits.includes(pitch))return;const next=[...chordHits,pitch];setChordHits(next);setCorrect(v=>v+1);setMessage(next.length===3?"🏗️ Acorde construído!":"Boa. Falta mais uma parte do acorde.");if(next.length===3)window.setTimeout(complete,300);return
  }
  if(!expected)return;
  if(!matches(pitch,expected)){setMistakes(v=>v+1);setWrong(pitch);setMessage(`Quase. Procure ${noteName(expected)}.`);window.setTimeout(()=>setWrong(null),380);return}
  setCorrect(v=>v+1);setWrong(null);if(index+1>=targets.length){setIndex(v=>v+1);complete()}else{setIndex(v=>v+1);setMessage("✓ Certo. A próxima missão apareceu.")}
 }
 function screenPress(key:LuwipiPianoKey){if(input==="screen")receive(key.pitch)}
 function blackPress(pitch:string){if(input==="screen")receive(pitch)}
 function externalPress(note:DetectedPianoNote){if(input!=="screen"&&note.source===input)receive(note.pitch)}
 async function playChoice(which:"a"|"b"){
   if(game.id==="leao-coelhinho"){await playPianoRate(1,{gain:which==="a"?.82:.18,duration:.75});return}
   if(game.id==="legato-staccato"){await playPianoRate(1,{gain:.55,duration:which==="a"?1.1:.2});return}
   await playPianoRate(which==="a"?.5:2,{gain:.5,duration:.72})
 }
 function choose(correctChoice:boolean){if(correctChoice){setCorrect(v=>v+1);setMessage("✓ Ouviu muito bem!");if(round>=3)complete();else setRound(v=>v+1)}else{setMistakes(v=>v+1);setMessage("Ouça outra vez. Sem pressa.")}}
 async function rhythmTap(){await playPercussionClick({frequency:taps===0?175:135,gain:.2});const next=taps+1;if(next>=4){setCorrect(v=>v+1);setTaps(0);if(round>=3)complete();else{setRound(v=>v+1);setMessage("✓ Pulso completo. Mais uma volta!")}}else{setTaps(next);setMessage(`${next}/4 · mantenha o mesmo pulso.`)}}
 function addBeat(value:number){const next=[...measure,value];const total=next.reduce((a,b)=>a+b,0);if(total>4){setMistakes(v=>v+1);setMessage("Passou de 4 tempos. Retire uma figura.");return}setMeasure(next);if(total===4){setCorrect(v=>v+1);setMessage("✓ O compasso ficou completo!");window.setTimeout(()=>{if(round>=3)complete();else{setRound(v=>v+1);setMeasure([])}},350)}}
 function reset(){setIndex(0);setCorrect(0);setMistakes(0);setWrong(null);setMessage(game.goal);setFinished(false);setTaps(0);setRound(0);setChordHits([]);setMeasure([])}

 const choiceGame=["elefante-passarinho","leao-coelhinho","legato-staccato"].includes(game.id);
 const rhythmGame=["siga-tambor","eco-musical","trem-ritmo"].includes(game.id);
 const measureGame=game.id==="construa-compasso";
 const currentChoice=round%2===0?"a":"b";
 const content=finished?<div className={styles.finish}><span>{game.emoji}</span><small>MISSÃO CONCLUÍDA</small><h1>{game.title}</h1><div className={styles.stars}>{[1,2,3].map(n=><b key={n} data-on={n<=(accuracy>=90?3:accuracy>=70?2:1)}>★</b>)}</div><p>{accuracy}% de precisão · {correct} acertos</p><div><button onClick={reset}>JOGAR DE NOVO</button><Link href="/jogos">OUTRO JOGO</Link></div></div>
 :pianoMode?<div className={styles.pianoGame}><header><span>{game.emoji}</span><div><small>{game.skill}</small><h1>{game.id==="construa-acorde"?"Construa Dó maior":game.id==="ouca-encontre"?"Ouça e encontre no piano":game.id==="mestre-dedos"?`Use o dedo ${FINGERS[index%5]}`:game.id==="ajude-cordeirinho"?"Ajude Nino a avançar":`Encontre ${expected?noteName(expected):"a nota"}`}</h1><p>{message}</p></div></header>{game.id==="ouca-encontre"&&expected&&<button className={styles.listenButton} onClick={()=>void playPianoRate(noteRate(expected),{gain:.55,duration:.75})}>▶ OUVIR NOTA</button>}{game.id==="pauta-tecla"&&expected?<div className={styles.score}><MusicScore notes={[expected]} currentIndex={0} wrongIndex={wrong?0:null} hideLabels/></div>:game.id==="construa-acorde"?<div className={styles.chord}><strong>Dó maior</strong>{chord.map(pitch=><span key={pitch} data-on={chordHits.includes(pitch)}>{noteName(pitch)}</span>)}</div>:<div className={styles.adventure}><div className={styles.path}/><span className={styles.hero} style={{left:`${8+Math.min(1,index/Math.max(1,targets.length))*78}%`}}>{Array.from(game.emoji)[0]||"🎵"}</span><b>🏁</b></div>}</div>
 :choiceGame?<div className={styles.choice}><header><span>{game.emoji}</span><small>{game.skill}</small><h1>{game.id==="leao-coelhinho"?"Forte ou suave?":game.id==="legato-staccato"?"Legato ou staccato?":"Grave ou agudo?"}</h1><p>Ouça e escolha. Pode repetir quantas vezes precisar.</p></header><button className={styles.listenButton} onClick={()=>void playChoice(currentChoice)}>▶ OUVIR DESAFIO</button><div className={styles.choiceButtons}>{game.id==="leao-coelhinho"?<><button onClick={()=>choose(currentChoice==="a")}><span>🦁</span><b>FORTE</b></button><button onClick={()=>choose(currentChoice==="b")}><span>🐇</span><b>SUAVE</b></button></>:game.id==="legato-staccato"?<><button onClick={()=>choose(currentChoice==="a")}><span>〰️</span><b>LEGATO</b></button><button onClick={()=>choose(currentChoice==="b")}><span>⚡</span><b>STACCATO</b></button></>:<><button onClick={()=>choose(currentChoice==="a")}><span>🐘</span><b>GRAVE</b></button><button onClick={()=>choose(currentChoice==="b")}><span>🐦</span><b>AGUDO</b></button></>}</div><p className={styles.feedback}>{message}</p></div>
 :rhythmGame?<div className={styles.rhythm}><header><span>{game.emoji}</span><small>{game.skill}</small><h1>{game.title}</h1><p>{message}</p></header><button onClick={()=>void rhythmTap()}><span>🥁</span><b>TOQUE NO PULSO</b><i>{[0,1,2,3].map(n=><em key={n} data-on={n<taps}/>)}</i></button></div>
 :measureGame?<div className={styles.measure}><header><span>{game.emoji}</span><small>COMPASSO 4/4</small><h1>Preencha exatamente 4 tempos</h1><p>{message}</p></header><div className={styles.measureLine}>{measure.map((beat,i)=><span key={i}>{beat===2?"𝅗𝅥":"♩"}</span>)}<b>{measure.reduce((a,b)=>a+b,0)}/4</b></div><div className={styles.beatButtons}><button onClick={()=>addBeat(1)}>♩ <b>1 tempo</b></button><button onClick={()=>addBeat(2)}>𝅗𝅥 <b>2 tempos</b></button><button onClick={()=>setMeasure(v=>v.slice(0,-1))}>↶ <b>retirar</b></button></div></div>
 :<div className={styles.finish}><span>{game.emoji}</span><small>EXPERIÊNCIA</small><h1>{game.title}</h1><p>{story}</p><button onClick={complete}>CONCLUIR MISSÃO</button></div>;

 const coachHidden=game.id==="pauta-tecla"||game.id==="ouca-encontre";
 const expectedKeys=coachHidden?undefined:game.id==="construa-acorde"?chord.filter(p=>!chordHits.includes(p)):expected;
 return <LearningPlayer backHref="/jogos" eyebrow={`JOGO · ${game.skill}`} title={game.title} progress={progress} status={`${accuracy}%`} tone="game" piano={{input,onInputChange:setInput,onExternalNote:externalPress,onPress:screenPress,onBlackPress:blackPress,expected:pianoMode?expectedKeys:undefined,wrong,octaves:game.age==="2-4"?2:3,startOctave:game.age==="2-4"?4:3,showLabels:game.age!=="2-4",blackKeysInteractive:true,hint:pianoMode?message:"O piano continua disponível para explorar enquanto joga."}}><div className={styles.stage}>{content}</div></LearningPlayer>
}
