import { idbClear, idbDelete, idbGet, idbSet } from "@/lib/local-db";
import type { AgeBand, CompetencyId, LessonBlock, MasteryLevel, StudentState } from "@/lib/suzuki-lessons";
import type { RepertoireFocus } from "@/lib/repertoire";

export type RepertoireStatus = "listening" | "learning" | "review";

export type RepertoireReference = {
  methodTitle?: string;
  pieceTitle: string;
  status: RepertoireStatus;
  focus?: RepertoireFocus;
  note?: string;
};

export type LocalStudent = {
  id: string;
  name: string;
  ageBand: AgeBand;
  level: "iniciante" | "em-progresso" | "avancado";
  parentName?: string;
  photoDataUrl?: string;
  repeatVariation: boolean;
  reducedStimulus: boolean;
  competencies: Partial<Record<CompetencyId, MasteryLevel>>;
  repertoire: string[];
  currentRepertoire?: RepertoireReference;
  createdAt: string;
};

export type ActiveLesson = {
  id: string;
  studentId: string;
  studentName: string;
  ageBand: AgeBand;
  state: StudentState;
  lessonId: string;
  lessonTitle: string;
  repertoire: string;
  blocks: LessonBlock[];
  instrumentMode: "physical" | "virtual" | "silent";
  currentBlockIndex: number;
  variationApplied: boolean;
  startedAt: string;
};

export type LessonHistory = {
  id: string;
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  repertoire: string;
  state: StudentState;
  instrumentMode: "physical" | "virtual" | "silent";
  startedAt: string;
  completedAt: string;
  competencies: Partial<Record<CompetencyId, MasteryLevel>>;
  note?: string;
  parentSummary?: string;
  homePractice?: string[];
};

export type LocalBackup = {
  format: "luwipi-local-backup";
  version: 3;
  exportedAt: string;
  students: LocalStudent[];
  history: LessonHistory[];
};

const STUDENTS = "luwipi:v3:students";
const HISTORY = "luwipi:v3:history";
const ACTIVE = "luwipi:v3:active-lesson";
const LEGACY_STUDENTS = "luwipi:v2:students";
const LEGACY_HISTORY = "luwipi:v2:history";
const LEGACY_ACTIVE = "luwipi:v2:active-lesson";
let migration: Promise<void> | null = null;

function localRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function normalizeStudent(student: LocalStudent): LocalStudent {
  return {
    ...student,
    repeatVariation: student.repeatVariation ?? false,
    reducedStimulus: student.reducedStimulus ?? false,
    competencies: student.competencies ?? {},
    repertoire: Array.isArray(student.repertoire) ? student.repertoire : [],
    currentRepertoire: student.currentRepertoire?.pieceTitle
      ? {
          methodTitle: student.currentRepertoire.methodTitle?.trim() || undefined,
          pieceTitle: student.currentRepertoire.pieceTitle.trim(),
          status: student.currentRepertoire.status ?? "learning",
          focus: student.currentRepertoire.focus ?? "ear-memory",
          note: student.currentRepertoire.note?.trim() || undefined,
        }
      : undefined,
  };
}

async function migrateLegacyData() {
  if (typeof window === "undefined") return;
  const existingStudents = await idbGet<LocalStudent[]>(STUDENTS);
  const existingHistory = await idbGet<LessonHistory[]>(HISTORY);

  if (!existingStudents) {
    const old = localRead<LocalStudent[]>(LEGACY_STUDENTS, []);
    if (old.length && await idbSet(STUDENTS, old.map(normalizeStudent))) {
      window.localStorage.removeItem(LEGACY_STUDENTS);
    }
  }
  if (!existingHistory) {
    const old = localRead<LessonHistory[]>(LEGACY_HISTORY, []);
    if (old.length && await idbSet(HISTORY, old.slice(0, 300))) {
      window.localStorage.removeItem(LEGACY_HISTORY);
    }
  }

  const oldActive = window.localStorage.getItem(LEGACY_ACTIVE);
  if (oldActive && !window.localStorage.getItem(ACTIVE)) {
    window.localStorage.setItem(ACTIVE, oldActive);
    window.localStorage.removeItem(LEGACY_ACTIVE);
  }
}

async function ready() {
  if (!migration) migration = migrateLegacyData();
  await migration;
}

async function durableRead<T>(key: string, fallback: T) {
  await ready();
  const value = await idbGet<T>(key);
  return value ?? fallback;
}

async function durableWrite(key: string, value: unknown) {
  await ready();
  const saved = await idbSet(key, value);
  if (!saved && typeof window !== "undefined") {
    // Compatibility fallback only for browsers where IndexedDB is unavailable.
    window.localStorage.setItem(key, JSON.stringify(value));
  } else if (saved && typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}

export async function getLocalStudents() {
  return (await durableRead<LocalStudent[]>(STUDENTS, [])).map(normalizeStudent);
}

export async function saveLocalStudents(students: LocalStudent[]) {
  await durableWrite(STUDENTS, students.map(normalizeStudent));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("luwipi:v3:students"));
}

export async function saveLocalStudent(student: LocalStudent) {
  const current = await getLocalStudents();
  await saveLocalStudents([normalizeStudent(student), ...current.filter((item) => item.id !== student.id)]);
}

export async function getLocalStudent(id: string) {
  return (await getLocalStudents()).find((student) => student.id === id) ?? null;
}

export async function updateLocalStudent(id: string, patch: Partial<Omit<LocalStudent, "id" | "createdAt">>) {
  const current = await getLocalStudents();
  const next = current.map((student) => student.id === id ? normalizeStudent({ ...student, ...patch }) : student);
  await saveLocalStudents(next);
  return next.find((student) => student.id === id) ?? null;
}

export function createLocalStudent(input: Pick<LocalStudent, "name" | "ageBand" | "level"> & Partial<Pick<LocalStudent, "parentName" | "photoDataUrl" | "repeatVariation" | "reducedStimulus">>): LocalStudent {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "student-" + Date.now(),
    name: input.name.trim(),
    ageBand: input.ageBand,
    level: input.level,
    parentName: input.parentName?.trim() || undefined,
    photoDataUrl: input.photoDataUrl || undefined,
    repeatVariation: input.repeatVariation ?? false,
    reducedStimulus: input.reducedStimulus ?? false,
    competencies: {},
    repertoire: [],
    createdAt: new Date().toISOString(),
  };
}

export function saveActiveLesson(session: ActiveLesson) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE, JSON.stringify(session));
  void idbSet(ACTIVE, session);
}

export function getActiveLesson() {
  return localRead<ActiveLesson | null>(ACTIVE, null);
}

export function clearActiveLesson() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ACTIVE);
  void idbDelete(ACTIVE);
}

export async function getLessonHistory() {
  return durableRead<LessonHistory[]>(HISTORY, []);
}

export async function getStudentHistory(studentId: string) {
  return (await getLessonHistory()).filter((entry) => entry.studentId === studentId);
}

export async function saveLessonHistory(entry: LessonHistory) {
  const current = await getLessonHistory();
  await durableWrite(HISTORY, [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 300));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("luwipi:v3:history"));
}

export async function updateStudentMastery(studentId: string, updates: Partial<Record<CompetencyId, MasteryLevel>>, repertoire?: string) {
  const students = await getLocalStudents();
  await saveLocalStudents(students.map((student) => {
    if (student.id !== studentId) return student;
    return normalizeStudent({
      ...student,
      competencies: { ...student.competencies, ...updates },
      repertoire: repertoire && !student.repertoire.includes(repertoire) ? [repertoire, ...student.repertoire] : student.repertoire,
    });
  }));
}

export async function exportLocalBackup(): Promise<LocalBackup> {
  return {
    format: "luwipi-local-backup",
    version: 3,
    exportedAt: new Date().toISOString(),
    students: await getLocalStudents(),
    history: await getLessonHistory(),
  };
}

function validStudent(value: unknown): value is LocalStudent {
  if (!value || typeof value !== "object") return false;
  const student = value as Partial<LocalStudent>;
  return typeof student.id === "string" && typeof student.name === "string" && ["2-3","4-5","6-8"].includes(String(student.ageBand));
}

function validHistory(value: unknown): value is LessonHistory {
  if (!value || typeof value !== "object") return false;
  const history = value as Partial<LessonHistory>;
  return typeof history.id === "string" && typeof history.studentId === "string" && typeof history.lessonId === "string";
}

export async function importLocalBackup(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("backup_invalido");
  const backup = input as Partial<LocalBackup> & { version?: number };
  if (backup.format !== "luwipi-local-backup" || ![2, 3].includes(Number(backup.version))) throw new Error("backup_incompativel");
  if (!Array.isArray(backup.students) || !backup.students.every(validStudent)) throw new Error("alunos_invalidos");
  if (!Array.isArray(backup.history) || !backup.history.every(validHistory)) throw new Error("historico_invalido");
  await durableWrite(STUDENTS, backup.students.map(normalizeStudent));
  await durableWrite(HISTORY, backup.history.slice(0, 300));
  clearActiveLesson();
  return { students: backup.students.length, history: backup.history.length };
}

export async function hydrateLocalLearningMirror() {
  await ready();
  if (typeof window === "undefined") return { restored: 0 };
  if (!window.localStorage.getItem(ACTIVE)) {
    const durable = await idbGet<ActiveLesson>(ACTIVE);
    if (durable) {
      window.localStorage.setItem(ACTIVE, JSON.stringify(durable));
      return { restored: 1 };
    }
  }
  return { restored: 0 };
}

export async function clearAllLocalLearningData() {
  await ready();
  await idbClear();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACTIVE);
    window.localStorage.removeItem(LEGACY_ACTIVE);
    window.localStorage.removeItem(LEGACY_STUDENTS);
    window.localStorage.removeItem(LEGACY_HISTORY);
    window.dispatchEvent(new Event("luwipi:v3:students"));
    window.dispatchEvent(new Event("luwipi:v3:history"));
  }
}
