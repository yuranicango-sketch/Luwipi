import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { offlineAccessCookie, verifyOfflineAccessLease } from "@/lib/offline-access";

export async function GET() {
  const store = await cookies();
  const lease = await verifyOfflineAccessLease(store.get(offlineAccessCookie)?.value);
  if (!lease) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.json(
    { ok: true, expiresAt: lease.exp, access: lease.access },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
