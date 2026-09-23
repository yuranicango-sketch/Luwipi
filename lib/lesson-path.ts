import type { CompetencyId, MasteryLevel } from "@/lib/suzuki-lessons";

export type LessonPathMeta = {
  sequence: number;
  prerequisites: Partial<Record<CompetencyId, MasteryLevel>>;
  reviews: CompetencyId[];
  next: string[];
};

export const masteryRank: Record<MasteryLevel, number> = {
  emergente: 1,
  desenvolvimento: 2,
  consolidado: 3,
  independente: 4,
};

export const lessonPath: Record<string, LessonPathMeta> = {
  "23-hello": { sequence: 1, prerequisites: {}, reviews: ["listening"], next: ["23-bear-bird", "23-walk"] },
  "23-bear-bird": { sequence: 2, prerequisites: { listening: "emergente" }, reviews: ["listening","pitch"], next: ["23-walk"] },
  "23-walk": { sequence: 3, prerequisites: { listening: "emergente" }, reviews: ["pulse","rhythm"], next: ["23-dynamics"] },
  "23-dynamics": { sequence: 4, prerequisites: { listening: "emergente", pulse: "emergente" }, reviews: ["dynamics","hand"], next: ["23-first-song"] },
  "23-first-song": { sequence: 5, prerequisites: { memory: "desenvolvimento", listening: "desenvolvimento" }, reviews: ["memory","keyboard"], next: [] },

  "45-beautiful-sound": { sequence: 1, prerequisites: {}, reviews: ["posture","hand"], next: ["45-echo","45-keyboard-groups"] },
  "45-echo": { sequence: 2, prerequisites: { listening: "emergente" }, reviews: ["listening","memory","rhythm"], next: ["45-keyboard-groups"] },
  "45-keyboard-groups": { sequence: 3, prerequisites: { listening: "emergente" }, reviews: ["keyboard","pitch"], next: ["45-direction"] },
  "45-direction": { sequence: 4, prerequisites: { pitch: "emergente", keyboard: "emergente" }, reviews: ["pitch","keyboard","memory"], next: ["45-first-piece"] },
  "45-first-piece": { sequence: 5, prerequisites: { memory: "desenvolvimento", hand: "emergente", pulse: "emergente" }, reviews: ["memory","hand","pulse"], next: [] },

  "68-body-piano": { sequence: 1, prerequisites: {}, reviews: ["posture","hand","fingers"], next: ["68-hear-find","68-rhythm"] },
  "68-hear-find": { sequence: 2, prerequisites: { listening: "emergente" }, reviews: ["listening","pitch","keyboard"], next: ["68-rhythm"] },
  "68-rhythm": { sequence: 3, prerequisites: { pulse: "emergente" }, reviews: ["pulse","rhythm","coordination"], next: ["68-reading"] },
  "68-reading": { sequence: 4, prerequisites: { memory: "desenvolvimento", pitch: "emergente" }, reviews: ["reading","memory","pitch"], next: ["68-performance"] },
  "68-performance": { sequence: 5, prerequisites: { memory: "desenvolvimento", hand: "desenvolvimento" }, reviews: ["memory","coordination","dynamics"], next: [] },
};

export function lessonPathMeta(id: string): LessonPathMeta {
  return lessonPath[id] ?? { sequence: 999, prerequisites: {}, reviews: [], next: [] };
}

export function unmetPrerequisites(id: string, competencies: Partial<Record<CompetencyId, MasteryLevel>>) {
  const meta = lessonPathMeta(id);
  return Object.entries(meta.prerequisites)
    .filter(([competency, required]) => {
      const current = competencies[competency as CompetencyId];
      return !current || masteryRank[current] < masteryRank[required as MasteryLevel];
    })
    .map(([competency]) => competency as CompetencyId);
}
