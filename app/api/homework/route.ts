import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { kidsSongs } from "@/lib/music-library";
import { sameOrigin } from "@/lib/request-security";

const CODE_RE = /^LUWI-[A-HJ-NP-Z2-9]{8}$/;
const SONGS = new Set(kidsSongs.filter((s) => s.playable).map((s) => s.id));

export async function GET() {
  const server = await createServerSupabaseClient();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await server
    .from("homework_assignments")
    .select("id,code,student_id,child_name,song_id,teacher_note,target_repeats,valid_until,created_at,revoked_at,homework_progress(sessions,repeats,completed,last_practiced_at,updated_at,notes_played)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) return NextResponse.json({ error: "database_error", detail: error.code }, { status: 500 });
  return NextResponse.json({ assignments: data ?? [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });

  const server = await createServerSupabaseClient();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();

  // Profile reads should use the authenticated user's client. This keeps the
  // request working even when the production service key is missing/stale,
  // while RLS still limits the read to the current user's own profile.
  const { data: profile, error: profileError } = await server
    .from("profiles")
    .select("access_status,access_until,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "profile_unavailable", detail: profileError.code }, { status: 503 });
  }
  if (!profile) return NextResponse.json({ error: "profile_missing" }, { status: 409 });

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
    const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";
    const note = String(body.teacherNote ?? "").trim().slice(0, 1000);
    const repeats = Math.min(10, Math.max(1, Number(body.targetRepeats) || 3));
    const until = new Date(String(body.validUntil ?? ""));

    const validStudentId = !studentId || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(studentId);
    if (
      !CODE_RE.test(code) ||
      !SONGS.has(songId) ||
      !name ||
      !validStudentId ||
      Number.isNaN(until.getTime()) ||
      until.getTime() <= Date.now() ||
      until.getTime() > Date.now() + 31 * 86400000
    ) return NextResponse.json({ error: "invalid_assignment" }, { status: 400 });

    let linkedStudentId: string | null = null;
    if (studentId) {
      const { data: student } = await server.from("students").select("id").eq("id", studentId).eq("teacher_id", user.id).maybeSingle();
      if (!student) return NextResponse.json({ error: "invalid_student" }, { status: 400 });
      linkedStudentId = student.id;
    }

    // Prefer the authenticated client: RLS already enforces teacher ownership
    // and product access. The service client is only a compatibility fallback.
    let { error } = await server.from("homework_assignments").insert({
      code,
      teacher_id: user.id,
      child_name: name,
      student_id: linkedStudentId,
      song_id: songId,
      teacher_note: note,
      target_repeats: repeats,
      valid_until: until.toISOString(),
    });

    if (error && admin && error.code !== "23505") {
      const fallback = await admin.from("homework_assignments").insert({
        code, teacher_id: user.id, child_name: name, student_id: linkedStudentId, song_id: songId,
        teacher_note: note, target_repeats: repeats, valid_until: until.toISOString(),
      });
      error = fallback.error;
    }

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "code_collision" }, { status: 409 });
      return NextResponse.json({ error: "database_error", detail: error.code }, { status: 500 });
    }

    return NextResponse.json({ ok: true, code });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
