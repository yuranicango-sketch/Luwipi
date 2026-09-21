import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CODE_RE=/^LUWI-[A-HJ-NP-Z2-9]{8}$/;
function hash(v:string){return createHash("sha256").update(v).digest("hex")}
function ip(r:Request){return (r.headers.get("x-forwarded-for")?.split(",")[0]||r.headers.get("x-real-ip")||"unknown").trim()}

export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
  const code=(await params).code.trim().toUpperCase();
  if(!CODE_RE.test(code))return NextResponse.json({error:"invalid_code"},{status:400});

  // Public homework lookup must not depend on a service-role key being present.
  // The database RPC exposes only the safe assignment fields for a valid code.
  const admin=createAdminSupabaseClient();
  const server=await createServerSupabaseClient();
  const s=admin??server;

  if(admin){
    const since=new Date(Date.now()-15*60*1000).toISOString(),ih=hash(ip(request)),ch=hash(code);
    const [{count:ipCount},{count:codeCount}]=await Promise.all([
      admin.from("homework_code_attempts").select("*",{count:"exact",head:true}).eq("ip_hash",ih).gte("attempted_at",since),
      admin.from("homework_code_attempts").select("*",{count:"exact",head:true}).eq("code_hash",ch).gte("attempted_at",since)
    ]);
    if((ipCount??0)>=60||(codeCount??0)>=20)return NextResponse.json({error:"too_many_requests"},{status:429,headers:{"Retry-After":"900"}});
    await admin.from("homework_code_attempts").insert({code_hash:ch,ip_hash:ih});
  }

  // Prefer the server credential when configured; fall back to the public client.\n  // The RPC itself only exposes the safe public homework projection.\n  const lookup = async (client: typeof server) => client.rpc("get_public_homework",{p_code:code});\n  let {data,error}=await lookup(server);\n  if(error && admin){({data,error}=await lookup(admin as typeof server));}
  if(error){console.error("public homework lookup failed",{code,error});return NextResponse.json({error:"database_error",detail:error.code||"rpc_failed"},{status:500});}
  const row=Array.isArray(data)?data[0]:data;
  if(!row)return NextResponse.json({error:"not_found"},{status:404});
  if(row.revoked_at)return NextResponse.json({error:"not_found"},{status:404});
  if(new Date(row.valid_until).getTime()<Date.now())return NextResponse.json({error:"expired"},{status:410});
  return NextResponse.json({assignment:{code:row.code,childName:row.child_name,studentId:row.student_id??undefined,songId:row.song_id,teacherNote:row.teacher_note??"",targetRepeats:row.target_repeats,validUntil:row.valid_until,createdAt:row.created_at}});
}
