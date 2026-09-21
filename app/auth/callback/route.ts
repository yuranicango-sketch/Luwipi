import { createCipheriv, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function encrypt(value: string) {
  const key = Buffer.from(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || "", "base64");
  if (key.length !== 32) throw new Error("encryption_not_configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(".");
}
function safeNext(value: string | null) { return value && value.startsWith("/") && !value.startsWith("//") ? value : "/onboarding"; }

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));

  const refreshToken = data.session?.provider_refresh_token;
  if (refreshToken) {
    try {
      const encrypted = encrypt(refreshToken);
      const admin = createAdminSupabaseClient();
      const db = admin ?? supabase;
      const { error: saveError } = await db.from("profiles").update({
        google_drive_refresh_token_enc: encrypted,
        google_drive_connected_at: new Date().toISOString(),
      }).eq("id", data.user.id);
      if (saveError) return NextResponse.redirect(new URL("/dashboard?drive=save_error", requestUrl.origin));
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch {
      return NextResponse.redirect(new URL("/dashboard?drive=config_error", requestUrl.origin));
    }
  }

  // Google may omit a refresh token when an old grant is reused.
  // Never mark Drive as connected unless a refresh token was actually persisted.
  return NextResponse.redirect(new URL("/dashboard?drive=refresh_token_missing", requestUrl.origin));
}
