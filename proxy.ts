import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const URL = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

const teacherRoutes = ["/dashboard", "/aula", "/alunos", "/curriculo", "/biblioteca", "/casa", "/onboarding"];

function protectedPath(pathname: string) {
  return teacherRoutes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))
    || pathname === "/admin"
    || pathname.startsWith("/admin/");
}

function trialAllowed(pathname: string) {
  return teacherRoutes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,access_status,trial_ends_at,access_until")
    .eq("id", user.id)
    .maybeSingle();

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
  if (active) return response;

  const trial = profile?.access_status === "trial"
    && !!profile.trial_ends_at
    && new Date(profile.trial_ends_at).getTime() > now;
  if (trial && trialAllowed(pathname)) return response;

  const url = request.nextUrl.clone();
  url.pathname = "/assinar";
  url.searchParams.set("reason", trial ? "trial_limit" : "trial_expired");
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
    "/admin/:path*",
  ],
};
