import type { CompetencyId } from "@/lib/suzuki-lessons";

export type VolumeOneStage = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  goal: string;
  competencies: CompetencyId[];
  scoreIds: string[];
  sourceBasis: string;
};

export const volumeOnePath: VolumeOneStage[] = [
  {
    id: "right-hand-foundation",
    order: 1,
    title: "Mão direita primeiro",
    subtitle: "Pulso, dedos e repetição consciente",
    goal: "Criar controlo digital básico sem pedir leitura complexa ao mesmo tempo.",
    competencies: ["pulse","fingers","hand","memory"],
    scoreIds: ["study-rh-1","twinkle"],
    sourceBasis: "Volume 1: estudos preparatórios da mão direita antes do repertório.",
  },
  {
    id: "right-hand-tone",
    order: 2,
    title: "Tonalização da mão direita",
    subtitle: "Som bonito antes de tocar mais notas",
    goal: "Trabalhar legato, relaxamento e qualidade de som em poucas notas.",
    competencies: ["dynamics","hand","fingers","listening"],
    scoreIds: ["tone-rh-1"],
    sourceBasis: "Volume 1: secção de tonalização da mão direita.",
  },
  {
    id: "left-hand-foundation",
    order: 3,
    title: "Mão esquerda separada",
    subtitle: "A mesma lógica, agora no registo grave",
    goal: "Dar à mão esquerda uma preparação própria antes de pedir coordenação.",
    competencies: ["fingers","hand","keyboard","memory"],
    scoreIds: ["study-lh-1"],
    sourceBasis: "Volume 1: estudos preparatórios da mão esquerda.",
  },
  {
    id: "left-hand-tone",
    order: 4,
    title: "Tonalização da mão esquerda",
    subtitle: "Ouvir e produzir um som estável no grave",
    goal: "Consolidar gesto, legato e controlo de peso na mão esquerda.",
    competencies: ["dynamics","hand","listening"],
    scoreIds: ["tone-lh-1"],
    sourceBasis: "Volume 1: tonalização da mão esquerda.",
  },
  {
    id: "known-song",
    order: 5,
    title: "Canção conhecida como ponte",
    subtitle: "Ouvido → memória → pauta",
    goal: "Usar uma melodia já familiar para introduzir leitura sem retirar o ouvido do centro.",
    competencies: ["listening","memory","reading","pitch"],
    scoreIds: ["twinkle","mary"],
    sourceBasis: "Volume 1: repertório simples depois dos estudos e tonalização.",
  },
  {
    id: "phrase-and-pulse",
    order: 6,
    title: "Frase, pulso e pequenas formas",
    subtitle: "De notas isoladas para música contínua",
    goal: "Manter pulso, reconhecer frases e terminar uma pequena peça sem interrupções constantes.",
    competencies: ["pulse","rhythm","memory","dynamics"],
    scoreIds: ["ode"],
    sourceBasis: "Volume 1: repertório progressivo com fraseado, dinâmica e mãos cada vez mais coordenadas.",
  },
];

export function volumeOneStageForScore(scoreId: string) {
  return volumeOnePath.find((stage) => stage.scoreIds.includes(scoreId)) ?? null;
}
