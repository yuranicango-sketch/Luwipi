import test from "node:test";
import assert from "node:assert/strict";
import { repertoireScores } from "../lib/repertoire-scores";
import { volumeOnePath } from "../lib/volume-one-path";

test("Volume 1 reference path is ordered and every stage resolves to playable Luwipi material", () => {
  assert.equal(volumeOnePath.length, 6);
  assert.deepEqual(volumeOnePath.map((stage) => stage.order), [1,2,3,4,5,6]);
  const ids = new Set(repertoireScores.map((score) => score.id));
  for (const stage of volumeOnePath) {
    assert.ok(stage.scoreIds.length > 0);
    for (const scoreId of stage.scoreIds) assert.ok(ids.has(scoreId), scoreId + " missing from score catalog");
  }
});

test("the reference path preserves the observed hand-right to hand-left to repertoire progression", () => {
  assert.match(volumeOnePath[0].title, /direita/i);
  assert.match(volumeOnePath[1].title, /Tonalização.*direita/i);
  assert.match(volumeOnePath[2].title, /esquerda/i);
  assert.match(volumeOnePath[3].title, /Tonalização.*esquerda/i);
  assert.match(volumeOnePath[4].title, /Canção conhecida/i);
});

test("published-method references are metadata only", () => {
  for (const score of repertoireScores) {
    if (score.methodReferences.some((value) => /Suzuki Piano School/i.test(value))) {
      assert.ok(score.methodReferences.some((value) => /referência/i.test(value)));
      assert.ok(!score.source.includes("arranjo Suzuki"));
    }
  }
});
