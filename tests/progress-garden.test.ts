import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("progress garden cycles instead of saturating at a fixed final stage", async () => {
  const source = await readFile(new URL("../components/progress-garden.tsx", import.meta.url), "utf8");
  assert.match(source, /completedCycles = Math\.floor/);
  assert.match(source, /lessons \+ repertoire \* 2 \+ mastery \* 3/);
  assert.doesNotMatch(source, /Math\.min\(stages\.length/);
});
