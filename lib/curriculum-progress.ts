"use client";

import type { AgeGroup } from "@/lib/curriculum";

export type MasteryState = "mastered" | "reinforce" | null;

export type LessonProgress = {
  step: number;
  action?: number;
  completed: boolean;
  mastery: MasteryState;
  updatedAt: string;
};

export type CurriculumProgress = Record<string, LessonProgress>;

function storageKey(studentId: string, age: AgeGroup) {
  return `luwipi:curriculum:v3:${studentId}:${age}`;
}

export function readCurriculumProgress(
  studentId: string,
  age: AgeGroup,
): CurriculumProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(studentId, age));
    return raw ? (JSON.parse(raw) as CurriculumProgress) : {};
  } catch {
    return {};
  }
}

function writeCurriculumProgress(
  studentId: string,
  age: AgeGroup,
  value: CurriculumProgress,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(studentId, age), JSON.stringify(value));
}

export function saveLessonStep(
  studentId: string,
  age: AgeGroup,
  lessonNumber: number,
  step: number,
  action = 0,
) {
  const current = readCurriculumProgress(studentId, age);
  const key = String(lessonNumber);
  current[key] = {
    step,
    action,
    completed: current[key]?.completed ?? false,
    mastery: current[key]?.mastery ?? null,
    updatedAt: new Date().toISOString(),
  };
  writeCurriculumProgress(studentId, age, current);
}

export function completeLesson(
  studentId: string,
  age: AgeGroup,
  lessonNumber: number,
  mastery: Exclude<MasteryState, null>,
) {
  const current = readCurriculumProgress(studentId, age);
  current[String(lessonNumber)] = {
    step: 999,
    action: 0,
    completed: true,
    mastery,
    updatedAt: new Date().toISOString(),
  };
  writeCurriculumProgress(studentId, age, current);
}

export function currentLessonNumber(progress: CurriculumProgress) {
  for (let lesson = 1; lesson <= 48; lesson += 1) {
    if (!progress[String(lesson)]?.completed) return lesson;
  }
  return 48;
}
