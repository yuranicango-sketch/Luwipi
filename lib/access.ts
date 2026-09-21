import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type AccessState = "admin" | "active" | "trial" | "expired";

export async function getAccessState(userId: string): Promise<{state:AccessState; trialEndsAt:string|null; accessUntil:string|null}> {
  const admin = createAdminSupabaseClient();
  if (!admin) return { state:"expired", trialEndsAt:null, accessUntil:null };
  const { data } = await admin.from("profiles").select("role,access_status,trial_ends_at,access_until").eq("id",userId).maybeSingle();
  if (!data) return { state:"expired", trialEndsAt:null, accessUntil:null };
  if (data.role === "admin") return { state:"admin", trialEndsAt:data.trial_ends_at, accessUntil:data.access_until };
  const now=Date.now();
  if (data.access_status === "active" && (!data.access_until || new Date(data.access_until).getTime()>now)) return { state:"active", trialEndsAt:data.trial_ends_at, accessUntil:data.access_until };
  if (data.access_status === "trial" && data.trial_ends_at && new Date(data.trial_ends_at).getTime()>now) return { state:"trial", trialEndsAt:data.trial_ends_at, accessUntil:data.access_until };
  return { state:"expired", trialEndsAt:data.trial_ends_at, accessUntil:data.access_until };
}
