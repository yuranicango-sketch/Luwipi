export type ScoreNote = {
  name: string;
  midi: number;
  staffStep: number;
  beats: 1 | 2;
};

export type RepertoireScore = {
  id: string;
  title: string;
  subtitle: string;
  level: "Primeiros sons" | "Iniciante" | "Em progresso";
  source: string;
  methodReferences: string[];
  notes: ScoreNote[];
};

const n = (name: string, midi: number, staffStep: number, beats: 1 | 2 = 1): ScoreNote => ({ name, midi, staffStep, beats });

export const repertoireScores: RepertoireScore[] = [
  {
    id: "twinkle",
    title: "Brilha, Brilha, Estrelinha",
    subtitle: "Melodia principal · mão direita",
    level: "Iniciante",
    source: "Melodia tradicional em domínio público · arranjo pedagógico próprio do Luwipi",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência de repertório; não reproduz a edição"],
    notes: [n("Dó",60,-2),n("Dó",60,-2),n("Sol",67,2),n("Sol",67,2),n("Lá",69,3),n("Lá",69,3),n("Sol",67,2,2),n("Fá",65,1),n("Fá",65,1),n("Mi",64,0),n("Mi",64,0),n("Ré",62,-1),n("Ré",62,-1),n("Dó",60,-2,2)],
  },
  {
    id: "mary",
    title: "Maria Tinha um Cordeirinho",
    subtitle: "Primeira frase · mão direita",
    level: "Primeiros sons",
    source: "Canção infantil histórica em domínio público · arranjo pedagógico próprio do Luwipi",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência de repertório; não reproduz a edição"],
    notes: [n("Mi",64,0),n("Ré",62,-1),n("Dó",60,-2),n("Ré",62,-1),n("Mi",64,0),n("Mi",64,0),n("Mi",64,0,2),n("Ré",62,-1),n("Ré",62,-1),n("Ré",62,-1,2),n("Mi",64,0),n("Sol",67,2),n("Sol",67,2,2)],
  },
  {
    id: "ode",
    title: "Ode à Alegria",
    subtitle: "Tema inicial · mão direita",
    level: "Em progresso",
    source: "L. van Beethoven · obra em domínio público · adaptação pedagógica própria do Luwipi",
    methodReferences: ["Repertório clássico de domínio público"],
    notes: [n("Mi",64,0),n("Mi",64,0),n("Fá",65,1),n("Sol",67,2),n("Sol",67,2),n("Fá",65,1),n("Mi",64,0),n("Ré",62,-1),n("Dó",60,-2),n("Dó",60,-2),n("Ré",62,-1),n("Mi",64,0),n("Mi",64,0,2),n("Ré",62,-1,2)],
  },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function scoreForRepertoire(title: string) {
  const target = normalize(title.replace(/—.*/, ""));
  return repertoireScores.find((score) => {
    const candidate = normalize(score.title);
    return target.includes(candidate) || candidate.includes(target);
  }) ?? null;
}
