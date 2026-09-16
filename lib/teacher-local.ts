import type { AgeGroup } from "@/lib/curriculum";
import type { HomeworkAssignment } from "@/lib/demo-assignments";

export type Student = {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  parentName?: string;
  createdAt: string;
};

export type HomeworkProgress = {
  code: string;
  completedRepeats: number;
  targetRepeats: number;
  sessionCount: number;
  lastPracticedAt: string;
  completedAt?: string;
};

const STUDENTS_KEY = "luwipi:students";
const ASSIGNMENTS_KEY = "luwipi:assignments";
const PROGRESS_PREFIX = "luwipi:progress:";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getStudents(): Student[] {
  if (typeof window === "undefined") return [];
  return safeParse<Student[]>(localStorage.getItem(STUDENTS_KEY), []);
}

export function saveStudent(student: Student) {
  if (typeof window === "undefined") return;
  const current = getStudents();
  const next = [student, ...current.filter((item) => item.id !== student.id)];
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("luwipi:students-changed"));
}

export function removeStudent(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(getStudents().filter((item) => item.id !== id)));
  window.dispatchEvent(new Event("luwipi:students-changed"));
}

export function getAssignments(): HomeworkAssignment[] {
  if (typeof window === "undefined") return [];
  return safeParse<HomeworkAssignment[]>(localStorage.getItem(ASSIGNMENTS_KEY), []);
}

export function saveAssignment(assignment: HomeworkAssignment) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`luwipi-homework:${assignment.code}`, JSON.stringify(assignment));
  const current = getAssignments();
  const next = [assignment, ...current.filter((item) => item.code !== assignment.code)].slice(0, 100);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("luwipi:assignments-changed"));
}

export function getHomeworkProgress(code: string): HomeworkProgress | null {
  if (typeof window === "undefined") return null;
  return safeParse<HomeworkProgress | null>(localStorage.getItem(`${PROGRESS_PREFIX}${code}`), null);
}

export function saveHomeworkProgress(progress: HomeworkProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PROGRESS_PREFIX}${progress.code}`, JSON.stringify(progress));
  window.dispatchEvent(new Event("luwipi:progress-changed"));
}
