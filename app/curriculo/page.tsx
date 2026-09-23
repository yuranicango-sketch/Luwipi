import { redirect } from "next/navigation";
import { getEnhancedCurriculum, getVariant } from "@/lib/curriculum-v3";

export default async function CurriculumPage({searchParams}:{searchParams:Promise<{age?:string;variant?:string;student?:string;current?:string}>}){
 const params=await searchParams;const program=getEnhancedCurriculum(params.age);const variant=getVariant(program,params.variant);const student=params.student?.trim()||"default";
 const query=new URLSearchParams({age:program.age,variant:variant.id,student,map:"1"});
 const n=Number(params.current);if(Number.isInteger(n)&&n>=1&&n<=48)query.set("lesson",String(n));
 redirect(`/aprender?${query.toString()}`);
}
