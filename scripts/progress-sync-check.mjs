import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile(new URL("../api/sightreading-progress.js",import.meta.url),"utf8");
const originalEnv={...process.env};
process.env.SUPABASE_URL="https://sync-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY="test-public-key";
const api=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
let row=null,writes=0;
const fetchBefore=globalThis.fetch;
const uuid="c1ee0af0-2287-4876-9510-99eab3b19af0";
const json=(v,status=200)=>Response.json(v,{status});
globalThis.fetch=async(url,init)=>{
 const u=new URL(url);
 if(u.pathname.endsWith("/auth/v1/user")){
  assert.equal(init.headers.apikey,"test-public-key");
  assert.equal(init.headers.authorization,"Bearer valid-token");
  return json({id:uuid});
 }
 if(u.pathname.endsWith("/rest/v1/sightreading_progress_v1")){
  if(init.method==="POST"){
   const v=JSON.parse(init.body);assert.equal(v.user_id,uuid);
   if(row)return json({code:"23505"},409);
   row=v;writes++;
   return json([row],201);
  }
  if(init.method==="PATCH"){
   const expected=u.searchParams.get("updated_at").replace(/^eq\./,"");
   if(!row||row.updated_at!==expected)return json([]);
   row=JSON.parse(init.body);writes++;return json([row]);
  }
  return json(row?[row]:[]);
 }
 throw Error("Unexpected endpoint: "+u.pathname);
};
const url="https://luwipi.test/api/sightreading-progress";
const auth={"authorization":"Bearer valid-token","origin":"https://luwipi.test","content-type":"application/json"};
try{
 let res=await api.GET(new Request(url));
 assert.equal(res.status,401);
 res=await api.PUT(new Request(url,{method:"PUT",headers:{...auth,origin:"https://wrong.example"},body:"{}"}));
 assert.equal(res.status,403);assert.equal(writes,0);
 const draft={version:1,levels:{A:{level:0,certified:true,streak:["fake"],sessions:[{
  sessionId:"session-1",exerciseId:"A0-1",date:"2026-10-01",notes:1,rhythm:1,stops:0,bpm:60,verified:true,success:true
 }]}},mistakes:[{track:"A",level:0,pattern:"2.ª descendente",lastSeen:"2026-10-01",due:["2026-10-02"]}],seen:["A0-1"]};
 res=await api.PUT(new Request(url,{method:"PUT",headers:auth,body:JSON.stringify({draft,updatedAt:null})}));
 assert.equal(res.status,200);const result=await res.json();
 assert.equal(result.draft.levels.A.certified,false);
 assert.equal(result.draft.levels.A.streak.length,0);
 assert.equal(result.draft.levels.A.sessions[0].verified,false);
 assert.equal(result.draft.levels.A.sessions[0].success,false);
 assert.equal(result.draft.seen.length,1);
 assert.equal(writes,1);
 res=await api.GET(new Request(url,{headers:auth}));
 assert.equal(res.status,200);assert.equal((await res.json()).draft.mistakes[0].pattern,"2.ª descendente");
 res=await api.PUT(new Request(url,{method:"PUT",headers:auth,body:JSON.stringify({draft,updatedAt:null})}));
 assert.equal(res.status,409);assert.equal(writes,1);
 const value=await (await api.GET(new Request(url,{headers:auth}))).json();
 res=await api.PUT(new Request(url,{method:"PUT",headers:auth,body:JSON.stringify({draft,updatedAt:value.updatedAt})}));
 assert.equal(res.status,200);assert.equal(writes,2);
 console.log("Progress sync: unauthorized and foreign origins blocked; server sanitizes client claims; stale revisions rejected; authorized draft read/write passed.");
}finally{
 globalThis.fetch=fetchBefore;Object.assign(process.env,originalEnv);
}
