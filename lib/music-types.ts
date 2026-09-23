export type MusicRights = "original" | "public-domain" | "license-required";
export type SongSection = { label:string; notes:string[] };
export type PianoNote = `${"Dó"|"Ré"|"Mi"|"Fá"|"Sol"|"Lá"|"Si"}${3|4|5|6}`;
export type PianoOctaves = 1|2|3;
export type ScoreHandMode = "right"|"left"|"both";
export type ScoreArticulation = "legato"|"staccato"|"accent";
export type ScoreDynamic = "pp"|"p"|"mp"|"mf"|"f";
export type PianoScoreEvent = {
  right?:string[];
  left?:string[];
  beats?:number;
  rightFingering?:number[];
  leftFingering?:number[];
  articulation?:ScoreArticulation;
  dynamic?:ScoreDynamic;
  phraseEnd?:boolean;
};
export type KidsSong = {
  id:string;title:string;subtitle:string;age:"2-4"|"5-8"|"both";difficulty:"Muito fácil"|"Fácil"|"Intermédio";
  theme:string;emoji:string;rights:MusicRights;playable:boolean;story:string;rightsSource?:string;
  colors?:{note:string;color:string}[];sequence?:string[];sections?:SongSection[];sheetMusic?:boolean;timeSignature?:"4/4"|"3/4";
  category?:"infantil"|"repertorio-5-8"|"licenciado";pianoOctaves?:PianoOctaves;grandStaff?:boolean;scoreEvents?:PianoScoreEvent[];
};
