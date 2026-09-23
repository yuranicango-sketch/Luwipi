import type { AgeBand, CompetencyId, LessonBlock, MasteryLevel, StudentState } from "./suzuki-lessons";
import type { ExternalRepertoire } from "./repertoire";

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
  externalRepertoire: ExternalRepertoire[];
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

const DB_NAME = "luwipi-teacher";
const DB_VERSION = 1;
const STUDENTS_STORE = "students";
const HISTORY_STORE = "history";
const META_STORE = "meta";
const ACTIVE = "luwipi:v3:active-lesson";
const LEGACY_STUDENTS = "luwipi:v2:students";
const LEGACY_HISTORY = "luwipi:v2:history";
const LEGACY_ACTIVE = "luwipi:v2:active-lesson";

function normalizeStudent(student: LocalStudent): LocalStudent {
  return { ...student, externalRepertoire: Array.isArray(student.externalRepertoire) ? student.externalRepertoire : [] };
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb_request_failed"));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("indexeddb_transaction_failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("indexeddb_transaction_aborted"));
  });
}

async function migrateLegacy(db: IDBDatabase) {
  if (typeof window === "undefined") return;
  const check = db.transaction(META_STORE, "readonly");
  const migrated = await requestResult(check.objectStore(META_STORE).get("v2-migrated"));
  if (migrated) return;

  const students = (() => {
    try { return JSON.parse(window.localStorage.getItem(LEGACY_STUDENTS) || "[]") as LocalStudent[]; } catch { return []; }
  })();
  const history = (() => {
    try { return JSON.parse(window.localStorage.getItem(LEGACY_HISTORY) || "[]") as LessonHistory[]; } catch { return []; }
  })();

  const tx = db.transaction([STUDENTS_STORE, HISTORY_STORE, META_STORE], "readwrite");
  students.map(normalizeStudent).forEach((student) => tx.objectStore(STUDENTS_STORE).put(student));
  history.forEach((entry) => tx.objectStore(HISTORY_STORE).put(entry));
  tx.objectStore(META_STORE).put({ key: "v2-migrated", at: new Date().toISOString() });
  await transactionDone(tx);

  const legacyActive = window.localStorage.getItem(LEGACY_ACTIVE);
  if (legacyActive && !window.localStorage.getItem(ACTIVE)) window.localStorage.setItem(ACTIVE, legacyActive);
  window.localStorage.removeItem(LEGACY_STUDENTS);
  window.localStorage.removeItem(LEGACY_HISTORY);
  window.localStorage.removeItem(LEGACY_ACTIVE);
}

async function openDb() {
  if (typeof indexedDB === "undefined") throw new Error("indexeddb_unavailable");
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STUDENTS_STORE)) db.createObjectStore(STUDENTS_STORE, { keyPath: "id" });
    if (!db.objectStoreNames.contains(HISTORY_STORE)) {
      const store = db.createObjectStore(HISTORY_STORE, { keyPath: "id" });
      store.createIndex("studentId", "studentId", { unique: false });
      store.createIndex("completedAt", "completedAt", { unique: false });
    }
    if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "key" });
  };
  const db = await requestResult(request);
  await migrateLegacy(db);
  return db;
}

export async function getLocalStudents() {
  const db = await openDb();
  const rows = await requestResult(db.transaction(STUDENTS_STORE, "readonly").objectStore(STUDENTS_STORE).getAll()) as LocalStudent[];
  return rows.map(normalizeStudent).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveLocalStudent(student: LocalStudent) {
  const db = await openDb();
  const tx = db.transaction(STUDENTS_STORE, "readwrite");
  tx.objectStore(STUDENTS_STORE).put(normalizeStudent(student));
  await transactionDone(tx);
}

export async function getLocalStudent(id: string) {
  const db = await openDb();
  const student = await requestResult(db.transaction(STUDENTS_STORE, "readonly").objectStore(STUDENTS_STORE).get(id)) as LocalStudent | undefined;
  return student ? normalizeStudent(student) : null;
}

export async function updateLocalStudent(id: string, patch: Partial<Omit<LocalStudent, "id" | "createdAt">>) {
  const student = await getLocalStudent(id);
  if (!student) return null;
  const next = normalizeStudent({ ...student, ...patch });
  await saveLocalStudent(next);
  return next;
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
    externalRepertoire: [],
    createdAt: new Date().toISOString(),
  };
}

export function saveActiveLesson(session: ActiveLesson) {
  if (typeof window !== "undefined") window.localStorage.setItem(ACTIVE, JSON.stringify(session));
}
export function getActiveLesson() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(ACTIVE) || "null") as ActiveLesson | null; } catch { return null; }
}
export function clearActiveLesson() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ACTIVE);
}

export async function getLessonHistory() {
  const db = await openDb();
  const rows = await requestResult(db.transaction(HISTORY_STORE, "readonly").objectStore(HISTORY_STORE).getAll()) as LessonHistory[];
  return rows.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
export async function getStudentHistory(studentId: string) {
  const db = await openDb();
  const rows = await requestResult(db.transaction(HISTORY_STORE, "readonly").objectStore(HISTORY_STORE).index("studentId").getAll(studentId)) as LessonHistory[];
  return rows.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
export async function saveLessonHistory(entry: LessonHistory) {
  const db = await openDb();
  const tx = db.transaction(HISTORY_STORE, "readwrite");
  tx.objectStore(HISTORY_STORE).put(entry);
  await transactionDone(tx);
}

export async function updateStudentMastery(studentId: string, updates: Partial<Record<CompetencyId, MasteryLevel>>, repertoire?: string) {
  const student = await getLocalStudent(studentId);
  if (!student) return;
  await saveLocalStudent({
    ...student,
    competencies: { ...student.competencies, ...updates },
    repertoire: repertoire && !student.repertoire.includes(repertoire) ? [repertoire, ...student.repertoire] : student.repertoire,
  });
}

export async function exportLocalBackup(): Promise<LocalBackup> {
  return { format: "luwipi-local-backup", version: 3, exportedAt: new Date().toISOString(), students: await getLocalStudents(), history: await getLessonHistory() };
}

function validStudent(value: unknown): value is LocalStudent {
  if (!value || typeof value !== "object") return false;
  const student = value as Partial<LocalStudent>;
  return typeof student.id === "string" && typeof student.name === "string" && ["2-3", "4-5", "6-8"].includes(String(student.ageBand));
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

  const db = await openDb();
  const tx = db.transaction([STUDENTS_STORE, HISTORY_STORE], "readwrite");
  tx.objectStore(STUDENTS_STORE).clear();
  tx.objectStore(HISTORY_STORE).clear();
  backup.students.map(normalizeStudent).forEach((student) => tx.objectStore(STUDENTS_STORE).put(student));
  backup.history.forEach((entry) => tx.objectStore(HISTORY_STORE).put(entry));
  await transactionDone(tx);
  clearActiveLesson();
  return { students: backup.students.length, history: backup.history.length };
}

export async function clearAllLocalLearningData() {
  const db = await openDb();
  const tx = db.transaction([STUDENTS_STORE, HISTORY_STORE], "readwrite");
  tx.objectStore(STUDENTS_STORE).clear();
  tx.objectStore(HISTORY_STORE).clear();
  await transactionDone(tx);
  clearActiveLesson();
}
