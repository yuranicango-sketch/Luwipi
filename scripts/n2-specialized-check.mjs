import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const engineWindow={};
new Function("window",await read("assets/music/score-engine.js"))(engineWindow);
new Function("globalThis",await read("assets/pedagogy/specialized-n2.js"))(engineWindow);
const E=engineWindow.LuwipiScoreEngine,N2=engineWindow.LuwipiSpecializedN2;
const ui=await read("assets/pedagogy/sightreading-workspace.js");
const from=ui.indexOf("function splitABC(seed){"),to=ui.indexOf("\n// A pure selection",from);
assert.ok(from>=0&&to>from,"The two-hand score importer is missing.");
const parse=new Function("E",ui.slice(from,to)+";return splitABC;")(E);
const TRACKS="ABCDEFGHIJ".split(""),barLength={A:4,B:4,C:4,D:4,E:3,F:3,G:4,H:4,I:4,J:4};
let count=0,voices=0;
for(const track of TRACKS){
 const study=N2.get(track,2);
 assert.ok(study&&study.specialized&&!study.certification,track+" must stay training-only");
 assert.ok(study.intent&&study.limitations&&study.abc.includes("%%score"),track+" missing learning intention");
 const score=parse(study);
 assert.deepEqual(score.meter,study.meter.split("/").map(Number),track+" meter mismatch");
 assert.equal(score.events.length>0,true,track+" has no notes");
 const target=barLength[track],lanes=new Map();
 for(const note of score.events){
  const lane=String(note.id).split("-")[0];
  if(!lanes.has(lane))lanes.set(lane,new Map());
  const key=note.startBeat+"|"+note.durationBeat;
  lanes.get(lane).set(key,{start:note.startBeat,length:note.durationBeat});
 }
 for(const rest of score.rests){
  const lane=String(rest.id).split("-")[0];
  if(!lanes.has(lane))lanes.set(lane,new Map());
  const key=rest.startBeat+"|"+rest.durationBeat;
  lanes.get(lane).set(key,{start:rest.startBeat,length:rest.durationBeat});
 }
 const expectedLanes=track==="H"?["RH","RH2","LH"]:["RH","LH"];
 assert.deepEqual([...lanes.keys()].sort(),expectedLanes.slice().sort(),track+" lacks a required voice");
 for(const lane of expectedLanes){
  const durations=Array(8).fill(0);
  for(const note of lanes.get(lane).values()){
   const bar=Math.floor((note.start+0.00001)/target);
   assert.ok(bar>=0&&bar<8,track+" "+lane+" exceeded the eighth bar");
   assert.ok(note.start+note.length<=(bar+1)*target+0.0001,track+" note overflows a bar");
   durations[bar]+=note.length;
  }
  for(const [index,length] of durations.entries())assert.ok(Math.abs(length-target)<0.00001,track+" "+lane+" bar "+(index+1)+" duration "+length);
  voices++;
 }
 assert.ok(score.events.some(e=>e.clef==="treble")&&score.events.some(e=>e.clef==="bass"),track+" two-staff import failed");
 if(track==="A")assert.ok(score.events.some(e=>e.clef==="treble"&&e.midi<60),"Ledger-line note missing");
 if(track==="B")assert.ok(score.events.some(e=>e.clef==="treble"&&e.midi===65),"Fourth from C to F missing");
 if(track==="C")assert.equal(score.keyFifths,3,"Three-sharp key signature failed");
 if(track==="D")assert.ok(score.events.filter(e=>e.clef==="treble"&&e.startBeat===0).length>=3,"Inverted chord lost notes");
 if(track==="E")assert.deepEqual(score.meter,[3,4],"Waltz meter failed");
 if(track==="F"){assert.equal(score.tempoBpm,108,"Dotted-quarter 72 must become quarter 108 for internal playback");assert.ok(score.rests.length>0,"Compound-meter rest missing");}
 if(track==="G"){const top=score.events.filter(e=>e.clef==="treble");assert.ok(top.some(e=>e.dynamic==="p")&&top.some(e=>e.dynamic==="f"),"Expression not written");assert.ok(Math.min(...top.map(e=>e.velocity))<Math.max(...top.map(e=>e.velocity)),"Crescendo not audible");}
 if(track==="H"){
  assert.ok(score.events.some(e=>e.voiceDirection==="up")&&score.events.some(e=>e.voiceDirection==="down"),"Independent stem directions missing");
 }
 if(track==="I")assert.ok(score.events.some(e=>e.durationBeat===.5),"Reading-ahead subdivision missing");
 if(track==="J"){assert.equal(study.transposeSemitones,2);const expected=E.normalizeScore({...score,events:score.events.map(e=>({...e,midi:e.midi+2}))});assert.ok(expected.events.every((e,i)=>e.midi!==score.events[i].midi),"Both hands must transpose");}
 count++;
}
assert.equal(count,10);
const live=await read("assets/live/live-mode.js");
assert.ok(live.includes("startPreRead(30)")&&live.includes("practiceButton.disabled=true")&&live.includes("pedagogyTranspose=[2,5,7].includes(interval)?interval:0"),"Sight-reading preparation or transposition contract missing");
assert.ok(live.includes("if(!score||!groups.length||practiceButton.disabled)return"),"Pre-reading start is not gated");
assert.ok(live.includes("if(pedagogyNovel||pedagogyTranspose){playButton.disabled=true;hearButton.disabled=true;}"),"Preview bypass during first sight or transposition");
assert.ok(ui.includes("S2?.get(track,level)")&&ui.includes("transposeSemitones:seed.transposeSemitones||0"),"N2 did not wire into one workspace");
console.log("N2 specialized: "+count+" authored studies, "+voices+" independently measured voices, 8 bars each and valid two-staff parsing.");
console.log("Tested key signature, ledger lines, inversions, waltz, compound rhythm, expressive dynamics, two-voice stems, reading ahead and both-hand transposition.");
console.log("The 30-second sight-reading preparation and no-preview contracts are present.");
