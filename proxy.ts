import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createOfflineAccessLease, isVerificationFailure, offlineAccessCookie, offlineAccessMaxAge, verifyOfflineAccessLease } from "@/lib/offline-access";

const URL = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

const teacherRoutes = ["/dashboard", "/aula", "/alunos", "/curriculo", "/biblioteca", "/casa", "/onboarding", "/jogos", "/repertorio"];

function protectedPath(pathname: string) {
  return teacherRoutes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))
    || pathname === "/admin"
    || pathname.startsWith("/admin/");
}

function trialAllowed(pathname: string) {
  return teacherRoutes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function technicalFailure(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/acesso-indisponivel";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

async function cachedTeacherAccess(request: NextRequest, expectedUserId?: string) {
  const lease = await verifyOfflineAccessLease(request.cookies.get(offlineAccessCookie)?.value);
  if (!lease) return null;
  if (expectedUserId && lease.sub !== expectedUserId) return null;
  return lease;
}

async function rememberAccess(response: NextResponse, userId: string, access: "active" | "trial") {
  const token = await createOfflineAccessLease(userId, access);
  if (!token) return;
  response.cookies.set(offlineAccessCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: offlineAccessMaxAge,
  });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!protectedPath(pathname)) return NextResponse.next();

  if (!URL || !KEY) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });

  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store");
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    if (isVerificationFailure(userError) && trialAllowed(pathname) && await cachedTeacherAccess(request)) {
      response.headers.set("x-luwipi-access", "offline-grace");
      return response;
    }
    if (isVerificationFailure(userError)) return technicalFailure(request);

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,access_status,trial_ends_at,access_until")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    if (trialAllowed(pathname) && await cachedTeacherAccess(request, user.id)) {
      response.headers.set("x-luwipi-access", "offline-grace");
      return response;
    }
    return technicalFailure(request);
  }

  if (profile?.role === "admin") return response;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const now = Date.now();
  const active = profile?.access_status === "active"
    && (!profile.access_until || new Date(profile.access_until).getTime() > now);
  if (active) {
    await rememberAccess(response, user.id, "active");
    return response;
  }

  const trial = profile?.access_status === "trial"
    && !!profile.trial_ends_at
    && new Date(profile.trial_ends_at).getTime() > now;
  if (trial && trialAllowed(pathname)) {
    await rememberAccess(response, user.id, "trial");
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/assinar";
  const trialExpired = profile?.access_status === "trial" && !!profile.trial_ends_at && new Date(profile.trial_ends_at).getTime() <= now;
  url.searchParams.set("reason", trialExpired ? "trial_expired" : "subscription_required");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/aula/:path*",
    "/alunos/:path*",
    "/curriculo/:path*",
    "/biblioteca/:path*",
    "/casa/:path*",
    "/onboarding/:path*",
    "/jogos/:path*",
    "/repertorio/:path*",
    "/admin/:path*",
  ],
};
