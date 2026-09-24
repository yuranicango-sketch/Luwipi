const COOKIE = "luwipi_offline_access";
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

type OfflineLease = {
  v: 1;
  sub: string;
  access: "active" | "trial";
  exp: number;
};

function secret() {
  return process.env.OFFLINE_ACCESS_SECRET || process.env.SUPABASE_SECRET_KEY || "";
}

function base64UrlEncode(input: string) {
  return btoa(unescape(encodeURIComponent(input))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - input.length % 4) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

async function hmac(value: string) {
  const keyText = secret();
  if (!keyText) return "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(keyText), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  return Array.from(signature).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createOfflineAccessLease(sub: string, access: OfflineLease["access"]) {
  const payload: OfflineLease = { v: 1, sub, access, exp: Date.now() + EIGHT_HOURS };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(encoded);
  if (!signature) return null;
  return `${encoded}.${signature}`;
}

export async function verifyOfflineAccessLease(token?: string | null) {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = await hmac(encoded);
  if (!expected || expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (mismatch !== 0) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as OfflineLease;
    if (payload.v !== 1 || !payload.sub || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const offlineAccessCookie = COOKIE;
export const offlineAccessMaxAge = EIGHT_HOURS / 1000;

export function isVerificationFailure(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; message?: string; status?: number };
  const text = `${candidate.name ?? ""} ${candidate.message ?? ""}`.toLowerCase();
  return Boolean(
    (candidate.status && candidate.status >= 500)
    || text.includes("fetch")
    || text.includes("network")
    || text.includes("timeout")
    || text.includes("retryable"),
  );
}
