import test from "node:test";
import assert from "node:assert/strict";
import { ledgerLineSteps, staffStepForPitch, staffY } from "../lib/staff-position";

test("treble clef uses E4 as bottom line and C4 as ledger line below", () => {
  assert.equal(staffStepForPitch("Mi",64,"treble"),0);
  assert.equal(staffStepForPitch("Sol",67,"treble"),2);
  assert.equal(staffStepForPitch("Dó",60,"treble"),-2);
  assert.deepEqual(ledgerLineSteps(staffStepForPitch("Dó",60,"treble")),[-2]);
  assert.equal(staffY("Dó",60,"treble",140),160);
});

test("bass clef uses G2 as bottom line and follows its own note order", () => {
  assert.equal(staffStepForPitch("Sol",43,"bass"),0);
  assert.equal(staffStepForPitch("Lá",45,"bass"),1);
  assert.equal(staffStepForPitch("Si",47,"bass"),2);
  assert.equal(staffStepForPitch("Dó",48,"bass"),3);
  assert.equal(staffStepForPitch("Ré",50,"bass"),4);
  assert.equal(staffStepForPitch("Mi",52,"bass"),5);
  assert.equal(staffStepForPitch("Fá",53,"bass"),6);
  assert.equal(staffStepForPitch("Sol",55,"bass"),7);
  assert.equal(staffStepForPitch("Lá",57,"bass"),8);
});

test("middle C occupies the same ledger line between grand-staff clefs", () => {
  const fromTreble=staffY("Dó",60,"treble",140);
  const fromBass=staffY("Dó",60,"bass",260);
  assert.equal(fromTreble,160);
  assert.equal(fromBass,160);
  assert.equal(fromTreble,fromBass);
  assert.deepEqual(ledgerLineSteps(staffStepForPitch("Dó",60,"bass")),[10]);
});

test("legacy staffStep values cannot force a bass note into treble positioning", () => {
  assert.equal(staffStepForPitch("Dó",48,"bass"),3);
  assert.notEqual(staffStepForPitch("Dó",48,"bass"),-2);
});
