import type { AgeBand, CompetencyId, LessonBlock, MasteryLevel, StudentState } from "@/lib/suzuki-lessons";

export type RepertoireStatus = "listening" | "learning" | "review";

export type RepertoireReference = {
  methodTitle?: string;
  pieceTitle: string;
  status: RepertoireStatus;
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
  version: 2;
  exportedAt: string;
  students: LocalStudent[];
  history: LessonHistory[];
};

const STUDENTS = "luwipi:v2:students";
const ACTIVE = "luwipi:v2:active-lesson";
const HISTORY = "luwipi:v2:history";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
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
          note: student.currentRepertoire.note?.trim() || undefined,
        }
      : undefined,
  };
}

export function getLocalStudents() {
  return read<LocalStudent[]>(STUDENTS, []).map(normalizeStudent);
}

export function saveLocalStudents(students: LocalStudent[]) {
  write(STUDENTS, students.map(normalizeStudent));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("luwipi:v2:students"));
}

export function saveLocalStudent(student: LocalStudent) {
  const current = getLocalStudents();
  saveLocalStudents([normalizeStudent(student), ...current.filter((item) => item.id !== student.id)]);
}

export function getLocalStudent(id: string) {
  return getLocalStudents().find((student) => student.id === id) ?? null;
}

export function updateLocalStudent(id: string, patch: Partial<Omit<LocalStudent, "id" | "createdAt">>) {
  const next = getLocalStudents().map((student) => student.id === id ? normalizeStudent({ ...student, ...patch }) : student);
  saveLocalStudents(next);
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

export function saveActiveLesson(session: ActiveLesson) { write(ACTIVE, session); }
export function getActiveLesson() { return read<ActiveLesson | null>(ACTIVE, null); }
export function clearActiveLesson() { if (typeof window !== "undefined") window.localStorage.removeItem(ACTIVE); }

export function getLessonHistory() { return read<LessonHistory[]>(HISTORY, []); }
export function getStudentHistory(studentId: string) { return getLessonHistory().filter((entry) => entry.studentId === studentId); }

export function saveLessonHistory(entry: LessonHistory) {
  const current = getLessonHistory();
  write(HISTORY, [entry, ...current].slice(0, 300));
}

export function updateStudentMastery(studentId: string, updates: Partial<Record<CompetencyId, MasteryLevel>>, repertoire?: string) {
  const students = getLocalStudents();
  const next = students.map((student) => {
    if (student.id !== studentId) return student;
    return normalizeStudent({
      ...student,
      competencies: { ...student.competencies, ...updates },
      repertoire: repertoire && !student.repertoire.includes(repertoire) ? [repertoire, ...student.repertoire] : student.repertoire,
    });
  });
  saveLocalStudents(next);
}

export function exportLocalBackup(): LocalBackup {
  return { format: "luwipi-local-backup", version: 2, exportedAt: new Date().toISOString(), students: getLocalStudents(), history: getLessonHistory() };
}

function validStudent(value: unknown): value is LocalStudent {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<LocalStudent>;
  return typeof s.id === "string" && typeof s.name === "string" && ["2-3","4-5","6-8"].includes(String(s.ageBand));
}

function validHistory(value: unknown): value is LessonHistory {
  if (!value || typeof value !== "object") return false;
  const h = value as Partial<LessonHistory>;
  return typeof h.id === "string" && typeof h.studentId === "string" && typeof h.lessonId === "string";
}

export function importLocalBackup(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("backup_invalido");
  const backup = input as Partial<LocalBackup>;
  if (backup.format !== "luwipi-local-backup" || backup.version !== 2) throw new Error("backup_incompativel");
  if (!Array.isArray(backup.students) || !backup.students.every(validStudent)) throw new Error("alunos_invalidos");
  if (!Array.isArray(backup.history) || !backup.history.every(validHistory)) throw new Error("historico_invalido");
  saveLocalStudents(backup.students.map(normalizeStudent));
  write(HISTORY, backup.history.slice(0, 300));
  clearActiveLesson();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("luwipi:v2:history"));
  return { students: backup.students.length, history: backup.history.length };
}

export function clearAllLocalLearningData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STUDENTS);
  window.localStorage.removeItem(ACTIVE);
  window.localStorage.removeItem(HISTORY);
  window.dispatchEvent(new Event("luwipi:v2:students"));
  window.dispatchEvent(new Event("luwipi:v2:history"));
}
