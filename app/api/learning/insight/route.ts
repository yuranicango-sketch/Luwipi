import { NextRequest, NextResponse } from "next/server";
import type { AgeGroup } from "@/lib/curriculum";
import { rankMetrics, type CompetencyId, type StudentMetric } from "@/lib/learning-intelligence";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AGES=new Set(["2-4","5-8","adult"]);

export async function GET(request:NextRequest){
  const supabase=await createServerSupabaseClient();
  const user=(await supabase.auth.getUser()).data.user;
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const studentId=request.nextUrl.searchParams.get("studentId")??"",age=request.nextUrl.searchParams.get("age")??"";
  if(!UUID.test(studentId)||!AGES.has(age))return NextResponse.json({error:"invalid_query"},{status:400});
  const [{data:student,error:studentError},{data:progress},{data:metrics},{data:sessions},{data:homework}]=await Promise.all([
    supabase.from("students").select("id,display_code,age_group").eq("id",studentId).eq("teacher_id",user.id).maybeSingle(),
    supabase.from("learning_progress").select("lesson_number,step,action,completed,mastery,updated_at").eq("teacher_id",user.id).eq("student_id",studentId).eq("age_group",age).order("lesson_number"),
    supabase.from("student_competency_metrics").select("competency,evidence_count,successes,mistakes,mastery_score,last_accuracy,last_content_id,updated_at").eq("teacher_id",user.id).eq("student_id",studentId).eq("age_group",age),
    supabase.from("learning_sessions").select("id,session_type,content_id,lesson_number,accuracy,stars,duration_seconds,created_at").eq("teacher_id",user.id).eq("student_id",studentId).eq("age_group",age).order("created_at",{ascending:false}).limit(80),
    supabase.from("homework_assignments").select("id,code,song_id,target_repeats,created_at,homework_progress(completed,repeats,last_practiced_at)").eq("teacher_id",user.id).eq("student_id",studentId).order("created_at",{ascending:false}).limit(20),
  ]);
  if(studentError||!student)return NextResponse.json({error:"student_not_found"},{status:404});
  const mappedMetrics:StudentMetric[]=(metrics??[]).map(row=>({
    competency:row.competency as CompetencyId,evidenceCount:row.evidence_count,successes:row.successes,mistakes:row.mistakes,
    masteryScore:Number(row.mastery_score),lastAccuracy:row.last_accuracy,lastContentId:row.last_content_id,updatedAt:row.updated_at,
  }));
  const ranked=rankMetrics(mappedMetrics);
  const progressRows=(progress??[]).map(row=>({lessonNumber:row.lesson_number,step:row.step,action:row.action,completed:row.completed,mastery:row.mastery,updatedAt:row.updated_at}));
  const completedLessons=progressRows.filter(row=>row.completed).length;
  let currentLesson=1;for(let i=1;i<=48;i++){if(!progressRows.find(row=>row.lessonNumber===i)?.completed){currentLesson=i;break}currentLesson=48}
  const recent=(sessions??[]).map(row=>({id:row.id,sessionType:row.session_type,contentId:row.content_id,lessonNumber:row.lesson_number,accuracy:row.accuracy,stars:row.stars,durationSeconds:row.duration_seconds,createdAt:row.created_at}));
  const homeworkRows=(homework??[]).map(row=>{const raw=row.homework_progress as unknown;const p=Array.isArray(raw)?raw[0]??null:raw as {completed?:boolean;repeats?:number;last_practiced_at?:string|null}|null;return{id:row.id,code:row.code,songId:row.song_id,targetRepeats:row.target_repeats,completed:Boolean(p?.completed),repeats:p?.repeats??0,lastPracticedAt:p?.last_practiced_at??null,createdAt:row.created_at}});
  const lastHomeworkPractice=homeworkRows.map(row=>row.lastPracticedAt).filter((value):value is string=>Boolean(value)).sort().at(-1)??null;
  return NextResponse.json({
    student:{id:student.id,displayCode:student.display_code,ageGroup:student.age_group},
    progress:progressRows,metrics:ranked,recentSessions:recent,homework:homeworkRows,
    summary:{completedLessons,currentLesson,totalSessions:recent.length,practiceMinutes:Math.round(recent.reduce((sum,row)=>sum+row.durationSeconds,0)/60),homeworkAssigned:homeworkRows.length,homeworkCompleted:homeworkRows.filter(row=>row.completed).length,lastHomeworkPractice},
    recommended:ranked.slice(0,3).map(row=>row.competency),
  });
}
