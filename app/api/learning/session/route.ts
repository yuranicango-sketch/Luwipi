import { NextResponse } from "next/server";
import type { AgeGroup } from "@/lib/curriculum";
import { competenciesForSession, sessionQuality, type CompetencyId, type LearningSessionType } from "@/lib/learning-intelligence";
import { sameOrigin } from "@/lib/request-security";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AGES=new Set(["2-4","5-8","adult"]);
const TYPES=new Set(["lesson","song","game","workout"]);
const SOURCES=new Set(["screen","midi","microphone","mixed"]);
const HANDS=new Set(["right","left","both"]);

function bounded(value:unknown,max=100000){const n=Math.floor(Number(value)||0);return Math.max(0,Math.min(max,n))}
function pct(value:unknown){if(value===null||value===undefined||value==="")return null;return Math.max(0,Math.min(100,Math.round(Number(value)||0)))}

export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:"forbidden_origin"},{status:403});
  const supabase=await createServerSupabaseClient();
  const user=(await supabase.auth.getUser()).data.user;
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const raw=await request.text();
  if(raw.length>40000)return NextResponse.json({error:"payload_too_large"},{status:413});
  let body:Record<string,unknown>;
  try{const parsed=JSON.parse(raw);body=parsed&&typeof parsed==="object"?parsed as Record<string,unknown>:{};}catch{return NextResponse.json({error:"invalid_json"},{status:400})}
  const studentId=String(body.studentId??""),age=String(body.ageGroup??"") as AgeGroup,sessionType=String(body.sessionType??"") as LearningSessionType;
  if(!UUID.test(studentId)||!AGES.has(age)||!TYPES.has(sessionType))return NextResponse.json({error:"invalid_session"},{status:400});
  const lessonRaw=body.lessonNumber===null||body.lessonNumber===undefined?null:Number(body.lessonNumber);
  const lessonNumber=lessonRaw!==null&&Number.isInteger(lessonRaw)&&lessonRaw>=1&&lessonRaw<=48?lessonRaw:null;
  const contentId=String(body.contentId??"").trim().slice(0,120)||null;
  const source=SOURCES.has(String(body.source))?String(body.source):null;
  const handMode=HANDS.has(String(body.handMode))?String(body.handMode):null;
  const correct=bounded(body.correct),mistakes=bounded(body.mistakes),attempts=Math.max(bounded(body.attempts),correct+mistakes);
  const accuracy=pct(body.accuracy);
  const stars=body.stars===null||body.stars===undefined?null:Math.max(1,Math.min(3,Math.round(Number(body.stars)||1)));
  const durationSeconds=bounded(body.durationSeconds,21600);
  const metadata=body.metadata&&typeof body.metadata==="object"&&!Array.isArray(body.metadata)?body.metadata as Record<string,unknown>:{};
  const startedAt=typeof body.startedAt==="string"&&!Number.isNaN(Date.parse(body.startedAt))?body.startedAt:new Date(Date.now()-durationSeconds*1000).toISOString();
  const now=new Date().toISOString();

  const {data:session,error:sessionError}=await supabase.from("learning_sessions").insert({
    teacher_id:user.id,student_id:studentId,age_group:age,session_type:sessionType,
    lesson_number:lessonNumber,content_id:contentId,source,hand_mode:handMode,
    attempts,correct,mistakes,accuracy,stars,duration_seconds:durationSeconds,metadata,
    started_at:startedAt,ended_at:now,
  }).select("id").single();
  if(sessionError)return NextResponse.json({error:sessionError.code==="42501"?"forbidden":"database_error",detail:sessionError.code},{status:sessionError.code==="42501"?403:500});

  const competencies=competenciesForSession({sessionType,age,lessonNumber,contentId,metadata:{...metadata,handMode}});
  const quality=sessionQuality({accuracy,correct,mistakes,mastery:String(metadata.mastery??"")});
  const updated:CompetencyId[]=[];
  for(const competency of competencies){
    const {data:current}=await supabase.from("student_competency_metrics")
      .select("evidence_count,successes,mistakes,mastery_score")
      .eq("teacher_id",user.id).eq("student_id",studentId).eq("age_group",age).eq("competency",competency).maybeSingle();
    const evidence=(current?.evidence_count??0)+1;
    const previous=Number(current?.mastery_score??.5);
    const weight=evidence<=2?.42:evidence<=6?.3:.2;
    const masteryScore=Math.max(0,Math.min(1,previous*(1-weight)+quality*weight));
    const {error}=await supabase.from("student_competency_metrics").upsert({
      teacher_id:user.id,student_id:studentId,age_group:age,competency,
      evidence_count:evidence,successes:(current?.successes??0)+correct,mistakes:(current?.mistakes??0)+mistakes,
      mastery_score:masteryScore,last_accuracy:accuracy,last_content_id:contentId??(lessonNumber?`lesson-${lessonNumber}`:null),updated_at:now,
    },{onConflict:"student_id,age_group,competency"});
    if(!error)updated.push(competency);
  }
  return NextResponse.json({ok:true,sessionId:session.id,competencies:updated});
}
