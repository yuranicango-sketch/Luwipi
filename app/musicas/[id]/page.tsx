import { notFound, redirect } from "next/navigation";
import { SongPractice } from "@/components/song-practice";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";
import { getSong } from "@/lib/music-library";

export default async function SongPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string;age?:string}>}){
 const [{id},query]=await Promise.all([params,searchParams]);
 if(query.student||query.age)redirect(contextRedirectHref({studentId:query.student,ageGroup:query.age,next:`/musicas/${id}`}));
 const context=await resolveLearningContext(),song=getSong(id);
 const hasNotes=Boolean(song?.sequence?.length||song?.sections?.some(section=>section.notes.length));
 if(!song||!song.playable||!hasNotes)notFound();
 return <main><SongPractice song={song} studentId={context.studentId} ageGroup={context.ageGroup}/></main>;
}
