import { NextRequest,NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

async function allowed(){
 const s=await createServerSupabaseClient(); const {data:{user}}=await s.auth.getUser();
 if(!user)return false; const a=createAdminSupabaseClient(); if(!a)return false;
 const {data}=await a.from("profiles").select("role").eq("id",user.id).maybeSingle(); return data?.role==="admin";
}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!await allowed())return NextResponse.json({error:"Não autorizado"},{status:401});
 const {id}=await params; const {decision}=await req.json(); const admin=createAdminSupabaseClient()!;
 if(decision==="rejected"){
  const {error}=await admin.from("pedagogy_assets").update({status:"rejected",updated_at:new Date().toISOString()}).eq("id",id);
  return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({ok:true});
 }
 if(decision!=="approved")return NextResponse.json({error:"Decisão inválida"},{status:400});
 const {data:asset,error:readError}=await admin.from("pedagogy_assets").select("*").eq("id",id).single();
 if(readError||!asset)return NextResponse.json({error:"Asset não encontrado"},{status:404});
 try{
  const upstream=await fetch(asset.source_url,{redirect:"follow",signal:AbortSignal.timeout(12000)});
  if(!upstream.ok)throw new Error("A fonte não respondeu.");
  const raw=Buffer.from(await upstream.arrayBuffer()); if(raw.length>12*1024*1024)throw new Error("Imagem original demasiado grande.");
  const contentType=(upstream.headers.get("content-type")??"image/jpeg").split(";")[0];
  if(!contentType.startsWith("image/"))throw new Error("A origem não devolveu uma imagem.");
  const ext=contentType.includes("png")?"png":contentType.includes("webp")?"webp":contentType.includes("svg")?"svg":"jpg";
  const checksum=createHash("sha256").update(raw).digest("hex"); const path=`${asset.visual_key}/${checksum.slice(0,20)}.${ext}`;
  const {error:uploadError}=await admin.storage.from("pedagogy-assets").upload(path,raw,{contentType,upsert:true,cacheControl:"31536000"});
  if(uploadError)throw uploadError;
  const {data:pub}=admin.storage.from("pedagogy-assets").getPublicUrl(path);
  const {data,error}=await admin.from("pedagogy_assets").update({status:"approved",storage_path:path,mime_type:contentType,original_bytes:raw.length,stored_bytes:raw.length,checksum_sha256:checksum,approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id).select().single();
  if(error)throw error; return NextResponse.json({asset:{...data,url:pub.publicUrl}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Falha ao guardar imagem"},{status:422});}
}
