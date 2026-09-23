import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CODE_RE=/^LUWI-[A-HJ-NP-Z2-9]{8}$/;
function hash(value:string){return createHash("sha256").update(value).digest("hex")}
function ip(request:Request){return (request.headers.get("x-forwarded-for")?.split(",")[0]||request.headers.get("x-real-ip")||"unknown").trim()}

export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
 const code=(await params).code.trim().toUpperCase();
 if(!CODE_RE.test(code))return NextResponse.json({error:"invalid_code"},{status:400});
 const admin=createAdminSupabaseClient();
 if(!admin){
   const server=await createServerSupabaseClient();
   const {data,error}=await server.rpc("get_public_homework",{p_code:code});
   if(error)return NextResponse.json({error:"database_error",detail:error.code||"rpc_failed"},{status:500});
   const row=Array.isArray(data)?data[0]:data;
   if(!row||row.revoked_at)return NextResponse.json({error:"not_found"},{status:404});
   if(new Date(row.valid_until).getTime()<Date.now())return NextResponse.json({error:"expired"},{status:410});
   return NextResponse.json({assignment:{code:row.code,childName:row.child_name,studentId:row.student_id??undefined,songId:row.song_id,teacherNote:row.teacher_note??"",targetRepeats:row.target_repeats,validUntil:row.valid_until,createdAt:row.created_at}},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }
 const since=new Date(Date.now()-15*60*1000).toISOString(),ipHash=hash(ip(request)),codeHash=hash(code);
 const [{count:ipCount},{count:codeCount}]=await Promise.all([
   admin.from("homework_code_attempts").select("*",{count:"exact",head:true}).eq("ip_hash",ipHash).gte("attempted_at",since),
   admin.from("homework_code_attempts").select("*",{count:"exact",head:true}).eq("code_hash",codeHash).gte("attempted_at",since),
 ]);
 if((ipCount??0)>=60||(codeCount??0)>=20)return NextResponse.json({error:"too_many_requests"},{status:429,headers:{"Retry-After":"900"}});
 await admin.from("homework_code_attempts").insert({code_hash:codeHash,ip_hash:ipHash});

 const {data:row,error}=await admin.from("homework_assignments")
   .select("code,child_name,student_id,song_id,teacher_note,target_repeats,valid_until,created_at,revoked_at")
   .eq("code",code).maybeSingle();
 if(error)return NextResponse.json({error:"database_error",detail:error.code},{status:500});
 if(!row||row.revoked_at)return NextResponse.json({error:"not_found"},{status:404});
 if(new Date(row.valid_until).getTime()<Date.now())return NextResponse.json({error:"expired"},{status:410});
 return NextResponse.json({assignment:{code:row.code,childName:row.child_name,studentId:row.student_id??undefined,songId:row.song_id,teacherNote:row.teacher_note??"",targetRepeats:row.target_repeats,validUntil:row.valid_until,createdAt:row.created_at}},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
