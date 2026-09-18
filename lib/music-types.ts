export type MusicRights = "original" | "public-domain" | "license-required";
export type SongSection = { label: string; notes: string[] };
export type KidsSong = { id:string; title:string; subtitle:string; age:"2-4"|"5-8"|"both"; difficulty:"Muito fácil"|"Fácil"|"Intermédio"; theme:string; emoji:string; rights:MusicRights; playable:boolean; story:string; rightsSource?:string; colors?:{note:string;color:string}[]; sequence?:string[]; sections?:SongSection[]; sheetMusic?:boolean; timeSignature?:"4/4"|"3/4"; category?:"infantil"|"repertorio-5-8"|"licenciado"; };
