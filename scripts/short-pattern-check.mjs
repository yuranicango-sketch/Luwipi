import fs from "node:fs/promises";
import assert from "node:assert/strict";
const read=p=>fs.readFile(new URL("../"+p,import.meta.url),"utf8");
const engineWindow={};
new Function("window",await read("assets/music/score-engine.js"))(engineWindow);
const E=engineWindow.LuwipiScoreEngine;
const ui=await read("assets/pedagogy/sightreading-workspace.js");
const start=ui.indexOf("function shortPatternScore("),end=ui.indexOf("\nfunction launch(",start);
assert.ok(start>=0&&end>start,"Short-pattern excerpt function must be used by the path");
assert.match(ui.slice(end),/score=shortPatternScore\(score\)/,"Pattern button must use the shared excerpt");
const clip=new Function("E",ui.slice(start,end)+";return shortPatternScore;")(E);
const base=E.normalizeScore({
 title:"Practice 8 bars",meter:[4,4],tempoBpm:120,
 staffLayout:[{id:"RH",clef:"treble"},{id:"LH",clef:"bass"}],
 events:Array.from({length:8},(_,bar)=>[{id:"RH-"+bar,note:"C5",midi:72,clef:"treble",startBeat:bar*4,durationBeat:4},
  {id:"LH-"+bar,note:"C3",midi:48,clef:"bass",startBeat:bar*4,durationBeat:4}]).flat(),
 performanceEvents:Array.from({length:8},(_,bar)=>[0,1,2,3].map(n=>({
   id:"perf-"+bar+"-"+n,note:"C5",midi:72,clef:"treble",startBeat:bar*4+n,durationBeat:1
 }))).flat()
});
const sample=clip(base),audio=E.performanceEvents(sample);
assert.equal(sample.measures,2);
assert.equal(sample.events.length,4,"Only 2 written bars should be shown");
assert.equal(audio.length,8,"Only the same 2 performed bars should play");
assert.ok(Math.max(...audio.map(e=>e.startBeat+e.durationBeat))<=8);
assert.equal(E.groupEvents(sample).length,2,"Evaluation should use same two-bar excerpt");
assert.equal(sample.durationBeats,8);
const mixed=E.normalizeScore({
 title:"Meter-change swing",meter:[3,4],meterMap:[{beat:0,meter:[3,4]},{beat:3,meter:[5,8]},{beat:5.5,meter:[4,4]}],
 tempoMap:[{beat:0,bpm:120},{beat:3,bpm:100},{beat:5.5,bpm:75}],
 events:[{midi:72,note:"C5",id:"RH-0",clef:"treble",startBeat:0,durationBeat:3},
         {midi:74,note:"D5",id:"RH-1",clef:"treble",startBeat:3,durationBeat:2.5},
         {midi:76,note:"E5",id:"RH-2",clef:"treble",startBeat:5.5,durationBeat:4}],
 performanceEvents:[{midi:72,id:"perf1",startBeat:0,durationBeat:2},
  {midi:74,id:"perf2",startBeat:3,durationBeat:3},{midi:76,id:"perf3",startBeat:5.5,durationBeat:4}]
});
const altered=clip(mixed);
assert.equal(altered.measures,2,"Mixed-meter two bars should be preserved");
assert.equal(altered.events.length,2,"The following meter may not enter the excerpt");
assert.equal(altered.performanceEvents.length,2);
assert.equal(altered.performanceEvents[1].durationBeat,2.5,"Performance crossing the excerpt must end at the boundary");
assert.deepEqual(altered.tempoMap.map(x=>x.beat),[0,3]);
assert.deepEqual(altered.meterMap.map(x=>x.beat),[0,3]);
const ordinary=E.normalizeScore({title:"No separate performance",meter:[4,4],
 events:[{midi:60,note:"C4",startBeat:0,durationBeat:2},{midi:62,note:"D4",startBeat:4,durationBeat:2},{midi:64,note:"E4",startBeat:8,durationBeat:2}]});
assert.equal(clip(ordinary).performanceEvents.length,2,"Default performance events cannot leak the remaining six bars");
console.log("PASS: two-bar pattern, complete notation, matching playback/evaluation, mixed meters and boundary clipping.");
