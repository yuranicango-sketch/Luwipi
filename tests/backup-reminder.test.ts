import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("successful export records the backup date used by the reminder", async () => {
  const panel = await readFile(new URL("../components/local-data-panel.tsx", import.meta.url), "utf8");
  const reminder = await readFile(new URL("../components/backup-reminder.tsx", import.meta.url), "utf8");
  assert.match(panel, /luwipi:v3:last-backup/);
  assert.match(panel, /luwipi:v3:backup/);
  assert.match(reminder, /luwipi:v3:last-backup/);
});
