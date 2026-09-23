"use client";

import { LivingLessonWorld } from "@/components/living-lesson-world";
import type { LessonExperience } from "@/lib/lesson-experience";
import { mediaForLesson } from "@/lib/lesson-media";
import styles from "./lesson-scene.module.css";

type Props={
 age:"2-4"|"5-8"|"adult";
 lessonNumber:number;
 experience:LessonExperience;
 title:string;
 instruction:string;
 expected?:string;
 reaction?:"idle"|"success"|"wrong";
};

function KeyboardMap({visualKey,expected}:{visualKey:string;expected?:string}){
 const whites=Array.from({length:14},(_,i)=>i);
 const blackAfter=new Set([0,1,3,4,5,7,8,10,11,12]);
 return <div className={styles.keyboardMap} data-mode={visualKey}>
   <div className={styles.keyPrompt}>{visualKey==="black-groups"?"Encontre o padrão 2 · 3":visualKey==="find-c"?"Procure o Dó junto ao grupo de 2":visualKey==="low-region"?"Explore o lado grave":visualKey==="high-region"?"Explore o lado agudo":"O teclado é um mapa"}</div>
   <div className={styles.miniKeys}>{whites.map((i)=><div key={i} className={styles.miniWhite} data-active={expected?.startsWith(["Dó","Ré","Mi","Fá","Sol","Lá","Si"][i%7]??"")}>{blackAfter.has(i)&&<i/>}</div>)}</div>
   <div className={styles.regions}><span>GRAVE</span><span>MEIO</span><span>AGUDO</span></div>
 </div>;
}

function RhythmScene({visualKey}:{visualKey:string}){
 const count=visualKey==="three-four"?3:4;
 return <div className={styles.rhythmScene}><div className={styles.beats}>{Array.from({length:count},(_,i)=><span key={i} style={{animationDelay:`${i*.18}s`}}><b>{i+1}</b></span>)}</div><strong>{visualKey==="rest"?"O silêncio também ocupa um lugar":visualKey==="eighth-pairs"?"Duas notas dentro de um pulso":visualKey==="tempo"?"O pulso pode andar devagar ou rápido":"Sinta o pulso antes de tocar"}</strong></div>;
}

function StaffScene({grand,visualKey}:{grand:boolean;visualKey:string}){
 return <div className={styles.staffScene} data-grand={grand}>
   <div className={styles.staffBlock}><b className={styles.clef}>𝄞</b>{Array.from({length:5},(_,i)=><i key={i}/>)}
     <span className={styles.staffNote} style={{left:"54%",top:visualKey==="treble"?"48%":"56%"}}/>
   </div>
   {grand&&<div className={styles.staffBlock}><b className={styles.clef}>𝄢</b>{Array.from({length:5},(_,i)=><i key={i}/>)}
     <span className={styles.staffNote} style={{left:"46%",top:visualKey==="middle-c"?"12%":"47%"}}/>
   </div>}
   <strong>{visualKey==="middle-c"?"O Dó central liga as duas mãos":visualKey==="treble"?"A clave de Sol organiza a mão direita":visualKey==="bass"?"A clave de Fá organiza a mão esquerda":grand?"Duas claves, um único mapa":"A pauta mostra a direção da música"}</strong>
 </div>;
}

function SequenceScene({visualKey}:{visualKey:string}){
 const n=visualKey==="two-step"?2:visualKey==="three-step"?3:visualKey==="missing-step"?4:5;
 return <div className={styles.sequenceScene}><div>{Array.from({length:n},(_,i)=><span key={i} data-hole={visualKey==="missing-step"&&i===2} style={{animationDelay:`${i*.12}s`}}>{visualKey==="missing-step"&&i===2?"?":i+1}</span>)}</div><strong>{visualKey==="same-different"?"Compare: ficou igual ou mudou?":visualKey==="missing-step"?"Que som completa o caminho?":"Veja a ordem. Depois leve-a para o piano."}</strong></div>;
}

function ListenScene({visualKey}:{visualKey:string}){
 return <div className={styles.listenScene}><div className={styles.soundBars}>{Array.from({length:18},(_,i)=><i key={i} style={{height:`${22+((i*19)%58)}%`,animationDelay:`${i*.04}s`}}/>)}</div><strong>{visualKey==="hidden-sound"?"Ouça primeiro. Procure depois.":visualKey==="three-note-echo"?"Guarde três sons na memória.":visualKey==="sound-order"?"Qual som veio primeiro?":"O ouvido vem antes dos olhos."}</strong></div>;
}

function HarmonyScene({visualKey}:{visualKey:string}){
 return <div className={styles.harmonyScene}><div className={styles.chordStack}><span>Dó</span><span>Mi</span><span>Sol</span></div><div className={styles.intervalTrack}><i/><i/><i/><i/><i/></div><strong>{visualKey==="intervals"?"Veja e ouça a distância entre as notas":visualKey==="cfg"?"Três acordes abrem muitas músicas":"Três notas podem soar como uma unidade"}</strong></div>;
}

function CreationScene({visualKey}:{visualKey:string}){
 return <div className={styles.creationScene}><div>{Array.from({length:4},(_,i)=><span key={i}><small>{i+1}</small><b>{i===0?"COMEÇO":i===3?"FINAL":"IDEIA"}</b></span>)}</div><strong>{visualKey==="four-bars"?"Construa uma ideia em quatro compassos":visualKey==="question-answer"?"Uma frase pergunta. A outra responde.":"Aqui não existe uma única resposta certa."}</strong></div>;
}

function PhotoScene({items}:{items:ReturnType<typeof mediaForLesson>}){
 return <div className={styles.photoGrid} data-count={items.length}>{items.map((item,index)=><figure key={item.src} style={{animationDelay:`${index*.12}s`}}><img src={item.src} alt={item.alt} style={{objectFit:item.fit??"cover"}}/><figcaption>{item.credit}</figcaption></figure>)}</div>;
}

export function LessonScene({age,lessonNumber,experience,title,instruction,expected,reaction="idle"}:Props){
 const media=mediaForLesson(age,lessonNumber,experience.visualKey);
 let visual;
 if(media.length)visual=<PhotoScene items={media}/>;
 else if(["keyboard","movement"].includes(experience.kind))visual=<KeyboardMap visualKey={experience.visualKey} expected={expected}/>;
 else if(experience.kind==="rhythm")visual=<RhythmScene visualKey={experience.visualKey}/>;
 else if(experience.kind==="staff"||experience.kind==="grand-staff")visual=<StaffScene grand={experience.kind==="grand-staff"} visualKey={experience.visualKey}/>;
 else if(experience.kind==="sequence"||experience.kind==="memory")visual=<SequenceScene visualKey={experience.visualKey}/>;
 else if(experience.kind==="listen"||experience.kind==="contrast")visual=<ListenScene visualKey={experience.visualKey}/>;
 else if(experience.kind==="harmony")visual=<HarmonyScene visualKey={experience.visualKey}/>;
 else if(experience.kind==="creation"||experience.kind==="practice")visual=<CreationScene visualKey={experience.visualKey}/>;
 else visual=age==="2-4"&&["story","performance","celebration"].includes(experience.kind)?null:<div className={styles.stageWord}><span>{String(lessonNumber).padStart(2,"0")}</span><strong>{title}</strong><i/></div>;

 return <section className={styles.scene} data-kind={experience.kind} data-reaction={reaction} data-age={age}>
   <LivingLessonWorld age={age} lessonNumber={lessonNumber} experience={experience} reaction={reaction}/>
   {visual&&<div className={styles.activityLayer}><div className={styles.visual}>{visual}</div></div>}
   <div className={styles.caption}><small>{experience.chapter}</small><h2>{title}</h2><p>{instruction}</p></div>
 </section>;
}
