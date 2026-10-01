import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const win={};
class SvgStub{
 constructor(name){this.name=name;this.children=[];this.attributes={};this.textContent="";}
 setAttribute(name,value){this.attributes[name]=String(value)}
 appendChild(node){this.children.push(node);return node}
 removeChild(node){this.children.splice(this.children.indexOf(node),1);return node}
 get firstChild(){return this.children[0]||null}
}
const doc={createElementNS:(_ns,name)=>new SvgStub(name)};
new Function("window","document",await read("assets/music/score-engine.js"))(win,doc);
new Function("globalThis",await read("assets/pedagogy/specialized-n3.js"))(win);
const E=win.LuwipiScoreEngine,N3=win.LuwipiSpecializedN3,ui=await read("assets/pedagogy/sightreading-workspace.js");
const start=ui.indexOf("function splitABC(seed){"),end=ui.indexOf("// A pure selection",start);
assert.ok(start>=0&&end>start);
const parse=new Function("E",ui.slice(start,end)+";return splitABC;")(E);
const tracks="ABCDEFGHIJ".split(""),signatures=new Set();
let lanesCount=0,expressions=0;
for(const track of tracks){
 const seed=N3.get(track,3);
 assert.ok(seed?.specialized&&!seed.certification&&seed.intent&&seed.limitations,"N3 missing or falsely certified: "+track);
 assert.ok(!signatures.has(seed.abc),"Duplicate authored N3 study: "+track);
 signatures.add(seed.abc);
 const score=parse(seed);
 assert.deepEqual(score.meter,[4,4]);
 assert.equal(score.measures,8,track+" must have 8 bars");
 const lanes=new Map();
 for(const e of [...score.events,...score.rests]){
  const lane=String(e.id).split("-")[0];
  if(!lanes.has(lane))lanes.set(lane,new Map());
  // Distinct chord pitches at the SAME onset represent one rhythmic event.
  const key=e.startBeat+"|"+e.durationBeat;
  lanes.get(lane).set(key,{start:e.startBeat,duration:e.durationBeat});
 }
 const wanted=track==="H"?["RH","RH2","LH"]:["RH","LH"];
 assert.deepEqual([...lanes.keys()].sort(),wanted.slice().sort(),track+" lost score lane");
 for(const lane of wanted){
  const beats=Array(8).fill(0);
  for(const e of lanes.get(lane).values()){
   const bar=Math.floor((e.start+.00001)/4);
   assert.ok(bar>=0&&bar<8,track+" overflow");
   assert.ok(e.start+e.duration<=4*(bar+1)+.0001,track+" crossed barline");
   beats[bar]+=e.duration;
  }
  beats.forEach((sum,i)=>assert.ok(Math.abs(sum-4)<.000001,track+" "+lane+" bar "+(i+1)+" = "+sum));
  lanesCount++;
 }
 assert.ok(score.events.some(x=>x.clef==="treble")&&score.events.some(x=>x.clef==="bass"),track+" must use both hands");
 if(track==="A")assert.ok(score.events.some(x=>x.clef==="treble"&&x.midi>=88),"3–4 ledger lines need high treble notes");
 if(track==="B")assert.ok(score.events.some(x=>x.clef==="treble"&&x.startBeat===1&&x.midi===69),"Major sixth C–A missing");
 if(track==="C")assert.equal(score.keyFifths,5,"B major signature must have five sharps");
 if(track==="D")assert.ok(score.events.filter(x=>x.clef==="treble"&&x.startBeat===0).length===4,"Seventh chord must retain all four pitches");
 if(track==="E"){
  const bass=score.events.filter(x=>x.clef==="bass"&&x.startBeat<4);
  assert.equal(bass.length,8);
  assert.deepEqual(bass.map(x=>x.startBeat),[0,.5,1,1.5,2,2.5,3,3.5],"Alberti rhythm wrong");
 }
 if(track==="F"){
  assert.ok(score.events.some(x=>x.durationBeat===.25),"Actual sixteenth note missing");
  assert.ok(score.rests.some(x=>x.clef==="treble"&&x.startBeat===0&&x.durationBeat===.5),"Off-beat first entry missing");
 }
 if(track==="G"){
  assert.equal(score.pedalMarks.length,7,"Pedal change markers missing");
  assert.deepEqual(score.pedalMarks.map(x=>x.label),["Ped.","↺","↺","↺","↺","↺","✱"]);
  expressions++;
 }
 if(track==="H"){
  const lower=score.events.filter(x=>x.id.startsWith("RH2-"));
  assert.ok(lower.every(x=>x.voiceDirection==="down")&&lower.every(x=>x.startBeat>=4),"Imitation must begin after first bar");
  assert.ok(score.events.some(x=>x.voiceDirection==="up"),"Upper voice stem direction lost");
 }
 if(track==="I")assert.ok(score.events.filter(x=>x.clef==="treble"&&x.startBeat<4).length===8,"Advance-reading grouping missing");
 if(track==="J"){
  assert.equal(seed.transposeSemitones,5);
  assert.equal(seed.cues.length,8);
  assert.ok(score.events.every(x=>x.midi+5<=127),"Study transposition would exceed MIDI range");
 }
}
assert.equal(tracks.length,10);
// Assert the actual SVG score renderer places pedagogic pedal cues beneath the staves.
const svg=doc.createElementNS("http://www.w3.org/2000/svg","svg");
E.render(svg,parse(N3.get("G",3)),{});
function svgTexts(root){return [root.name==="text"?root.textContent:"",...root.children.flatMap(svgTexts)].filter(Boolean)}
const markings=svgTexts(svg);
assert.ok(markings.includes("Ped."),"Initial pedal marking was not drawn");
assert.ok(markings.filter(x=>x==="↺ Ped.").length>=5,"Pedal exchange symbols were not drawn");
assert.ok(markings.includes("✱"),"Final pedal release missing");
const live=await read("assets/live/live-mode.js");
assert.ok(live.includes("[2,5].includes(Number(options.transposeSemitones))"),"Fourth-up transposition missing");
assert.ok(live.includes("pedagogyHint=String(options.guideHint"),"Pedal interpretation cue missing");
assert.ok(live.includes("if(pedagogyNovel)startPreRead(30)"),"No 30s pre-reading");
const engine=await read("assets/music/score-engine.js");
assert.ok(engine.includes("score.pedalMarks")&&engine.includes("Ped."),"Pedal markings are not engraved");
assert.ok(ui.includes("S3?.get(track,level)")&&ui.includes("const canExploreN3"),"N3 not reachable");
const html=await read("app.html");assert.ok(html.includes("specialized-n3.js"),"N3 script not mounted");
console.log("N3 studies parsed: 10 unique compositions; "+lanesCount+" valid, full-length independent voices; 8 measured bars each.");
console.log("Validated upper ledger notes, sixth, five sharps, seventh chords, Alberti, off-beat sixteenths, pedal changes, imitation and fourth-up transposition.");
