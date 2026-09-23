import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function context() {
  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return null;
  const admin = createAdminSupabaseClient();
  return { db: admin ?? session };
}

function imageResponse(response: Response) {
  const contentType = (response.headers.get("content-type") ?? "image/jpeg").split(";")[0];
  if (!contentType.startsWith("image/") || !response.body) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

async function fetchSource(url: string) {
  return fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
    headers: { "user-agent": "Mozilla/5.0 Luwipi/1.0" },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await context();
  if (!ctx) return new NextResponse(null, { status: 401 });

  const { id } = await params;
  const { data: asset } = await ctx.db
    .from("pedagogy_assets")
    .select("source_url,storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!asset) return new NextResponse(null, { status: 404 });

  if (asset.storage_path) {
    const { data } = ctx.db.storage.from("pedagogy-assets").getPublicUrl(asset.storage_path);
    return NextResponse.redirect(data.publicUrl, 302);
  }

  try {
    const first = await fetchSource(asset.source_url);
    if (!first.ok) return new NextResponse(null, { status: 404 });

    const type = (first.headers.get("content-type") ?? "").split(";")[0];
    if (type.startsWith("image/")) return imageResponse(first);

    if (type.includes("text/html")) {
      const html = await first.text();
      const match =
        html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
      if (!match) return new NextResponse(null, { status: 404 });

      const imageUrl = new URL(match[1].replace(/&amp;/g, "&"), first.url).toString();
      const image = await fetchSource(imageUrl);
      if (!image.ok) return new NextResponse(null, { status: 404 });
      return imageResponse(image);
    }
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, { status: 404 });
}
