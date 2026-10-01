import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
for(const file of ["sightreading-foundation-v1.js","specialized-n0-n1.js","specialized-n2.js","specialized-n3.js","specialized-n4.js","specialized-advanced-core.js","specialized-n5.js","specialized-n6.js","specialized-n7.js","score-equivalence.js"])
 await import("../assets/pedagogy/"+file);
const P=globalThis.LuwipiPedagogyV1,S=globalThis.LuwipiSpecializedStudies,
 S2=globalThis.LuwipiSpecializedN2,S3=globalThis.LuwipiSpecializedN3,S4=globalThis.LuwipiSpecializedN4,
 S5=globalThis.LuwipiSpecializedN5,S6=globalThis.LuwipiSpecializedN6,S7=globalThis.LuwipiSpecializedN7,
 eq=globalThis.LuwipiScoreEquivalence;
const read=p=>readFile(new URL("../"+p,import.meta.url),"utf8");
const root={};new Function("window",await read("assets/music/score-engine.js"))(root);
const ui=await read("assets/pedagogy/sightreading-workspace.js"),
 begin=ui.indexOf("function splitABC(seed){"),end=ui.indexOf("// A pure selection",begin);
assert.ok(begin>=0&&end>begin,"Score parser missing");
const parse=new Function("E",ui.slice(begin,end)+";return splitABC;")(root.LuwipiScoreEngine);
let count=0;const groups=new Map();
function add(seed){
 const s=parse(seed),signature=JSON.stringify({
  meter:s.meter,map:s.meterMap,key:s.keyFifths,keyMap:s.keyMap,
  staff:s.staffLayout,clefMap:s.clefMap,octave:s.octaveMarks,
  events:s.events.map(e=>[e.id.split("-")[0],e.note,e.midi,e.startBeat,e.durationBeat,e.accidental]),
  rests:s.rests.map(r=>[r.id.split("-")[0],r.startBeat,r.durationBeat])
 });
 if(!groups.has(signature))groups.set(signature,[]);
 groups.get(signature).push(seed.id);count++;
}
for(const t of P.trackIds){
 for(let l=0;l<8;l++)for(let i=0;i<P.availableVariants(t,l);i++)add(P.makeSeed(t,l,i));
 for(let l=0;l<8;l++){
  const api=l<=1?S:l===2?S2:l===3?S3:l===4?S4:l===5?S5:l===6?S6:S7,
    num=l<=2?1:api.count(t);
  for(let i=0;i<num;i++)add(api.get(t,l,i));
 }
}
const dup=[...groups.values()].filter(ids=>ids.length>1);
const expected=Object.fromEntries(dup.flatMap(ids=>ids.map(id=>[id,ids.filter(other=>other!==id)])));
assert.deepEqual(eq,expected,"First-sight collision snapshot is stale: rebuild it when score content changes");
assert.equal(count,1463);
assert.equal(dup.length,63);
assert.equal(Object.keys(eq).length,127);
console.log("First sight: "+count+" exercises checked, "+dup.length+" collision classes, "+Object.keys(eq).length+" exposure-equivalence IDs synchronized.");
