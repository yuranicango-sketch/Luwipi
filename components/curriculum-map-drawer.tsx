"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnhancedProgram, CurriculumVariant } from "@/lib/curriculum-v3";
import { readCurriculumProgress, type CurriculumProgress } from "@/lib/curriculum-progress";
import { getLessonExperience } from "@/lib/lesson-experience";
import styles from "./curriculum-map-drawer.module.css";

type Props={
 open:boolean;
 onClose:()=>void;
 onSelect:(lesson:number)=>void;
 program:EnhancedProgram;
 variant:CurriculumVariant;
 studentId:string;
 currentLesson:number;
 revision?:number;
 maxLesson?:number;
};

export function CurriculumMapDrawer({open,onClose,onSelect,program,variant,studentId,currentLesson,revision=0,maxLesson=48}:Props){
 const[progress,setProgress]=useState<CurriculumProgress>({});
 useEffect(()=>{if(open)setProgress(readCurriculumProgress(studentId,program.age))},[open,studentId,program.age,revision,currentLesson]);
 const completed=useMemo(()=>Object.values(progress).filter(item=>item.completed).length,[progress]);
 if(!open)return null;
 return <div className={styles.overlay} onClick={onClose}>
   <aside className={styles.drawer} onClick={(e)=>e.stopPropagation()}>
     <header><div><small>PERCURSO LUWIPI · {variant.label}</small><h2>{program.name}</h2><p>{completed}/48 aulas concluídas</p></div><button onClick={onClose} aria-label="Fechar mapa">×</button></header>
     <div className={styles.overall}><i style={{width:`${Math.round(completed/48*100)}%`}}/></div>
     <div className={styles.modules}>{program.modules.map((module,moduleIndex)=>{
       const done=module.lessons.filter(lesson=>progress[String(lesson.number)]?.completed).length;
       const active=module.lessons.some(lesson=>lesson.number===currentLesson);
       return <section key={module.id} className={styles.module} data-active={active}>
         <div className={styles.moduleHead}><span>{String(moduleIndex+1).padStart(2,"0")}</span><div><small>MÓDULO {moduleIndex+1}</small><h3>{module.title}</h3><p>{done}/{module.lessons.length} concluídas</p></div></div>
         <div className={styles.lessons}>{module.lessons.map(lesson=>{
           const state=progress[String(lesson.number)],doneLesson=Boolean(state?.completed),current=lesson.number===currentLesson,locked=lesson.number>maxLesson&&!doneLesson;
           const exp=getLessonExperience(program.age,lesson.number);
           return <button key={lesson.number} data-done={doneLesson} data-current={current} data-locked={locked} onClick={()=>{onSelect(lesson.number);if(!locked)onClose()}}>
             <span>{doneLesson?"✓":locked?"×":String(lesson.number).padStart(2,"0")}</span>
             <div><strong>{lesson.title}</strong><small>{exp.chapter}</small></div>
             {doneLesson&&<b>{state?.mastery==="mastered"?"★★★":"★★☆"}</b>}
           </button>
         })}</div>
       </section>
     })}</div>
   </aside>
 </div>;
}
