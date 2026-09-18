"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import type { AgeGroup } from "@/lib/curriculum";
import type { CurriculumVariant, EnhancedLesson, EnhancedModule } from "@/lib/curriculum-v3";
import { buildLessonSteps } from "@/lib/lesson-engine";
import { completeLesson, saveLessonStep, type MasteryState } from "@/lib/curriculum-progress";
import styles from "./lesson-runner.module.css";

type Props={age:AgeGroup;module:EnhancedModule;lesson:EnhancedLesson;variant:CurriculumVariant;studentId:string};

export function LessonRunner({age,module,lesson,variant,studentId}:Props){
  const router=useRouter();
  const steps=useMemo(()=>buildLessonSteps({age,module,lesson,variant}),[age,module,lesson,variant]);
  const[stepIndex,setStepIndex]=useState(0);
  const[mastery,setMastery]=useState<MasteryState>(null);
  const step=steps[stepIndex];
  const isLast=stepIndex===steps.length-1;
  const percent=Math.round(((stepIndex+1)/steps.length)*100);

  function goTo(index:number){
    const safe=Math.max(0,Math.min(steps.length-1,index));
    setStepIndex(safe);
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

    <nav className={styles.steps} aria-label="Etapas da aula">
      {steps.map((item,index)=><button key={item.id} className={`${index===stepIndex?styles.activeStep:""} ${index<stepIndex?styles.doneStep:""}`} onClick={()=>goTo(index)}>
        <b>{index<stepIndex?"✓":index+1}</b><span>{item.title}</span>
      </button>)}
    </nav>

    <article className={styles.stage}>
      <div className={styles.stageHeading}>
        <div className={styles.icon}>{step.icon}</div>
        <div><small>{step.duration}</small><h2>{step.title}</h2><p>{step.goal}</p></div>
      </div>

      <section className={styles.doNow}>
        <span className={styles.sectionLabel}>FAÇA AGORA</span>
        <ol>{step.actions.map((action,index)=><li key={`${step.id}-${index}`}><b>{index+1}</b><span>{action}</span></li>)}</ol>
      </section>

      {step.say&&<section className={styles.say}><span className={styles.sectionLabel}>DIGA ASSIM</span><p>“{step.say}”</p></section>}

      <div className={styles.twoColumns}>
        <section><span className={styles.sectionLabel}>A CRIANÇA FAZ</span><p>{step.childDoes}</p></section>
        <section><span className={styles.sectionLabel}>PODE AVANÇAR QUANDO</span><p>{step.success}</p></section>
      </div>

      {step.tip&&<aside className={styles.tip}><strong>Dica</strong><span>{step.tip}</span></aside>}
      {step.actionHref&&step.actionLabel&&<Link className={styles.action} href={step.actionHref}>{step.actionLabel}</Link>}
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
      {!isLast?<button className={styles.primary} onClick={()=>goTo(stepIndex+1)}>FEITO · PRÓXIMO</button>
      :<button className={styles.primary} onClick={finish} disabled={!mastery}>CONCLUIR AULA</button>}
    </footer>
  </section>;
}
