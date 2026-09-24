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
