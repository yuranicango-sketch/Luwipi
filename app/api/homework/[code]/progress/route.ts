import {NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
type ProgressBody={sessionStarted?:boolean;durationSeconds?:number;noteCompleted?:boolean;repetitionCompleted?:boolean};
const CODE_RE=/^LUWI-[A-HJ-NP-Z2-9]{8}$/;
export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){
 const code=(await params).code.trim().toUpperCase();
 if(!CODE_RE.test(code))return NextResponse.json({error:"invalid_code"},{status:400});
 const body=(await request.json().catch(()=>({}))) as ProgressBody;
 const supabase=await createServerSupabaseClient();
 const {data,error}=await supabase.rpc("update_public_homework_progress",{
   p_code:code,
   p_session_started:Boolean(body.sessionStarted),
   p_note_completed:Boolean(body.noteCompleted),
   p_duration_seconds:Math.min(86400,Math.max(0,Math.floor(body.durationSeconds??0))),
   p_repetition_completed:Boolean(body.repetitionCompleted)
 });
 if(error){
   const msg=String(error.message||"");
   if(msg.includes("not_found"))return NextResponse.json({error:"not_found"},{status:404});
   if(msg.includes("expired"))return NextResponse.json({error:"expired"},{status:410});
   return NextResponse.json({error:"database_error",detail:error.code},{status:500});
 }
 return NextResponse.json({ok:true,progress:data});
}
