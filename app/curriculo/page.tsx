import { redirect } from "next/navigation";
import { contextRedirectHref } from "@/lib/learning-context";

export default async function CurriculumPage({searchParams}:{searchParams:Promise<{age?:string;student?:string;current?:string}>}){
 const params=await searchParams,n=Number(params.current),query=new URLSearchParams({map:"1"});
 if(Number.isInteger(n)&&n>=1&&n<=48)query.set("lesson",String(n));
 const next=`/aprender?${query.toString()}`;
 if(params.student||params.age)redirect(contextRedirectHref({studentId:params.student,ageGroup:params.age,next}));
 redirect(next);
}
