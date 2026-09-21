"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import type { AgeGroup } from "@/lib/curriculum";
import type { CurriculumVariant, EnhancedLesson, EnhancedModule } from "@/lib/curriculum-v3";
import { buildLessonSteps } from "@/lib/lesson-engine";
import { getSong } from "@/lib/music-library";
import { PreschoolInlineSong } from "@/components/preschool-inline-song";
import { LessonVisual } from "@/components/lesson-visual";
import { completeLesson, saveLessonStep, type MasteryState } from "@/lib/curriculum-progress";
import styles from "./lesson-runner.module.css";

type Props={age:AgeGroup;module:EnhancedModule;lesson:EnhancedLesson;variant:CurriculumVariant;studentId:string};

export function LessonRunner({age,module,lesson,variant,studentId}:Props){
  const router=useRouter();
  const steps=useMemo(()=>buildLessonSteps({age,module,lesson,variant}),[age,module,lesson,variant]);
  const[stepIndex,setStepIndex]=useState(0);
  const[mastery,setMastery]=useState<MasteryState>(null);
  const[showGuide,setShowGuide]=useState(false);
  const step=steps[stepIndex];
  const lessonSong=step.songId?getSong(step.songId):undefined;
  const isLast=stepIndex===steps.length-1;
  const percent=Math.round(((stepIndex+1)/steps.length)*100);

  function goTo(index:number){
    const safe=Math.max(0,Math.min(steps.length-1,index));
    setStepIndex(safe);
    setShowGuide(false);
    saveLessonStep(studentId,age,lesson.number,safe);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function finish(){
    if(!mastery)return;
    completeLesson(studentId,age,lesson.number,mastery);
    const nextLesson=Math.min(48,lesson.number+1);
    router.push(`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}&current=${nextLesson}`);
  }

  return <section className={styles.shell} style={{"--accent":module.accent} as CSSProperties}>
    <header className={styles.top}>
      <div>
        <Link className={styles.back} href={`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}`}>← Sair da aula</Link>
        <span className={styles.lessonNumber}>AULA {lesson.number} DE 48</span>
        <h1>{lesson.title}</h1>
        <p className={styles.objective}>{lesson.objective}</p>
      </div>
      <div className={styles.meta}><strong>{variant.label}</strong><span>{variant.lessonLength}</span></div>
    </header>

    <div className={styles.progress}><div><i style={{width:`${percent}%`}}/></div><span>Etapa {stepIndex+1} de {steps.length}</span></div>

    <details className={styles.stepDrawer}><summary>Ver todas as etapas <span>{stepIndex+1}/{steps.length}</span></summary><nav className={styles.steps} aria-label="Etapas da aula">
      {steps.map((item,index)=><button key={item.id} className={`${index===stepIndex?styles.activeStep:""} ${index<stepIndex?styles.doneStep:""}`} onClick={()=>goTo(index)}>
        <b>{index<stepIndex?"✓":index+1}</b><span>{item.title}</span>
      </button>)}
    </nav></details>

    <article className={styles.stage}>
      <header className={styles.stageHeading}>
        <div><small>AULA {lesson.number} · {step.id==="repertoire"?"MÚSICA DO MÊS":step.title.toUpperCase()}</small><h2>{step.title}</h2><p>{step.goal}</p></div>
        <span className={styles.duration}>{step.duration}</span>
      </header>

      <div className={styles.lessonGrid}>
        <div className={styles.scenePanel}>
          <span className={styles.sceneLabel}>CENA DA AULA</span>
          <LessonVisual stepId={step.id} icon={step.icon} title={step.title} age={age} accent={module.accent} instruction={step.actions.join(" ")}/>
        </div>

        <div className={styles.teacherPanel}>
          <span className={styles.sectionLabel}>GUIA DO PROFESSOR</span>
          <h3>Faça só isto agora</h3>
          <ol className={styles.teacherSteps}>{step.actions.map((action,index)=><li key={`${step.id}-${index}`}><b>{index+1}</b><span>{action}</span></li>)}</ol>
          {(step.example||step.say||step.tip)&&<button type="button" className={styles.guideToggle} onClick={()=>setShowGuide(v=>!v)}>{showGuide?"Fechar ajuda":"💬 Ver o que posso dizer"}</button>}
          {showGuide&&step.say&&<section className={styles.say}><span className={styles.sectionLabel}>DIGA ASSIM</span><p>“{step.say}”</p></section>}
          {showGuide&&step.example&&<section className={styles.example}><span className={styles.sectionLabel}>EXEMPLO</span><p>{step.example}</p></section>}
          {showGuide&&step.tip&&<aside className={styles.tip}><strong>Dica</strong><span>{step.tip}</span></aside>}
          {step.actionHref&&step.actionLabel&&<Link className={styles.action} href={step.actionHref}>{step.actionLabel}</Link>}
        </div>
      </div>

      {lessonSong&&age==="2-4"&&step.id==="repertoire"&&<div className={styles.monthSong}><PreschoolInlineSong song={lessonSong} lessonNumber={lesson.number}/></div>}
      {lessonSong&&age!=="2-4"&&step.id==="repertoire"&&<section className={styles.songCard}><div className={styles.songArt}><span>{lessonSong.emoji}</span></div><div><small>MÚSICA DO MÊS</small><h3>{lessonSong.title}</h3><p>{lessonSong.story}</p><Link href={`/musicas/${lessonSong.id}`}>PRATICAR MÚSICA →</Link></div></section>}

      <div className={styles.observe}><span>👀</span><div><small>OBSERVE</small><strong>{step.childDoes}</strong><p>Pode avançar quando: {step.success}</p></div></div>
    </article>
    {isLast&&<section className={styles.mastery}>
      <div><small>ANTES DE TERMINAR</small><h3>Como a criança terminou?</h3><p>Escolha uma opção. “Reforçar” não impede a próxima aula.</p></div>
      <div className={styles.masteryButtons}>
        <button className={mastery==="mastered"?styles.selectedGood:""} onClick={()=>setMastery("mastered")}>✓ Conseguiu</button>
        <button className={mastery==="reinforce"?styles.selectedReinforce:""} onClick={()=>setMastery("reinforce")}>↻ Precisa reforçar</button>
      </div>
    </section>}

    <footer className={styles.controls}>
      <button className={styles.secondary} onClick={()=>goTo(stepIndex-1)} disabled={stepIndex===0}>VOLTAR</button>
      {!isLast?<button className={styles.primary} onClick={()=>goTo(stepIndex+1)}>CONCLUÍDO · PRÓXIMO →</button>
      :<button className={styles.primary} onClick={finish} disabled={!mastery}>CONCLUIR AULA</button>}
    </footer>
  </section>;
}
