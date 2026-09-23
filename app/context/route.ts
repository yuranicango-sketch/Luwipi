import { NextRequest, NextResponse } from "next/server";
import { AGE_COOKIE, STUDENT_COOKIE, normalizeAge } from "@/lib/learning-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeNext(value:string|null){
  if(!value||!value.startsWith("/")||value.startsWith("//"))return"/dashboard";
  return value;
}
function cookieOptions(){
  return{httpOnly:true,sameSite:"lax" as const,secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*365};
}

export async function GET(request:NextRequest){
  const studentId=request.nextUrl.searchParams.get("student")?.trim()??"";
  const requestedAge=normalizeAge(request.nextUrl.searchParams.get("age"));
  const next=safeNext(request.nextUrl.searchParams.get("next"));
  const response=NextResponse.redirect(new URL(next,request.url),303);

  if(studentId){
    if(!UUID.test(studentId))return NextResponse.redirect(new URL("/dashboard",request.url),303);
    const supabase=await createServerSupabaseClient();
    const user=(await supabase.auth.getUser()).data.user;
    if(!user){
      const login=new URL("/login",request.url);login.searchParams.set("next",request.nextUrl.pathname+request.nextUrl.search);
      return NextResponse.redirect(login,303);
    }
    const {data}=await supabase.from("students").select("id,age_group").eq("id",studentId).eq("teacher_id",user.id).maybeSingle();
    if(!data)return NextResponse.redirect(new URL("/dashboard",request.url),303);
    const age=normalizeAge(data.age_group)??requestedAge??"2-4";
    response.cookies.set(STUDENT_COOKIE,data.id,cookieOptions());
    response.cookies.set(AGE_COOKIE,age,cookieOptions());
    return response;
  }

  if(requestedAge)response.cookies.set(AGE_COOKIE,requestedAge,cookieOptions());
  return response;
}
