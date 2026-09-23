import {NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import {sameOrigin} from "@/lib/request-security";

async function ctx(){const s=await createServerSupabaseClient();const u=(await s.auth.getUser()).data.user;return {s,u}}
export async function GET(){
 const {s,u}=await ctx();if(!u)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data,error}=await s.from("students").select("id,display_code,age_group,created_at").eq("teacher_id",u.id).order("created_at");
 if(error)return NextResponse.json({error:"database_error",detail:error.code},{status:500});
 return NextResponse.json({students:(data??[]).map(x=>({id:x.id,name:x.display_code,age_group:x.age_group,guardian_name:null}))});
}
export async function POST(r:Request){
 if(!sameOrigin(r))return NextResponse.json({error:"forbidden_origin"},{status:403});
 const {s,u}=await ctx();if(!u)return NextResponse.json({error:"unauthorized"},{status:401});
 const raw=await r.text();if(raw.length>100000)return NextResponse.json({error:"payload_too_large"},{status:413});
 const b:unknown=JSON.parse(raw);const body=b&&typeof b==="object"?b as Record<string,unknown>:{};
 const input=(Array.isArray(body.students)?body.students:[body]).slice(0,200).filter(x=>x&&typeof x==="object") as Record<string,unknown>[];
 if(!input.length)return NextResponse.json({error:"invalid_students"},{status:400});
 const {count}=await s.from("students").select("*",{count:"exact",head:true}).eq("teacher_id",u.id);
 const start=(count??0)+1;
 const validAges=new Set(["2-4","5-8","adult"]);
 if(input.some(x=>!validAges.has(String(x.ageGroup))))return NextResponse.json({error:"invalid_age_group"},{status:400});
 const rows=input.map((x,i)=>({teacher_id:u.id,name:`Aluno ${String(start+i).padStart(3,"0")}`,display_code:`Aluno ${String(start+i).padStart(3,"0")}`,age_group:String(x.ageGroup),guardian_name:null,notes:null}));
 const {data,error}=await s.from("students").insert(rows).select("id,display_code,age_group,created_at");
 if(error)return NextResponse.json({error:"database_error",detail:error.code},{status:500});
 return NextResponse.json({students:(data??[]).map(x=>({id:x.id,name:x.display_code,age_group:x.age_group,guardian_name:null}))});
}
