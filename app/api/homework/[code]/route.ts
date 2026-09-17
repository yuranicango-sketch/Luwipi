import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const CODE_RE = /^LUWI-[A-HJ-NP-Z2-9]{8}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!CODE_RE.test(code)) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("homework_assignments")
    .select("id, code, child_name, student_id, song_id, teacher_note, target_repeats, valid_until, created_at, revoked_at")
    .eq("code", code)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "database_error" }, { status: 500 });
  if (!data || data.revoked_at) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (new Date(data.valid_until).getTime() < Date.now()) return NextResponse.json({ error: "expired" }, { status: 410 });

  return NextResponse.json({
    assignment: {
      code: data.code,
      childName: data.child_name,
      studentId: data.student_id ?? undefined,
      songId: data.song_id,
      teacherNote: data.teacher_note ?? "",
      targetRepeats: data.target_repeats,
      validUntil: data.valid_until,
      createdAt: data.created_at,
    },
  });
}
