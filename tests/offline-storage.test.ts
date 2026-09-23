import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("service worker never caches authenticated navigation or APIs", async () => {
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(source, /pathname\.startsWith\("\/auth\/"\)/);
});

test("students and history use IndexedDB as primary storage", async () => {
  const source = await readFile(new URL("../lib/teacher-local-v2.ts", import.meta.url), "utf8");
  assert.match(source, /durableRead<LocalStudent\[\]>\(STUDENTS/);
  assert.match(source, /durableWrite\(STUDENTS/);
  assert.match(source, /durableRead<LessonHistory\[\]>\(HISTORY/);
  assert.match(source, /durableWrite\(HISTORY/);
  assert.match(source, /localStorage\.setItem\(ACTIVE/);
});
