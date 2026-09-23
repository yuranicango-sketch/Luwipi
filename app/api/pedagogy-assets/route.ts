import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function context() {
  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return null;

  const admin = createAdminSupabaseClient();
  const db = admin ?? session;
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { session, db, canReview: profile?.role === "admin" };
}

export async function GET(req: NextRequest) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const key = req.nextUrl.searchParams.get("visual_key");
  const status = req.nextUrl.searchParams.get("status");
  let query = ctx.db.from("pedagogy_assets").select("*").order("created_at");
  if (key) query = query.eq("visual_key", key);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const assets = (data ?? []).map((asset) => ({
    ...asset,
    public_url: asset.storage_path
      ? ctx.db.storage.from("pedagogy-assets").getPublicUrl(asset.storage_path).data.publicUrl
      : null,
  }));

  return NextResponse.json(
    { assets, canReview: ctx.canReview },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(req: NextRequest) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ctx.canReview) return NextResponse.json({ error: "Sem permissão para rever imagens" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await ctx.db
    .from("pedagogy_assets")
    .upsert(body, { onConflict: "source_url" })
    .select()
    .single();

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ asset: data });
}
