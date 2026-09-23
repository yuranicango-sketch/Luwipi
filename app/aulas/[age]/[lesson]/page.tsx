import { notFound, redirect } from "next/navigation";
import { contextRedirectHref } from "@/lib/learning-context";

export default async function LessonPage({params,searchParams}:{params:Promise<{age:string;lesson:string}>;searchParams:Promise<{student?:string}>}){
 const path=await params,query=await searchParams,lesson=Number(path.lesson);
 if(!Number.isInteger(lesson)||lesson<1||lesson>48||!["2-4","5-8","adult"].includes(path.age))notFound();
 redirect(contextRedirectHref({studentId:query.student,ageGroup:path.age,next:`/aprender?lesson=${lesson}`}));
}
