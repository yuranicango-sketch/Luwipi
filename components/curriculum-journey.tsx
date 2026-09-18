"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EnhancedProgram, CurriculumVariant } from "@/lib/curriculum-v3";
import {
  currentLessonNumber,
  readCurriculumProgress,
  type CurriculumProgress,
} from "@/lib/curriculum-progress";
import { ModuleIllustration } from "@/components/module-illustration";
import styles from "./curriculum-journey.module.css";

type Props = {
  program: EnhancedProgram;
  variant: CurriculumVariant;
  studentId: string;
  initialCurrent?: number;
};

export function CurriculumJourney({
  program,
  variant,
  studentId,
  initialCurrent,
}: Props) {
  const [progress, setProgress] = useState<CurriculumProgress>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(readCurriculumProgress(studentId, program.age));
    setLoaded(true);
  }, [studentId, program.age]);

  const currentLesson = useMemo(() => {
    if (!loaded && initialCurrent) return initialCurrent;
    return currentLessonNumber(progress);
  }, [loaded, initialCurrent, progress]);

  return (
    <div className={styles.moduleList}>
      {program.modules.map((module, moduleIndex) => {
        const first = module.lessons[0].number;
        const last = module.lessons[module.lessons.length - 1].number;
        const completed = module.lessons.filter(
          (lesson) => progress[String(lesson.number)]?.completed,
        ).length;
        const isCurrentModule =
          currentLesson >= first && currentLesson <= last;
        const percent = Math.round((completed / module.lessons.length) * 100);

        return (
          <section
            className={`${styles.module} ${
              isCurrentModule ? styles.currentModule : ""
            }`}
            key={module.id}
            style={
              {
                "--accent": module.accent,
                "--soft": module.surface,
              } as React.CSSProperties
            }
          >
            <div className={styles.moduleHero}>
              <div className={styles.copy}>
                <div className={styles.kicker}>
                  <span>Módulo {moduleIndex + 1}</span>
                  <span>Aulas {first}–{last}</span>
                  {isCurrentModule && <b>VOCÊ ESTÁ AQUI</b>}
                </div>
                <h2>{module.title}</h2>
                <h3>{module.subtitle}</h3>
                <p>{module.outcome}</p>

                <div className={styles.moduleProgress}>
                  <div><i style={{ width: `${percent}%` }} /></div>
                  <span>{completed}/{module.lessons.length} aulas</span>
                </div>
              </div>

              <div className={styles.illustration}>
                <ModuleIllustration type={module.illustration} />
              </div>
            </div>

            <div className={styles.lessons}>
              {module.lessons.map((lesson) => {
                const state = progress[String(lesson.number)];
                const done = Boolean(state?.completed);
                const current = lesson.number === currentLesson;

                return (
                  <article
                    className={`${styles.lesson} ${done ? styles.done : ""} ${
                      current ? styles.current : ""
                    }`}
                    key={lesson.number}
                  >
                    <div className={styles.marker}>
                      <span>{done ? "✓" : String(lesson.number).padStart(2, "0")}</span>
                    </div>

                    <div className={styles.lessonBody}>
                      <div className={styles.titleRow}>
                        <div>
                          <h4>{lesson.title}</h4>
                          <p>{lesson.focus}</p>
                        </div>
                        <span>{variant.lessonLength}</span>
                      </div>

                      <details>
                        <summary>Ver plano</summary>
                        <div className={styles.planGrid}>
                          <div><small>Objetivo</small><p>{lesson.objective}</p></div>
                          <div><small>Domínio</small><p>{lesson.mastery}</p></div>
                          <div><small>Repertório</small><p>{lesson.repertoire}</p></div>
                          <div><small>Tarefa</small><p>{lesson.homePractice}</p></div>
                        </div>
                        <div className={styles.adaptation}>
                          <strong>{variant.label}: </strong>
                          {variant.id === "2-3" || variant.id === "5-6"
                            ? lesson.adaptation.younger
                            : lesson.adaptation.older}
                        </div>
                      </details>
                    </div>

                    <div className={styles.action}>
                      <Link
                        className={current ? styles.continue : styles.start}
                        href={`/aulas/${program.age}/${lesson.number}?variant=${variant.id}&student=${encodeURIComponent(studentId)}`}
                      >
                        {done ? "REVER" : current ? "CONTINUAR" : "COMEÇAR"}
                      </Link>
                      {state?.mastery === "reinforce" && (
                        <small className={styles.reinforce}>↻ reforçar</small>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
