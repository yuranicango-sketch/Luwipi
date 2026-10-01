import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=p=>readFile(new URL("../"+p,import.meta.url),"utf8");
const w={};new Function("window",await read("assets/music/score-engine.js"))(w);
new Function("globalThis",await read("assets/pedagogy/specialized-n0-n1.js"))(w);
const E=w.LuwipiScoreEngine,S=w.LuwipiSpecializedStudies,ui=await read("assets/pedagogy/sightreading-workspace.js");
const from=ui.indexOf("function splitABC(seed){"),to=ui.indexOf("\nfunction launch(",from);
assert.ok(from>=0&&to>from);
const parse=new Function("E",ui.slice(from,to)+";return splitABC;")(E);
let total=0;const seen=new Set();
for(const track of S.trackIds){
 for(const level of S.supportedLevels){
  const item=S.get(track,level);
  assert.ok(item&&item.specialized&&item.certification===false);
  assert.ok(item.intent&&item.abc.includes("%%score { RH LH }"));
  assert.ok(!seen.has(item.id));seen.add(item.id);
  const score=parse(item);
  assert.ok(score.events.some(e=>e.clef==="bass")&&score.events.some(e=>e.clef==="treble"),item.id+" must include both hands");
  const end=Math.max(...score.events.map(e=>e.startBeat+e.durationBeat));
  assert.equal(end,track==="F"&&level===1?24:32,item.id+" must have eight measured bars");
  if(track==="G")assert.ok(score.events.some(e=>e.articulations.includes(level?"accent":"staccato")),item.id+" lost articulation");
  if(track==="J")assert.equal(item.cues.length,8,item.id+" lacks beat-aligned harmony labels");
  total++;
 }
}
assert.equal(total,20);
const api=await read("api/sightreading-progress.js"),sync=await read("assets/pedagogy/progress-sync.js");
assert.doesNotThrow(()=>new Function(api.replace("export async function GET","async function GET").replace("export async function PUT","async function PUT")));
assert.doesNotThrow(()=>new Function(sync));
const html=await read("app.html"),live=await read("assets/live/live-mode.js");
for(const file of ["specialized-n0-n1.js","progress-sync.js","sightreading-workspace.js"])assert.ok(html.includes(file));
assert.ok(live.includes("pedagogyNovel=Boolean(options.firstSight)")&&live.includes("playButton.disabled=true;hearButton.disabled=true"));
assert.ok(ui.includes("profile.seen.push(seed.id)")&&ui.includes("seed=S?.get(track,level)"));
console.log(total+" original, goal-targeted eight-bar studies parsed on both staves, including G expression and J chord cues.");
console.log("No-preview first-sight gate and authenticated draft integration: static and syntax checks passed.");
