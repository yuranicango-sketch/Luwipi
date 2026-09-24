import test from "node:test";
import assert from "node:assert/strict";
import { repertoireScores } from "../lib/repertoire-scores";

test("embedded sheet music separates public-domain repertoire from original Luwipi studies", () => {
  assert.ok(repertoireScores.length >= 7);
  for (const score of repertoireScores) {
    if (score.kind === "repertoire") assert.match(score.source, /domínio público/i);
    else assert.match(score.source, /original do Luwipi/i);
    assert.ok(score.notes.length >= 8);
  }
});

test("method references do not falsely label Maria Tinha um Cordeirinho as Suzuki Vol. 1", () => {
  const mary = repertoireScores.find((score) => score.id === "mary");
  assert.ok(mary);
  assert.doesNotMatch(mary.methodReferences.join(" "), /Suzuki Piano School, Vol\. 1/i);
});


test("left-hand studies use bass clef and every preparatory study carries fingering", () => {
  const studies = repertoireScores.filter((score) => score.kind === "study");
  assert.ok(studies.length >= 4);
  for (const score of studies) {
    if (score.hand === "left") assert.equal(score.clef, "bass");
    assert.ok(score.notes.some((note) => note.finger));
    assert.match(score.source, /não reproduz|não reproduz os exercícios/i);
  }
});
