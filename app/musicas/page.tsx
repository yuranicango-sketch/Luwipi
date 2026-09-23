import { redirect } from "next/navigation";
import { MusicLibraryBrowser } from "@/components/music-library-browser";
import { ProductShell } from "@/components/product-shell";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";
import { kidsSongs } from "@/lib/music-library";

export default async function MusicLibraryPage({searchParams}:{searchParams:Promise<{student?:string;age?:string}>}){
 const params=await searchParams;
 if(params.student||params.age)redirect(contextRedirectHref({studentId:params.student,ageGroup:params.age,next:"/musicas"}));
 const context=await resolveLearningContext();
 return <ProductShell backHref="/dashboard" backLabel="Aulas"><div className="container"><MusicLibraryBrowser songs={kidsSongs} ageGroup={context.ageGroup}/></div></ProductShell>;
}
