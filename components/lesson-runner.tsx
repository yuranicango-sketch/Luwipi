"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { GrandStaffScore } from "@/components/grand-staff-score";
import { LearningPlayer } from "@/components/learning-player";
import { LivingLessonWorld } from "@/components/living-lesson-world";
import { LessonMiniGame, type LessonNoteEvent } from "@/components/lesson-mini-game";
import { LessonScene } from "@/components/lesson-scene";
import type { LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import type { DetectedPianoNote, PianoInputSource } from "@/components/piano-input";
import type { AgeGroup } from "@/lib/curriculum";
import type { CurriculumVariant, EnhancedLesson, EnhancedModule, EnhancedProgram } from "@/lib/curriculum-v3";
import { completeLesson, readCurriculumProgress, saveLessonStep, type MasteryState } from "@/lib/curriculum-progress";
import { buildLessonSteps } from "@/lib/lesson-engine";
import { experienceForStep, getLessonExperience, getVariantExperiencePolicy, lessonPitchChallenge } from "@/lib/lesson-experience";
import { getSong, noteName, noteOctave } from "@/lib/music-library";
import { recordLearningSession } from "@/lib/learning-client";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./lesson-runner.module.css";

type Props={
 age:AgeGroup;
 program:EnhancedProgram;
 module:EnhancedModule;
 lesson:EnhancedLesson;
 variant:CurriculumVariant;
 studentId:string;
 maxLesson?:number;
 onLocked:()=>void;
 onOpenMap:()=>void;
 onNavigateLesson:(lesson:number)=>void;
 onCompleted:(next?:number)=>void;
 onExit:()=>void;
};

function pitchMatches(pitch:string,expected:string){return /[3-6]$/.test(expected)?pitch===expected:noteName(pitch)===noteName(expected)}
function grandEvents(notes:string[]){return notes.map(note=>noteOctave(note)<=3?{left:[note]}:{right:[note]})}
function pause(ms:number){return new Promise<void>(resolve=>window.setTimeout(resolve,ms))}

export function LessonRunner({age,program,module,lesson,variant,studentId,maxLesson=48,onLocked,onOpenMap,onNavigateLesson,onCompleted,onExit}:Props){
 const steps=useMemo(()=>buildLessonSteps({age,module,lesson,variant}),[age,module,lesson,variant]);
 const baseExperience=useMemo(()=>getLessonExperience(age,lesson.number),[age,lesson.number]);
 const[stepIndex,setStepIndex]=useState(0),[actionIndex,setActionIndex]=useState(0),[mastery,setMastery]=useState<MasteryState>(null),[showGuide,setShowGuide]=useState(false),[showCompletion,setShowCompletion]=useState(false);
 const[input,setInput]=useState<PianoInputSource>("screen"),[message,setMessage]=useState("Comece a missão."),[wrong,setWrong]=useState<string|null>(null),[done,setDone]=useState(false);
 const[taps,setTaps]=useState(0),[listenSeen,setListenSeen]=useState<string[]>([]),[freeNotes,setFreeNotes]=useState(0),[songIndex,setSongIndex]=useState(0),[songHits,setSongHits]=useState<string[]>([]),[gameExpected,setGameExpected]=useState<string|string[]|undefined>(undefined),[noteEvent,setNoteEvent]=useState<LessonNoteEvent|null>(null);
 const[sessionCorrect,setSessionCorrect]=useState(0),[sessionMistakes,setSessionMistakes]=useState(0);
 const sessionStartedAt=useRef(Date.now()),sessionRecorded=useRef(false);

 const step=steps[stepIndex];
 const sceneExperience=useMemo(()=>{
   const experience=experienceForStep(baseExperience,step.id,Boolean(step.gameId),Boolean(step.songId));
   if(age==="2-4"&&lesson.number===1){
     if(step.id==="arrive")return{...experience,kind:"story" as const,visualKey:"piano-world"};
     if(step.id==="story")return{...experience,kind:"contrast" as const,visualKey:"high-low"};
     if(step.id==="mission")return{...experience,kind:"contrast" as const,visualKey:"sound-homes"};
     if(step.songId)return{...experience,kind:"song" as const,visualKey:"star-song"};
   }
   return experience;
 },[baseExperience,step.id,step.gameId,step.songId,age,lesson.number]);
 const policy=useMemo(()=>getVariantExperiencePolicy(variant.id,sceneExperience.kind),[variant.id,sceneExperience.kind]);
 const rawActionCount=Math.max(1,step.actions.length);
 const actionCount=step.gameId||step.songId?1:sceneExperience.gate==="teacher"?1:Math.max(1,Math.min(rawActionCount,policy.repetitions));
 const currentAction=step.actions[Math.min(actionIndex,rawActionCount-1)]??step.title;
 const challenge=useMemo(()=>lessonPitchChallenge(age,lesson.number),[age,lesson.number]);
 const challengeExpected=challenge.length?challenge[(stepIndex+actionIndex)%challenge.length]:undefined;

 const lessonSong=step.songId?getSong(step.songId):undefined;
 const repertoireNotes=useMemo(()=>{
   if(!lessonSong)return[];
   const all=lessonSong.sections?.[0]?.notes??lessonSong.sequence??[];
   if(age!=="2-4")return all.slice(0,Math.min(8,all.length));
   const phase=((lesson.number-1)%8)+1;
   return all.slice(0,Math.min(all.length,Math.max(3,phase+1)));
 },[lessonSong,age,lesson.number]);
 const grandSongEvents=useMemo(()=>lessonSong?.grandStaff&&lessonSong.scoreEvents?.length?lessonSong.scoreEvents.slice(0,Math.min(6,lessonSong.scoreEvents.length)):[],[lessonSong]);
 const grandSongEvent=grandSongEvents[songIndex];
 const grandSongExpected=grandSongEvent?[...(grandSongEvent.left??[]),...(grandSongEvent.right??[])]:[];
 const grandSongRemaining=grandSongExpected.filter(item=>!songHits.includes(item));
 const repertoireExpected=repertoireNotes[songIndex];

 const isLastAction=actionIndex>=actionCount-1,isLastStep=stepIndex>=steps.length-1;
 const total=steps.reduce((sum,item)=>{
   const exp=experienceForStep(baseExperience,item.id,Boolean(item.gameId),Boolean(item.songId));
   const p=getVariantExperiencePolicy(variant.id,exp.kind);
   const count=item.gameId||item.songId?1:exp.gate==="teacher"?1:Math.max(1,Math.min(Math.max(1,item.actions.length),p.repetitions));
   return sum+count;
 },0);
 const completeBefore=steps.slice(0,stepIndex).reduce((sum,item)=>{
   const exp=experienceForStep(baseExperience,item.id,Boolean(item.gameId),Boolean(item.songId));
   const p=getVariantExperiencePolicy(variant.id,exp.kind);
   return sum+(item.gameId||item.songId?1:exp.gate==="teacher"?1:Math.max(1,Math.min(Math.max(1,item.actions.length),p.repetitions)));
 },0)+actionIndex;
 const percent=Math.round(completeBefore/Math.max(1,total)*100);

 const expected=step.gameId?gameExpected:step.songId?(grandSongEvents.length?grandSongRemaining:repertoireExpected):(sceneExperience.gate==="piano"||sceneExperience.gate==="score"?challengeExpected:undefined);
 const nextLessonNumber=lesson.number<48?lesson.number+1:undefined;
 const nextLesson=nextLessonNumber?program.modules.flatMap(item=>item.lessons).find(item=>item.number===nextLessonNumber):undefined;

 useEffect(()=>{
   const saved=readCurriculumProgress(studentId,age)[String(lesson.number)];
   if(!saved||saved.completed)return;
   const safe=Math.max(0,Math.min(steps.length-1,saved.step??0));
   setStepIndex(safe);
   const item=steps[safe],exp=experienceForStep(baseExperience,item.id,Boolean(item.gameId),Boolean(item.songId)),p=getVariantExperiencePolicy(variant.id,exp.kind);
   const count=item.gameId||item.songId?1:exp.gate==="teacher"?1:Math.max(1,Math.min(Math.max(1,item.actions.length),p.repetitions));
   setActionIndex(Math.max(0,Math.min(count-1,saved.action??0)));
 },[studentId,age,lesson.number,steps,baseExperience,variant.id]);

 useEffect(()=>{
   setMessage(studentPrompt());
   setWrong(null);setDone(false);setTaps(0);setListenSeen([]);setFreeNotes(0);setSongIndex(0);setSongHits([]);setGameExpected(undefined);setNoteEvent(null);
   void preloadPianoSamples();
 },[stepIndex,actionIndex,step.id,lesson.number]);

 function studentPrompt(){
   if(step.gameId)return "Complete a missão sem sair da aula.";
   if(step.songId)return age==="2-4"?"Vamos tocar este pedacinho da música.":"Leia e toque a frase. O cursor espera.";
   if(sceneExperience.gate==="rhythm")return "Mantenha o pulso até completar a sequência.";
   if(sceneExperience.gate==="listen"||sceneExperience.gate==="choice")return "Ouça primeiro. Depois compare.";
   if(sceneExperience.gate==="score")return "Leia o que aparece e encontre no piano.";
   if(sceneExperience.gate==="piano")return challengeExpected?`Encontre ${noteName(challengeExpected)} no piano.`:"Experimente esta ideia no piano.";
   if(sceneExperience.gate==="free")return "Crie uma resposta no piano.";
   return age==="2-4"?step.title:(step.say??step.title);
 }

 function go(nextStep:number,nextAction=0){
   const s=Math.max(0,Math.min(steps.length-1,nextStep)),item=steps[s];
   const exp=experienceForStep(baseExperience,item.id,Boolean(item.gameId),Boolean(item.songId)),p=getVariantExperiencePolicy(variant.id,exp.kind);
   const count=item.gameId||item.songId?1:exp.gate==="teacher"?1:Math.max(1,Math.min(Math.max(1,item.actions.length),p.repetitions));
   const a=Math.max(0,Math.min(count-1,nextAction));
   setStepIndex(s);setActionIndex(a);setMastery(null);saveLessonStep(studentId,age,lesson.number,s,a);
 }
 function next(){
   if(!done)return;
   if(!isLastAction)return go(stepIndex,actionIndex+1);
   if(!isLastStep)return go(stepIndex+1,0);
   setShowCompletion(true);
 }
 function previous(){if(actionIndex>0)return go(stepIndex,actionIndex-1);if(stepIndex>0)return go(stepIndex-1,0)}
 function markDone(text="Conseguimos. Pode continuar."){setDone(true);setWrong(null);setMessage(text)}
 function registerCorrect(count=1){setSessionCorrect(value=>value+count)}
 function registerMistake(count=1){setSessionMistakes(value=>value+count)}
 function persistLessonSession(finalMastery:Exclude<MasteryState,null>){
   if(sessionRecorded.current)return;sessionRecorded.current=true;
   const attempts=sessionCorrect+sessionMistakes,accuracy=attempts?Math.round(sessionCorrect/attempts*100):(finalMastery==="mastered"?100:68);
   void recordLearningSession({
     studentId,ageGroup:age,sessionType:"lesson",lessonNumber:lesson.number,contentId:`lesson-${lesson.number}`,
     source:input,attempts,correct:sessionCorrect,mistakes:sessionMistakes,accuracy,
     stars:finalMastery==="mastered"?3:2,durationSeconds:Math.max(1,Math.round((Date.now()-sessionStartedAt.current)/1000)),
     startedAt:new Date(sessionStartedAt.current).toISOString(),metadata:{mastery:finalMastery,variant:variant.id,chapter:baseExperience.chapter},
   });
 }
 function finishLesson(next?:number){
   if(!mastery)return;
   persistLessonSession(mastery);
   completeLesson(studentId,age,lesson.number,mastery);
   setShowCompletion(false);
   onCompleted(next);
   if(next&&next>maxLesson){onLocked();return}
   if(next)onNavigateLesson(next);else onExit();
 }
 function emitPitch(pitch:string){
   setNoteEvent(prev=>({id:(prev?.id??0)+1,pitch}));
   if(step.gameId)return;
   if(step.songId){
     if(grandSongEvents.length){
       if(!grandSongEvent)return;
       if(!grandSongExpected.includes(pitch)){registerMistake();setWrong(pitch);setMessage("Veja as notas que estão dentro do cursor.");window.setTimeout(()=>setWrong(null),380);return}
       if(songHits.includes(pitch))return;
       registerCorrect();const nextHits=[...songHits,pitch];setSongHits(nextHits);setWrong(null);
       if(grandSongExpected.every(item=>nextHits.includes(item))){
         setSongHits([]);
         if(songIndex+1>=grandSongEvents.length){setSongIndex(v=>v+1);markDone("As duas mãos chegaram juntas ao fim da frase.")}
         else{setSongIndex(v=>v+1);setMessage("Certo. O próximo encontro já está à espera.")}
       }else setMessage(`Boa. Falta ${grandSongExpected.length-nextHits.length} ${grandSongExpected.length-nextHits.length===1?"nota":"notas"}.`);
       return;
     }
     if(!repertoireExpected)return;
     if(!pitchMatches(pitch,repertoireExpected)){registerMistake();setWrong(pitch);setMessage(`Quase. Procure ${noteName(repertoireExpected)}.`);window.setTimeout(()=>setWrong(null),380);return}
     registerCorrect();setWrong(null);
     if(songIndex+1>=repertoireNotes.length){setSongIndex(v=>v+1);markDone("A frase ficou completa.")}
     else{setSongIndex(v=>v+1);setMessage("Certo. Continue a frase.")}
     return;
   }
   if(sceneExperience.gate==="piano"||sceneExperience.gate==="score"){
     if(challengeExpected&&!pitchMatches(pitch,challengeExpected)){registerMistake();setWrong(pitch);setMessage(`Procure ${noteName(challengeExpected)}.`);window.setTimeout(()=>setWrong(null),380);return}
     registerCorrect();markDone(challengeExpected?"Encontrou.":"Boa resposta no piano.");
     return;
   }
   if(sceneExperience.gate==="free"){
     registerCorrect();const count=freeNotes+1;setFreeNotes(count);
     if(count>=policy.repetitions)markDone("A tua resposta musical ficou pronta.");else setMessage(`${count}/${policy.repetitions} · escolha outro som.`);
   }
 }
 function screenPress(key:LuwipiPianoKey){if(input==="screen")emitPitch(key.pitch)}
 function blackPress(pitch:string){if(input==="screen")emitPitch(pitch)}
 function externalPress(note:DetectedPianoNote){if(input!=="screen"&&note.source===input)emitPitch(note.pitch)}
 const handleGameExpected=useCallback((value:string|string[]|undefined)=>setGameExpected(value),[]);
 const handleGameMessage=useCallback((value:string)=>setMessage(value),[]);
 const handleGameComplete=useCallback(()=>{registerCorrect();markDone("Missão concluída. Continue a aula.")},[]);

 async function rhythmTap(){
   await playPercussionClick({frequency:taps===0?176:136,gain:.2});
   const target=sceneExperience.visualKey==="three-four"?3:4,n=taps+1;
   if(n>=target){registerCorrect();setTaps(target);markDone("Pulso completo.")}
   else{setTaps(n);setMessage(`${n}/${target} · mantenha o mesmo espaço entre as batidas.`)}
 }
 async function compare(which:"a"|"b"){
   const key=sceneExperience.visualKey;
   if(key==="loud-soft"||lesson.number===37)await playPianoRate(1,{gain:which==="a"?.82:.18,duration:.8});
   else if(key==="long-short")await playPianoRate(1,{gain:.52,duration:which==="a"?1.2:.2});
   else if(key==="tempo"){for(let i=0;i<4;i++){await playPercussionClick({frequency:i===0?176:136,gain:.16});await pause(which==="a"?560:230)}}
   else if(key==="intervals"){await playPianoRate(1,{gain:.48,duration:.42});await pause(100);await playPianoRate(which==="a"?Math.pow(2,2/12):Math.pow(2,7/12),{gain:.48,duration:.55});}
   else await playPianoRate(which==="a"?.5:2,{gain:.52,duration:.78});
   const next=[...new Set([...listenSeen,which])];setListenSeen(next);
   setMessage(next.length>=2?"Já ouviu os dois exemplos. Compare e continue.":"Agora ouça o outro exemplo.");
   if(next.length>=2){if(!done)registerCorrect();setDone(true);}
 }

 const childPrompt=studentPrompt();
 const noteChallenge=challenge.length?challenge:[challengeExpected].filter(Boolean) as string[];
 const scoreIndex=challenge.length?Math.max(0,(stepIndex+actionIndex)%challenge.length):0;
 const teacherValidate=<button className={styles.validate} onClick={()=>markDone("Professor validou esta cena.")}>{done?"VALIDADO":"PROFESSOR: CONSEGUIMOS"}</button>;

 let content;
 if(step.gameId){
   content=<LessonMiniGame gameId={step.gameId} noteEvent={noteEvent} onComplete={handleGameComplete} onExpectedChange={handleGameExpected} onMessage={handleGameMessage}/>;
 }else if(step.songId&&lessonSong){
   content=<section className={styles.songScene} data-age={age}><LivingLessonWorld age={age} lessonNumber={lesson.number} experience={sceneExperience} reaction={wrong?"wrong":done?"success":"idle"}/><div className={styles.worldPanel}><header><small>{grandSongEvents.length?"MÚSICA · DUAS MÃOS":"MÚSICA DENTRO DA AULA"}</small><h2>{lessonSong.title}</h2><p>{message}</p></header>{grandSongEvents.length?<GrandStaffScore events={grandSongEvents} currentIndex={Math.min(songIndex,Math.max(0,grandSongEvents.length-1))} hand="both" wrong={Boolean(wrong)} timeSignature={lessonSong.timeSignature??"4/4"}/>:age==="2-4"?<div className={styles.youngSequence}>{repertoireNotes.map((note,index)=><span key={`${note}-${index}`} data-done={index<songIndex} data-active={index===songIndex}><b>{index+1}</b></span>)}</div>:<MusicScore notes={repertoireNotes} currentIndex={Math.min(songIndex,Math.max(0,repertoireNotes.length-1))} wrongIndex={wrong?Math.min(songIndex,repertoireNotes.length-1):null} timeSignature={lessonSong.timeSignature??"4/4"} hideLabels={!policy.readingLabels}/>}<strong className={styles.sceneMessage}>{message}</strong></div></section>;
 }else if((sceneExperience.kind==="staff"||sceneExperience.kind==="grand-staff")&&noteChallenge.length){
   content=<section className={styles.scoreScene} data-age={age}><LivingLessonWorld age={age} lessonNumber={lesson.number} experience={sceneExperience} reaction={wrong?"wrong":done?"success":"idle"}/><div className={styles.worldPanel}><header><small>{sceneExperience.kind==="grand-staff"?"DUAS CLAVES · UM MAPA":"LER PARA TOCAR"}</small><h2>{childPrompt}</h2></header><div className={styles.scoreBox}>{sceneExperience.kind==="grand-staff"?<GrandStaffScore events={grandEvents(noteChallenge)} currentIndex={scoreIndex} hand="both" wrong={Boolean(wrong)}/>:<MusicScore notes={noteChallenge} currentIndex={scoreIndex} wrongIndex={wrong?scoreIndex:null} hideLabels={!policy.readingLabels}/>}</div><strong className={styles.sceneMessage}>{message}</strong></div></section>;
 }else if(sceneExperience.gate==="rhythm"){
   content=<section className={styles.rhythmScene}><LessonScene age={age} lessonNumber={lesson.number} experience={sceneExperience} title={step.title} instruction={childPrompt} reaction={wrong?"wrong":done?"success":"idle"}/><button className={styles.rhythmPad} onClick={()=>void rhythmTap()}><strong>TOQUE NO PULSO</strong><div>{[0,1,2,3].map(i=><i key={i} data-on={i<taps}/>)}</div></button></section>;
 }else if(sceneExperience.gate==="listen"||sceneExperience.gate==="choice"){
   content=<section className={styles.compareScene}><LessonScene age={age} lessonNumber={lesson.number} experience={sceneExperience} title={step.title} instruction={childPrompt}/><div className={styles.compareButtons}><button onClick={()=>void compare("a")}><span>A</span><strong>{sceneExperience.visualKey==="loud-soft"?"FORTE":sceneExperience.visualKey==="long-short"?"LONGO":sceneExperience.visualKey==="tempo"?"DEVAGAR":sceneExperience.visualKey==="intervals"?"PERTO":["high-low","sound-homes"].includes(sceneExperience.visualKey)?"GRAVE":"OPÇÃO A"}</strong></button><button onClick={()=>void compare("b")}><span>B</span><strong>{sceneExperience.visualKey==="loud-soft"?"SUAVE":sceneExperience.visualKey==="long-short"?"CURTO":sceneExperience.visualKey==="tempo"?"RÁPIDO":sceneExperience.visualKey==="intervals"?"LONGE":["high-low","sound-homes"].includes(sceneExperience.visualKey)?"AGUDO":"OPÇÃO B"}</strong></button></div></section>;
 }else{
   content=<section className={styles.conceptScene}><LessonScene age={age} lessonNumber={lesson.number} experience={sceneExperience} title={step.title} instruction={childPrompt} expected={typeof expected==="string"?expected:undefined} reaction={wrong?"wrong":done?"success":"idle"}/><div className={styles.missionBar}><div><small>{sceneExperience.gate==="teacher"?"PROFESSOR VALIDA":sceneExperience.gate==="free"?"CRIE NO PIANO":"TOQUE NO PIANO"}</small><strong>{message}</strong></div>{sceneExperience.gate==="teacher"?teacherValidate:<span data-done={done}>{done?"PRONTO":expected?noteName(Array.isArray(expected)?expected[0]:expected):`${freeNotes}/${policy.repetitions}`}</span>}</div></section>;
 }

 const controls=<div className={styles.navControls}><button onClick={previous} disabled={stepIndex===0&&actionIndex===0}>←</button><span>{stepIndex+1}.{actionIndex+1}</span><button disabled={!done} data-ready={done} onClick={next}>{isLastStep&&isLastAction?"CONCLUIR":"CONTINUAR →"}</button></div>;
 const actions=<><button type="button" onClick={onOpenMap}>MAPA</button><button type="button" onClick={()=>setShowGuide(true)}>PROFESSOR</button></>;

 return <>
   <LearningPlayer onBack={onOpenMap} eyebrow={`AULA ${lesson.number} · ${sceneExperience.chapter}`} title={lesson.title} progress={percent} status={variant.label} action={actions} tone="lesson" audience={age==="2-4"?"preschool":age==="adult"?"adult":"child"} piano={{input,onInputChange:setInput,onExternalNote:externalPress,onPress:screenPress,onBlackPress:blackPress,expected:done?undefined:expected,wrong,octaves:age==="2-4"?2:3,startOctave:age==="2-4"?4:3,showLabels:policy.showPianoLabels,blackKeysInteractive:true,attentionCue:age==="2-4"&&Boolean(expected)&&!done,hint:message}}>
     <div className={styles.stage} style={{"--accent":module.accent,"--soft":module.surface} as CSSProperties}><div className={styles.student}>{content}</div><aside className={styles.footer}><div><small>{sceneExperience.chapter}</small><strong>{step.title}</strong></div>{controls}</aside></div>
   </LearningPlayer>

   {showGuide&&<div className={styles.overlay} onClick={()=>setShowGuide(false)}><aside className={styles.guide} onClick={e=>e.stopPropagation()}><button className={styles.close} onClick={()=>setShowGuide(false)}>×</button><small>GUIA DO PROFESSOR · {variant.label}</small><h2>{step.title}</h2><p className={styles.goal}>{step.goal}</p><div><b>DIGA ASSIM</b><p>{step.say?`“${step.say}”`:step.title}</p></div><div><b>PASSOS DO PROFESSOR</b>{step.actions.map((item,index)=><p key={index}><strong>{index+1}.</strong> {item}</p>)}</div>{step.example&&<div><b>EXEMPLO</b><p>{step.example}</p></div>}{step.tip&&<div><b>DICA PEDAGÓGICA</b><p>{step.tip}</p></div>}<div><b>OBSERVE</b><p>{step.childDoes}</p><p>Avance quando: {step.success}</p></div>{step.actionHref&&step.actionLabel&&<Link href={step.actionHref}>{step.actionLabel}</Link>}<button className={styles.guideValidate} onClick={()=>{markDone("Professor validou esta cena.");setShowGuide(false)}}>{done?"CENA JÁ VALIDADA":"VALIDAR ESTA CENA"}</button></aside></div>}

   {showCompletion&&<div className={styles.completionOverlay}><section className={styles.completion}>
     <div className={styles.completionMark}><i/><i/><i/></div><small>AULA {lesson.number} CONCLUÍDA</small><h1>{lesson.title}</h1><p>{lesson.objective}</p><div className={styles.lessonProgress}><span style={{width:`${lesson.number/48*100}%`}}/></div><div className={styles.mastery}><b>Professor · como terminou?</b><button data-selected={mastery==="mastered"} onClick={()=>setMastery("mastered")}>★★★ Seguro</button><button data-selected={mastery==="reinforce"} onClick={()=>setMastery("reinforce")}>★★☆ Reforçar depois</button></div>{nextLesson?<div className={styles.nextLesson}><small>PRÓXIMA AVENTURA</small><strong>{nextLesson.number}. {nextLesson.title}</strong><p>{nextLesson.focus}</p><button disabled={!mastery} onClick={()=>finishLesson(nextLesson.number)}>{nextLesson.number>maxLesson?"DESBLOQUEAR PRÓXIMAS AULAS":"CONTINUAR PARA A PRÓXIMA AULA →"}</button></div>:<div className={styles.nextLesson}><small>CICLO COMPLETO</small><strong>48 aulas concluídas</strong><button disabled={!mastery} onClick={()=>finishLesson()}>TERMINAR CICLO</button></div>}<div className={styles.completionActions}><button onClick={onOpenMap}>VER MAPA</button><button disabled={!mastery} onClick={()=>finishLesson()}>TERMINAR SESSÃO</button></div>
   </section></div>}
 </>;
}
