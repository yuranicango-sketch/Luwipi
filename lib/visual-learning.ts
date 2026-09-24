import type { AgeBand, LessonBlock } from "@/lib/suzuki-lessons";

export type NaturalNote = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type NoteCharacterKind = "sun" | "bird" | "leaf" | "cat" | "lion" | "fox" | "whale";

export type NoteCharacter = {
  note: NaturalNote;
  label: string;
  name: string;
  color: string;
  shape: string;
  kind: NoteCharacterKind;
  imageSrc?: string;
};

export const noteCharacters: Record<NaturalNote, NoteCharacter> = {
  C: { note:"C", label:"Dó", name:"Dori", color:"#F4C94F", shape:"●", kind:"sun" },
  D: { note:"D", label:"Ré", name:"Riri", color:"#72C6E5", shape:"▲", kind:"bird" },
  E: { note:"E", label:"Mi", name:"Milo", color:"#76C995", shape:"■", kind:"leaf" },
  F: { note:"F", label:"Fá", name:"Fafa", color:"#BD86DA", shape:"◆", kind:"cat" },
  G: { note:"G", label:"Sol", name:"Soli", color:"#EFA05C", shape:"★", kind:"lion" },
  A: { note:"A", label:"Lá", name:"Lala", color:"#E97873", shape:"⬟", kind:"fox" },
  B: { note:"B", label:"Si", name:"Sibi", color:"#5F9EDC", shape:"♥", kind:"whale" },
};

export type FingerExercise = {
  id: string;
  ageBand: AgeBand;
  title: string;
  rhyme: string[];
  sequence: { hand: "L" | "R"; finger: 1 | 2 | 3 | 4 | 5 }[];
};

export const fingerExercises: Record<AgeBand, FingerExercise> = {
  "2-3": {
    id:"finger-wake-23",
    ageBand:"2-3",
    title:"Os dedinhos acordam",
    rhyme:["Um acorda devagar,", "dois vem logo acompanhar.", "Três, quatro, cinco também —", "tocam leve e ficam bem."],
    sequence:[
      {hand:"R",finger:1},{hand:"R",finger:2},{hand:"R",finger:3},{hand:"R",finger:4},{hand:"R",finger:5},
      {hand:"R",finger:4},{hand:"R",finger:3},{hand:"R",finger:2},{hand:"R",finger:1},
    ],
  },
  "4-5": {
    id:"finger-voices-45",
    ageBand:"4-5",
    title:"Cada dedo tem uma voz",
    rhyme:["Um começa sem apertar,", "dois e três vão conversar.", "Quatro e cinco entram depois,", "e voltamos um, dois, três, dois, um."],
    sequence:[
      {hand:"R",finger:1},{hand:"R",finger:2},{hand:"R",finger:3},{hand:"R",finger:4},{hand:"R",finger:5},
      {hand:"R",finger:4},{hand:"R",finger:3},{hand:"R",finger:2},{hand:"R",finger:1},
    ],
  },
  "6-8": {
    id:"finger-balance-68",
    ageBand:"6-8",
    title:"Cinco dedos, um só gesto",
    rhyme:["Polegar prepara o caminho,", "dois e três seguem bem juntinhos.", "Quatro e cinco sem endurecer,", "volta igual e deixa o som crescer."],
    sequence:[
      {hand:"R",finger:1},{hand:"R",finger:2},{hand:"R",finger:3},{hand:"R",finger:4},{hand:"R",finger:5},
      {hand:"L",finger:5},{hand:"L",finger:4},{hand:"L",finger:3},{hand:"L",finger:2},{hand:"L",finger:1},
    ],
  },
};

export type ContourEvent = {
  syllable: string;
  note: NaturalNote;
  pitch: number;
};

export type SongContour = {
  id: string;
  title: string;
  aliases: string[];
  events: ContourEvent[];
};

export const songContours: SongContour[] = [
  {
    id:"twinkle",
    title:"Brilha, Brilha, Estrelinha",
    aliases:["brilha, brilha, estrelinha","brilha brilha estrelinha"],
    events:[
      {syllable:"Bri",note:"C",pitch:0},{syllable:"lha",note:"C",pitch:0},{syllable:"bri",note:"G",pitch:4},{syllable:"lha",note:"G",pitch:4},
      {syllable:"es",note:"A",pitch:5},{syllable:"tre",note:"A",pitch:5},{syllable:"li",note:"G",pitch:4},{syllable:"nha",note:"F",pitch:3},
    ],
  },
  {
    id:"mary",
    title:"Maria Tinha um Cordeirinho",
    aliases:["maria tinha um cordeirinho","cordeirinho"],
    events:[
      {syllable:"Ma",note:"E",pitch:2},{syllable:"ri",note:"D",pitch:1},{syllable:"a",note:"C",pitch:0},{syllable:"ti",note:"D",pitch:1},
      {syllable:"nha",note:"E",pitch:2},{syllable:"um",note:"E",pitch:2},{syllable:"cor",note:"E",pitch:2},{syllable:"dei",note:"D",pitch:1},
    ],
  },
  {
    id:"march",
    title:"Marcha, Soldado",
    aliases:["marcha, soldado","marcha soldado"],
    events:[
      {syllable:"Mar",note:"C",pitch:0},{syllable:"cha",note:"C",pitch:0},{syllable:"sol",note:"E",pitch:2},{syllable:"da",note:"G",pitch:4},
      {syllable:"do",note:"G",pitch:4},{syllable:"ca",note:"E",pitch:2},{syllable:"be",note:"D",pitch:1},{syllable:"ça",note:"C",pitch:0},
    ],
  },
  {
    id:"ciranda",
    title:"Ciranda, Cirandinha",
    aliases:["ciranda, cirandinha","ciranda cirandinha"],
    events:[
      {syllable:"Ci",note:"C",pitch:0},{syllable:"ran",note:"D",pitch:1},{syllable:"da",note:"E",pitch:2},{syllable:"ci",note:"F",pitch:3},
      {syllable:"ran",note:"G",pitch:4},{syllable:"di",note:"F",pitch:3},{syllable:"nha",note:"E",pitch:2},{syllable:"va",note:"D",pitch:1},
    ],
  },
  {
    id:"sapo",
    title:"O Sapo Não Lava o Pé",
    aliases:["o sapo não lava o pé","o sapo nao lava o pe","sapo"],
    events:[
      {syllable:"O",note:"C",pitch:0},{syllable:"sa",note:"E",pitch:2},{syllable:"po",note:"G",pitch:4},{syllable:"não",note:"G",pitch:4},
      {syllable:"la",note:"A",pitch:5},{syllable:"va",note:"G",pitch:4},{syllable:"o",note:"E",pitch:2},{syllable:"pé",note:"C",pitch:0},
    ],
  },
  {
    id:"ode",
    title:"Ode à Alegria",
    aliases:["ode à alegria","ode a alegria"],
    events:[
      {syllable:"Mi",note:"E",pitch:2},{syllable:"mi",note:"E",pitch:2},{syllable:"fá",note:"F",pitch:3},{syllable:"sol",note:"G",pitch:4},
      {syllable:"sol",note:"G",pitch:4},{syllable:"fá",note:"F",pitch:3},{syllable:"mi",note:"E",pitch:2},{syllable:"ré",note:"D",pitch:1},
    ],
  },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
}

export function contourForRepertoire(title: string) {
  const target=normalize(title.replace(/—.*/,""));
  return songContours.find((song)=>song.aliases.some((alias)=>{
    const normalized=normalize(alias);
    return target.includes(normalized)||normalized.includes(target);
  })) ?? null;
}

export type LessonSceneKind =
  | "welcome"
  | "pitch-animals"
  | "march"
  | "dynamics"
  | "echo"
  | "keyboard-village"
  | "direction"
  | "technique"
  | "melody"
  | "reading"
  | "performance"
  | "listening";

export function sceneForBlock(block: LessonBlock): LessonSceneKind {
  const id=block.id.toLowerCase();
  const title=normalize(block.title);
  const competencies=new Set(block.competencies);
  if(block.kind==="arrival") return "welcome";
  if(/urso|passarinho|gigante|mora o som|grave|agudo/.test(id+" "+title)||competencies.has("pitch")) return "pitch-animals";
  if(/marcha|passo|pulso|ritmo/.test(id+" "+title)||competencies.has("pulse")||competencies.has("rhythm")) return "march";
  if(/forte|suave|leao|ratinho/.test(id+" "+title)||competencies.has("dynamics")) return "dynamics";
  if(/eco|igual|diferente/.test(id+" "+title)) return "echo";
  if(/teclas|grupo|duplas|trios|caça/.test(id+" "+title)||competencies.has("keyboard")) return "keyboard-village";
  if(/subindo|descendo|direcao|acima|abaixo/.test(id+" "+title)) return "direction";
  if(competencies.has("posture")||competencies.has("hand")||competencies.has("fingers")||competencies.has("coordination")) return "technique";
  if(competencies.has("reading")) return "reading";
  if(/performance/.test(id+" "+title)) return "performance";
  if(block.kind==="repertoire") return "melody";
  return "listening";
}
