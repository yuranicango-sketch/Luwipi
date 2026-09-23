import { MusicLibraryBrowser } from "@/components/music-library-browser";
import { ProductShell } from "@/components/product-shell";
import { kidsSongs } from "@/lib/music-library";

export default async function MusicLibraryPage({searchParams}:{searchParams:Promise<{student?:string;age?:string}>}){
 const params=await searchParams,student=params.student?.trim()||"default";
 const age=params.age==="2-4"?"2-4":params.age==="adult"?"adult":"5-8";
 return <ProductShell backHref={`/dashboard?age=${age}&student=${encodeURIComponent(student)}`} backLabel="Aulas"><div className="container"><MusicLibraryBrowser songs={kidsSongs} studentId={student} ageGroup={age}/></div></ProductShell>;
}
