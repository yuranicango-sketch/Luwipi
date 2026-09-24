import test from "node:test";
import assert from "node:assert/strict";
import { methodVolumePaths } from "../lib/method-volume-paths";
import { repertoireScores } from "../lib/repertoire-scores";

test("volumes 2-5 each expose five ordered training stages", () => {
  assert.deepEqual(methodVolumePaths.map((item) => item.volume), [2,3,4,5]);
  for (const volume of methodVolumePaths) {
    assert.equal(volume.stages.length, 5);
    assert.deepEqual(volume.stages.map((stage) => stage.order), [1,2,3,4,5]);
  }
});

test("every volume stage resolves to playable Luwipi studies", () => {
  const ids=new Set(repertoireScores.map((score)=>score.id));
  for (const volume of methodVolumePaths) {
    for (const stage of volume.stages) {
      assert.ok(stage.scoreIds.length>0, stage.id+" has no practice material");
      for (const id of stage.scoreIds) assert.ok(ids.has(id), id+" missing for "+stage.id);
    }
  }
});

test("advanced two-hand studies contain explicit events for both hands", () => {
  const advanced=repertoireScores.filter((score)=>score.hand==="both");
  assert.ok(advanced.length>=7);
  for (const score of advanced) {
    assert.equal(score.clef,"grand");
    assert.ok(score.events?.length);
    assert.ok(score.events?.some((event)=>(event.right?.length??0)>0));
    assert.ok(score.events?.some((event)=>(event.left?.length??0)>0));
  }
});

test("method references stay metadata while Luwipi studies stay original", () => {
  for (const score of repertoireScores.filter((item)=>item.volumeReference && item.volumeReference>=2)) {
    assert.equal(score.kind,"study");
    assert.match(score.source,/original do Luwipi/i);
    assert.ok(score.methodReferences.some((reference)=>/referência/i.test(reference)));
  }
});
