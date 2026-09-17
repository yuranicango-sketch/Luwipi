import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type ProgressBody = {
  repeats?: number;
  sessionStarted?: boolean;
  durationSeconds?: number;
  completed?: boolean;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  const body = (await request.json().catch(() => ({}))) as ProgressBody;
  const supabase = createAdminSupabaseClient();

  if (!supabase) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });

  const { data: assignment, error: assignmentError } = await supabase
    .from("homework_assignments")
    .select("id, target_repeats, valid_until, revoked_at")
    .eq("code", code)
    .maybeSingle();

  if (assignmentError) return NextResponse.json({ error: "database_error" }, { status: 500 });
  if (!assignment || assignment.revoked_at) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (new Date(assignment.valid_until).getTime() < Date.now()) return NextResponse.json({ error: "expired" }, { status: 410 });

  const { data: current } = await supabase
    .from("homework_progress")
    .select("sessions, repeats, completed, first_practiced_at, completed_at")
    .eq("assignment_id", assignment.id)
    .maybeSingle();

  const repeats = Math.max(0, Math.min(1000, Math.floor(body.repeats ?? current?.repeats ?? 0)));
  const sessions = Math.max(0, (current?.sessions ?? 0) + (body.sessionStarted ? 1 : 0));
  const completed = Boolean(body.completed || current?.completed || repeats >= assignment.target_repeats);
  const now = new Date().toISOString();

  const { error: progressError } = await supabase
    .from("homework_progress")
    .upsert({
      assignment_id: assignment.id,
      sessions,
      repeats,
      completed,
      first_practiced_at: current?.first_practiced_at ?? now,
      last_practiced_at: now,
      completed_at: completed ? current?.completed_at ?? now : null,
      updated_at: now,
    }, { onConflict: "assignment_id" });

  if (progressError) return NextResponse.json({ error: "database_error" }, { status: 500 });

  if (body.sessionStarted || body.durationSeconds) {
    await supabase.from("homework_practice_sessions").insert({
      assignment_id: assignment.id,
      repetitions: repeats,
      duration_seconds: Math.max(0, Math.floor(body.durationSeconds ?? 0)),
      completed,
      ended_at: body.durationSeconds ? now : null,
    });
  }

  return NextResponse.json({ ok: true, progress: { sessions, repeats, completed } });
}
