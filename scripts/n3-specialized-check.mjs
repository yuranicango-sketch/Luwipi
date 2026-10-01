import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import "../assets/pedagogy/sightreading-foundation-v1.js";
import "../assets/pedagogy/specialized-n0-n1.js";
import "../assets/pedagogy/specialized-n2.js";
import "../assets/pedagogy/specialized-n3.js";
const P=globalThis.LuwipiPedagogyV1,S=globalThis.LuwipiSpecializedStudies,S2=globalThis.LuwipiSpecializedN2,S3=globalThis.LuwipiSpecializedN3;
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const win={};
new Function("window",await read("assets/music/score-engine.js"))(win);
const E=win.LuwipiScoreEngine,ui=await read("assets/pedagogy/sightreading-workspace.js");
const start=ui.indexOf("function splitABC(seed){");
const choice=ui.indexOf("\n// A pure selection rule",start);
const launch=ui.indexOf("\nfunction launch(",choice);
assert.ok(start>=0&&choice>start&&launch>choice);
const parse=new Function("E",ui.slice(start,choice)+"\nreturn splitABC;")(E);
const chooseSeed=new Function("P","S","S2","S3",ui.slice(choice,launch)+"\nreturn chooseSeed;")(P,S,S2,S3);
const ids=new Set();
let count=0,laneCount=0;
for(const track of "ABCDEFGHIJ"){
 const variants=S3.count(track);
 assert.ok(variants>0,track+" has no N3 study");
 for(let index=0;index<variants;index++){
  const study=S3.get(track,3,index);
  assert.ok(study.specialized&&!study.certification&&study.intent&&study.limitations,study.id+" lacks competency/limitation");
  assert.ok(!ids.has(study.id),"Repeated authored study ID");ids.add(study.id);
  const score=parse(study),measureBeats=score.meter[0]*4/score.meter[1];
  assert.equal(measureBeats,4,"N3 studies currently use 4/4");
  const lanes=new Map();
  for(const e of [...score.events,...score.rests]){
   const lane=e.id.split("-")[0];
   if(!lanes.has(lane))lanes.set(lane,new Map());
   lanes.get(lane).set(e.startBeat+"|"+e.durationBeat,e);
  }
  const expectedLanes=track==="H"?["RH","RH2","LH"]:["RH","LH"];
  assert.deepEqual([...lanes.keys()].sort(),expectedLanes.slice().sort(),study.id+" lost a voice");
  for(const lane of expectedLanes){
   const totals=Array(8).fill(0);
   for(const e of lanes.get(lane).values()){
    const bar=Math.floor((e.startBeat+.000001)/4);
    assert.ok(bar>=0&&bar<8,study.id+" extends past bar 8");
    assert.ok(e.startBeat+e.durationBeat<=(bar+1)*4+.00001,study.id+" event crosses bar unexpectedly");
    totals[bar]+=e.durationBeat;
   }
   assert.ok(totals.every(n=>Math.abs(n-4)<.00001),study.id+" "+lane+" bar durations "+totals);
   laneCount++;
  }
  const end=Math.max(...score.events.map(e=>e.startBeat+e.durationBeat),...score.rests.map(e=>e.startBeat+e.durationBeat));
  assert.equal(end,32,study.id+" ends before/after eight bars");
  if(track==="A"&&index===0)assert.ok(score.events.some(e=>e.clef==="treble"&&e.midi>=88)&&score.events.some(e=>e.clef==="treble"&&e.midi<58),"Ledger lines missing");
  if(track==="A"&&index===1){
   for(const bar of study.crossingMeasures){
    const first=bar*4;
    assert.ok(score.events.filter(e=>e.startBeat===first&&e.clef==="bass").some(l=>score.events.filter(e=>e.startBeat===first&&e.clef==="treble").some(r=>l.midi>r.midi)),"Crossing hand order absent");
   }
  }
  if(track==="B")assert.deepEqual(score.events.filter(e=>e.clef==="treble"&&e.startBeat<=3).map(e=>e.midi),[60,69,60,71],"6th/7th missing");
  if(track==="C"&&index===0)assert.equal(score.keyFifths,5,"Five-sharp armature missing");
  if(track==="C"&&index===1){
   const up=score.events.filter(e=>e.clef==="treble"&&e.startBeat>=4&&e.startBeat<8).map(e=>e.midi);
   const down=score.events.filter(e=>e.clef==="treble"&&e.startBeat>=8&&e.startBeat<12).map(e=>e.midi);
   assert.deepEqual(up,[76,78,80,81],"Melodic minor ascent is missing F# or G#");
   assert.deepEqual(down,[81,79,77,76],"Melodic minor descent must be natural");
  }
  if(track==="D")assert.equal(score.events.filter(e=>e.clef==="treble"&&e.startBeat===0).length,4,"Seventh chord was flattened");
  if(track==="E"&&index===0)assert.ok(score.events.filter(e=>e.clef==="bass"&&e.startBeat<4).length>=4,"Alberti is not four events");
  if(track==="E"&&index===1)assert.ok(score.events.filter(e=>e.clef==="bass"&&e.startBeat<4).some(e=>e.midi===60),"Open arpeggio lacks octave");
  if(track==="F"){
   assert.ok(score.events.some(e=>e.clef==="treble"&&e.durationBeat===.25),"Semiquavers missing");
   assert.ok(score.events.some(e=>e.clef==="treble"&&e.startBeat===.5),"Offbeat syncopation missing");
  }
  if(track==="G"){
   const marks=score.events.filter(e=>e.clef==="bass"&&e.pedal);
   assert.equal(marks.length,8,"Pedal changes are not represented each bar");
   assert.equal(marks[0].pedalAction,"start");
   assert.ok(marks.slice(1).every(e=>e.pedalAction==="change"));
  }
  if(track==="H"){
   const v1=score.events.filter(e=>e.id.startsWith("RH-")&&e.startBeat<4).map(e=>e.midi);
   const v2=score.events.filter(e=>e.id.startsWith("RH2-")&&e.startBeat>=4&&e.startBeat<8).map(e=>e.midi);
   assert.deepEqual(v1,[64,65,67]);
   assert.equal(v2.length,3);assert.ok(v1.every((pitch,i)=>v2[i]-pitch===3),"Imitation must retain the exact interval contour");
   assert.ok(score.events.some(e=>e.voiceDirection==="up")&&score.events.some(e=>e.voiceDirection==="down"),"Voice stem direction lost");
  }
  if(track==="I")assert.ok(score.events.some(e=>e.clef==="treble"&&e.durationBeat===.5)&&score.events.some(e=>e.clef==="bass"&&e.durationBeat===1),"Hand independence missing");
  if(track==="J")assert.equal(study.transposeSemitones,index===0?5:7,"Sight transposition interval wrong");
  count++;
 }
 const seen=[];
 for(let i=0;i<variants;i++){
  const next=chooseSeed(track,3,3,seen);
  assert.equal(next.id,S3.get(track,3,i).id,"Next study repeated or skipped");
  seen.push(next.id);
 }
 const next=chooseSeed(track,3,3,seen);
 assert.ok(next&&!seen.includes(next.id),"First-sight must fall back to genuinely unseen material");
}
assert.equal(count,14);
const live=await read("assets/live/live-mode.js"),html=await read("app.html"),engine=await read("assets/music/score-engine.js");
assert.ok(live.includes("pedagogyTranspose=[2,5,7].includes(interval)?interval:0"),"Fourth/fifth transposition is not actually matched");
assert.ok(live.includes("startPreRead(30)")&&live.includes("if(pedagogyNovel||pedagogyTranspose){playButton.disabled=true;hearButton.disabled=true;}"),"No-preview/pre-read contract broken");
assert.ok(engine.includes("event.pedalAction==='change'")&&engine.includes('voiceDirection:["up","down"]'),"Pedal markings or independent stems missing");
assert.ok(html.includes("specialized-n3.js")&&ui.includes("S3?.get(track,explorationLevel)"),"N3 not mounted in existing workspace");
console.log("N3 music: "+count+" original studies across ten tracks; "+laneCount+" independently verified eight-bar voices.");
console.log("Tested ledger lines, hand crossing, 6ths/7ths, five sharps, melodic minor, inversions, Alberti/arpeggios, syncopation, pedal changes, exact imitation, reading ahead and 4th/5th transposition.");
