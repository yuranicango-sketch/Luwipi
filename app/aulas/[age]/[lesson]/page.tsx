import { redirect, notFound } from "next/navigation";
import { getEnhancedCurriculum, getVariant, findLesson } from "@/lib/curriculum-v3";

export default async function LessonPage({params,searchParams}:{params:Promise<{age:string;lesson:string}>;searchParams:Promise<{variant?:string;student?:string}>}){
 const path=await params,query=await searchParams,program=getEnhancedCurriculum(path.age),lesson=Number(path.lesson);
 if(!Number.isInteger(lesson)||lesson<1||lesson>48||!findLesson(program,lesson))notFound();
 const variant=getVariant(program,query.variant),student=query.student?.trim()||"default";
 redirect(`/aprender?age=${program.age}&variant=${variant.id}&student=${encodeURIComponent(student)}&lesson=${lesson}`);
}
