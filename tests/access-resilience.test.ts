import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("network verification failures are not treated as expired billing", async () => {
  const source = await readFile(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.match(source, /acesso-indisponivel/);
  assert.match(source, /offline-grace/);
  assert.match(source, /createOfflineAccessLease/);
  assert.match(source, /trial_expired/);
  assert.match(source, /subscription_required/);
});

test("only the generic local lesson shell is cached as navigation", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /offline-aula/);
  assert.match(source, /url\.pathname === "\/offline-aula"/);
  assert.match(source, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(source, /pathname\.startsWith\("\/auth\/"\)/);
});


test("reloading the live lesson without network falls back to the generic offline shell", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /url\.pathname === "\/aula"/);
  assert.match(source, /Response\.redirect\(new URL\("\/offline-aula"/);
});

test("the client offline window copies the signed lease expiry instead of extending itself", async () => {
  const local = await readFile(new URL("../lib/offline-lesson-access.ts", import.meta.url), "utf8");
  const bootstrap = await readFile(new URL("../components/offline-access-bootstrap.tsx", import.meta.url), "utf8");
  assert.match(local, /markOfflineLessonWindow\(expiresAt: number\)/);
  assert.doesNotMatch(local, /Date\.now\(\) \+ EIGHT_HOURS/);
  assert.match(bootstrap, /api\/access\/offline-status/);
  assert.match(bootstrap, /markOfflineLessonWindow\(body\.expiresAt\)/);
});

test("sign out clears the signed offline lease cookie", async () => {
  const source = await readFile(new URL("../app/auth/signout/route.ts", import.meta.url), "utf8");
  assert.match(source, /offlineAccessCookie/);
  assert.match(source, /maxAge: 0/);
});
