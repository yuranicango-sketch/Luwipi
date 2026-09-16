export type HomeworkAssignment = {
  code: string;
  childName: string;
  studentId?: string;
  songId: string;
  teacherNote: string;
  targetRepeats: number;
  validUntil: string;
  createdAt?: string;
};

export const demoAssignments: HomeworkAssignment[] = [
  {
    code: "LUWI-4827",
    childName: "Maria",
    songId: "passeio-das-cores",
    teacherNote: "Faça devagar. Primeiro diga as cores, depois toque.",
    targetRepeats: 3,
    validUntil: "2026-12-31",
    createdAt: "2026-09-16T00:00:00.000Z",
  },
];

export function normalizeHomeworkCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function getDemoAssignment(code: string) {
  const normalized = normalizeHomeworkCode(code);
  return demoAssignments.find((assignment) => assignment.code === normalized);
}
