import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ProgressBody={sessionStarted?:boolean;durationSeconds?:number;noteCompleted?:boolean;repetitionCompleted?:boolean};
const CODE_RE=/^LUWI-[A-HJ-NP-Z2-9]{8}$/;

export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){
 const code=(await params).code.trim().toUpperCase();
 if(!CODE_RE.test(code))return NextResponse.json({error:"invalid_code"},{status:400});
 const admin=createAdminSupabaseClient();
 const raw=await request.text();
 if(raw.length>12000)return NextResponse.json({error:"payload_too_large"},{status:413});
 let body:ProgressBody={};try{body=JSON.parse(raw) as ProgressBody}catch{return NextResponse.json({error:"invalid_json"},{status:400})}
 if(!admin){
   const server=await createServerSupabaseClient();
   const {data,error}=await server.rpc("update_public_homework_progress",{
     p_code:code,p_session_started:Boolean(body.sessionStarted),p_note_completed:Boolean(body.noteCompleted),
     p_duration_seconds:Math.min(86400,Math.max(0,Math.floor(Number(body.durationSeconds)||0))),
     p_repetition_completed:Boolean(body.repetitionCompleted),
   });
   if(error){
     const msg=String(error.message||"");
     if(msg.includes("not_found"))return NextResponse.json({error:"not_found"},{status:404});
     if(msg.includes("expired"))return NextResponse.json({error:"expired"},{status:410});
     return NextResponse.json({error:"database_error",detail:error.code},{status:500});
   }
   return NextResponse.json({ok:true,progress:data});
 }

 const {data:assignment,error:assignmentError}=await admin.from("homework_assignments")
   .select("id,target_repeats,valid_until,revoked_at")
   .eq("code",code).maybeSingle();
 if(assignmentError)return NextResponse.json({error:"database_error",detail:assignmentError.code},{status:500});
 if(!assignment||assignment.revoked_at)return NextResponse.json({error:"not_found"},{status:404});
 if(new Date(assignment.valid_until).getTime()<Date.now())return NextResponse.json({error:"expired"},{status:410});

 const {data:current,error:progressError}=await admin.from("homework_progress")
   .select("id,sessions,repeats,notes_played,completed,first_practiced_at,last_practiced_at,completed_at")
   .eq("assignment_id",assignment.id).maybeSingle();
 if(progressError)return NextResponse.json({error:"database_error",detail:progressError.code},{status:500});

 const now=new Date().toISOString(),sessionStarted=Boolean(body.sessionStarted),noteCompleted=Boolean(body.noteCompleted),repetitionCompleted=Boolean(body.repetitionCompleted);
 const durationSeconds=Math.min(86400,Math.max(0,Math.floor(Number(body.durationSeconds)||0)));
 const sessions=Math.min(10000,(current?.sessions??0)+(sessionStarted?1:0));
 const repeats=Math.min(assignment.target_repeats,(current?.repeats??0)+(repetitionCompleted?1:0));
 const notesPlayed=Math.min(1000000,(current?.notes_played??0)+(noteCompleted?1:0));
 const completed=Boolean(current?.completed)||repeats>=assignment.target_repeats;
 const completedAt=completed?(current?.completed_at??now):null;

 const {error:updateError}=await admin.from("homework_progress").upsert({
   assignment_id:assignment.id,sessions,repeats,notes_played:notesPlayed,completed,
   first_practiced_at:current?.first_practiced_at??now,last_practiced_at:now,completed_at:completedAt,updated_at:now,
 },{onConflict:"assignment_id"});
 if(updateError)return NextResponse.json({error:"database_error",detail:updateError.code},{status:500});

 if(sessionStarted||durationSeconds>0){
   await admin.from("homework_practice_sessions").insert({
     assignment_id:assignment.id,repetitions:repeats,duration_seconds:durationSeconds,completed,ended_at:durationSeconds>0?now:null,
   });
 }
 return NextResponse.json({ok:true,progress:{sessions,repeats,notesPlayed,completed}});
}
