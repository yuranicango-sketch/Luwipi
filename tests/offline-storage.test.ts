import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("teacher navigation can fall back only while a short offline grace is valid", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /SET_OFFLINE_GRACE/);
  assert.match(source, /graceValid()/);
  assert.match(source, /ROUTE_CACHE/);
  assert.match(source, /finalPath === "\/acesso-indisponivel"/);
  assert.match(source, /Login e \/assinar representam decisões definitivas/);
});

test("offline grace is capped at eight hours after verified access", async () => {
  const source = await readFile(new URL("../app/api/access/offline-pass/route.ts", import.meta.url), "utf8");
  assert.match(source, /8 \* 60 \* 60 \* 1000/);
  assert.match(source, /Math\.min\(now \+ GRACE_MS, entitlementUntil\)/);
});

test("technical verification failure is distinct from expired access", async () => {
  const source = await readFile(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.match(source, /acesso-indisponivel/);
  assert.match(source, /profileError \|\| !profile/);
  assert.match(source, /trial_expired/);
  assert.match(source, /subscription_required/);
});

test("students and history use IndexedDB as primary storage", async () => {
  const source = await readFile(new URL("../lib/teacher-local-v2.ts", import.meta.url), "utf8");
  assert.match(source, /durableRead<LocalStudent\[\]>\(STUDENTS/);
  assert.match(source, /durableWrite\(STUDENTS/);
  assert.match(source, /durableRead<LessonHistory\[\]>\(HISTORY/);
  assert.match(source, /durableWrite\(HISTORY/);
  assert.match(source, /localStorage\.setItem\(ACTIVE/);
});
