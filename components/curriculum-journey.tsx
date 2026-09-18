"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { EnhancedProgram, CurriculumVariant } from "@/lib/curriculum-v3";
import { currentLessonNumber, readCurriculumProgress, type CurriculumProgress } from "@/lib/curriculum-progress";
import { ModuleIllustration } from "@/components/module-illustration";
import styles from "./curriculum-journey.module.css";

type Props={program:EnhancedProgram;variant:CurriculumVariant;studentId:string;initialCurrent?:number};

export function CurriculumJourney({program,variant,studentId,initialCurrent}:Props){
  const[progress,setProgress]=useState<CurriculumProgress>({});
  const[loaded,setLoaded]=useState(false);
  const[expanded,setExpanded]=useState<string|null>(null);

  useEffect(()=>{setProgress(readCurriculumProgress(studentId,program.age));setLoaded(true);},[studentId,program.age]);

  const currentLesson=useMemo(()=>{
    if(!loaded&&initialCurrent)return initialCurrent;
    return currentLessonNumber(progress);
  },[loaded,initialCurrent,progress]);

  const currentModuleId=useMemo(()=>program.modules.find(module=>module.lessons.some(lesson=>lesson.number===currentLesson))?.id??program.modules[0]?.id,[program.modules,currentLesson]);

  useEffect(()=>{if(!expanded&&currentModuleId)setExpanded(currentModuleId);},[expanded,currentModuleId]);

  const currentLessonData=program.modules.flatMap(module=>module.lessons).find(lesson=>lesson.number===currentLesson);

  return <div>
    {currentLessonData&&<section className={styles.today}>
      <div><small>PRÓXIMA AULA</small><h2>{currentLessonData.number}. {currentLessonData.title}</h2><p>{currentLessonData.focus}</p></div>
      <Link href={`/aulas/${program.age}/${currentLessonData.number}?variant=${variant.id}&student=${encodeURIComponent(studentId)}`}>CONTINUAR AULA</Link>
    </section>}

    <div className={styles.moduleList}>
      {program.modules.map((module,moduleIndex)=>{
        const first=module.lessons[0].number;
        const last=module.lessons[module.lessons.length-1].number;
        const completed=module.lessons.filter(lesson=>progress[String(lesson.number)]?.completed).length;
        const isCurrentModule=currentLesson>=first&&currentLesson<=last;
        const isOpen=expanded===module.id;
        const percent=Math.round((completed/module.lessons.length)*100);

        return <section className={`${styles.module} ${isCurrentModule?styles.currentModule:""}`} key={module.id} style={{"--accent":module.accent,"--soft":module.surface} as CSSProperties}>
          <button className={styles.moduleToggle} onClick={()=>setExpanded(isOpen?null:module.id)} aria-expanded={isOpen}>
            <div className={styles.moduleIcon}><ModuleIllustration type={module.illustration}/></div>
            <div className={styles.moduleSummary}>
              <div className={styles.kicker}><span>MÓDULO {moduleIndex+1}</span><span>AULAS {first}–{last}</span>{isCurrentModule&&<b>VOCÊ ESTÁ AQUI</b>}</div>
              <h2>{module.title}</h2><p>{module.subtitle}</p>
              <div className={styles.progress}><div><i style={{width:`${percent}%`}}/></div><span>{completed}/{module.lessons.length}</span></div>
            </div>
            <span className={styles.chevron}>{isOpen?"−":"+"}</span>
          </button>

          {isOpen&&<div className={styles.lessons}>
            <p className={styles.moduleOutcome}>{module.outcome}</p>
            {module.lessons.map(lesson=>{
              const state=progress[String(lesson.number)];
              const done=Boolean(state?.completed);
              const current=lesson.number===currentLesson;
              return <article className={`${styles.lesson} ${done?styles.done:""} ${current?styles.current:""}`} key={lesson.number}>
                <span className={styles.marker}>{done?"✓":String(lesson.number).padStart(2,"0")}</span>
                <div className={styles.lessonText}><h3>{lesson.title}</h3><p>{lesson.focus}</p>{state?.mastery==="reinforce"&&<small>↻ Reforçar depois</small>}</div>
                <Link className={current?styles.continue:styles.start} href={`/aulas/${program.age}/${lesson.number}?variant=${variant.id}&student=${encodeURIComponent(studentId)}`}>{done?"REVER":current?"CONTINUAR":"ABRIR"}</Link>
              </article>;
            })}
          </div>}
        </section>;
      })}
    </div>
  </div>;
}
