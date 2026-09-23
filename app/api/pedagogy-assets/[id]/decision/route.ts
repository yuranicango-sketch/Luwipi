import { NextRequest,NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import sharp from "sharp";

async function allowed(){
 const s=await createServerSupabaseClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return false;
 const a=createAdminSupabaseClient();
 const db=a??s;
 const {data}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();
 return data?.role==="admin";
}
async function resolveImageSource(url:string){
 const first=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(12000),headers:{"user-agent":"Mozilla/5.0 Luwipi/1.0"}});
 if(!first.ok)throw new Error("A fonte não respondeu.");
 const type=(first.headers.get("content-type")??"").split(";")[0];
 if(type.startsWith("image/"))return {response:first,url:first.url};
 if(type.includes("text/html")){
  const html=await first.text();
  const match=html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i)||html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
  if(!match)throw new Error("A página não forneceu uma imagem utilizável.");
  const imageUrl=match[1].replace(/&amp;/g,"&");
  const image=await fetch(imageUrl,{redirect:"follow",signal:AbortSignal.timeout(12000),headers:{"user-agent":"Mozilla/5.0 Luwipi/1.0"}});
  if(!image.ok)throw new Error("A imagem da fonte não respondeu.");
  return {response:image,url:image.url};
 }
 throw new Error("A origem não devolveu uma imagem.");
}
async function optimize(raw:Buffer,contentType:string){
 if(contentType==="image/svg+xml") return {buffer:raw,type:contentType,ext:"svg",width:null,height:null};
 const image=sharp(raw,{failOn:"warning"}).rotate();
 const buffer=await image.resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true}).webp({quality:78,effort:5,smartSubsample:true}).toBuffer();
 const meta=await sharp(buffer).metadata();
 return {buffer,type:"image/webp",ext:"webp",width:meta.width??null,height:meta.height??null};
}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!await allowed())return NextResponse.json({error:"Não autorizado"},{status:403});
 const {id}=await params; const {decision}=await req.json(); const admin=createAdminSupabaseClient();
 if(!admin)return NextResponse.json({error:"Configuração administrativa indisponível"},{status:503});
 if(decision==="rejected"){
  const {error}=await admin.from("pedagogy_assets").update({status:"rejected",updated_at:new Date().toISOString()}).eq("id",id);
  return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({ok:true});
 }
 if(decision!=="approved")return NextResponse.json({error:"Decisão inválida"},{status:400});
 const {data:asset,error:readError}=await admin.from("pedagogy_assets").select("*").eq("id",id).single();
 if(readError||!asset)return NextResponse.json({error:"Asset não encontrado"},{status:404});
 try{
  const {response:upstream}=await resolveImageSource(asset.source_url);
  const raw=Buffer.from(await upstream.arrayBuffer()); if(raw.length>12*1024*1024)throw new Error("Imagem original demasiado grande.");
  const contentType=(upstream.headers.get("content-type")??"image/jpeg").split(";")[0];
  if(!contentType.startsWith("image/"))throw new Error("A origem não devolveu uma imagem.");
  const optimized=await optimize(raw,contentType);
  if(optimized.buffer.length>2*1024*1024)throw new Error("A imagem otimizada continua acima do limite de 2 MB.");
  const checksum=createHash("sha256").update(optimized.buffer).digest("hex");
  const path=`${asset.visual_key}/${checksum.slice(0,20)}.${optimized.ext}`;
  const {error:uploadError}=await admin.storage.from("pedagogy-assets").upload(path,optimized.buffer,{contentType:optimized.type,upsert:true,cacheControl:"31536000"});
  if(uploadError)throw uploadError;
  const {data:pub}=admin.storage.from("pedagogy-assets").getPublicUrl(path);
  const {data,error}=await admin.from("pedagogy_assets").update({status:"approved",storage_path:path,mime_type:optimized.type,width:optimized.width,height:optimized.height,original_bytes:raw.length,stored_bytes:optimized.buffer.length,checksum_sha256:checksum,approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id).select().single();
  if(error)throw error; return NextResponse.json({asset:{...data,url:pub.publicUrl,saved_bytes:raw.length-optimized.buffer.length}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Falha ao comprimir e guardar imagem"},{status:422});}
}
