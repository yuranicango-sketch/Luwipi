import test from "node:test";
import assert from "node:assert/strict";
import { repertoireScores } from "../lib/repertoire-scores";

test("embedded sheet music identifies public-domain or independently usable sources", () => {
  assert.ok(repertoireScores.length >= 3);
  for (const score of repertoireScores) {
    assert.match(score.source, /domínio público/i);
    assert.ok(score.notes.length >= 10);
  }
});

test("method references do not falsely label Maria Tinha um Cordeirinho as Suzuki Vol. 1", () => {
  const mary = repertoireScores.find((score) => score.id === "mary");
  assert.ok(mary);
  assert.doesNotMatch(mary.methodReferences.join(" "), /Suzuki Piano School, Vol\. 1/i);
});
