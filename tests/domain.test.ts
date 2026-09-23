import test from "node:test";
import assert from "node:assert/strict";
import { lessonTemplates, type CompetencyId } from "../lib/suzuki-lessons";
import { nextCompetencyFocus, recommendLessons } from "../lib/lesson-recommender";
import type { LocalStudent } from "../lib/teacher-local-v2";

function student(patch: Partial<LocalStudent> = {}): LocalStudent {
  return {
    id: "student-1",
    name: "Sofia",
    ageBand: "4-5",
    level: "iniciante",
    repeatVariation: false,
    reducedStimulus: false,
    competencies: {},
    repertoire: [],
    createdAt: "2026-09-23T00:00:00.000Z",
    ...patch,
  };
}

test("curriculum starts with exactly 15 model lessons: five per age band", () => {
  assert.equal(lessonTemplates.length, 15);
  for (const age of ["2-3", "4-5", "6-8"] as const) {
    assert.equal(lessonTemplates.filter((lesson) => lesson.ageBand === age).length, 5);
  }
});

test("every model lesson contains the live-teaching spine", () => {
  const required = ["arrival", "movement", "ear", "piano", "repertoire", "closing"];
  for (const lesson of lessonTemplates) {
    assert.deepEqual(lesson.blocks.map((block) => block.kind), required);
    assert.ok(lesson.blocks.every((block) => block.minutes > 0));
  }
});

test("child-facing cues never use explicit wrong/error punishment", () => {
  const forbidden = /(?:❌|errad[oa]|falhaste|perdeste|0\/|score)/i;
  for (const lesson of lessonTemplates) {
    for (const block of lesson.blocks) {
      assert.doesNotMatch(block.childCue, forbidden, `${lesson.id}/${block.id}`);
    }
  }
});

test("current repertoire influences the recommendation without copying method content", () => {
  const s = student({
    currentRepertoire: {
      methodTitle: "Método externo",
      pieceTitle: "Maria Tinha um Cordeirinho",
      status: "learning",
    },
  });
  const recommendations = recommendLessons(s, "steady", []);
  assert.ok(recommendations.length > 0);
  assert.ok(recommendations[0].reasons.includes("Continua a peça atual"));
  assert.match(recommendations[0].lesson.repertoire, /Maria Tinha/i);
});

test("weak competencies surface as next focus and remain teacher-owned", () => {
  const competencies: Partial<Record<CompetencyId, "emergente" | "desenvolvimento" | "consolidado" | "independente">> = {
    listening: "independente",
    pulse: "consolidado",
    rhythm: "desenvolvimento",
    pitch: "emergente",
  };
  const focus = nextCompetencyFocus(student({ competencies }));
  assert.equal(focus.length, 3);
  assert.ok(focus.some((item) => item.id === "pitch"));
  assert.ok(focus.some((item) => item.level === null));
});

test("daily state changes reasons, not mastery", () => {
  const s = student();
  const before = JSON.stringify(s.competencies);
  const tired = recommendLessons(s, "tired", []);
  assert.ok(tired.some((item) => item.reasons.includes("Menos carga, mais escuta")));
  assert.equal(JSON.stringify(s.competencies), before);
});
