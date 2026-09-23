import type { CompetencyId } from "@/lib/suzuki-lessons";

export type RepertoireFocus = "ear-memory" | "technique" | "reading" | "coordination";

export const repertoireFocusLabels: Record<RepertoireFocus, string> = {
  "ear-memory": "Ouvido e memória",
  technique: "Técnica e som",
  reading: "Leitura",
  coordination: "Coordenação",
};

export const repertoireFocusCompetencies: Record<RepertoireFocus, CompetencyId[]> = {
  "ear-memory": ["listening", "memory", "pitch"],
  technique: ["posture", "hand", "fingers", "dynamics"],
  reading: ["reading", "pitch", "keyboard"],
  coordination: ["coordination", "pulse", "rhythm"],
};
