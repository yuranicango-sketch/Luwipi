export type ScoreHand = "right" | "left" | "either";

export type ScoreNote = {
  name: string;
  midi: number;
  staffStep: number;
  beats: 1 | 2;
  finger?: 1 | 2 | 3 | 4 | 5;
  measureStart?: boolean;
  phraseEnd?: boolean;
};

export type RepertoireScore = {
  id: string;
  title: string;
  subtitle: string;
  level: "Primeiros sons" | "Iniciante" | "Em progresso";
  kind: "study" | "repertoire";
  hand: ScoreHand;
  clef: "treble" | "bass";
  source: string;
  methodReferences: string[];
  notes: ScoreNote[];
};

const n = (
  name: string,
  midi: number,
  staffStep: number,
  beats: 1 | 2 = 1,
  finger?: 1 | 2 | 3 | 4 | 5,
  measureStart = false,
  phraseEnd = false,
): ScoreNote => ({
  name, midi, staffStep, beats,
  ...(finger ? { finger } : {}),
  ...(measureStart ? { measureStart } : {}),
  ...(phraseEnd ? { phraseEnd } : {}),
});

export const repertoireScores: RepertoireScore[] = [
  {
    id: "study-rh-1",
    title: "Estudo Luwipi · Mão Direita 1",
    subtitle: "Cinco dedos · pulso regular · original Luwipi",
    level: "Primeiros sons",
    kind: "study",
    hand: "right",
    clef: "treble",
    source: "Exercício técnico original do Luwipi, criado a partir da sequência pedagógica observada no Volume 1; não reproduz a edição Suzuki.",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência de sequência pedagógica; conteúdo musical original Luwipi"],
    notes: [
      n("Dó",60,-2,1,1,true),n("Ré",62,-1,1,2),n("Mi",64,0,1,3),n("Fá",65,1,1,4,true,true),
      n("Sol",67,2,1,5,true),n("Fá",65,1,1,4),n("Mi",64,0,1,3),n("Ré",62,-1,1,2,true,true),
      n("Dó",60,-2,2,1,true),
    ],
  },
  {
    id: "tone-rh-1",
    title: "Tonalização Luwipi · Mão Direita",
    subtitle: "Legato em cinco notas · original Luwipi",
    level: "Primeiros sons",
    kind: "study",
    hand: "right",
    clef: "treble",
    source: "Exercício de sonoridade original do Luwipi; não reproduz os exercícios editoriais Suzuki.",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência ao conceito de tonalização"],
    notes: [
      n("Dó",60,-2,2,1,true),n("Ré",62,-1,2,2),n("Mi",64,0,2,3,true,true),
      n("Fá",65,1,2,4,true),n("Sol",67,2,2,5),n("Fá",65,1,2,4,true,true),
      n("Mi",64,0,2,3,true),n("Ré",62,-1,2,2),n("Dó",60,-2,2,1,true,true),
    ],
  },
  {
    id: "study-lh-1",
    title: "Estudo Luwipi · Mão Esquerda 1",
    subtitle: "Cinco dedos no grave · original Luwipi",
    level: "Primeiros sons",
    kind: "study",
    hand: "left",
    clef: "bass",
    source: "Exercício técnico original do Luwipi, criado a partir da sequência pedagógica observada no Volume 1; não reproduz a edição Suzuki.",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência de sequência pedagógica; conteúdo musical original Luwipi"],
    notes: [
      n("Dó",48,-2,1,5,true),n("Ré",50,-1,1,4),n("Mi",52,0,1,3),n("Fá",53,1,1,2,true,true),
      n("Sol",55,2,1,1,true),n("Fá",53,1,1,2),n("Mi",52,0,1,3),n("Ré",50,-1,1,4,true,true),
      n("Dó",48,-2,2,5,true),
    ],
  },
  {
    id: "tone-lh-1",
    title: "Tonalização Luwipi · Mão Esquerda",
    subtitle: "Legato no grave · original Luwipi",
    level: "Primeiros sons",
    kind: "study",
    hand: "left",
    clef: "bass",
    source: "Exercício de sonoridade original do Luwipi; não reproduz os exercícios editoriais Suzuki.",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência ao conceito de tonalização"],
    notes: [
      n("Sol",55,2,2,1,true),n("Fá",53,1,2,2),n("Mi",52,0,2,3,true,true),
      n("Ré",50,-1,2,4,true),n("Dó",48,-2,2,5),n("Ré",50,-1,2,4,true,true),
      n("Mi",52,0,2,3,true),n("Fá",53,1,2,2),n("Sol",55,2,2,1,true,true),
    ],
  },
  {
    id: "twinkle",
    title: "Brilha, Brilha, Estrelinha",
    subtitle: "Melodia principal · mão direita",
    level: "Iniciante",
    kind: "repertoire",
    hand: "right",
    clef: "treble",
    source: "Melodia tradicional em domínio público · arranjo pedagógico próprio do Luwipi",
    methodReferences: ["Suzuki Piano School, Vol. 1 — referência de repertório; não reproduz a edição"],
    notes: [
      n("Dó",60,-2,1,1,true),n("Dó",60,-2,1,1),n("Sol",67,2,1,5),n("Sol",67,2,1,5,true),
      n("Lá",69,3,1,5,true),n("Lá",69,3,1,5),n("Sol",67,2,2,4, false,true),
      n("Fá",65,1,1,4,true),n("Fá",65,1,1,4),n("Mi",64,0,1,3),n("Mi",64,0,1,3,true),
      n("Ré",62,-1,1,2,true),n("Ré",62,-1,1,2),n("Dó",60,-2,2,1,false,true),
    ],
  },
  {
    id: "mary",
    title: "Maria Tinha um Cordeirinho",
    subtitle: "Primeira frase · mão direita",
    level: "Primeiros sons",
    kind: "repertoire",
    hand: "right",
    clef: "treble",
    source: "Canção infantil histórica em domínio público · arranjo pedagógico próprio do Luwipi",
    methodReferences: ["Canção infantil tradicional — sem referência específica a uma edição de método"],
    notes: [
      n("Mi",64,0,1,3,true),n("Ré",62,-1,1,2),n("Dó",60,-2,1,1),n("Ré",62,-1,1,2,true),
      n("Mi",64,0,1,3,true),n("Mi",64,0,1,3),n("Mi",64,0,2,3,false,true),
      n("Ré",62,-1,1,2,true),n("Ré",62,-1,1,2),n("Ré",62,-1,2,2,false,true),
      n("Mi",64,0,1,3,true),n("Sol",67,2,1,5),n("Sol",67,2,2,5,false,true),
    ],
  },
  {
    id: "ode",
    title: "Ode à Alegria",
    subtitle: "Tema inicial · mão direita",
    level: "Em progresso",
    kind: "repertoire",
    hand: "right",
    clef: "treble",
    source: "L. van Beethoven · obra em domínio público · adaptação pedagógica própria do Luwipi",
    methodReferences: ["Repertório clássico de domínio público"],
    notes: [
      n("Mi",64,0,1,3,true),n("Mi",64,0,1,3),n("Fá",65,1,1,4),n("Sol",67,2,1,5,true),
      n("Sol",67,2,1,5,true),n("Fá",65,1,1,4),n("Mi",64,0,1,3),n("Ré",62,-1,1,2,true,true),
      n("Dó",60,-2,1,1,true),n("Dó",60,-2,1,1),n("Ré",62,-1,1,2),n("Mi",64,0,1,3,true),
      n("Mi",64,0,2,3,true),n("Ré",62,-1,2,2,false,true),
    ],
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
