const CACHE = "luwipi-static-v4";
const CORE = ["/icon.svg", "/offline-aula"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await Promise.allSettled(CORE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (url.pathname === "/offline-aula") {
      event.respondWith(caches.match("/offline-aula").then((cached) => cached || fetch(request)));
      return;
    }
    if (url.pathname === "/aula") {
      event.respondWith(fetch(request).catch(async () => {
        const cached = await caches.match("/offline-aula");
        if (cached) return Response.redirect(new URL("/offline-aula", self.location.origin), 302);
        throw new Error("offline_lesson_shell_unavailable");
      }));
      return;
    }
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  const isStatic = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/assets/") || /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname);
  if (!isStatic) return;

  event.respondWith(caches.match(request).then((cached) => {
    const network = fetch(request).then((response) => {
      if (response.ok && response.type === "basic") caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    });
    return cached || network;
  }));
});
