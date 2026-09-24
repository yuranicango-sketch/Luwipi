import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/request-security";
import { offlineAccessCookie } from "@/lib/offline-access";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(offlineAccessCookie, "", { path: "/", maxAge: 0 });
  return response;
}
