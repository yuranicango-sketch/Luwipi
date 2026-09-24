const STATIC_CACHE = "luwipi-static-v4";
const ROUTE_CACHE = "luwipi-offline-routes-v1";
const META_CACHE = "luwipi-offline-meta-v1";
const META_URL = "/__luwipi_offline_grace__";
const CORE = ["/icon.svg"];
const TEACHER_ROUTES = ["/dashboard", "/aula", "/alunos", "/curriculo", "/biblioteca", "/casa", "/onboarding", "/jogos", "/partituras"];

function teacherPath(pathname) {
  return TEACHER_ROUTES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

async function writeGrace(expiresAt) {
  const cache = await caches.open(META_CACHE);
  await cache.put(META_URL, new Response(JSON.stringify({ expiresAt }), {
    headers: { "content-type": "application/json" },
  }));
}

async function readGrace() {
  const cache = await caches.open(META_CACHE);
  const response = await cache.match(META_URL);
  if (!response) return null;
  try {
    const value = await response.json();
    return typeof value.expiresAt === "string" ? value : null;
  } catch {
    return null;
  }
}

async function graceValid() {
  const grace = await readGrace();
  if (!grace) return false;
  const expires = new Date(grace.expiresAt).getTime();
  if (!Number.isFinite(expires) || expires <= Date.now()) {
    await clearOfflineAccess();
    return false;
  }
  return true;
}

async function clearOfflineAccess() {
  await caches.delete(META_CACHE);
  await caches.delete(ROUTE_CACHE);
}

function routeRequest(pathname) {
  return new Request(new URL(pathname, self.location.origin).toString(), {
    method: "GET",
    credentials: "include",
    headers: { accept: "text/html" },
  });
}

async function warmRoutes() {
  if (!(await graceValid())) return;
  const cache = await caches.open(ROUTE_CACHE);
  await Promise.allSettled(TEACHER_ROUTES.map(async (pathname) => {
    const request = routeRequest(pathname);
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok && !response.redirected && new URL(response.url).pathname === pathname) {
      await cache.put(request, response.clone());
    }
  }));
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SET_OFFLINE_GRACE" && typeof data.expiresAt === "string") {
    event.waitUntil(writeGrace(data.expiresAt).then(() => warmRoutes()));
  }
  if (data.type === "CLEAR_OFFLINE_GRACE") {
    event.waitUntil(clearOfflineAccess());
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.allSettled(CORE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, ROUTE_CACHE, META_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && teacherPath(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const finalPath = new URL(response.url).pathname;

        if (response.ok && !response.redirected && finalPath === url.pathname) {
          const cache = await caches.open(ROUTE_CACHE);
          await cache.put(routeRequest(url.pathname), response.clone());
          return response;
        }

        if (finalPath === "/acesso-indisponivel" && await graceValid()) {
          const cache = await caches.open(ROUTE_CACHE);
          const cached = await cache.match(routeRequest(url.pathname));
          if (cached) return cached;
        }

        // Login e /assinar representam decisões definitivas do servidor; não contornar.
        return response;
      } catch {
        if (await graceValid()) {
          const cache = await caches.open(ROUTE_CACHE);
          const cached = await cache.match(routeRequest(url.pathname));
          if (cached) return cached;
        }
        throw new Error("offline_access_unavailable");
      }
    })());
    return;
  }

  if (
    request.mode === "navigate" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  ) return;

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname);

  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      });
      return cached || network;
    }),
  );
});
