import test from "node:test";
import assert from "node:assert/strict";
import { lessonTemplates } from "../lib/suzuki-lessons";
import { contourForRepertoire, fingerExercises, noteCharacters, sceneForBlock, songContours } from "../lib/visual-learning";

test("all seven natural notes have a stable visual identity", () => {
  assert.deepEqual(Object.keys(noteCharacters), ["C","D","E","F","G","A","B"]);
  const colors=new Set(Object.values(noteCharacters).map((item)=>item.color));
  const names=new Set(Object.values(noteCharacters).map((item)=>item.name));
  assert.equal(colors.size,7);
  assert.equal(names.size,7);
  for(const item of Object.values(noteCharacters)){
    assert.ok(item.label.length>0);
    assert.ok(item.shape.length>0);
  }
});

test("all three age bands have an original finger-rhyme exercise", () => {
  for(const ageBand of ["2-3","4-5","6-8"] as const){
    const exercise=fingerExercises[ageBand];
    assert.equal(exercise.ageBand,ageBand);
    assert.ok(exercise.rhyme.length>=4);
    assert.ok(exercise.sequence.length>=8);
    assert.ok(exercise.sequence.every((step)=>step.finger>=1&&step.finger<=5));
  }
});

test("six repertoire songs expose a syllable contour from the same musical data layer", () => {
  assert.equal(songContours.length,6);
  for(const song of songContours){
    assert.ok(song.events.length>=8);
    for(const event of song.events){
      assert.ok(noteCharacters[event.note]);
      assert.ok(event.syllable.length>0);
    }
  }
  assert.ok(contourForRepertoire("Brilha, Brilha, Estrelinha — motivo inicial"));
  assert.ok(contourForRepertoire("Maria Tinha um Cordeirinho"));
  assert.ok(contourForRepertoire("Ode à Alegria — frase conhecida"));
});

test("the pitch story is Elephant and Bird and resolves to the immersive pitch world", () => {
  const lesson=lessonTemplates.find((item)=>item.id==="23-bear-bird");
  assert.ok(lesson);
  assert.match(lesson.title,/Elefante e o Passarinho/i);
  const movement=lesson.blocks.find((block)=>block.kind==="movement");
  const ear=lesson.blocks.find((block)=>block.kind==="ear");
  assert.ok(movement);
  assert.ok(ear);
  assert.match(movement.teacherCue,/Elefante/i);
  assert.equal(sceneForBlock(ear),"pitch-animals");
});

test("visual scene routing covers the core lesson concepts", () => {
  const expected=new Set(["welcome","pitch-animals","march","dynamics","echo","keyboard-village","direction","technique","melody","reading","performance","listening"]);
  const produced=new Set<string>();
  for(const lesson of lessonTemplates){
    for(const block of lesson.blocks) produced.add(sceneForBlock(block));
  }
  for(const scene of ["welcome","pitch-animals","march","dynamics","keyboard-village","technique","melody","reading","performance"]){
    assert.ok(produced.has(scene),scene+" is missing from the lesson bank");
    assert.ok(expected.has(scene));
  }
});
