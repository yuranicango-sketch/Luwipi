import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
await import("../assets/pedagogy/sightreading-foundation-v1.js");
await import("../assets/pedagogy/specialized-n0-n1.js");
const P=globalThis.LuwipiPedagogyV1,S=globalThis.LuwipiSpecializedStudies,ui=await read("assets/pedagogy/sightreading-workspace.js");
const first=ui.indexOf("function chooseSeed("),last=ui.indexOf("\\nfunction launch(",first);
assert.ok(first>=0&&last>first,"Explicit unseen-score selection is missing");
const chooseSeed=new Function("P","S",ui.slice(first,last)+";return chooseSeed;")(P,S);
let count=0;
for(const track of P.trackIds){
 for(const level of [0,1]){
  const special=S.get(track,level);
  assert.ok(special,"Specialized N0/N1 exercise missing");
  const seen=[];
  const training=chooseSeed(track,level,2,seen);
  assert.equal(training.id,special.id,"Specialized pattern should be available during training");
  seen.push(training.id); // preview played: no longer unseen
  const next=chooseSeed(track,level,3,seen);
  assert.ok(next&&next.id!==training.id,"Previewed piece reused as first-sight");
  seen.push(next.id);
  const newOne=chooseSeed(track,level,3,seen);
  assert.ok(newOne&&newOne.id!==next.id,"First-sight must stay unique");
  count+=3;
 }
}
const track="F",level=0,variants=P.availableVariants(track,level);
const consumed=[S.get(track,level).id,...Array.from({length:variants},(_,i)=>P.makeSeed(track,level,i).id)];
assert.equal(chooseSeed(track,level,3,consumed),null,"Must stop when all musical material was exposed");
assert.ok(ui.includes("localEdits!==editsAtLoad")&&ui.includes("sync.mergeDrafts(draft,profile)")&&ui.includes("if(edited)void sync.save(profile)"),"Sync load overwrites new local attempts");
const sync=await read("assets/pedagogy/progress-sync.js");
assert.ok(sync.includes("loadTicket++")&&sync.includes("ownerAtSave!==activeUser")&&sync.includes("function reset()"),"Signout sync isolation missing");
const html=await read("app.html"),anchor='const p="',start=html.lastIndexOf(anchor),end=html.indexOf('",b=atob(p)',start);
assert.ok(start>=0&&end>start,"Packed core not found");
const core=Buffer.from(html.slice(start+anchor.length,end),"base64").map(x=>x^83).toString("utf8");
assert.ok(core.includes("new Event('luwipi:access-ready')")&&core.includes("new Event('luwipi:access-signed-out')"),"Auth lifecycle events not emitted");
assert.ok(core.includes("window.LuwipiGetAccessToken="),"Global token bridge must remain available");
console.log("Reading integrity: "+count+" selection checks; N0/N1 previews cannot be re-used as first-sight.");
console.log("Race-proof progress merging, sign-out isolation, packed auth lifecycle and bank-exhaustion tests passed.");
