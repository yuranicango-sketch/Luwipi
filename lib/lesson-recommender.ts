import type { AgeBand, CompetencyId, LessonTemplate, MasteryLevel, StudentState } from "./suzuki-lessons";
import { lessonPathMeta, unmetPrerequisites } from "./lesson-path";
import { repertoireFocusCompetencies, type ExternalRepertoire } from "./repertoire";

export type StudentForRecommendation = {
  ageBand: AgeBand;
  level: LessonTemplate["level"];
  repeatVariation: boolean;
  competencies: Partial<Record<CompetencyId, MasteryLevel>>;
  externalRepertoire?: ExternalRepertoire[];
};

export type Recommendation = {
  lesson: LessonTemplate;
  score: number;
  ready: boolean;
  unmet: CompetencyId[];
  reasons: string[];
};

export function recommendLessons(
  lessons: LessonTemplate[],
  student: StudentForRecommendation,
  state: StudentState,
  historyLessonIds: string[],
): Recommendation[] {
  const activeRepertoire = (student.externalRepertoire ?? []).find((item) => item.active);
  const repertoireSkills = activeRepertoire ? repertoireFocusCompetencies[activeRepertoire.focus] : [];

  return lessons
    .filter((lesson) => lesson.ageBand === student.ageBand)
    .map((lesson) => {
      let score = 0;
      const reasons: string[] = [];
      const path = lessonPathMeta(lesson.id);
      const unmet = unmetPrerequisites(lesson.id, student.competencies);
      const ready = unmet.length === 0;

      if (lesson.level === student.level) {
        score += 5;
        reasons.push("nível atual");
      }
      if (student.level === "iniciante" && lesson.level === "em-progresso") score += 1;

      const uses = historyLessonIds.filter((id) => id === lesson.id).length;
      score -= uses * (student.repeatVariation ? 1 : 0.12);
      if (uses > 0 && !student.repeatVariation) reasons.push("revisão consciente");

      if (state === "electric" && lesson.blocks.some((block) => block.kind === "movement" && block.minutes >= 4)) {
        score += 2;
        reasons.push("começa pelo corpo");
      }
      if (state === "tired" && lesson.focus.includes("listening")) {
        score += 2;
        reasons.push("mais escuta");
      }
      if (state === "sensitive" && (lesson.focus.includes("memory") || lesson.focus.includes("listening"))) {
        score += 2;
        reasons.push("mais previsível");
      }

      const emergingTargets = lesson.focus.filter((id) => !student.competencies[id] || student.competencies[id] === "emergente").length;
      score += emergingTargets;
      if (emergingTargets > 0) reasons.push("competências em construção");

      const reviewMatches = path.reviews.filter((id) => student.competencies[id] === "desenvolvimento").length;
      score += reviewMatches * 0.8;
      if (reviewMatches > 0) reasons.push("revisão em espiral");

      const repertoireMatches = lesson.focus.filter((id) => repertoireSkills.includes(id)).length;
      score += repertoireMatches * 1.25;
      if (repertoireMatches > 0 && activeRepertoire) reasons.push(`apoia “${activeRepertoire.piece}”`);

      if (!ready) score -= 10 + unmet.length * 2;
      else score += Math.max(0, 3 - path.sequence * 0.15);

      return { lesson, score, ready, unmet, reasons };
    })
    .sort((a, b) => {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      return b.score - a.score;
    });
}
