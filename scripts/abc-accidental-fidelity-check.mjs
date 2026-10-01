import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const load=p=>readFile(new URL("../"+p,import.meta.url),"utf8");
class SvgStub {
 constructor(name){this.name=name;this.children=[];this.attributes={};this.textContent="";}
 setAttribute(key,value){this.attributes[key]=String(value)}
 appendChild(child){this.children.push(child);return child}
 removeChild(child){this.children.splice(this.children.indexOf(child),1);return child}
 get firstChild(){return this.children[0]||null}
}
const fakeDocument={createElementNS:(_ns,name)=>new SvgStub(name)},win={};
new Function("window","document",await load("assets/music/score-engine.js"))(win,fakeDocument);
for(const path of ["assets/pedagogy/sightreading-foundation-v1.js","assets/pedagogy/specialized-n0-n1.js","assets/pedagogy/specialized-n2.js","assets/pedagogy/specialized-n3.js","assets/pedagogy/specialized-n4.js"]){
 new Function("globalThis",await load(path))(win);
}
const E=win.LuwipiScoreEngine,P=win.LuwipiPedagogyV1;
const cases=[
 {name:"Within G major and reset",abc:"X:1\nM:4/4\nL:1/4\nK:G\n=F F ^F F | F _B B =B |",midi:[65,65,66,66,66,70,70,71],spelling:["F4","F4","F#4","F#4","F#4","Bb4","Bb4","B4"],marks:["natural",null,"sharp",null,null,"flat",null,"natural"]},
 {name:"Written octave independent",abc:"X:1\nM:4/4\nL:1/4\nK:C\n^F F f f | F f |",midi:[66,66,77,77,65,77],spelling:["F#4","F#4","F5","F5","F4","F5"],marks:["sharp",null,null,null,null,null]},
 {name:"Chord changes and reset",abc:"X:1\nM:4/4\nL:1/4\nK:C\n[_B,D]2 [B,D]2 | [B,D]4 |",midi:[58,62,58,62,59,62],spelling:["Bb3","D4","Bb3","D4","B3","D4"],marks:["flat",null,null,null,null,null]},
 {name:"Double accidental",abc:"X:1\nM:4/4\nL:1/4\nK:C\n^^F F __B B | F B |",midi:[67,67,69,69,65,71],spelling:["F##4","F##4","Bbb4","Bbb4","F4","B4"],marks:["double-sharp",null,"double-flat",null,null,null]}
];
for(const item of cases){
 const notes=E.parseABC(item.abc).events;
 assert.deepEqual(notes.map(x=>x.midi),item.midi,item.name+" playback");
 assert.deepEqual(notes.map(x=>x.note),item.spelling,item.name+" visual spelling");
 assert.deepEqual(notes.map(x=>x.accidental),item.marks,item.name+" printed accidentals");
}
const svg=new SvgStub("svg"),score=E.parseABC(cases[0].abc);
E.render(svg,score,{});
function texts(el){return[el.name==="text"?el.textContent:"",...el.children.flatMap(texts)].filter(Boolean)}
const symbols=texts(svg);
assert.ok(symbols.includes("♮"),"Written natural is not rendered");
assert.equal(symbols.filter(x=>x==="♯").length,3,"Key signatures should display 2 sharps, and the note 1 written sharp");
assert.equal(symbols.filter(x=>x==="♭").length,1,"Only the explicit flat should be drawn");
const workspace=await load("assets/pedagogy/sightreading-workspace.js"),start=workspace.indexOf("function splitABC(seed){"),end=workspace.indexOf("// A pure selection",start);
assert.ok(start>=0&&end>start);
const parse=new Function("E",workspace.slice(start,end)+";return splitABC;")(E);
let total=0,specialized=0;
for(const track of P.trackIds){
 for(let level=0;level<8;level++){
  const totalVariants=P.availableVariants(track,level);
  for(let variant=0;variant<totalVariants;variant++){
   const seed=P.makeSeed(track,level,variant),score=parse(seed);
   assert.equal(score.measures,8,seed.id+" eight measured bars");
   assert.ok(score.events.some(x=>x.clef==="treble")&&score.events.some(x=>x.clef==="bass"),seed.id+" both hands");
   total++;
  }
 }
 const studies=[
  ...[0,1].map(level=>win.LuwipiSpecializedStudies.get(track,level)),
  win.LuwipiSpecializedN2.get(track,2),
  ...Array.from({length:win.LuwipiSpecializedN3.count(track)},(_,i)=>win.LuwipiSpecializedN3.get(track,3,i)),
  ...Array.from({length:win.LuwipiSpecializedN4.count(track)},(_,i)=>win.LuwipiSpecializedN4.get(track,4,i))
 ];
 for(const study of studies){
  assert.ok(study?.certification===false,study?.id+" not an examination");
  const score=parse(study);
  assert.equal(score.measures,8,study.id+" eight measured bars");
  assert.ok(score.events.some(x=>x.clef==="treble")&&score.events.some(x=>x.clef==="bass"),study.id+" both hands");
  specialized++;
 }
}
assert.equal(total,1344);
assert.equal(specialized,55);
console.log("ABC fidelity: 4 accidental, pitch, chord and octave cases passed; written naturals and key-only sharps engraved correctly.");
console.log("Regressions: "+total+" generated two-hand studies and "+specialized+" specialized two-hand studies parse to eight measured bars.");
