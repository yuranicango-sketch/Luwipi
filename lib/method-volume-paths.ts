import type { CompetencyId } from "@/lib/suzuki-lessons";

export type MethodStage = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  goal: string;
  competencies: CompetencyId[];
  scoreIds: string[];
  repertoireReferences: string[];
};

export type MethodVolumePath = {
  volume: 2 | 3 | 4 | 5;
  title: string;
  summary: string;
  stages: MethodStage[];
};

export const methodVolumePaths: MethodVolumePath[] = [
  {
    volume: 2,
    title: "Escalas, duas mãos e pequenas formas",
    summary: "Dó maior em mãos separadas, duas oitavas e mãos juntas; depois dança, acompanhamento, frase e dinâmica.",
    stages: [
      { id:"v2-c-separate", order:1, title:"Escala de Dó maior · mãos separadas", subtitle:"Polegar sem tensão", goal:"Estabilizar dedilhação e som antes de juntar as mãos.", competencies:["fingers","hand","keyboard","reading"], scoreIds:["v2-scale-c-rh","v2-scale-c-lh"], repertoireReferences:[] },
      { id:"v2-two-octaves", order:2, title:"Duas oitavas", subtitle:"Continuidade entre posições", goal:"Atravessar posições mantendo pulso e gesto livre.", competencies:["fingers","pulse","keyboard","coordination"], scoreIds:["v2-scale-c-two-octaves"], repertoireReferences:[] },
      { id:"v2-hands-together", order:3, title:"Escala a mãos juntas", subtitle:"Dedilhações diferentes, pulso comum", goal:"Sincronizar polegares e passagens de dedos.", competencies:["coordination","fingers","pulse","hand"], scoreIds:["v2-scale-c-both"], repertoireReferences:["Écossaise — J. N. Hummel"] },
      { id:"v2-dance", order:4, title:"Dança e acompanhamento", subtitle:"Melodia sobre padrão regular", goal:"Manter uma mão estável enquanto a outra fraseia.", competencies:["coordination","pulse","rhythm","memory"], scoreIds:["v2-dance-pattern"], repertoireReferences:["Minuet in G Major","Minuet in G Minor","Écossaise"] },
      { id:"v2-phrase", order:5, title:"Frase e dinâmica", subtitle:"Tocar além das notas certas", goal:"Organizar começo, direção e final com contraste de intensidade.", competencies:["dynamics","memory","reading","listening"], scoreIds:["v2-phrase-study"], repertoireReferences:["A Short Story","The Happy Farmer","Cradle Song","Melody"] }
    ]
  },
  {
    volume: 3,
    title: "Sonatina, acompanhamento e independência",
    summary: "Sonatinas completas, movimentos contrastantes, acompanhamento quebrado e articulação mais exigente.",
    stages: [
      { id:"v3-sonatina", order:1, title:"Textura de sonatina", subtitle:"Melodia + acompanhamento quebrado", goal:"Separar papéis entre as mãos sem perder a pulsação comum.", competencies:["coordination","pulse","hand","memory"], scoreIds:["v3-sonatina-pattern"], repertoireReferences:["Sonatina in C Major, Op. 36 No. 1 — Clementi"] },
      { id:"v3-character", order:2, title:"Contraste entre movimentos", subtitle:"Allegro, Andante e Vivace", goal:"Mudar caráter, toque e pulso mantendo controlo técnico.", competencies:["dynamics","rhythm","listening","memory"], scoreIds:["v3-articulation-study"], repertoireReferences:["Clementi — Allegro / Andante / Vivace"] },
      { id:"v3-broken", order:3, title:"Acompanhamento quebrado contínuo", subtitle:"Regularidade sem endurecer", goal:"Manter padrão uniforme enquanto a melodia respira.", competencies:["coordination","fingers","pulse","hand"], scoreIds:["v3-sonatina-pattern"], repertoireReferences:["Sonatina in C Major, Op. 55 No. 1 — Kuhlau"] },
      { id:"v3-articulation", order:4, title:"Articulação e ataque", subtitle:"Legato, staccato e acento", goal:"Mudar articulação sem alterar pulso nem criar tensão.", competencies:["dynamics","fingers","reading","listening"], scoreIds:["v3-articulation-study"], repertoireReferences:["The Wild Rider","Ecossaise","Teasing Song"] },
      { id:"v3-form", order:5, title:"Forma maior", subtitle:"Saber onde a música está", goal:"Reconhecer secções, retornos e cadências.", competencies:["memory","reading","coordination","dynamics"], scoreIds:["v3-form-study"], repertoireReferences:["Theme from Symphony No. 3 'Eroica'","Little Waltz"] }
    ]
  },
  {
    volume: 4,
    title: "Ornamentos, polifonia e forma clássica",
    summary: "Rondo, minueto, Burgmüller, Bach e sonatina ampliam forma, ornamentação, agilidade e independência de vozes.",
    stages: [
      { id:"v4-rondo", order:1, title:"Fluxo em forma de rondó", subtitle:"Tema que retorna", goal:"Ouvir retornos e manter energia em frases longas.", competencies:["memory","reading","pulse","dynamics"], scoreIds:["v4-rondo-study"], repertoireReferences:["Rondo from Divertimento in D Major, K. 334 — Mozart"] },
      { id:"v4-ornament", order:2, title:"Ornamentos no pulso", subtitle:"Trinos e notas auxiliares", goal:"Preparar ornamentos leves sem esmagar a frase.", competencies:["fingers","rhythm","listening","dynamics"], scoreIds:["v4-ornament-study"], repertoireReferences:["Minuet I from 8 Minuets — Mozart"] },
      { id:"v4-even", order:3, title:"Dedos iguais", subtitle:"Velocidade nasce da regularidade", goal:"Construir agilidade com som uniforme.", competencies:["fingers","pulse","hand","reading"], scoreIds:["v4-even-finger-study"], repertoireReferences:["Arabesque — Burgmüller","By the Limpid Stream — Burgmüller"] },
      { id:"v4-polyphony", order:4, title:"Dança polifónica", subtitle:"Duas linhas com intenção própria", goal:"Ouvir vozes independentes mantendo articulação comum.", competencies:["coordination","listening","reading","memory"], scoreIds:["v4-two-voice-study"], repertoireReferences:["Musette in D Major","Gavotte in G Minor","Minuets I and II","Gigue — J. S. Bach"] },
      { id:"v4-movements", order:5, title:"Vários movimentos", subtitle:"Forma, caráter e transições", goal:"Planear uma obra em secções com objetivos técnicos diferentes.", competencies:["memory","coordination","dynamics","reading"], scoreIds:["v4-rondo-study"], repertoireReferences:["Sonatina in G Major — Beethoven"] }
    ]
  },
  {
    volume: 5,
    title: "Voicing, contraponto e repertório de concerto",
    summary: "Beethoven, Bach, Haydn, Chopin e Daquin exigem voz cantada, contraponto, forma maior, nuance e precisão.",
    stages: [
      { id:"v5-voicing", order:1, title:"Melodia sobre acompanhamento", subtitle:"Uma mão canta; a outra sustenta", goal:"Diferenciar peso e dinâmica entre melodia e acompanhamento.", competencies:["coordination","dynamics","listening","hand"], scoreIds:["v5-voicing-study"], repertoireReferences:["Für Elise — Beethoven"] },
      { id:"v5-invention", order:2, title:"Duas vozes independentes", subtitle:"Imitação entre as mãos", goal:"Ouvir entradas separadas e manter cada linha viva.", competencies:["coordination","listening","reading","memory"], scoreIds:["v5-invention-study"], repertoireReferences:["Invention No. 1 in C Major, BWV 772 — J. S. Bach"] },
      { id:"v5-sonata", order:3, title:"Arquitetura de sonata", subtitle:"Movimentos e direção de longo alcance", goal:"Sustentar forma e memória em repertório maior.", competencies:["memory","reading","dynamics","coordination"], scoreIds:["v5-sonata-study"], repertoireReferences:["Sonata in F Major — Beethoven","Sonata in C Major, Hob. XVI/35 — Haydn"] },
      { id:"v5-romantic", order:4, title:"Frase romântica", subtitle:"Direção e flexibilidade expressiva", goal:"Modelar tensão e resolução sem perder clareza rítmica.", competencies:["dynamics","listening","pulse","memory"], scoreIds:["v5-romantic-study"], repertoireReferences:["Waltz in A Minor — Chopin","Of Foreign Lands and People — Schumann"] },
      { id:"v5-repetition", order:5, title:"Repetição rápida e precisão", subtitle:"Mesmo gesto, som controlado", goal:"Manter repetição leve, mudança de posição e articulação nítida.", competencies:["fingers","hand","rhythm","reading"], scoreIds:["v5-repetition-study"], repertoireReferences:["The Cuckoo — Daquin"] }
    ]
  }
];

export function methodVolume(volume: 2 | 3 | 4 | 5) {
  return methodVolumePaths.find((item) => item.volume === volume) ?? null;
}
