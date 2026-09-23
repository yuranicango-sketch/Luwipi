import { cookies } from "next/headers";
import type { AgeGroup } from "@/lib/curriculum";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const STUDENT_COOKIE="luwipi_student";
export const AGE_COOKIE="luwipi_age";

export type LearningContext={
  studentId:string;
  studentName:string|null;
  ageGroup:AgeGroup;
  hasStudent:boolean;
};

export function normalizeAge(value:string|undefined|null):AgeGroup|null{
  return value==="2-4"?"2-4":value==="5-8"?"5-8":value==="adult"?"adult":null;
}

export function contextRedirectHref(input:{studentId?:string|null;ageGroup?:string|null;next:string}){
  const query=new URLSearchParams();
  if(input.studentId?.trim())query.set("student",input.studentId.trim());
  const age=normalizeAge(input.ageGroup);
  if(age)query.set("age",age);
  query.set("next",input.next);
  return `/context?${query.toString()}`;
}

export async function resolveLearningContext():Promise<LearningContext>{
  const jar=await cookies();
  const fallbackAge=normalizeAge(jar.get(AGE_COOKIE)?.value)??"2-4";
  const supabase=await createServerSupabaseClient();
  const user=(await supabase.auth.getUser()).data.user;
  if(!user)return{studentId:"default",studentName:null,ageGroup:fallbackAge,hasStudent:false};

  const cookieId=jar.get(STUDENT_COOKIE)?.value??"";
  if(UUID.test(cookieId)){
    const {data}=await supabase.from("students").select("id,display_code,age_group").eq("id",cookieId).eq("teacher_id",user.id).maybeSingle();
    if(data){
      const age=normalizeAge(data.age_group)??fallbackAge;
      return{studentId:data.id,studentName:data.display_code,ageGroup:age,hasStudent:true};
    }
  }

  const {data:first}=await supabase.from("students").select("id,display_code,age_group").eq("teacher_id",user.id).order("created_at",{ascending:true}).limit(1).maybeSingle();
  if(first){
    const age=normalizeAge(first.age_group)??fallbackAge;
    return{studentId:first.id,studentName:first.display_code,ageGroup:age,hasStudent:true};
  }

  return{studentId:"default",studentName:null,ageGroup:fallbackAge,hasStudent:false};
}
