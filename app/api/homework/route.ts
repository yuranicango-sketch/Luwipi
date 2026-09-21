import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const CODE_RE=/^LUWI-[A-HJ-NP-Z2-9]{8}$/;
export async function POST(request:Request){
 const supabase=createAdminSupabaseClient();
 if(!supabase)return NextResponse.json({error:"server_not_configured"},{status:503});
 try{
  const body=await request.json();
  if(!CODE_RE.test(body.code)||!body.songId||!body.childName)return NextResponse.json({error:"invalid_assignment"},{status:400});
  const {error}=await supabase.from("homework_assignments").insert({
   code:body.code,child_name:body.childName,student_id:body.studentId??null,song_id:body.songId,
   teacher_note:body.teacherNote??"",target_repeats:body.targetRepeats??3,valid_until:body.validUntil
  });
  if(error){console.error("homework insert",error);return NextResponse.json({error:"database_error"},{status:500});}
  return NextResponse.json({ok:true,code:body.code});
 }catch{return NextResponse.json({error:"invalid_request"},{status:400});}
}
