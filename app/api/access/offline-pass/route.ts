import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const GRACE_MS = 8 * 60 * 60 * 1000;

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401, headers });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,access_status,trial_ends_at,access_until")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ ok: false, reason: "verification_unavailable" }, { status: 503, headers });
  }

  const now = Date.now();
  let entitlementUntil = Number.POSITIVE_INFINITY;
  let allowed = profile.role === "admin";

  if (profile.role !== "admin") {
    if (profile.access_status === "active") {
      entitlementUntil = profile.access_until ? new Date(profile.access_until).getTime() : Number.POSITIVE_INFINITY;
      allowed = entitlementUntil > now;
    } else if (profile.access_status === "trial" && profile.trial_ends_at) {
      entitlementUntil = new Date(profile.trial_ends_at).getTime();
      allowed = entitlementUntil > now;
    }
  }

  if (!allowed) {
    return NextResponse.json({ ok: false, reason: "access_expired" }, { status: 403, headers });
  }

  const expiresAt = Math.min(now + GRACE_MS, entitlementUntil);
  return NextResponse.json({
    ok: true,
    verifiedAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    windowHours: Math.round((expiresAt - now) / 3600000 * 10) / 10,
  }, { headers });
}
