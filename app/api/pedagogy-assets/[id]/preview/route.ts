import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function allowed(){const s=await createServerSupabaseClient();const {data:{user}}=await s.auth.getUser();return !!user}
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await allowed())return new NextResponse(null,{status:401});
 const {id}=await params;const admin=createAdminSupabaseClient();if(!admin)return new NextResponse(null,{status:503});
 const {data:asset}=await admin.from("pedagogy_assets").select("source_url,storage_path").eq("id",id).maybeSingle();
 if(!asset)return new NextResponse(null,{status:404});
 if(asset.storage_path){const {data}=admin.storage.from("pedagogy-assets").getPublicUrl(asset.storage_path);return NextResponse.redirect(data.publicUrl,302)}
 try{
  const first=await fetch(asset.source_url,{redirect:"follow",signal:AbortSignal.timeout(10000),headers:{"user-agent":"Mozilla/5.0 Luwipi/1.0"}});
  const type=(first.headers.get("content-type")??"").split(";")[0];
  if(first.ok&&type.startsWith("image/"))return NextResponse.redirect(first.url,302);
  if(first.ok&&type.includes("text/html")){
   const html=await first.text();
   const match=html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i)||html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
   if(match)return NextResponse.redirect(match[1].replace(/&amp;/g,"&"),302);
  }
 }catch{}
 return new NextResponse(null,{status:404});
}