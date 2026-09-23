"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { GrandStaffScore } from "@/components/grand-staff-score";
import { LearningPlayer } from "@/components/learning-player";
import type { LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import type { DetectedPianoNote, PianoInputSource } from "@/components/piano-input";
import { noteName, noteOctave, noteRate, type KidsSong, type PianoScoreEvent, type ScoreHandMode } from "@/lib/music-library";
import { recordLearningSession } from "@/lib/learning-client";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./song-practice.module.css";

type PracticeMode="learn"|"practice"|"perform";
type Tempo=60|75|100;
type Section={label:string;notes:string[]};
type GrandEvent={sourceIndex:number;event:PianoScoreEvent;expected:string[]};

function sectionsFor(song:KidsSong):Section[]{return song.sections?.length?song.sections:[{label:"Música",notes:song.sequence??[]}];}
function samePitch(pitch:string,expected:string,strict:boolean){return strict?pitch===expected:noteName(pitch)===noteName(expected)}
function stars(accuracy:number){return accuracy>=95?3:accuracy>=80?2:1}
function eventNotes(event:PianoScoreEvent,hand:ScoreHandMode){return hand==="right"?(event.right??[]):hand==="left"?(event.left??[]):[...(event.left??[]),...(event.right??[])]}
function wait(ms:number){return new Promise<void>(resolve=>window.setTimeout(resolve,ms))}

export function SongPractice({song,studentId="default",ageGroup="5-8"}:{song:KidsSong;studentId?:string;ageGroup?:"2-4"|"5-8"|"adult"}){
 const sections=useMemo(()=>sectionsFor(song),[song]);
 const fullSequence=useMemo(()=>sections.flatMap(section=>section.notes),[sections]);
 const isGrand=Boolean(song.grandStaff&&song.scoreEvents?.length);
 const[started,setStarted]=useState(false),[finished,setFinished]=useState(false),[listening,setListening]=useState(false);
 const[mode,setMode]=useState<PracticeMode>("practice"),[input,setInput]=useState<PianoInputSource>("screen"),[tempo,setTempo]=useState<Tempo>(75),[metronome,setMetronome]=useState(false);
 const[sectionIndex,setSectionIndex]=useState(0),[noteIndex,setNoteIndex]=useState(0),[hand,setHand]=useState<ScoreHandMode>("both"),[grandIndex,setGrandIndex]=useState(0),[hits,setHits]=useState<string[]>([]);
 const[correct,setCorrect]=useState(0),[mistakes,setMistakes]=useState(0),[wrong,setWrong]=useState<string|null>(null),[message,setMessage]=useState("A partitura espera pela nota certa.");
 const token=useRef(0),lock=useRef(false),sessionStartedAt=useRef(Date.now()),sessionRecorded=useRef(false);

 const grandEvents=useMemo<GrandEvent[]>(()=>!isGrand?[]:(song.scoreEvents??[]).map((event,sourceIndex)=>({sourceIndex,event,expected:eventNotes(event,hand)})).filter(item=>item.expected.length>0),[isGrand,song.scoreEvents,hand]);
 const grandCurrent=grandEvents[grandIndex];
 const activeSection=mode==="perform"?{label:"Música completa",notes:fullSequence}:sections[sectionIndex]??sections[0];
 const sequence=activeSection?.notes??[];
 const expectedNormal=sequence[noteIndex];
 const strict=(song.pianoOctaves??1)>1;
 const remainingGrand=grandCurrent?.expected.filter(pitch=>!hits.includes(pitch))??[];
 const expectedDisplay=isGrand?remainingGrand:expectedNormal;
 const normalProgress=sequence.length?noteIndex/sequence.length:0;
 const sectionProgress=mode==="perform"?normalProgress:(sectionIndex+normalProgress)/Math.max(1,sections.length);
 const grandProgress=grandEvents.length?grandIndex/grandEvents.length:0;
 const progress=Math.round((isGrand?grandProgress:sectionProgress)*100);
 const attempts=correct+mistakes,accuracy=attempts?Math.round(correct/attempts*100):100;

 useEffect(()=>{void preloadPianoSamples()},[]);
 useEffect(()=>{if(!metronome||!started||finished)return;let beat=0;const beats=song.timeSignature==="3/4"?3:4,delay=60000/(92*tempo/100);void playPercussionClick({frequency:180,gain:.18});const id=window.setInterval(()=>{beat=(beat+1)%beats;void playPercussionClick({frequency:beat===0?180:132,gain:beat===0?.18:.12})},delay);return()=>window.clearInterval(id)},[metronome,started,finished,tempo,song.timeSignature]);
 useEffect(()=>{setGrandIndex(0);setHits([]);setWrong(null);if(started&&isGrand)setMessage(hand==="both"?"As duas pautas estão ativas.":hand==="right"?"Só a mão direita está ativa.":"Só a mão esquerda está ativa.")},[hand,isGrand,started]);
 useEffect(()=>{
   if(!finished||sessionRecorded.current)return;
   sessionRecorded.current=true;
   const scoreStars=stars(accuracy);
   void recordLearningSession({
     studentId,ageGroup,sessionType:"song",contentId:song.id,source:input,
     handMode:isGrand?hand:null,attempts,correct,mistakes,accuracy,stars:scoreStars,
     durationSeconds:Math.max(1,Math.round((Date.now()-sessionStartedAt.current)/1000)),
     startedAt:new Date(sessionStartedAt.current).toISOString(),
     metadata:{mode,difficulty:song.difficulty,title:song.title,grandStaff:isGrand,timeSignature:song.timeSignature??"4/4"},
   });
 },[finished,studentId,ageGroup,song.id,song.difficulty,song.title,song.timeSignature,input,isGrand,hand,attempts,correct,mistakes,accuracy,mode]);

 function resetSession(nextMode=mode){token.current+=1;lock.current=false;sessionStartedAt.current=Date.now();sessionRecorded.current=false;setMode(nextMode);setSectionIndex(0);setNoteIndex(0);setGrandIndex(0);setHits([]);setCorrect(0);setMistakes(0);setWrong(null);setFinished(false);setListening(false);setMessage(nextMode==="learn"?"Ouça, veja e toque sem pressa.":nextMode==="perform"?"Do começo ao fim. O Player acompanha você.":"A partitura espera pela nota certa.");setStarted(true)}
 function finish(){setFinished(true);setMessage("Música concluída!")}
 function nextNormal(){if(noteIndex+1<sequence.length){setNoteIndex(v=>v+1);return}if(mode!=="perform"&&sectionIndex<sections.length-1){setSectionIndex(v=>v+1);setNoteIndex(0);setMessage("Nova frase. Respire e continue.");return}finish()}
 function acceptNormal(pitch:string){if(!expectedNormal||lock.current)return;setCorrect(c=>c+1);setWrong(null);setMessage("✓ Certo. A próxima nota já está à espera.");lock.current=true;window.setTimeout(()=>{lock.current=false;nextNormal()},110)}
 function receiveGrand(pitch:string){if(!grandCurrent||lock.current)return;const target=grandCurrent.expected;if(!target.includes(pitch)){setMistakes(v=>v+1);setWrong(pitch);setMessage("Quase. Veja as notas dentro do cursor.");window.setTimeout(()=>setWrong(null),420);return}if(hits.includes(pitch))return;const nextHits=[...hits,pitch];setHits(nextHits);setCorrect(v=>v+1);setWrong(null);if(target.every(item=>nextHits.includes(item))){setMessage("✓ As notas encontraram-se.");lock.current=true;window.setTimeout(()=>{lock.current=false;setHits([]);if(grandIndex+1>=grandEvents.length)finish();else setGrandIndex(v=>v+1)},150)}else setMessage(`Boa. Falta ${target.length-nextHits.length} ${target.length-nextHits.length===1?"nota":"notas"}.`)}
 function receivePitch(pitch:string){if(!started||finished||listening)return;if(isGrand){receiveGrand(pitch);return}if(!expectedNormal)return;setAttemptsForNormal(pitch)}
 function setAttemptsForNormal(pitch:string){if(!expectedNormal)return;setMistakes(value=>{if(samePitch(pitch,expectedNormal,strict))return value;return value+1});if(!samePitch(pitch,expectedNormal,strict)){setWrong(pitch);setMessage(`Quase. Procure ${noteName(expectedNormal)}${strict?noteOctave(expectedNormal):""}.`);window.setTimeout(()=>setWrong(null),420);return}acceptNormal(pitch)}
 function screenPress(key:LuwipiPianoKey){if(input!=="screen")return;receivePitch(key.pitch)}
 function blackPress(pitch:string){if(input!=="screen")return;receivePitch(pitch)}
 function externalPress(note:DetectedPianoNote){if(input==="screen"||note.source!==input)return;receivePitch(note.pitch)}
 async function listen(){if(listening)return;const id=++token.current;setListening(true);setMessage("Ouça primeiro.");if(isGrand){for(const item of grandEvents){if(token.current!==id)return;for(const pitch of item.expected)void playPianoRate(noteRate(pitch),{gain:.45,duration:Math.max(.28,.56*(item.event.beats??1))});await wait(620*100/tempo*Math.max(.5,item.event.beats??1))}}else{const resume=noteIndex;for(let i=0;i<sequence.length;i+=1){if(token.current!==id)return;setNoteIndex(i);await playPianoRate(noteRate(sequence[i]),{gain:.58,duration:.55});await wait(520*100/tempo)}setNoteIndex(resume)}if(token.current===id){setListening(false);setMessage("Agora é a sua vez.")}}

 if(!started)return <section className={styles.intro}><Link href={`/musicas?student=${encodeURIComponent(studentId)}&age=${ageGroup}`}>← Biblioteca</Link><div className={styles.heroArt}><span>{song.emoji}</span>{isGrand&&<b>𝄞 𝄢</b>}</div><small>{isGrand?"DUAS MÃOS · GRANDE PAUTA":"PLAYER LUWIPI"}</small><h1>{song.title}</h1><p>{song.story}</p><div className={styles.modeCards}><button onClick={()=>resetSession("learn")}><b>01</b><strong>Aprender</strong><span>Ouvir, ver as notas e construir a música por etapas.</span></button><button className={styles.primaryMode} onClick={()=>resetSession("practice")}><b>02</b><strong>Praticar</strong><span>O cursor espera. Só avança depois da nota certa.</span><em>IDEAL</em></button><button onClick={()=>resetSession("perform")}><b>03</b><strong>Tocar</strong><span>Menos pistas, música contínua e resultado no fim.</span></button></div></section>;
 if(finished){const scoreStars=stars(accuracy);return <section className={styles.finish}><div className={styles.stars}>{[1,2,3].map(n=><span key={n} data-on={n<=scoreStars}>★</span>)}</div><small>SESSÃO CONCLUÍDA</small><h1>{song.title}</h1><p>{isGrand?"As duas mãos chegaram ao fim da peça.":"A música chegou ao fim."}</p><div className={styles.stats}><div><b>{accuracy}%</b><span>precisão</span></div><div><b>{correct}</b><span>acertos</span></div><div><b>{mistakes}</b><span>a rever</span></div></div><div className={styles.finishActions}><button onClick={()=>resetSession(mode)}>TOCAR DE NOVO</button><Link href={`/professor/tarefas?song=${encodeURIComponent(song.id)}`}>ENVIAR COMO TAREFA</Link><Link href={`/musicas?student=${encodeURIComponent(studentId)}&age=${ageGroup}`}>OUTRA MÚSICA</Link></div></section>}

 const toolbar=<><button data-active={mode==="learn"} onClick={()=>resetSession("learn")}>Aprender</button><button data-active={mode==="practice"} onClick={()=>resetSession("practice")}>Praticar</button><button data-active={mode==="perform"} onClick={()=>resetSession("perform")}>Tocar inteira</button>{isGrand&&<><span className={styles.separator}/><button data-active={hand==="right"} onClick={()=>setHand("right")}>Mão direita</button><button data-active={hand==="left"} onClick={()=>setHand("left")}>Mão esquerda</button><button data-active={hand==="both"} onClick={()=>setHand("both")}>Duas mãos</button></>}<span className={styles.separator}/><select value={tempo} onChange={(e:{target:{value:string}})=>setTempo(Number(e.target.value) as Tempo)}><option value={60}>60%</option><option value={75}>75%</option><option value={100}>100%</option></select><button data-active={metronome} onClick={()=>setMetronome(v=>!v)}>♩ Metrónomo</button><button disabled={listening} onClick={()=>void listen()}>{listening?"A tocar…":"▶ Ouvir"}</button></>;
 const pianoHint=isGrand&&input==="microphone"&&hand==="both"?"Microfone assistido: toque as notas do acorde/evento uma a uma. Para simultaneidade real, use MIDI ou tela.":message;
 const status=isGrand?`${grandIndex+1}/${Math.max(1,grandEvents.length)} · ${accuracy}%`:`${mode==="perform"?"Completa":`${sectionIndex+1}/${sections.length}`} · ${accuracy}%`;
 return <LearningPlayer backHref={`/musicas?student=${encodeURIComponent(studentId)}&age=${ageGroup}`} eyebrow={isGrand?"PARTITURA · DUAS MÃOS":mode==="perform"?"TOCAR INTEIRA":"MODO MÚSICA"} title={song.title} progress={progress} status={status} toolbar={toolbar} tone="song" piano={{input,onInputChange:setInput,onExternalNote:externalPress,onPress:screenPress,onBlackPress:blackPress,expected:expectedDisplay,wrong,octaves:3,startOctave:3,showLabels:mode!=="perform",blackKeysInteractive:true,hint:pianoHint}}>
   <div className={styles.stage}>
     <header className={styles.instruction}><div><small>{input==="screen"?"TOQUE NO PIANO":input==="midi"?"MIDI ATIVO":"MICROFONE ATIVO"}</small><h2>{message}</h2></div><div className={styles.now}><span>AGORA</span><strong>{isGrand?(remainingGrand.length?remainingGrand.join(" + "):"✓"):(expectedNormal?mode==="perform"?"♪":`${noteName(expectedNormal)}${strict?noteOctave(expectedNormal):""}`:"✓")}</strong></div></header>
     <div className={styles.scoreArea}>{isGrand?<GrandStaffScore events={song.scoreEvents??[]} currentIndex={grandCurrent?.sourceIndex??0} hand={hand} wrong={Boolean(wrong)} timeSignature={song.timeSignature??"4/4"}/>:<MusicScore notes={sequence} currentIndex={noteIndex} wrongIndex={wrong?noteIndex:null} timeSignature={song.timeSignature??"4/4"} hideLabels={mode==="perform"}/>}</div>
     <div className={styles.storyStrip}><span>{song.emoji}</span><div><small>{activeSection?.label??"Música"}</small><strong>{isGrand?hand==="both"?"Coordene as duas pautas sem correr.":"Construa esta mão antes de juntar as duas.":song.subtitle}</strong></div><i style={{width:`${progress}%`}}/></div>
   </div>
 </LearningPlayer>
}
