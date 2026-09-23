import { redirect } from "next/navigation";
import { LearningJourney } from "@/components/learning-journey";
import { getEnhancedCurriculum, getVariant } from "@/lib/curriculum-v3";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LearnPage({searchParams}:{searchParams:Promise<{age?:string;variant?:string;student?:string;lesson?:string;map?:string}>}){
 const params=await searchParams;
 const parsed=Number(params.lesson),initialLesson=Number.isInteger(parsed)&&parsed>=1&&parsed<=48?parsed:undefined;
 const next=new URLSearchParams();if(initialLesson)next.set("lesson",String(initialLesson));if(params.map==="1")next.set("map","1");
 if(params.student||params.age)redirect(contextRedirectHref({studentId:params.student,ageGroup:params.age,next:`/aprender${next.size?`?${next.toString()}`:""}`}));
 const context=await resolveLearningContext(),program=getEnhancedCurriculum(context.ageGroup),variant=getVariant(program,undefined);
 let maxLesson=48;
 try{
   const supabase=await createServerSupabaseClient();
   const user=(await supabase.auth.getUser()).data.user;
   if(user){
     const {data}=await supabase.from("profiles").select("role,access_status,trial_ends_at,access_until").eq("id",user.id).maybeSingle();
     const now=Date.now();
     const active=data?.role==="admin"||(data?.access_status==="active"&&(!data.access_until||new Date(data.access_until).getTime()>now));
     const trial=data?.access_status==="trial"&&data.trial_ends_at&&new Date(data.trial_ends_at).getTime()>now;
     if(!active&&trial)maxLesson=8;
   }
 }catch{}
 return <LearningJourney program={program} variant={variant} studentId={context.studentId} initialLesson={initialLesson} initialMap={params.map==="1"} maxLesson={maxLesson}/>;
}
