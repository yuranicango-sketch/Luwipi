"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AgeGroup } from "@/lib/curriculum";
import type {
  CurriculumVariant,
  EnhancedLesson,
  EnhancedModule,
} from "@/lib/curriculum-v3";
import { buildLessonSteps } from "@/lib/lesson-engine";
import {
  completeLesson,
  saveLessonStep,
  type MasteryState,
} from "@/lib/curriculum-progress";
import styles from "./lesson-runner.module.css";

type Props = {
  age: AgeGroup;
  module: EnhancedModule;
  lesson: EnhancedLesson;
  variant: CurriculumVariant;
  studentId: string;
};

export function LessonRunner({
  age,
  module,
  lesson,
  variant,
  studentId,
}: Props) {
  const router = useRouter();
  const steps = useMemo(
    () => buildLessonSteps({ age, module, lesson, variant }),
    [age, module, lesson, variant],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [mastery, setMastery] = useState<MasteryState>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const percent = Math.round(((stepIndex + 1) / steps.length) * 100);

  function next() {
    const nextIndex = Math.min(steps.length - 1, stepIndex + 1);
    setStepIndex(nextIndex);
    saveLessonStep(studentId, age, lesson.number, nextIndex);
  }

  function previous() {
    setStepIndex((value) => Math.max(0, value - 1));
  }

  function finish() {
    if (!mastery) return;
    completeLesson(studentId, age, lesson.number, mastery);
    const nextLesson = Math.min(48, lesson.number + 1);
    router.push(
      `/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}&current=${nextLesson}`,
    );
  }

  return (
    <section className={styles.shell} style={{ "--accent": module.accent } as React.CSSProperties}>
      <header className={styles.top}>
        <div>
          <Link href={`/curriculo?age=${age}&variant=${variant.id}&student=${encodeURIComponent(studentId)}`}>
            ← Currículo
          </Link>
          <small>Módulo · {module.title}</small>
          <h1>Aula {lesson.number}: {lesson.title}</h1>
        </div>
        <div className={styles.meta}>
          <span>{variant.label}</span>
          <span>{variant.lessonLength}</span>
        </div>
      </header>

      <div className={styles.progress}>
        <div><i style={{ width: `${percent}%` }} /></div>
        <span>{stepIndex + 1}/{steps.length}</span>
      </div>

      <nav className={styles.stepDots} aria-label="Etapas da aula">
        {steps.map((item, index) => (
          <button
            key={item.id}
            className={index === stepIndex ? styles.activeDot : index < stepIndex ? styles.doneDot : ""}
            onClick={() => {
              setStepIndex(index);
              saveLessonStep(studentId, age, lesson.number, index);
            }}
            aria-label={`Ir para ${item.title}`}
          >
            {index < stepIndex ? "✓" : index + 1}
          </button>
        ))}
      </nav>

      <article className={styles.stage}>
        <div className={styles.icon}>{step.icon}</div>
        <div className={styles.stageCopy}>
          <small>{step.duration}</small>
          <h2>{step.title}</h2>
          <p>{step.instruction}</p>

          {step.teacherCue && (
            <div className={styles.teacherCue}>
              <strong>Para o professor</strong>
              <span>{step.teacherCue}</span>
            </div>
          )}

          {step.actionHref && step.actionLabel && (
            <Link className={styles.action} href={step.actionHref}>
              {step.actionLabel}
            </Link>
          )}
        </div>
      </article>

      {isLast && (
        <div className={styles.mastery}>
          <h3>Como terminou esta aula?</h3>
          <p>O professor decide. “Reforçar” não bloqueia a próxima aula.</p>
          <div>
            <button
              className={mastery === "mastered" ? styles.selectedGood : ""}
              onClick={() => setMastery("mastered")}
            >
              ✓ Domínio conseguido
            </button>
            <button
              className={mastery === "reinforce" ? styles.selectedReinforce : ""}
              onClick={() => setMastery("reinforce")}
            >
              ↻ Reforçar depois
            </button>
          </div>
        </div>
      )}

      <footer className={styles.controls}>
        <button className={styles.secondary} onClick={previous} disabled={stepIndex === 0}>
          VOLTAR
        </button>
        {!isLast ? (
          <button className={styles.primary} onClick={next}>
            PRÓXIMO
          </button>
        ) : (
          <button className={styles.primary} onClick={finish} disabled={!mastery}>
            CONCLUIR AULA
          </button>
        )}
      </footer>
    </section>
  );
}
