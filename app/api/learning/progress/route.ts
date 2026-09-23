import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/request-security";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AGES=new Set(["2-4","5-8","adult"]);

async function context(){
  const supabase=await createServerSupabaseClient();
  const user=(await supabase.auth.getUser()).data.user;
  return {supabase,user};
}

export async function GET(request:NextRequest){
  const {supabase,user}=await context();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const studentId=request.nextUrl.searchParams.get("studentId")??"";
  const age=request.nextUrl.searchParams.get("age")??"";
  if(!UUID.test(studentId)||!AGES.has(age))return NextResponse.json({error:"invalid_query"},{status:400});
  const {data,error}=await supabase.from("learning_progress")
    .select("lesson_number,step,action,completed,mastery,updated_at")
    .eq("teacher_id",user.id).eq("student_id",studentId).eq("age_group",age)
    .order("lesson_number");
  if(error)return NextResponse.json({error:"database_error",detail:error.code},{status:500});
  return NextResponse.json({progress:(data??[]).map(row=>({
    lessonNumber:row.lesson_number,step:row.step,action:row.action,completed:row.completed,mastery:row.mastery,updatedAt:row.updated_at,
  }))});
}

export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:"forbidden_origin"},{status:403});
  const {supabase,user}=await context();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const raw=await request.text();
  if(raw.length>12000)return NextResponse.json({error:"payload_too_large"},{status:413});
  let body:Record<string,unknown>;
  try{const parsed=JSON.parse(raw);body=parsed&&typeof parsed==="object"?parsed as Record<string,unknown>:{};}catch{return NextResponse.json({error:"invalid_json"},{status:400})}
  const studentId=String(body.studentId??""),age=String(body.ageGroup??"");
  const lessonNumber=Number(body.lessonNumber),step=Math.max(0,Math.floor(Number(body.step)||0)),action=Math.max(0,Math.floor(Number(body.action)||0));
  const completed=Boolean(body.completed),mastery=body.mastery==="mastered"||body.mastery==="reinforce"?body.mastery:null;
  if(!UUID.test(studentId)||!AGES.has(age)||!Number.isInteger(lessonNumber)||lessonNumber<1||lessonNumber>48)return NextResponse.json({error:"invalid_progress"},{status:400});
  const now=new Date().toISOString();
  const {data,error}=await supabase.from("learning_progress").upsert({
    teacher_id:user.id,student_id:studentId,age_group:age,lesson_number:lessonNumber,
    step:completed?999:step,action:completed?0:action,completed,mastery,
    completed_at:completed?now:null,updated_at:now,
  },{onConflict:"student_id,age_group,lesson_number"}).select("lesson_number,step,action,completed,mastery,updated_at").single();
  if(error)return NextResponse.json({error:error.code==="42501"?"forbidden":"database_error",detail:error.code},{status:error.code==="42501"?403:500});
  return NextResponse.json({progress:{lessonNumber:data.lesson_number,step:data.step,action:data.action,completed:data.completed,mastery:data.mastery,updatedAt:data.updated_at}});
}
