import { NextRequest,NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
async function user(){const s=await createServerSupabaseClient();const {data:{user}}=await s.auth.getUser();return user}
export async function GET(req:NextRequest){
 const current=await user();if(!current)return NextResponse.json({error:"Não autorizado"},{status:401});
 const admin=createAdminSupabaseClient();if(!admin)return NextResponse.json({error:"Configuração do servidor incompleta"},{status:503});
 const key=req.nextUrl.searchParams.get("visual_key"),status=req.nextUrl.searchParams.get("status");
 let q=admin.from("pedagogy_assets").select("*").order("created_at");
 if(key)q=q.eq("visual_key",key);if(status)q=q.eq("status",status);
 const {data,error}=await q;if(error)return NextResponse.json({error:error.message},{status:500});
 const assets=(data??[]).map(a=>({...a,public_url:a.storage_path?admin.storage.from("pedagogy-assets").getPublicUrl(a.storage_path).data.publicUrl:null}));
 return NextResponse.json({assets},{headers:{"Cache-Control":"no-store, max-age=0"}});
}
export async function POST(req:NextRequest){
 if(!await user())return NextResponse.json({error:"Não autorizado"},{status:401});
 const admin=createAdminSupabaseClient();if(!admin)return NextResponse.json({error:"Configuração do servidor incompleta"},{status:503});
 const body=await req.json();const {data,error}=await admin.from("pedagogy_assets").upsert(body,{onConflict:"source_url"}).select().single();
 return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({asset:data});
}