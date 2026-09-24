import test from "node:test";
import assert from "node:assert/strict";
import { lessonTemplates, wildcardActivities, type CompetencyId } from "../lib/suzuki-lessons";
import { repertoireScores } from "../lib/repertoire-scores";
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
  const matching = recommendations.find((item) => /Maria Tinha/i.test(item.lesson.repertoire));
  assert.ok(matching);
  assert.ok(matching.reasons.includes("Continua a peça atual"));
  assert.match(matching.lesson.repertoire, /Maria Tinha/i);
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


test("advanced lessons stay behind explicit prerequisites", () => {
  const recommendations = recommendLessons(
    student({ level: "avancado", competencies: {} }),
    "steady",
    [],
  );
  const performance = recommendations.find((item) => item.lesson.id === "45-first-piece");
  assert.ok(performance);
  assert.equal(performance.ready, false);
  assert.ok(performance.unmet.includes("memory"));
  assert.equal(recommendations[0].ready, true);
});

test("repertoire focus supports a published piece even when the title is different", () => {
  const s = student({
    ageBand: "6-8",
    level: "em-progresso",
    competencies: { memory: "desenvolvimento", pitch: "emergente" },
    currentRepertoire: {
      methodTitle: "Suzuki Piano School Vol. 1",
      pieceTitle: "Peça externa em estudo",
      status: "learning",
      focus: "reading",
    },
  });
  const reading = recommendLessons(s, "steady", []).find((item) => item.lesson.id === "68-reading");
  assert.ok(reading);
  assert.equal(reading.ready, true);
  assert.ok(reading.reasons.includes("Apoia a peça atual"));
});

test("every live-teaching block gives the accompanying adult a useful cue", () => {
  for (const lesson of lessonTemplates) {
    for (const block of lesson.blocks) {
      assert.ok(block.parentCue?.trim(), `${lesson.id}/${block.kind} is missing parentCue`);
    }
  }
});

test("wildcards communicate 60-90 seconds without turning it into a rigid timer", () => {
  for (const blocks of Object.values(wildcardActivities)) {
    for (const block of blocks) {
      assert.match(block.durationLabel ?? "", /60–90 s/);
      assert.match(block.durationLabel ?? "", /sem cronómetro/);
      assert.ok(block.minutes >= 1 && block.minutes <= 1.5);
    }
  }
});

test("embedded sheet music remains independent from published method editions", () => {
  assert.ok(repertoireScores.length >= 7);
  for (const score of repertoireScores) {
    if (score.kind === "repertoire") assert.match(score.source, /domínio público/i);
    else assert.match(score.source, /original do Luwipi/i);
    assert.ok(score.notes.length >= 8 || (score.events?.length ?? 0) >= 6, score.id + " is too short to be useful");
    assert.ok(score.methodReferences.every((reference) => /referência|repertório|tradicional/i.test(reference)));
  }
});
