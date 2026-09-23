import test from "node:test";
import assert from "node:assert/strict";
import { recommendLessons } from "../lib/lesson-recommender";
import type { LessonTemplate } from "../lib/suzuki-lessons";

const lesson = (
  id: string,
  focus: LessonTemplate["focus"],
  level: LessonTemplate["level"] = "iniciante",
): LessonTemplate => ({
  id,
  ageBand: "4-5",
  level,
  title: id,
  shortTitle: id,
  repertoire: "Canção",
  focus,
  blocks: [{
    id: id + "-m",
    kind: "movement",
    title: "Mover",
    minutes: 4,
    objective: "",
    teacherCue: "",
    childCue: "",
    screenMode: "off",
    competencies: ["pulse"],
  }],
});

const lessons = [
  lesson("45-beautiful-sound", ["posture", "hand"]),
  lesson("45-echo", ["listening", "memory"]),
  lesson("45-first-piece", ["memory", "hand", "pulse"], "avancado"),
];

test("keeps lessons with unmet prerequisites behind ready lessons", () => {
  const result = recommendLessons(
    lessons,
    { ageBand: "4-5", level: "iniciante", repeatVariation: false, competencies: {} },
    "steady",
    [],
  );
  assert.equal(result[0].lesson.id, "45-beautiful-sound");
  assert.equal(result.at(-1)?.ready, false);
});

test("uses current external repertoire focus as a recommendation signal", () => {
  const result = recommendLessons(
    lessons,
    {
      ageBand: "4-5",
      level: "iniciante",
      repeatVariation: false,
      competencies: { listening: "emergente" },
      externalRepertoire: [{
        id: "r1",
        method: "Suzuki Piano School Vol. 1",
        piece: "Peça atual",
        focus: "ear-memory",
        active: true,
        createdAt: new Date(0).toISOString(),
      }],
    },
    "steady",
    [],
  );
  assert.ok(result.find((item) => item.lesson.id === "45-echo")?.reasons.some((reason) => reason.includes("Peça atual")));
});

test("state check favors movement for an energetic child", () => {
  const result = recommendLessons(
    lessons,
    { ageBand: "4-5", level: "iniciante", repeatVariation: false, competencies: { listening: "emergente" } },
    "electric",
    [],
  );
  assert.ok(result[0].reasons.includes("começa pelo corpo"));
});
