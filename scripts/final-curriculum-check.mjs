import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
for(const file of [
 "sightreading-foundation-v1.js","specialized-n0-n1.js","specialized-n2.js",
 "specialized-n3.js","specialized-n4.js","specialized-advanced-core.js",
 "specialized-n5.js","specialized-n6.js","specialized-n7.js","advanced-questions.js"
])await import("../assets/pedagogy/"+file);
const P=globalThis.LuwipiPedagogyV1,ONE=globalThis.LuwipiSpecializedStudies,
 TWO=globalThis.LuwipiSpecializedN2,THREE=globalThis.LuwipiSpecializedN3,
 FOUR=globalThis.LuwipiSpecializedN4,FIVE=globalThis.LuwipiSpecializedN5,
 SIX=globalThis.LuwipiSpecializedN6,SEVEN=globalThis.LuwipiSpecializedN7,
 Q=globalThis.LuwipiAdvancedQuestions;
class SvgStub{
 constructor(name){this.name=name;this.children=[];this.attributes={};this.textContent=""}
 setAttribute(k,v){this.attributes[k]=String(v)}
 appendChild(child){this.children.push(child);return child}
 removeChild(child){this.children.splice(this.children.indexOf(child),1);return child}
 get firstChild(){return this.children[0]||null}
}
const windowMock={},doc={createElementNS:(_ns,name)=>new SvgStub(name)};
new Function("window","document",await source("assets/music/score-engine.js"))(windowMock,doc);
const E=windowMock.LuwipiScoreEngine,ui=await source("assets/pedagogy/sightreading-workspace.js");
const beginning=ui.indexOf("function splitABC(seed){"),choice=ui.indexOf("// A pure selection",beginning),launch=ui.indexOf("function launch(which){",choice);
assert.ok(beginning>=0&&choice>beginning&&launch>choice,"Missing shared parser and selection");
const parse=new Function("E",ui.slice(beginning,choice)+";return splitABC;")(E);
const choose=new Function("P","S","S2","S3","S4","S5","S6","S7",ui.slice(choice,launch)+";return chooseSeed;")(P,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN);
const tracks="ABCDEFGHIJ".split("");
const knownIds=new Set(),fingerprints=new Map();
let generated=0,older=0,advanced=0,partials=0,questions=0,lanes=0,printed=0;
const abcToken=/(\[(?:[\^_=]*[A-Ga-g][,']*)+\]|[\^_=]*[A-Ga-gzZ][,']*)(?:\d+)?(?:\/\d*)?/g;
function audit(seed,{strict=false}={}){
 assert.ok(seed.id&&!knownIds.has(seed.id),"Duplicate exercise ID "+seed.id);
 knownIds.add(seed.id);
 assert.ok(seed.title&&seed.abc,"Missing score "+seed.id);
 const sc=parse(seed);
 assert.deepEqual(sc.meter,seed.meter.split("/").map(Number),seed.id+" meter");
 const bars=seed.bars||8;
 assert.equal(sc.measures,bars,seed.id+" measured bars");
 assert.ok(sc.events.some(e=>e.clef==="treble")&&sc.events.some(e=>e.clef==="bass"),seed.id+" missing either hand");
 if(strict){
  const expected=seed.secondTrebleVoice||seed.secondBassVoice?[
   "RH",...(seed.secondTrebleVoice?["RH2"]:[]),"LH",...(seed.secondBassVoice?["LH2"]:[])
  ]:["RH","LH"];
  const byVoice=new Map();
  for(const event of [...sc.events,...sc.rests]){
   const voice=String(event.id).split("-")[0];
   if(!byVoice.has(voice))byVoice.set(voice,new Map());
   // Chords have several pitches but one rhythmic duration.
   byVoice.get(voice).set(event.startBeat+"|"+event.durationBeat,event);
  }
  assert.deepEqual([...byVoice.keys()].sort(),expected.sort(),seed.id+" independent voices");
  for(const voice of expected){
   const sums=Array(bars).fill(0);
   for(const e of byVoice.get(voice).values()){
    const bar=Math.floor((e.startBeat+.00001)/sc.beatsPerMeasure);
    assert.ok(bar>=0&&bar<bars,seed.id+" voice beyond score");
    assert.ok(e.startBeat+e.durationBeat<=(bar+1)*sc.beatsPerMeasure+.002,seed.id+" crosses a barline");
    sums[bar]+=e.durationBeat;
   }
   sums.forEach((sum,i)=>assert.ok(Math.abs(sum-sc.beatsPerMeasure)<.004,seed.id+" "+voice+" bar "+(i+1)+" = "+sum));
   lanes++;
  }
  // Reject silent typos which a tolerant ABC tokenizer would otherwise skip.
  for(const line of seed.abc.split("\n").filter(x=>x.startsWith("[V:"))){
   for(const bar of line.replace(/^\[V:[A-Z0-9]+\]\s*/,"").replace(/\s*\|\]\s*$/,"").split("|")){
    const clean=bar.replace(/\[([^\]]+)\]/g,(_,inner)=>"["+inner.replace(/\s+/g,"")+"]").replace(/\s+/g,"");
    assert.equal(clean.replace(abcToken,""),"",seed.id+" unknown ABC notation");
   }
  }
  const fingerprint=JSON.stringify({meter:sc.meter,key:sc.keyFifths,notes:sc.events.map(e=>[e.midi,e.startBeat,e.durationBeat,e.clef])});
  assert.ok(!fingerprints.has(fingerprint),seed.id+" repeats musical score "+fingerprints.get(fingerprint));
  fingerprints.set(fingerprint,seed.id);
 }
 return sc;
}
for(const track of tracks){
 for(let level=0;level<8;level++){
  const module=P.moduleFor(track,level);
  assert.ok(module&&module.objective&&module.proof,track+"N"+level+" objective or criterion missing");
  const variants=P.availableVariants(track,level);
  assert.ok(variants>0,track+"N"+level+" no general bank");
  for(let i=0;i<variants;i++){audit(P.makeSeed(track,level,i));generated++}
 }
 for(const level of [0,1,2,3,4]){
  const api=level<=1?ONE:level===2?TWO:level===3?THREE:FOUR;
  const count=level<=2?1:api.count(track);
  for(let i=0;i<count;i++){
   const study=api.get(track,level,i);
   assert.ok(study?.specialized&&!study.certification,track+" N"+level+" mistakenly certified");
   audit(study);older++;
  }
 }
 for(const level of [5,6,7]){
  const api=level===5?FIVE:level===6?SIX:SEVEN,count=api.count(track);
  assert.ok(count>=2,track+" N"+level+" needs two newly composed reading pieces");
  for(let i=0;i<2;i++){
   const quiz=Q.get(track,level,i);
   assert.ok(quiz&&quiz.length===4&&Array.isArray(quiz[1])&&quiz[1].length===4&&
    Number.isInteger(quiz[2])&&quiz[2]>=0&&quiz[2]<4&&quiz[3],track+" N"+level+" quiz missing");
   questions++;
  }
  const seen=[];
  for(let i=0;i<count;i++){
   const study=api.get(track,level,i);
   assert.equal(choose(track,level,3,seen).id,study.id,study.id+" must be selected once as a fresh score");
   seen.push(study.id);
   assert.ok(!study.certification&&study.intent&&study.limitations,"Advanced score may not certify itself");
   const sc=audit(study,{strict:true});
   if(study.partialCoverage){
    assert.ok(study.limitations.startsWith("Parcial:"),"Unexplained partial competency");
    partials++;
   }
   if(track==="F"&&level===6){
    if(i===0)assert.deepEqual(sc.meter,[5,8]);
    if(i===1)assert.deepEqual(sc.meter,[7,8]);
    if(i===2){
     assert.deepEqual(sc.meter,[4,4]);
     assert.ok(sc.events.some(e=>Math.abs(e.durationBeat-1/3)<.003),"3:2 ternary subdivision missing");
     assert.ok(sc.events.some(e=>e.clef==="bass"&&e.durationBeat===.5),"3:2 duple part missing");
    }
   }
   if(track==="H"&&level>=6)assert.ok(study.secondTrebleVoice&&study.secondBassVoice,"Dense polyphony must use 4 independent voices");
   if(track==="G"&&level===5){
    const right=sc.events.filter(e=>e.id.startsWith("RH-")),bass=sc.events.filter(e=>e.id.startsWith("LH-"));
    assert.ok(right.every(e=>e.velocity>bass[0].velocity),"Voice hierarchy is not encoded");
   }
   if(track==="G"&&level===6)assert.ok(sc.events.filter(e=>e.pedalAction==="change").length>=6,"Syncopated pedal cues missing");
   if(track==="G"&&level===7)assert.ok(sc.events.some(e=>e.dynamic==="ff")&&sc.events.some(e=>e.dynamic==="p"),"Contemporary dynamics missing");
   if(track==="I"&&level===7)assert.equal(sc.measures,16,"Professional long reading needs 16 bars");
   if(track==="J"&&level===7)assert.equal(sc.measures,16,"Stage rehearsal needs 16 bars");
   if(track==="C"&&level===6)assert.ok(sc.events.some(e=>e.note.startsWith("Db"))&&sc.events.some(e=>e.note.startsWith("C#")),"Written enharmonics lost");
   advanced++;
  }
  const fallback=choose(track,level,3,seen);
  assert.ok(!fallback||!seen.includes(fallback.id),"Recycled authored first-sight exercise");
 }
}
assert.deepEqual([generated,older,advanced,questions],[1344,55,61,60]);
assert.equal(fingerprints.size,61);
assert.ok(partials>0,"Advanced limits must be disclosed");
function textTree(node){return [node.name==="text"?node.textContent:"",...node.children.flatMap(textTree)].filter(Boolean)}
const svg=new SvgStub("svg");
E.render(svg,parse(SIX.get("G",6,0)),{});
assert.ok(textTree(svg).some(x=>x.includes("Ped.")),"Pedal indications not engraved");
const poly=new SvgStub("svg");const polyRender=E.render(poly,SEVEN.get("H",7,0)&&parse(SEVEN.get("H",7,0)),{});
assert.ok(polyRender.groups.length>0,"Four-voice performance groups are missing");
const long=new SvgStub("svg");const longRender=E.render(long,parse(SEVEN.get("I",7,0)),{});
assert.ok(longRender.height>=900,"Long study isn't shown in full notation");
const app=await source("app.html"),css=await source("assets/app.css"),build=await source("scripts/build-static.sh");
for(const path of ["specialized-advanced-core.js","specialized-n5.js","specialized-n6.js","specialized-n7.js","advanced-questions.js"])
 assert.ok(app.includes(path),"Missing mounted resource "+path);
assert.ok(app.indexOf("specialized-advanced-core.js")<app.indexOf("specialized-n5.js"));
assert.ok(app.indexOf("advanced-questions.js")<app.indexOf("sightreading-workspace.js"));
assert.ok(app.includes("Jingle Bells")&&app.includes("Mary Had a Little Lamb"),"Original songs missing");
assert.ok(ui.includes("canExploreN5")&&ui.includes("canExploreN6")&&ui.includes("canExploreN7")&&ui.includes("workspace-path-level-select"));
assert.ok(css.includes("workspace-path-level-select")&&build.includes("final-curriculum-check.mjs"));
const originalAccidental=E.parseABC("X:1\nM:4/4\nL:1/4\nK:G\n=F F ^F F | F |").events;
assert.deepEqual(originalAccidental.slice(0,5).map(e=>e.midi),[65,65,66,66,66]);
console.log("Final curriculum: all 80 module objectives; "+generated+" general variants and "+older+" original N0–N4 studies.");
console.log("Advanced: "+advanced+" unique N5–N7 training scores with "+lanes+" measured independent voice lanes and "+questions+" multiple-choice questions.");
console.log("Validated mixed-meter training, 3:2, dense polyphony, enarmonic spelling, expressive dynamics, pedal, sixteen-bar sight-reading, old songs and compact workspace.");
console.log("Disclosure: "+partials+" advanced training scores have explicitly limited technical coverage; no professional certification is granted.");
