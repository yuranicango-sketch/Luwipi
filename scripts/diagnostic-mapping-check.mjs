import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=p=>readFile(new URL("../"+p,import.meta.url),"utf8");
const foundation=await read("assets/pedagogy/sightreading-foundation-v1.js"),diag=await read("assets/reading/sightreading-diagnostic.js");
const env={};new Function("globalThis",foundation)(env);
const p=env.LuwipiPedagogyV1.placementFromDiagnostic({
 tests:[0,1,1,2,2],extra:{C:1,I:1,G:1,H:1,J:0}
});
for(const t of "ABCDEFGHIJ")assert.equal(p[t].status,"reconhecimento elementar observado","Missing diagnostic evidence: "+t);
const faulty=env.LuwipiPedagogyV1.placementFromDiagnostic({tests:[0,3,null,null,null],extra:{C:0}});
assert.equal(faulty.A.status,"reconhecimento elementar observado");
assert.equal(faulty.B.status,"necessita reforço inicial");
assert.equal(faulty.C.status,"necessita reforço inicial");
assert.equal(faulty.J.status,"não avaliado");
assert.ok(!Object.values(p).some(t=>t.level>0),"Single-answer quiz must not certify a level");
assert.ok(diag.includes("const extra=[")&&diag.includes("supplement=extra[n-8]")&&diag.includes("n===13"),"Missing six-block diagnostic structure");
const app=await read("app.html");assert.ok(app.includes("LuwipiGetAccessToken")===false,"Auth bridge is embedded in the packed core and must not leak into visible HTML");
const packed=app.slice(app.lastIndexOf("const p=\""));
assert.ok(packed.includes('b=atob(p)')&&packed.includes('LuwipiCoreLoaded=true'),"Packed boot may have been corrupted");
const library=await read("assets/reading/reading-library.js"),sync=await read("assets/pedagogy/progress-sync.js");
assert.ok(library.includes("window.LuwipiGetAccessToken")&&sync.includes("window.LuwipiGetAccessToken"));
console.log("Ten-track initial placement, unanswered-track caution, six diagnostic blocks and shared authentication bridge: OK");
