import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { kidsSongs } from "@/lib/music-library";
import { sameOrigin } from "@/lib/request-security";

const CODE_RE = /^LUWI-[A-HJ-NP-Z2-9]{8}$/;
const SONGS = new Set(kidsSongs.filter((s) => s.playable).map((s) => s.id));

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });

  const server = await createServerSupabaseClient();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const db = admin ?? server;

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("access_status,access_until,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return NextResponse.json({ error: "profile_unavailable" }, { status: 503 });

  const active =
    profile?.role === "admin" ||
    (profile?.access_status === "active" &&
      (!profile.access_until || new Date(profile.access_until).getTime() > Date.now()));

  const trial = profile?.access_status === "trial";
  if (!active && !trial) return NextResponse.json({ error: "subscription_inactive" }, { status: 403 });

  try {
    const raw = await request.text();
    if (raw.length > 20000) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });

    const parsed: unknown = JSON.parse(raw);
    const body = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
    const code = String(body.code ?? "").trim().toUpperCase();
    const songId = String(body.songId ?? "");
    const name = String(body.childName ?? "").trim().slice(0, 120);
    const note = String(body.teacherNote ?? "").trim().slice(0, 1000);
    const repeats = Math.min(10, Math.max(1, Number(body.targetRepeats) || 3));
    const until = new Date(String(body.validUntil ?? ""));

    if (
      !CODE_RE.test(code) ||
      !SONGS.has(songId) ||
      !name ||
      Number.isNaN(until.getTime()) ||
      until.getTime() <= Date.now() ||
      until.getTime() > Date.now() + 31 * 86400000
    ) return NextResponse.json({ error: "invalid_assignment" }, { status: 400 });

    const { error } = await db.from("homework_assignments").insert({
      code,
      teacher_id: user.id,
      child_name: name,
      student_id: null,
      song_id: songId,
      teacher_note: note,
      target_repeats: repeats,
      valid_until: until.toISOString(),
    });

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "code_collision" }, { status: 409 });
      return NextResponse.json({ error: "database_error", detail: error.code }, { status: 500 });
    }

    return NextResponse.json({ ok: true, code });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
