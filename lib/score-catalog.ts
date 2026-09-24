export type ScoreNoteName = "C4"|"D4"|"E4"|"F4"|"G4"|"A4"|"B4"|"C5";
export type ScoreNote = { name: ScoreNoteName; semitone: number; beats: 1|2 };
export type ScorePiece = {
  id: string;
  title: string;
  source: string;
  publicDomain: true;
  level: "primeiros-passos"|"iniciante";
  pedagogicalReference?: string;
  notes: ScoreNote[];
};

const n = (name: ScoreNoteName, beats: 1|2 = 1): ScoreNote => {
  const semitones: Record<ScoreNoteName, number> = {C4:0,D4:2,E4:4,F4:5,G4:7,A4:9,B4:11,C5:12};
  return { name, semitone: semitones[name], beats };
};

export const scoreCatalog: ScorePiece[] = [
  {
    id:"brilha-brilha",
    title:"Brilha, Brilha, Estrelinha",
    source:"Melodia tradicional / domínio público · edição pedagógica própria Luwipi",
    publicDomain:true,
    level:"primeiros-passos",
    pedagogicalReference:"Suzuki Piano School Vol. 1 — referência de repertório. Esta partitura não reproduz o arranjo do método.",
    notes:[n("C4"),n("C4"),n("G4"),n("G4"),n("A4"),n("A4"),n("G4",2),n("F4"),n("F4"),n("E4"),n("E4"),n("D4"),n("D4"),n("C4",2)],
  },
  {
    id:"maria-cordeirinho",
    title:"Maria Tinha um Cordeirinho",
    source:"Melodia tradicional / domínio público · edição pedagógica própria Luwipi",
    publicDomain:true,
    level:"primeiros-passos",
    notes:[n("E4"),n("D4"),n("C4"),n("D4"),n("E4"),n("E4"),n("E4",2),n("D4"),n("D4"),n("D4",2),n("E4"),n("G4"),n("G4",2)],
  },
  {
    id:"ode-alegria",
    title:"Ode à Alegria — motivo",
    source:"L. van Beethoven · melodia em domínio público · edição pedagógica própria Luwipi",
    publicDomain:true,
    level:"iniciante",
    notes:[n("E4"),n("E4"),n("F4"),n("G4"),n("G4"),n("F4"),n("E4"),n("D4"),n("C4"),n("C4"),n("D4"),n("E4"),n("E4",2),n("D4"),n("D4",2)],
  },
  {
    id:"irmao-joao",
    title:"Irmão João",
    source:"Melodia tradicional / domínio público · edição pedagógica própria Luwipi",
    publicDomain:true,
    level:"iniciante",
    notes:[n("C4"),n("D4"),n("E4"),n("C4"),n("C4"),n("D4"),n("E4"),n("C4"),n("E4"),n("F4"),n("G4",2),n("E4"),n("F4"),n("G4",2)],
  },
];

export const scoreNoteLabels: Record<ScoreNoteName,string> = {C4:"Dó",D4:"Ré",E4:"Mi",F4:"Fá",G4:"Sol",A4:"Lá",B4:"Si",C5:"Dó"};
