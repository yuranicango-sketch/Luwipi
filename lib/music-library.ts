import type { KidsSong } from "@/lib/music-types";
import { musicDataA } from "@/lib/music-data-a";
import { musicDataB } from "@/lib/music-data-b";
import { musicDataC } from "@/lib/music-data-c";
import { musicDataD } from "@/lib/music-data-d";
import { musicDataE } from "@/lib/music-data-e";
import { musicDataF } from "@/lib/music-data-f";
import { musicDataG } from "@/lib/music-data-g";
import { musicDataH } from "@/lib/music-data-h";
export type { KidsSong, MusicRights, SongSection } from "@/lib/music-types";
export const kidsSongs: KidsSong[] = [...musicDataA,...musicDataB,...musicDataC,...musicDataD,...musicDataE,...musicDataF,...musicDataG,...musicDataH];
export function getSong(id:string){return kidsSongs.find((song)=>song.id===id);}
