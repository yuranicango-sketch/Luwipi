import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function isProtected(path:string,method:string){
  if (["/dashboard","/curriculo","/aulas","/jogos","/musicas","/recursos","/professor"].some(p=>path===p||path.startsWith(p+"/"))) return true;
  if (path==="/api/students"||path==="/api/groups") return true;
  if (path==="/api/homework" && method!=="GET") return true;
  return false;
}
function trialAllowed(path:string){
  if(path==="/dashboard") return true;
  const lesson=path.match(/^\/aulas\/(2-4|5-8)\/(\d+)$/);
  if(lesson) return Number(lesson[2])<=8;
  if(path.startsWith("/recursos/2-4/modulo-1")) return true;
  if(/^\/musicas\/[^/]+$/.test(path)||/^\/jogos\/[^/]+$/.test(path)) return true;
  return false;
}
export async function proxy(request:NextRequest){
  const path=request.nextUrl.pathname;
  if(!isProtected(path,request.method)) return NextResponse.next();
  let response=NextResponse.next({request});
  const supabase=createServerClient(SUPABASE_URL,SUPABASE_KEY,{cookies:{
    getAll:()=>request.cookies.getAll(),
    setAll:(items)=>{items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));}
  }});
  const user=(await supabase.auth.getUser()).data.user;
  if(!user){
    if(path.startsWith("/api/")) return NextResponse.json({error:"unauthorized"},{status:401});
    const u=request.nextUrl.clone();u.pathname="/login";u.searchParams.set("next",path);return NextResponse.redirect(u);
  }
  const {data}=await supabase.from("profiles").select("role,access_status,trial_ends_at,access_until").eq("id",user.id).maybeSingle();
  if(data?.role==="admin") return response;
  const now=Date.now();
  const active=data?.access_status==="active"&&(!data.access_until||new Date(data.access_until).getTime()>now);
  if(active) return response;
  const trial=data?.access_status==="trial"&&data.trial_ends_at&&new Date(data.trial_ends_at).getTime()>now;
  if(trial&&trialAllowed(path)) return response;
  if(path.startsWith("/api/")) return NextResponse.json({error:trial?"subscription_required":"trial_expired"},{status:403});
  const u=request.nextUrl.clone();u.pathname="/assinar";u.searchParams.set("reason",trial?"trial_limit":"trial_expired");return NextResponse.redirect(u);
}
export const config={matcher:["/dashboard/:path*","/curriculo/:path*","/aulas/:path*","/jogos/:path*","/musicas/:path*","/recursos/:path*","/professor/:path*","/api/students/:path*","/api/groups/:path*","/api/homework"]};
