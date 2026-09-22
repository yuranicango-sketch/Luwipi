import { NextRequest,NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function allowed(){
 const s=await createServerSupabaseClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return false;
 const admin=createAdminSupabaseClient(); if(!admin)return false;
 const {data}=await admin.from("profiles").select("role").eq("id",user.id).maybeSingle();
 return data?.role==="admin";
}
export async function GET(req:NextRequest){
 if(!await allowed())return NextResponse.json({error:"Não autorizado"},{status:401});
 const admin=createAdminSupabaseClient()!;
 const status=req.nextUrl.searchParams.get("status")??"candidate";
 const {data,error}=await admin.from("pedagogy_assets").select("*").eq("status",status).order("created_at");
 return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({assets:data??[]});
}
export async function POST(req:NextRequest){
 if(!await allowed())return NextResponse.json({error:"Não autorizado"},{status:401});
 const admin=createAdminSupabaseClient()!; const body=await req.json();
 const {data,error}=await admin.from("pedagogy_assets").upsert(body,{onConflict:"source_url"}).select().single();
 return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({asset:data});
}
