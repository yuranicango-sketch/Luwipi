import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import "../assets/pedagogy/sightreading-foundation-v1.js";
import "../assets/pedagogy/specialized-n0-n1.js";
import "../assets/pedagogy/specialized-n2.js";
import "../assets/pedagogy/specialized-n3.js";
import "../assets/pedagogy/specialized-n4.js";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const P=globalThis.LuwipiPedagogyV1,S=globalThis.LuwipiSpecializedStudies,S2=globalThis.LuwipiSpecializedN2,S3=globalThis.LuwipiSpecializedN3,S4=globalThis.LuwipiSpecializedN4;
const win={};new Function("window",await read("assets/music/score-engine.js"))(win);
const E=win.LuwipiScoreEngine,ui=await read("assets/pedagogy/sightreading-workspace.js");
const from=ui.indexOf("function splitABC(seed){"),choice=ui.indexOf("\n// A pure selection",from),end=ui.indexOf("\nfunction launch(",choice);
assert.ok(from>=0&&choice>from&&end>choice,"The unified two-hand score and study selector must exist.");
const parse=new Function("E",ui.slice(from,choice)+"\nreturn splitABC;")(E);
const choose=new Function("P","S","S2","S3","S4",ui.slice(choice,end)+"\nreturn chooseSeed;")(P,S,S2,S3,S4);
let studies=0,lanesTotal=0,partials=0;const ids=new Set();
for(const track of P.trackIds){
 const count=S4.count(track);assert.ok(count>=1,"N4 missing track "+track);
 const used=[];
 for(let index=0;index<count;index++){
  const scoreDef=S4.get(track,4,index);
  assert.ok(scoreDef.specialized&&!scoreDef.certification&&scoreDef.limitations&&scoreDef.intent,"Study has no pedagogy or improperly certifies N4 "+track);
  assert.ok(!ids.has(scoreDef.id),"N4 study ID reused "+scoreDef.id);ids.add(scoreDef.id);
  if(scoreDef.partialCoverage){assert.ok(scoreDef.limitations.startsWith("Parcial:"),"Partial coverage must be disclosed");partials++}
  assert.equal(choose(track,4,3,used).id,scoreDef.id,"A presented score must never be recycled as a first sight");
  used.push(scoreDef.id);
  const score=parse(scoreDef);
  assert.equal(score.measures,8,"Eight complete measures required "+scoreDef.id);
  const laneGroups=new Map();
  for(const event of [...score.events,...score.rests]){
   const lane=String(event.id).split("-")[0];
   if(!laneGroups.has(lane))laneGroups.set(lane,new Map());
   laneGroups.get(lane).set(event.startBeat+"|"+event.durationBeat,event);
  }
  const expected=track==="H"?["RH","RH2","LH","LH2"]:["RH","LH"];
  assert.deepEqual([...laneGroups.keys()].sort(),expected.slice().sort(),"Independent voices lost "+scoreDef.id);
  for(const lane of expected){
   const bars=Array(8).fill(0);
   for(const event of laneGroups.get(lane).values()){
    const bar=Math.floor((event.startBeat+.000001)/4);
    assert.ok(bar>=0&&bar<8,scoreDef.id+" "+lane+" exceeds 8 bars");
    assert.ok(event.startBeat+event.durationBeat<=(bar+1)*4+.001,scoreDef.id+" "+lane+" crosses bar "+(bar+1));
    bars[bar]+=event.durationBeat;
   }
   bars.forEach((total,i)=>assert.ok(Math.abs(total-4)<.002,scoreDef.id+" "+lane+" bar "+(i+1)+" is "+total));
   lanesTotal++;
  }
  if(track==="A")assert.ok(score.events.some(e=>e.clef==="treble"&&e.midi>=94),"Upper extreme register absent");
  if(track==="B"){
   const top=score.events.filter(e=>e.id.startsWith("RH-")).sort((a,b)=>a.startBeat-b.startBeat).slice(0,4).map(e=>e.midi);
   assert.deepEqual(top,[60,72,60,74],"Octave/ninth must sound as written");
  }
  if(track==="C")assert.ok(score.events.some(e=>e.clef==="treble"&&e.midi===78),"Applied dominant F# not parsed");
  if(track==="D")assert.ok(score.events.filter(e=>e.id.startsWith("RH-")&&e.startBeat===0).length===5,"Ninth chord omitted");
  if(track==="E"&&index===0)assert.ok(score.events.filter(e=>e.id.startsWith("LH-")&&e.startBeat<4).length===4,"Broken bass octave must have four attacks");
  if(track==="E"&&index===1)assert.ok(score.rests.filter(e=>e.clef==="bass").length>=12,"Syncopated accompaniment needs real rests");
  if(track==="F")assert.ok(score.events.filter(e=>Math.abs(e.durationBeat-1/3)<.001).length>=18,"Triplet rhythm must be real, not three straight eighths");
  if(track==="G")assert.ok(score.events.some(e=>e.id.startsWith("RH-")&&e.durationBeat===.25),"Written-out mordent needs fast neighbor notes");
  if(track==="H"){
   assert.ok(score.events.some(e=>e.id.startsWith("RH2-")&&e.voiceDirection==="down"),"Alto independent stems missing");
   assert.ok(score.events.some(e=>e.id.startsWith("LH2-")&&e.voiceDirection==="down"),"Bass independent stems missing");
  }
  if(track==="I")assert.ok(score.events.some(e=>e.clef==="treble"&&e.durationBeat===.5),"Scanning-ahead subdivisions missing");
  if(track==="J")assert.ok(scoreDef.partialCoverage&&scoreDef.limitations.includes("claves de Dó"),"Never represent absent C clefs as a complete N4 course");
  studies++;
 }
 const fallback=choose(track,4,3,used);
 assert.ok(fallback&&!used.includes(fallback.id),"Once authored pieces are seen, choose an unseen generated score or stop");
}
assert.equal(studies,11);
assert.equal(partials,5,"Incomplete advanced competencies must be visibly acknowledged");
const html=await read("app.html");
assert.ok(html.includes('specialized-n4.js')&&html.indexOf('specialized-n4.js')<html.indexOf('sightreading-workspace.js'),"N4 must load before the existing activity workspace");
assert.ok(ui.includes("canExploreN4")&&ui.includes("S4?.get(track,explorationLevel)"),"N4 exploratory session is inaccessible");
console.log("N4: "+studies+" authored two-hand studies, "+lanesTotal+" complete independent rhythmic voices, 8 bars each.");
console.log("Covered octave/ninth leaps, applied dominant, 9th chords, broken octave, syncopated bossa, authentic triplets, written ornament, SATB and timed pre-reading.");
console.log("Five partial modules visibly disclosed; no automatic certification or new dashboard.");
