import type { KidsSong } from "@/lib/music-types";
import { musicDataA } from "@/lib/music-data-a";
import { musicDataB } from "@/lib/music-data-b";
import { musicDataC } from "@/lib/music-data-c";
import { musicDataD } from "@/lib/music-data-d";
import { musicDataE } from "@/lib/music-data-e";
import { musicDataF } from "@/lib/music-data-f";
import { musicDataG } from "@/lib/music-data-g";
import { musicDataH } from "@/lib/music-data-h";
import { musicDataI } from "@/lib/music-data-i";
export type { KidsSong, MusicRights, SongSection } from "@/lib/music-types";
export const kidsSongs: KidsSong[] = [...musicDataA,...musicDataB,...musicDataC,...musicDataD,...musicDataE,...musicDataF,...musicDataG,...musicDataH,...musicDataI];
const NAMES=["Dó","Ré","Mi","Fá","Sol","Lá","Si"] as const;
export function noteName(note:string){return note.replace(/[45]$/,"");}
export function noteOctave(note:string){const m=note.match(/([45])$/);return m?Number(m[1]):4;}
export function noteRate(note:string){const name=noteName(note);const semitone:Record<string,number>={"Dó":0,"Ré":2,"Mi":4,"Fá":5,"Sol":7,"Lá":9,"Si":11};return Math.pow(2,((noteOctave(note)-4)*12+(semitone[name]??0))/12);}
export function octaveAwareNotes(notes:string[],octaves:1|2=1){if(octaves===1)return notes;let octave=4,previous=-1;return notes.map(raw=>{if(/[45]$/.test(raw))return raw;const name=noteName(raw);const index=NAMES.indexOf(name as typeof NAMES[number]);if(previous>=0&&index>=0){if(previous-index>=4)octave=5;else if(index-previous>=4)octave=4;}previous=index;return `${name}${octave}`;});}
export function getSong(id:string){const song=kidsSongs.find((item)=>item.id===id);if(!song)return undefined;const octaves=song.pianoOctaves??(song.age==="5-8"||song.difficulty==="Intermédio"?2:1);if(octaves===1)return song;const sections=song.sections?.map(section=>({...section,notes:octaveAwareNotes(section.notes,2)}));return {...song,pianoOctaves:2,sections,sequence:sections?.flatMap(section=>section.notes)??octaveAwareNotes(song.sequence??[],2)};}
