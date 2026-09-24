import test from "node:test";
import assert from "node:assert/strict";
import { scoreCatalog } from "../lib/score-catalog";

test("embedded scores are explicitly public-domain editions", () => {
  assert.ok(scoreCatalog.length >= 4);
  for (const piece of scoreCatalog) {
    assert.equal(piece.publicDomain, true);
    assert.match(piece.source, /domínio público/i);
    assert.ok(piece.notes.length >= 10);
  }
});

test("method references stay metadata and disclose independent notation", () => {
  const referenced = scoreCatalog.filter((piece) => piece.pedagogicalReference);
  assert.ok(referenced.length >= 1);
  for (const piece of referenced) {
    assert.match(piece.pedagogicalReference ?? "", /referência/i);
    assert.match(piece.pedagogicalReference ?? "", /não reproduz/i);
  }
});
