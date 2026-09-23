import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("service worker never caches authenticated navigations or APIs", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(source, /pathname\.startsWith\("\/auth\/"\)/);
  assert.match(source, /_next\/static/);
});

test("durable child data is assigned to IndexedDB stores", async () => {
  const source = await readFile(new URL("../lib/teacher-store.ts", import.meta.url), "utf8");
  assert.match(source, /indexedDB\.open/);
  assert.match(source, /STUDENTS_STORE/);
  assert.match(source, /HISTORY_STORE/);
  assert.doesNotMatch(source, /localStorage\.setItem\(.*STUDENTS/);
  assert.doesNotMatch(source, /localStorage\.setItem\(.*HISTORY/);
});
