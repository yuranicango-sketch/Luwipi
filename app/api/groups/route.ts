import {NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import {sameOrigin} from "@/lib/request-security";
async function ctx(){const s=await createServerSupabaseClient();const u=(await s.auth.getUser()).data.user;return {s,u}}
export async function GET(){
 const {s,u}=await ctx();if(!u)return NextResponse.json({error:"unauthorized"},{status:401});
 const {data,error}=await s.from("student_groups").select("id,name,created_at,student_group_members(student_id)").eq("teacher_id",u.id).order("created_at",{ascending:false});
 if(error)return NextResponse.json({error:"database_error",detail:error.code},{status:500});
 return NextResponse.json({groups:data??[]});
}
export async function POST(r:Request){
 if(!sameOrigin(r))return NextResponse.json({error:"forbidden_origin"},{status:403});
 const {s,u}=await ctx();if(!u)return NextResponse.json({error:"unauthorized"},{status:401});
 const raw=await r.text();if(raw.length>50000)return NextResponse.json({error:"payload_too_large"},{status:413});
 const b:unknown=JSON.parse(raw),body=b&&typeof b==="object"?b as Record<string,unknown>:{};
 const name=String(body.name??"").trim().slice(0,120);if(!name)return NextResponse.json({error:"invalid_group"},{status:400});
 const ids=[...new Set((Array.isArray(body.studentIds)?body.studentIds:[]).filter((x):x is string=>typeof x==="string"))].slice(0,200);
 if(ids.length){const {data}=await s.from("students").select("id").eq("teacher_id",u.id).in("id",ids);if((data??[]).length!==ids.length)return NextResponse.json({error:"invalid_students"},{status:403})}
 const {data:g,error}=await s.from("student_groups").insert({teacher_id:u.id,name}).select("id,name,created_at").single();
 if(error)return NextResponse.json({error:"database_error",detail:error.code},{status:500});
 if(ids.length){const {error:me}=await s.from("student_group_members").insert(ids.map(student_id=>({group_id:g.id,student_id})));if(me){await s.from("student_groups").delete().eq("id",g.id);return NextResponse.json({error:"database_error",detail:me.code},{status:500})}}
 return NextResponse.json({group:{...g,student_group_members:ids.map(student_id=>({student_id}))}});
}
