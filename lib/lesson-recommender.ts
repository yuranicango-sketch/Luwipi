import { competencyLabels, lessonTemplates, lessonsForAge, type CompetencyId, type LessonTemplate, type MasteryLevel, type StudentState } from "@/lib/suzuki-lessons";
import type { LessonHistory, LocalStudent } from "@/lib/teacher-local-v2";

export type LessonRecommendation = {
  lesson: LessonTemplate;
  score: number;
  reasons: string[];
};

const masteryRank: Record<MasteryLevel, number> = {
  emergente: 0,
  desenvolvimento: 1,
  consolidado: 2,
  independente: 3,
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levelDistance(student: LocalStudent["level"], lesson: LessonTemplate["level"]) {
  const order = ["iniciante", "em-progresso", "avancado"] as const;
  return Math.abs(order.indexOf(student) - order.indexOf(lesson));
}

function lessonFocusLabel(ids: CompetencyId[]) {
  return ids.slice(0, 2).map((id) => competencyLabels[id]).join(" + ");
}

export function recommendLessons(
  student: LocalStudent,
  state: StudentState,
  history: LessonHistory[],
): LessonRecommendation[] {
  const studentHistory = history.filter((item) => item.studentId === student.id);
  const recent = studentHistory.slice(0, 4);
  const ageLessons = lessonsForAge(student.ageBand);
  const seenIds = new Set(studentHistory.map((item) => item.lessonId));
  const firstUnseen = ageLessons.find((lesson) => !seenIds.has(lesson.id));
  const recentCompetencies = new Set<CompetencyId>(
    recent.flatMap((item) => Object.keys(item.competencies) as CompetencyId[]),
  );

  const currentPiece = normalize(student.currentRepertoire?.pieceTitle ?? "");

  return ageLessons.map((lesson) => {
    let score = 0;
    const reasons: string[] = [];

    const distance = levelDistance(student.level, lesson.level);
    score += distance === 0 ? 5 : distance === 1 ? 1 : -4;
    if (distance === 0) reasons.push("Nível atual");

    if (firstUnseen?.id === lesson.id) {
      score += 3;
      reasons.push("Próximo passo do percurso");
    }

    const weak = lesson.focus.filter((id) => {
      const level = student.competencies[id];
      return !level || masteryRank[level] <= 1;
    });
    if (weak.length) {
      score += weak.length * 1.6;
      reasons.push("Reforça " + lessonFocusLabel(weak));
    }

    const review = lesson.focus.filter((id) => {
      const level = student.competencies[id];
      return !!level && masteryRank[level] >= 2 && !recentCompetencies.has(id);
    });
    if (review.length) {
      score += Math.min(1.8, review.length * .7);
      reasons.push("Revisão espaçada");
    }

    const totalUses = studentHistory.filter((item) => item.lessonId === lesson.id).length;
    const recentUses = recent.filter((item) => item.lessonId === lesson.id).length;
    if (recentUses) {
      score -= student.repeatVariation ? recentUses * .35 : recentUses * .12;
    } else if (totalUses > 0) {
      score += .4;
    }

    if (totalUses > 0 && !student.repeatVariation) reasons.push("Repetição consciente");

    if (state === "electric" && lesson.blocks.some((block) => block.kind === "movement" && block.minutes >= 4)) {
      score += 1.7;
      reasons.push("Começa pelo corpo");
    }
    if (state === "tired" && lesson.focus.includes("listening")) {
      score += 1.7;
      reasons.push("Menos carga, mais escuta");
    }
    if (state === "sensitive" && (lesson.focus.includes("memory") || lesson.focus.includes("listening"))) {
      score += 1.5;
      reasons.push("Entrada previsível");
    }

    if (currentPiece) {
      const lessonRepertoire = normalize(lesson.repertoire);
      if (lessonRepertoire.includes(currentPiece) || currentPiece.includes(lessonRepertoire)) {
        score += 4;
        reasons.push("Continua a peça atual");
      } else if (student.currentRepertoire?.status === "review" && lesson.focus.includes("memory")) {
        score += .8;
        reasons.push("Ajuda a manter repertório");
      }
    }

    return { lesson, score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return lessonTemplates.indexOf(a.lesson) - lessonTemplates.indexOf(b.lesson);
  });
}

export function nextCompetencyFocus(student: LocalStudent) {
  return (Object.keys(competencyLabels) as CompetencyId[])
    .map((id) => {
      const level = student.competencies[id] ?? null;
      const priority = level === "emergente"
        ? 0
        : level === "desenvolvimento"
          ? 1
          : level === null
            ? 2
            : level === "consolidado"
              ? 3
              : 4;
      return { id, level, priority };
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(({ id, level }) => ({ id, label: competencyLabels[id], level }));
}
