import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { readRoster, writeRoster } from "@/lib/google-drive-roster";
import { sameOrigin } from "@/lib/request-security";

async function user() {
  const s = await createServerSupabaseClient();
  return (await s.auth.getUser()).data.user;
}

export async function GET() {
  const u = await user();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const r = await readRoster(u.id);
    return NextResponse.json({
      groups: r.groups.map((g) => ({
        ...g,
        student_group_members: g.studentIds.map((student_id) => ({ student_id })),
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "drive_error" },
      { status: 503 },
    );
  }
}

export async function POST(r: Request) {
  if (!sameOrigin(r)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const u = await user();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const raw = await r.text();
    if (raw.length > 50000) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    const b: unknown = JSON.parse(raw);
    const body = b && typeof b === "object" ? (b as Record<string, unknown>) : {};
    const roster = await readRoster(u.id);
    const name = String(body.name ?? "").trim().slice(0, 120);

    if (!name) {
      return NextResponse.json({ error: "invalid_group" }, { status: 400 });
    }

    const studentIds = Array.isArray(body.studentIds) ? body.studentIds : [];
    const requested: string[] = [
      ...new Set(studentIds.filter((x): x is string => typeof x === "string")),
    ].slice(0, 200);

    const allowed = new Set<string>(roster.students.map((s) => s.id));
    if (requested.some((id) => !allowed.has(id))) {
      return NextResponse.json({ error: "invalid_students" }, { status: 403 });
    }

    const group = {
      id: randomUUID(),
      name,
      studentIds: requested,
      created_at: new Date().toISOString(),
    };

    roster.groups = [group, ...roster.groups].slice(0, 500);
    await writeRoster(u.id, roster);
    return NextResponse.json({ group });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "drive_error" },
      { status: 503 },
    );
  }
}
