import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function reviewer() {
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

  if (profile?.role !== "admin") return null;
  return { session, admin, db };
}

async function resolveImageSource(url: string) {
  const first = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
    headers: { "user-agent": "Mozilla/5.0 Luwipi/1.0" },
  });
  if (!first.ok) throw new Error("A fonte não respondeu.");

  const type = (first.headers.get("content-type") ?? "").split(";")[0];
  if (type.startsWith("image/")) return { response: first, url: first.url };

  if (type.includes("text/html")) {
    const html = await first.text();
    const match =
      html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
    if (!match) throw new Error("A página não forneceu uma imagem utilizável.");

    const imageUrl = new URL(match[1].replace(/&amp;/g, "&"), first.url).toString();
    const image = await fetch(imageUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: { "user-agent": "Mozilla/5.0 Luwipi/1.0" },
    });
    if (!image.ok) throw new Error("A imagem da fonte não respondeu.");
    return { response: image, url: image.url };
  }

  throw new Error("A origem não devolveu uma imagem.");
}

async function optimize(raw: Buffer, contentType: string) {
  if (contentType === "image/svg+xml") {
    return { buffer: raw, type: contentType, ext: "svg", width: null, height: null };
  }

  const image = sharp(raw, { failOn: "warning" }).rotate();
  const buffer = await image
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5, smartSubsample: true })
    .toBuffer();
  const meta = await sharp(buffer).metadata();
  return {
    buffer,
    type: "image/webp",
    ext: "webp",
    width: meta.width ?? null,
    height: meta.height ?? null,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await reviewer();
  if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const decision = body?.decision;
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "Decisão inválida" }, { status: 400 });
  }

  const { data: asset, error: readError } = await ctx.db
    .from("pedagogy_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 400 });
  if (!asset) return NextResponse.json({ error: "Asset não encontrado" }, { status: 404 });

  const now = new Date().toISOString();
  if (decision === "rejected") {
    const { data, error } = await ctx.db
      .from("pedagogy_assets")
      .update({ status: "rejected", updated_at: now })
      .eq("id", id)
      .select("id,status")
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Asset não encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, asset: data });
  }

  const updates: Record<string, unknown> = {
    status: "approved",
    approved_at: now,
    updated_at: now,
  };
  let archived = false;
  let warning: string | null = null;
  let savedBytes: number | null = null;

  if (ctx.admin) {
    try {
      const { response: upstream } = await resolveImageSource(asset.source_url);
      const raw = Buffer.from(await upstream.arrayBuffer());
      if (raw.length > 12 * 1024 * 1024) throw new Error("Imagem original demasiado grande.");

      const contentType = (upstream.headers.get("content-type") ?? "image/jpeg").split(";")[0];
      if (!contentType.startsWith("image/")) throw new Error("A origem não devolveu uma imagem.");

      const optimized = await optimize(raw, contentType);
      if (optimized.buffer.length > 2 * 1024 * 1024) {
        throw new Error("A imagem otimizada continua acima do limite de 2 MB.");
      }

      const checksum = createHash("sha256").update(optimized.buffer).digest("hex");
      const path = `${asset.visual_key}/${checksum.slice(0, 20)}.${optimized.ext}`;
      const { error: uploadError } = await ctx.admin.storage
        .from("pedagogy-assets")
        .upload(path, optimized.buffer, {
          contentType: optimized.type,
          upsert: true,
          cacheControl: "31536000",
        });
      if (uploadError) throw uploadError;

      Object.assign(updates, {
        storage_path: path,
        mime_type: optimized.type,
        width: optimized.width,
        height: optimized.height,
        original_bytes: raw.length,
        stored_bytes: optimized.buffer.length,
        checksum_sha256: checksum,
      });
      savedBytes = raw.length - optimized.buffer.length;
      archived = true;
    } catch (error) {
      warning = error instanceof Error
        ? `Aprovação guardada, mas a cópia local falhou: ${error.message}`
        : "Aprovação guardada, mas a cópia local falhou.";
    }
  } else {
    warning = "Aprovação guardada. A cópia para o Storage será feita quando a configuração administrativa estiver disponível.";
  }

  const { data, error } = await ctx.db
    .from("pedagogy_assets")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Asset não encontrado" }, { status: 404 });

  const publicUrl = data.storage_path
    ? ctx.db.storage.from("pedagogy-assets").getPublicUrl(data.storage_path).data.publicUrl
    : null;

  return NextResponse.json({
    ok: true,
    archived,
    warning,
    asset: {
      ...data,
      url: publicUrl ?? data.source_url,
      saved_bytes: savedBytes,
    },
  });
}
