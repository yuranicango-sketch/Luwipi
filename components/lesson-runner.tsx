"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { LearningPlayer } from "@/components/learning-player";
import { LessonVisual } from "@/components/lesson-visual";
import type { LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";
import type { DetectedPianoNote, PianoInputSource } from "@/components/piano-input";
import type { AgeGroup } from "@/lib/curriculum";
import type { CurriculumVariant, EnhancedLesson, EnhancedModule } from "@/lib/curriculum-v3";
import { completeLesson, readCurriculumProgress, saveLessonStep, type MasteryState } from "@/lib/curriculum-progress";
import { buildLessonSteps } from "@/lib/lesson-engine";
import { getSong, noteName, noteOctave } from "@/lib/music-library";
import { playPercussionClick, playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./lesson-runner.module.css";

type Props={age:AgeGroup;module:EnhancedModule;lesson:EnhancedLesson;variant:CurriculumVariant;studentId:string};
type Kind="note"|"piano"|"rhythm"|"listen"|"physical";
type ListenMode="pitch"|"dynamics"|"generic";
const NATURAL=/(Dó|Ré|Mi|Fá|Sol|Lá|Si)/;

function classify(action:string):{kind:Kind;expected?:string;listenMode?:ListenMode}{
 const expected=action.match(NATURAL)?.[1];
 if(expected&&/(toqu|encontr|tecla|nota|piano)/i.test(action))return{kind:"note",expected};
 if(/(ritmo|pulso|palma|tambor|batid|compasso|tempo)/i.test(action))return{kind:"rhythm"};
 if(/(grave|agudo)/i.test(action))return{kind:"listen",listenMode:"pitch"};
 if(/(forte|suave|intensidade|dinâmic)/i.test(action))return{kind:"listen",listenMode:"dynamics"};
 if(/(escut|ouç|ouvir|som)/i.test(action))return{kind:"listen",listenMode:"generic"};
 if(/(piano|tecla|toqu|tocar|dedo|mão|acorde|escala)/i.test(action))return{kind:"piano"};
 return{kind:"physical"};
}
function pitchMatches(pitch:string,expected:string){return /[3-6]$/.test(expected)?pitch===expected:noteName(pitch)===noteName(expected)}

export function LessonRunner({age,module,lesson,variant,studentId}:Props){
 const router=useRouter();
 const steps=useMemo(()=>buildLessonSteps({age,module,lesson,variant}),[age,module,lesson,variant]);
 const[stepIndex,setStepIndex]=useState(0),[actionIndex,setActionIndex]=useState(0),[mastery,setMastery]=useState<MasteryState>(null),[showGuide,setShowGuide]=useState(false);
 const[input,setInput]=useState<PianoInputSource>("screen"),[message,setMessage]=useState("Vamos descobrir."),[wrong,setWrong]=useState<string|null>(null),[done,setDone]=useState(false),[taps,setTaps]=useState(0),[heard,setHeard]=useState<string|null>(null),[songIndex,setSongIndex]=useState(0);
 const step=steps[stepIndex],actionCount=Math.max(1,step.actions.length),currentAction=step.actions[Math.min(actionIndex,actionCount-1)]??"Explore esta ideia com a criança.";
 const spec=useMemo(()=>classify(currentAction),[currentAction]);
 const lessonSong=step.songId?getSong(step.songId):undefined,isRepertoire=Boolean(lessonSong&&step.id==="repertoire");
 const repertoireNotes=useMemo(()=>isRepertoire?(lessonSong?.sections?.[0]?.notes??lessonSong?.sequence?.slice(0,8)??[]):[],[isRepertoire,lessonSong]);
 const repertoireExpected=repertoireNotes[songIndex];
 const isLastAction=actionIndex>=actionCount-1,isLastStep=stepIndex>=steps.length-1;
 const total=steps.reduce((sum,item)=>sum+Math.max(1,item.actions.length),0),complete=steps.slice(0,stepIndex).reduce((sum,item)=>sum+Math.max(1,item.actions.length),0)+actionIndex;
 const percent=Math.round(complete/Math.max(1,total)*100);
 const expected=isRepertoire?repertoireExpected:spec.kind==="note"?spec.expected:undefined;

 useEffect(()=>{const saved=readCurriculumProgress(studentId,age)[String(lesson.number)];if(!saved||saved.completed)return;const safe=Math.max(0,Math.min(steps.length-1,saved.step??0));setStepIndex(safe);setActionIndex(Math.max(0,Math.min(Math.max(0,steps[safe].actions.length-1),saved.action??0)))},[studentId,age,lesson.number,steps]);
 useEffect(()=>{setMessage(age==="2-4"?"Vamos experimentar!":"Faça a missão e escute o resultado.");setWrong(null);setDone(false);setTaps(0);setHeard(null);setSongIndex(0);void preloadPianoSamples()},[stepIndex,actionIndex,currentAction,age]);

 function go(nextStep:number,nextAction=0){const s=Math.max(0,Math.min(steps.length-1,nextStep)),a=Math.max(0,Math.min(Math.max(0,steps[s].actions.length-1),nextAction));setStepIndex(s);setActionIndex(a);setMastery(null);saveLessonStep(studentId,age,lesson.number,s,a)}
 function next(){if(!isLastAction)return go(stepIndex,actionIndex+1);if(!isLastStep)return go(stepIndex+1,0);setShowGuide(true)}
 function previous(){if(actionIndex>0)return go(stepIndex,actionIndex-1);if(stepIndex>0)return go(stepIndex-1,Math.max(0,steps[stepIndex-1].actions.length-1))}
 function finish(){if(!mastery)return;completeLesson(studentId,age,lesson.number,mastery);router.push(`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}&current=${Math.min(48,lesson.number+1)}`)}
 function success(text:string){setDone(true);setWrong(null);setMessage(text)}
 function receive(pitch:string){
   if(isRepertoire){if(!repertoireExpected)return;if(!pitchMatches(pitch,repertoireExpected)){setWrong(pitch);setMessage(`Quase. Procure ${noteName(repertoireExpected)}.`);window.setTimeout(()=>setWrong(null),380);return}if(songIndex+1>=repertoireNotes.length){setSongIndex(v=>v+1);success("🌟 A frase musical ficou completa!")}else{setSongIndex(v=>v+1);setMessage("✓ Certo. Continue a frase.")}return}
   if(spec.kind==="note"&&spec.expected){if(!pitchMatches(pitch,spec.expected)){setWrong(pitch);setMessage(`Quase. Procure ${spec.expected}.`);window.setTimeout(()=>setWrong(null),380);return}success("✓ Encontrou a nota certa!");return}
   if(spec.kind==="piano"){setHeard(pitch);success(`✓ Ouvi ${pitch}. Continue a explorar.`)}
 }
 function screenPress(key:LuwipiPianoKey){if(input==="screen")receive(key.pitch)}
 function blackPress(pitch:string){if(input==="screen")receive(pitch)}
 function externalPress(note:DetectedPianoNote){if(input!=="screen"&&note.source===input)receive(note.pitch)}
 async function tap(){await playPercussionClick({frequency:taps===0?174:136,gain:.2});const n=Math.min(4,taps+1);setTaps(n);if(n>=4)success("✓ Pulso firme! Quatro batidas juntas.");else setMessage(`${n}/4 · continue no mesmo pulso.`)}
 async function listen(option:"a"|"b"){
   if(spec.listenMode==="dynamics"){await playPianoRate(1,{gain:option==="a"?.82:.18,duration:.8});setMessage(option==="a"?"Esse som foi forte.":"Esse som foi suave.");return}
   if(spec.listenMode==="pitch"){await playPianoRate(option==="a"?.5:2,{gain:.55,duration:.8});setMessage(option==="a"?"Esse som vive na região grave.":"Esse som vive na região aguda.");return}
   await playPianoRate(option==="a"?1:Math.pow(2,7/12),{gain:.5,duration:.7});setMessage(option==="a"?"Ouça o primeiro som.":"Compare com o segundo som.")
 }

 const studentContent=isRepertoire?<div className={styles.repertoire}><div className={styles.missionTitle}><span>{lessonSong?.emoji}</span><div><small>MÚSICA DA AULA</small><h2>{lessonSong?.title}</h2></div></div>{age==="2-4"?<div className={styles.kidSequence}>{repertoireNotes.map((note,index)=><span key={`${note}-${index}`} data-done={index<songIndex} data-active={index===songIndex}>♪</span>)}</div>:<MusicScore notes={repertoireNotes} currentIndex={Math.min(songIndex,Math.max(0,repertoireNotes.length-1))} wrongIndex={wrong?Math.min(songIndex,repertoireNotes.length-1):null} timeSignature={lessonSong?.timeSignature??"4/4"}/>}<p>{done?"Conseguimos tocar a frase.":"Toque a frase. O cursor só anda quando a nota estiver certa."}</p></div>
 :spec.kind==="rhythm"?<div className={styles.rhythm}><button type="button" onClick={()=>void tap()}><span>🥁</span><strong>TOQUE NO PULSO</strong><i>{[0,1,2,3].map(n=><em key={n} data-on={n<taps}/>)}</i></button><p>{message}</p></div>
 :spec.kind==="listen"?<div className={styles.listen}><header><small>OUVIR E DESCOBRIR</small><h2>{message}</h2></header><div><button onClick={()=>void listen("a")}><span>{spec.listenMode==="dynamics"?"🦁":spec.listenMode==="pitch"?"🐘":"①"}</span><b>{spec.listenMode==="dynamics"?"FORTE":spec.listenMode==="pitch"?"GRAVE":"SOM A"}</b></button><button onClick={()=>void listen("b")}><span>{spec.listenMode==="dynamics"?"🐇":spec.listenMode==="pitch"?"🐦":"②"}</span><b>{spec.listenMode==="dynamics"?"SUAVE":spec.listenMode==="pitch"?"AGUDO":"SOM B"}</b></button></div><button className={styles.confirm} onClick={()=>success("✓ Já ouvimos e comparamos.")}>{done?"✓ DESCOBRIMOS":"JÁ DESCOBRIMOS"}</button></div>
 :<div className={styles.discovery}><div className={styles.visual}><LessonVisual stepId={step.id} icon={step.icon} title={step.title} age={age} accent={module.accent} instruction={currentAction}/></div><div className={styles.mission}><small>{spec.kind==="note"?"ENCONTRE NO PIANO":spec.kind==="piano"?"EXPERIMENTE NO PIANO":"MISSÃO"}</small><h1>{age==="2-4"&&currentAction.length>75?step.title:currentAction}</h1>{spec.kind==="note"&&<strong className={styles.target}>{spec.expected}</strong>}{heard&&<span className={styles.heard}>Ouvi {heard}</span>}{spec.kind==="physical"&&<button className={styles.confirm} onClick={()=>success("✓ Conseguimos!")}>{done?"✓ FEITO":"CONSEGUIMOS"}</button>}<p>{message}</p></div></div>;

 const ready=done||spec.kind==="physical"||spec.kind==="listen";
 const controls=<div className={styles.navControls}><button onClick={previous} disabled={stepIndex===0&&actionIndex===0}>←</button><span>{stepIndex+1}.{actionIndex+1}</span><button data-ready={ready} onClick={next}>{isLastStep&&isLastAction?"Terminar":"Próximo →"}</button></div>;
 const teacherButton=<button type="button" onClick={()=>setShowGuide(true)}>PROFESSOR</button>;
 return <>
 <LearningPlayer backHref={`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}`} eyebrow={`AULA ${lesson.number} · ${step.title}`} title={lesson.title} progress={percent} status={`${stepIndex+1}/${steps.length}`} action={teacherButton} tone="lesson" piano={{input,onInputChange:setInput,onExternalNote:externalPress,onPress:screenPress,onBlackPress:blackPress,expected:done?undefined:expected,wrong,octaves:age==="2-4"?2:3,startOctave:age==="2-4"?4:3,showLabels:age!=="2-4",blackKeysInteractive:true,hint:isRepertoire?message:spec.kind==="note"?message:spec.kind==="piano"?message:"O piano fica disponível durante toda a aula."}}>
   <div className={styles.stage} style={{"--accent":module.accent,"--soft":module.surface} as CSSProperties}><div className={styles.student}>{studentContent}</div><aside className={styles.observation}><span>◉</span><div><small>PROFESSOR OBSERVA</small><strong>{step.childDoes}</strong></div>{controls}</aside></div>
 </LearningPlayer>
 {showGuide&&<div className={styles.overlay} onClick={()=>setShowGuide(false)}><aside className={styles.guide} onClick={(e:{stopPropagation:()=>void})=>e.stopPropagation()}><button className={styles.close} onClick={()=>setShowGuide(false)}>×</button><small>GUIA DO PROFESSOR</small><h2>{step.title}</h2><p className={styles.goal}>{step.goal}</p><div><b>DIGA ASSIM</b><p>{step.say?`“${step.say}”`:currentAction}</p></div>{step.example&&<div><b>EXEMPLO</b><p>{step.example}</p></div>}{step.tip&&<div><b>DICA PEDAGÓGICA</b><p>{step.tip}</p></div>}<div><b>OBSERVE</b><p>{step.childDoes}</p><p>Avance quando: {step.success}</p></div>{step.actionHref&&step.actionLabel&&<Link href={step.actionHref}>{step.actionLabel}</Link>}{isLastStep&&isLastAction&&<section className={styles.mastery}><h3>Como terminou a aula?</h3><button data-selected={mastery==="mastered"} onClick={()=>setMastery("mastered")}>★★★ Conseguiu com segurança</button><button data-selected={mastery==="reinforce"} onClick={()=>setMastery("reinforce")}>★★☆ Precisa reforçar</button><button className={styles.finishButton} disabled={!mastery} onClick={finish}>CONCLUIR AULA</button></section>}</aside></div>}
 </>
}
