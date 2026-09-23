import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/", request.url), 303);
}
