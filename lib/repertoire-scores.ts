export type ScoreHand = "right" | "left" | "either" | "both";

export type ScoreNote = {
  name: string;
  midi: number;
  staffStep: number;
  beats: 1 | 2;
  finger?: 1 | 2 | 3 | 4 | 5;
  measureStart?: boolean;
  phraseEnd?: boolean;
};

export type ScoreTone = {
  name: string;
  midi: number;
  staffStep: number;
  finger?: 1 | 2 | 3 | 4 | 5;
};

export type ScoreEvent = {
  beats: 1 | 2;
  right?: ScoreTone[];
  left?: ScoreTone[];
  measureStart?: boolean;
  phraseEnd?: boolean;
  dynamic?: "pp" | "p" | "mp" | "mf" | "f";
  articulation?: "legato" | "staccato" | "accent";
  pedal?: "down" | "up";
};

export type RepertoireScore = {
  id: string;
  title: string;
  subtitle: string;
  level: "Primeiros sons" | "Iniciante" | "Em progresso" | "Avançado";
  kind: "study" | "repertoire";
  hand: ScoreHand;
  clef: "treble" | "bass" | "grand";
  source: string;
  methodReferences: string[];
  notes: ScoreNote[];
  events?: ScoreEvent[];
  volumeReference?: 1 | 2 | 3 | 4 | 5;
  skills?: string[];
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

const t = (name: string, midi: number, staffStep: number, finger?: 1 | 2 | 3 | 4 | 5): ScoreTone => ({
  name, midi, staffStep, ...(finger ? { finger } : {}),
});

const e = (
  right: ScoreTone[] | undefined,
  left: ScoreTone[] | undefined,
  beats: 1 | 2 = 1,
  measureStart = false,
  phraseEnd = false,
  dynamic?: ScoreEvent["dynamic"],
  articulation?: ScoreEvent["articulation"],
  pedal?: ScoreEvent["pedal"],
): ScoreEvent => ({
  ...(right?.length ? { right } : {}),
  ...(left?.length ? { left } : {}),
  beats,
  ...(measureStart ? { measureStart } : {}),
  ...(phraseEnd ? { phraseEnd } : {}),
  ...(dynamic ? { dynamic } : {}),
  ...(articulation ? { articulation } : {}),
  ...(pedal ? { pedal } : {}),
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
  {
    id: "v2-scale-c-rh",
    title: "Escala de Dó · Mão Direita",
    subtitle: "Uma oitava · passagem do polegar · original Luwipi",
    level: "Iniciante",
    kind: "study",
    hand: "right",
    clef: "treble",
    volumeReference: 2,
    skills: ["escala", "passagem do polegar", "regularidade"],
    source: "Estudo original do Luwipi baseado na progressão técnica observada no Volume 2; não reproduz a edição Suzuki.",
    methodReferences: ["Suzuki Piano School, Vol. 2 — referência à sequência de escala de Dó maior"],
    notes: [n("Dó",60,-2,1,1,true),n("Ré",62,-1,1,2),n("Mi",64,0,1,3),n("Fá",65,1,1,1,true),n("Sol",67,2,1,2),n("Lá",69,3,1,3),n("Si",71,4,1,4),n("Dó",72,5,2,5,false,true)],
  },
  {
    id: "v2-scale-c-lh",
    title: "Escala de Dó · Mão Esquerda",
    subtitle: "Uma oitava · cruzamento controlado · original Luwipi",
    level: "Iniciante",
    kind: "study",
    hand: "left",
    clef: "bass",
    volumeReference: 2,
    skills: ["escala", "passagem do dedo", "regularidade"],
    source: "Estudo original do Luwipi baseado na progressão técnica observada no Volume 2; não reproduz a edição Suzuki.",
    methodReferences: ["Suzuki Piano School, Vol. 2 — referência à sequência de escala de Dó maior"],
    notes: [n("Dó",48,-2,1,5,true),n("Ré",50,-1,1,4),n("Mi",52,0,1,3),n("Fá",53,1,1,2,true),n("Sol",55,2,1,1),n("Lá",57,3,1,3),n("Si",59,4,1,2),n("Dó",60,5,2,1,false,true)],
  },
  {
    id: "v2-scale-c-both",
    title: "Escala de Dó · Mãos Juntas",
    subtitle: "Coordenação paralela · original Luwipi",
    level: "Em progresso",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 2,
    skills: ["escala", "mãos juntas", "coordenação"],
    source: "Estudo original do Luwipi inspirado na ordem de prática do Volume 2: mãos separadas antes de mãos juntas.",
    methodReferences: ["Suzuki Piano School, Vol. 2 — referência à progressão mãos separadas → mãos juntas"],
    notes: [n("Dó",60,-2),n("Ré",62,-1),n("Mi",64,0),n("Fá",65,1),n("Sol",67,2),n("Lá",69,3),n("Si",71,4),n("Dó",72,5,2)],
    events: [
      e([t("Dó",60,-2,1)],[t("Dó",48,-2,5)],1,true,false,"mf"),
      e([t("Ré",62,-1,2)],[t("Ré",50,-1,4)]),
      e([t("Mi",64,0,3)],[t("Mi",52,0,3)]),
      e([t("Fá",65,1,1)],[t("Fá",53,1,2)],1,true),
      e([t("Sol",67,2,2)],[t("Sol",55,2,1)]),
      e([t("Lá",69,3,3)],[t("Lá",57,3,3)]),
      e([t("Si",71,4,4)],[t("Si",59,4,2)]),
      e([t("Dó",72,5,5)],[t("Dó",60,5,1)],2,false,true),
    ],
  },
  {
    id: "v2-dance-pattern",
    title: "Estudo de Dança · Volume 2",
    subtitle: "Melodia curta + baixo regular · original Luwipi",
    level: "Em progresso",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 2,
    skills: ["dança", "pulso", "acompanhamento"],
    source: "Estudo original do Luwipi criado a partir das competências de dança e acompanhamento do Volume 2.",
    methodReferences: ["Suzuki Piano School, Vol. 2 — referência de nível e textura; não reproduz nenhuma peça"],
    notes: [n("Sol",67,2),n("Mi",64,0),n("Fá",65,1),n("Ré",62,-1),n("Mi",64,0),n("Dó",60,-2,2)],
    events: [
      e([t("Sol",67,2,5)],[t("Dó",48,-2,5)],1,true,false,"mf","legato"),
      e([t("Mi",64,0,3)],[t("Sol",55,2,1)]),
      e([t("Fá",65,1,4)],[t("Dó",48,-2,5)]),
      e([t("Ré",62,-1,2)],[t("Sol",55,2,1)],1,true,true),
      e([t("Mi",64,0,3)],[t("Dó",48,-2,5)],1,true,false,"p"),
      e([t("Dó",60,-2,1)],[t("Dó",48,-2,5)],2,false,true),
    ],
  },
  {
    id: "v2-phrase-study",
    title: "Estudo de Frase · Volume 2",
    subtitle: "Crescer e repousar · original Luwipi",
    level: "Em progresso",
    kind: "study",
    hand: "right",
    clef: "treble",
    volumeReference: 2,
    skills: ["frase", "dinâmica", "legato"],
    source: "Estudo melódico original do Luwipi para frase e dinâmica no nível do Volume 2.",
    methodReferences: ["Suzuki Piano School, Vol. 2 — referência de progressão; conteúdo musical original Luwipi"],
    notes: [n("Dó",60,-2,1,1,true),n("Mi",64,0,1,3),n("Sol",67,2,1,5),n("Lá",69,3,1,5,true),n("Sol",67,2,1,4),n("Mi",64,0,1,3),n("Ré",62,-1,1,2),n("Dó",60,-2,2,1,false,true)],
  },
  {
    id: "v3-sonatina-pattern",
    title: "Textura de Sonatina · Volume 3",
    subtitle: "Melodia + acompanhamento quebrado · original Luwipi",
    level: "Em progresso",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 3,
    skills: ["sonatina", "acompanhamento quebrado", "independência"],
    source: "Estudo original do Luwipi baseado na textura e exigência técnica observadas no Volume 3.",
    methodReferences: ["Suzuki Piano School, Vol. 3 — referência a sonatinas e acompanhamento; não reproduz Clementi ou Kuhlau"],
    notes: [n("Dó",60,-2),n("Mi",64,0),n("Sol",67,2),n("Mi",64,0),n("Ré",62,-1),n("Fá",65,1),n("Sol",67,2),n("Dó",72,5,2)],
    events: [
      e([t("Dó",60,-2,1)],[t("Dó",48,-2,5)],1,true,false,"mf","legato"),
      e([t("Mi",64,0,3)],[t("Sol",55,2,1)]),
      e([t("Sol",67,2,5)],[t("Mi",52,0,3)]),
      e([t("Mi",64,0,3)],[t("Sol",55,2,1)],1,false,true),
      e([t("Ré",62,-1,2)],[t("Ré",50,-1,5)],1,true,false,"p"),
      e([t("Fá",65,1,4)],[t("Lá",57,3,1)]),
      e([t("Sol",67,2,5)],[t("Fá",53,1,3)]),
      e([t("Dó",72,5,5)],[t("Sol",55,2,1)],2,false,true),
    ],
  },
  {
    id: "v3-articulation-study",
    title: "Legato e Staccato · Volume 3",
    subtitle: "Trocar o toque sem perder o pulso · original Luwipi",
    level: "Em progresso",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 3,
    skills: ["legato", "staccato", "acento"],
    source: "Estudo original do Luwipi para contraste de articulação no nível do Volume 3.",
    methodReferences: ["Suzuki Piano School, Vol. 3 — referência de caráter e articulação"],
    notes: [n("Mi",64,0),n("Fá",65,1),n("Sol",67,2),n("Mi",64,0),n("Ré",62,-1),n("Dó",60,-2,2)],
    events: [
      e([t("Mi",64,0,3)],[t("Dó",48,-2,5)],1,true,false,"f","staccato"),
      e([t("Fá",65,1,4)],[t("Sol",55,2,1)],1,false,false,undefined,"staccato"),
      e([t("Sol",67,2,5)],[t("Dó",48,-2,5)],1,false,true,undefined,"accent"),
      e([t("Mi",64,0,3)],[t("Fá",53,1,5)],1,true,false,"p","legato"),
      e([t("Ré",62,-1,2)],[t("Lá",57,3,1)],1,false,false,undefined,"legato"),
      e([t("Dó",60,-2,1)],[t("Fá",53,1,5)],2,false,true,undefined,"legato"),
    ],
  },
  {
    id: "v3-form-study",
    title: "Forma A–B–A · Volume 3",
    subtitle: "Memória estrutural · original Luwipi",
    level: "Em progresso",
    kind: "study",
    hand: "right",
    clef: "treble",
    volumeReference: 3,
    skills: ["forma", "memória", "retorno"],
    source: "Pequeno estudo formal original do Luwipi para reconhecer contraste e retorno.",
    methodReferences: ["Suzuki Piano School, Vol. 3 — referência de escala formal; conteúdo musical original Luwipi"],
    notes: [n("Dó",60,-2,1,1,true),n("Mi",64,0,1,3),n("Sol",67,2,1,5),n("Mi",64,0,1,3,true,true),n("Ré",62,-1,1,2,true),n("Fá",65,1,1,4),n("Lá",69,3,1,5),n("Fá",65,1,1,4,true,true),n("Dó",60,-2,1,1,true),n("Mi",64,0,1,3),n("Sol",67,2,1,5),n("Dó",72,5,2,5,false,true)],
  },
  {
    id: "v4-rondo-study",
    title: "Rondó Curto · Volume 4",
    subtitle: "Tema que retorna · original Luwipi",
    level: "Avançado",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 4,
    skills: ["rondó", "retorno temático", "frase longa"],
    source: "Estudo formal original do Luwipi inspirado no salto de escala estrutural do Volume 4.",
    methodReferences: ["Suzuki Piano School, Vol. 4 — referência de forma e nível; não reproduz Mozart"],
    notes: [n("Ré",62,-1),n("Fá",65,1),n("Lá",69,3),n("Fá",65,1),n("Mi",64,0),n("Sol",67,2),n("Si",71,4),n("Sol",67,2),n("Ré",62,-1,2)],
    events: [
      e([t("Ré",62,-1,1)],[t("Ré",50,-1,5)],1,true,false,"mf","legato"),
      e([t("Fá",65,1,3)],[t("Lá",57,3,1)]),
      e([t("Lá",69,3,5)],[t("Fá",53,1,3)]),
      e([t("Fá",65,1,3)],[t("Lá",57,3,1)],1,false,true),
      e([t("Mi",64,0,2)],[t("Dó",48,-2,5)],1,true,false,"p"),
      e([t("Sol",67,2,4)],[t("Sol",55,2,1)]),
      e([t("Si",71,4,5)],[t("Mi",52,0,3)]),
      e([t("Sol",67,2,4)],[t("Sol",55,2,1)],1,false,true),
      e([t("Ré",62,-1,1)],[t("Ré",50,-1,5)],2,true,true,"f"),
    ],
  },
  {
    id: "v4-ornament-study",
    title: "Ornamento no Pulso · Volume 4",
    subtitle: "Vizinhas rápidas sem tensão · original Luwipi",
    level: "Avançado",
    kind: "study",
    hand: "right",
    clef: "treble",
    volumeReference: 4,
    skills: ["ornamento", "trino", "regularidade"],
    source: "Estudo original do Luwipi para preparar ornamentos leves no nível observado no Volume 4.",
    methodReferences: ["Suzuki Piano School, Vol. 4 — referência à ornamentação; não reproduz as sugestões editoriais"],
    notes: [n("Sol",67,2,1,3,true),n("Lá",69,3,1,4),n("Sol",67,2,1,3),n("Lá",69,3,1,4,true),n("Sol",67,2,1,3),n("Fá",65,1,1,2),n("Mi",64,0,1,1),n("Ré",62,-1,2,2,false,true)],
  },
  {
    id: "v4-two-voice-study",
    title: "Duas Vozes · Volume 4",
    subtitle: "Linhas independentes · original Luwipi",
    level: "Avançado",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 4,
    skills: ["polifonia", "vozes", "coordenação"],
    source: "Estudo contrapontístico original do Luwipi para preparar o tipo de independência exigido no repertório de Bach do Volume 4.",
    methodReferences: ["Suzuki Piano School, Vol. 4 — referência de nível polifónico; conteúdo original Luwipi"],
    notes: [n("Dó",60,-2),n("Ré",62,-1),n("Mi",64,0),n("Fá",65,1),n("Sol",67,2),n("Mi",64,0),n("Ré",62,-1),n("Dó",60,-2,2)],
    events: [
      e([t("Dó",60,-2,1)],[t("Sol",55,2,1)],1,true,false,"mf","legato"),
      e([t("Ré",62,-1,2)],[t("Fá",53,1,2)]),
      e([t("Mi",64,0,3)],[t("Mi",52,0,3)]),
      e([t("Fá",65,1,4)],[t("Ré",50,-1,4)],1,false,true),
      e([t("Sol",67,2,5)],[t("Dó",48,-2,5)],1,true,false,"p"),
      e([t("Mi",64,0,3)],[t("Ré",50,-1,4)]),
      e([t("Ré",62,-1,2)],[t("Mi",52,0,3)]),
      e([t("Dó",60,-2,1)],[t("Fá",53,1,2)],2,false,true),
    ],
  },
  {
    id: "v5-voicing-study",
    title: "Melodia que Canta · Volume 5",
    subtitle: "Voz superior sobre arpejo · original Luwipi",
    level: "Avançado",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 5,
    skills: ["voicing", "arpejo", "dinâmica", "pedal"],
    source: "Estudo original do Luwipi para voicing e acompanhamento quebrado no nível do Volume 5.",
    methodReferences: ["Suzuki Piano School, Vol. 5 — referência de textura e nível; não reproduz Für Elise"],
    notes: [n("Mi",64,0),n("Sol",67,2),n("Lá",69,3),n("Sol",67,2),n("Fá",65,1),n("Mi",64,0,2)],
    events: [
      e([t("Mi",64,0,3)],[t("Lá",45,-3,5)],1,true,false,"p","legato","down"),
      e([t("Sol",67,2,5)],[t("Mi",52,0,2)]),
      e([t("Lá",69,3,5)],[t("Lá",57,3,1)]),
      e([t("Sol",67,2,4)],[t("Mi",52,0,2)],1,false,true,undefined,undefined,"up"),
      e([t("Fá",65,1,4)],[t("Ré",50,-1,5)],1,true,false,"mp","legato","down"),
      e([t("Mi",64,0,3)],[t("Lá",57,3,1)],2,false,true,undefined,undefined,"up"),
    ],
  },
  {
    id: "v5-invention-study",
    title: "Imitação a Duas Vozes · Volume 5",
    subtitle: "A ideia passa de uma mão para a outra · original Luwipi",
    level: "Avançado",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 5,
    skills: ["contraponto", "imitação", "independência"],
    source: "Estudo contrapontístico original do Luwipi para preparar independência de vozes no nível do Volume 5.",
    methodReferences: ["Suzuki Piano School, Vol. 5 — referência à Invenção n.º 1 de Bach; não reproduz a obra nem a edição"],
    notes: [n("Dó",60,-2),n("Ré",62,-1),n("Mi",64,0),n("Sol",67,2),n("Mi",64,0),n("Ré",62,-1),n("Dó",60,-2,2)],
    events: [
      e([t("Dó",60,-2,1)],undefined,1,true,false,"mf","legato"),
      e([t("Ré",62,-1,2)],[t("Dó",48,-2,5)]),
      e([t("Mi",64,0,3)],[t("Ré",50,-1,4)]),
      e([t("Sol",67,2,5)],[t("Mi",52,0,3)],1,false,true),
      e([t("Mi",64,0,3)],[t("Sol",55,2,1)],1,true,false,"p"),
      e([t("Ré",62,-1,2)],[t("Mi",52,0,3)]),
      e([t("Dó",60,-2,1)],[t("Ré",50,-1,4)],2,false,true),
    ],
  },
  {
    id: "v5-sonata-study",
    title: "Cadência e Forma · Volume 5",
    subtitle: "Pergunta, desenvolvimento e regresso · original Luwipi",
    level: "Avançado",
    kind: "study",
    hand: "both",
    clef: "grand",
    volumeReference: 5,
    skills: ["sonata", "cadência", "memória estrutural"],
    source: "Estudo formal original do Luwipi para preparar obras clássicas de maior dimensão no nível do Volume 5.",
    methodReferences: ["Suzuki Piano School, Vol. 5 — referência de escala formal; conteúdo original Luwipi"],
    notes: [n("Dó",60,-2),n("Mi",64,0),n("Sol",67,2),n("Si",71,4),n("Lá",69,3),n("Fá",65,1),n("Ré",62,-1),n("Dó",60,-2,2)],
    events: [
      e([t("Dó",60,-2,1)],[t("Dó",48,-2,5)],1,true,false,"f","accent"),
      e([t("Mi",64,0,3)],[t("Sol",55,2,1)]),
      e([t("Sol",67,2,5)],[t("Mi",52,0,3)]),
      e([t("Si",71,4,5)],[t("Sol",55,2,1)],1,false,true),
      e([t("Lá",69,3,5)],[t("Fá",53,1,5)],1,true,false,"p","legato"),
      e([t("Fá",65,1,4)],[t("Lá",57,3,1)]),
      e([t("Ré",62,-1,2)],[t("Sol",55,2,1)]),
      e([t("Dó",60,-2,1)],[t("Dó",48,-2,5)],2,false,true,"mf"),
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
