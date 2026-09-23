import { notFound } from "next/navigation";
import { SongPractice } from "@/components/song-practice";
import { getSong } from "@/lib/music-library";

export default async function SongPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string;age?:string}>}){
 const [{id},query]=await Promise.all([params,searchParams]);
 const song=getSong(id),age=query.age==="2-4"?"2-4":query.age==="adult"?"adult":"5-8";
 const hasNotes=Boolean(song?.sequence?.length||song?.sections?.some(section=>section.notes.length));
 if(!song||!song.playable||!hasNotes)notFound();
 return <main><SongPractice song={song} studentId={query.student?.trim()||"default"} ageGroup={age}/></main>;
}
