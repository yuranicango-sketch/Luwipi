import fs from "node:fs/promises";
import path from "node:path";
import { webcrypto } from "node:crypto";

if(!globalThis.crypto)globalThis.crypto=webcrypto;

const ROOT=process.cwd();
let passed=0;
const notes=[];
function assert(cond,msg){if(!cond)throw new Error(msg)}
async function test(name,fn){
  try{await fn();passed++;notes.push("✓ "+name)}
  catch(error){notes.push("✗ "+name+" — "+(error?.message||error));throw error}
}
async function read(rel){return fs.readFile(path.join(ROOT,rel),"utf8")}
function response(body,status=200,headers={}){return new Response(typeof body==="string"?body:JSON.stringify(body),{status,headers:{"content-type":"application/json",...headers}})}
async function moduleFrom(rel){
  const src=await read(rel);
  return import("data:text/javascript;base64,"+Buffer.from(src).toString("base64")+"#"+Date.now()+Math.random());
}
function u32(n){return[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]}
function midiBuffer(track){
  return new Uint8Array([0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,1,0xe0,0x4d,0x54,0x72,0x6b,...u32(track.length),...track]).buffer;
}
async function engine(){
  const src=await read("assets/music/score-engine.js"),w={};
  new Function("window",src)(w);
  return w.LuwipiScoreEngine;
}
function decodeCore(app){
  const marker='const p="',s=app.lastIndexOf(marker),e=app.indexOf('",b=atob(p)',s);
  assert(s>=0&&e>s,"encoded app core not found");
  const bytes=Buffer.from(app.slice(s+marker.length,e),"base64");
  for(let i=0;i<bytes.length;i++)bytes[i]^=83;
  return bytes.toString("utf8");
}
function validPlan(){
  const description=(i)=>"Toque um padrão curto no piano. Diga: \"Escuta e repete comigo.\" [ESPERE] Peça ao aluno para imitar o padrão "+i+" e repita uma vez se houver hesitação.";
  return{
    longGoal:"Tocar pequenos padrões com pulso estável.",
    longWhy:"Construir ouvido, coordenação e autonomia musical.",
    cycleName:"Ouvir e responder",
    cycleRule:"Avança quando o aluno imita com segurança.",
    holdRule:"Repete quando o pulso ou a resposta ainda não estão estáveis.",
    monthGoal:"Imitar e tocar padrões curtos mantendo o pulso.",
    methods:["Luwipi"],
    lessons:Array.from({length:4},(_,i)=>({
      intention:"Ouvir, imitar e tocar com segurança.",
      observe:"Pulso, resposta auditiva e coordenação.",
      easyHint:"Reduz o padrão para duas notas.",
      hardHint:"Muda o ponto de partida mantendo o mesmo pulso.",
      blocks:[
        {min:10,title:"Ouvir "+(i+1),description:description(1),method:"Luwipi",resource:""},
        {min:10,title:"Imitar "+(i+1),description:description(2),method:"Gordon",resource:"Eco do Piano"},
        {min:10,title:"Tocar "+(i+1),description:description(3),method:"Luwipi",resource:"Leitura"}
      ]
    }))
  };
}

await test("Score engine: MIDI, sustain, tonalidade e fidelity",async()=>{
  const E=await engine();
  const track=[
    0x00,0xff,0x51,0x03,0x07,0xa1,0x20,
    0x00,0xff,0x59,0x02,0xfe,0x00,
    0x00,0xb0,0x40,0x7f,
    0x00,0x90,0x3f,0x64,
    0x83,0x60,0x80,0x3f,0x00,
    0x83,0x60,0xb0,0x40,0x00,
    0x00,0xff,0x2f,0x00
  ];
  const score=E.parseMIDI(midiBuffer(track));
  assert(score.events[0].note==="Eb4","key-aware Eb spelling failed");
  assert(E.performanceEvents(score)[0].pedal===true,"sustain CC64 not preserved");
  assert(E.performanceEvents(score)[0].durationBeat===2,"sustain duration not preserved");
  const audit=E.auditScore(score);
  assert(audit.notePreservation===1&&!audit.blocked,"valid MIDI fidelity audit failed");
});

await test("Score engine: timing humano fica limpo sem perder performance",async()=>{
  const E=await engine();
  const t=E.transcribePerformance([
    {id:"a",midi:60,startBeat:.04,durationBeat:.96,velocity:75,track:0},
    {id:"b",midi:64,startBeat:1.03,durationBeat:.49,velocity:70,track:0}
  ],{meter:[4,4],keyFifths:0});
  assert(t.events[0].startBeat===0&&t.events[0].durationBeat===1,"human quarter note did not quantize cleanly");
  assert(t.events[0].performanceStartBeat===.04&&t.events[0].performanceDurationBeat===.96,"original human timing was lost");
  assert(t.gridBeat>=.25,"transcriber selected unnecessarily tiny notation grid");
});

await test("Score engine: ties, tempo map e perda de notas são detetados",async()=>{
  const E=await engine();
  const tied=E.transcribePerformance([{id:"x",midi:60,startBeat:3,durationBeat:2,velocity:70,track:0}],{meter:[4,4],keyFifths:0});
  assert(tied.events.length===2&&tied.events[0].tieStart&&tied.events[1].tieStop,"bar-crossing tie failed");
  const timed=E.normalizeScore({tempoBpm:120,tempoMap:[{beat:0,bpm:120},{beat:2,bpm:60}],events:[{id:"a",midi:60,startBeat:0,durationBeat:1,velocity:70}]});
  assert(Math.round(E.beatToMs(timed,3))===2000,"tempo map integration failed");
  const bad=E.normalizeScore({source:"midi",events:[{id:"a",sourceEventId:"a",midi:60,startBeat:0,durationBeat:1,velocity:70}],performanceEvents:[{id:"a",midi:60,startBeat:0,durationBeat:1,velocity:70},{id:"b",midi:62,startBeat:1,durationBeat:1,velocity:70}],transcription:{confidence:1}});
  assert(E.auditScore(bad).blocked===true,"lost MIDI event was not blocked");
});

await test("Score engine: MIDI corrompido é recusado",async()=>{
  const E=await engine();let failed=false;
  try{E.parseMIDI(new Uint8Array([1,2,3,4]).buffer)}catch{failed=true}
  assert(failed,"malformed MIDI was accepted");
});

await test("Google Drive: criar, ler e guardar aluno no appDataFolder",async()=>{
  const app=await read("app.html"),core=decodeCore(app);
  const start=core.indexOf("const LuwipiStudentVault=(()=>{"),end=core.indexOf("const LuwipiProductionAccess",start);
  assert(start>=0&&end>start,"Drive vault source not found");
  const vaultSrc=core.slice(start,end);
  let stored={version:1,students:[]},fileCreated=false;
  const fakeFetch=async(url,options={})=>{
    const u=String(url);
    if(u.includes("files?spaces=appDataFolder"))return response({files:fileCreated?[{id:"drive-file-1"}]:[]});
    if(u.includes("/drive/v3/files?fields=id")&&options.method==="POST"){fileCreated=true;return response({id:"drive-file-1"})}
    if(u.includes("/upload/drive/v3/files/")&&options.method==="PATCH"){stored=JSON.parse(options.body);return response({},200)}
    if(u.includes("alt=media"))return new Response(JSON.stringify(stored),{status:200,headers:{"content-type":"text/plain"}});
    return response({},404);
  };
  const fakeSelect={innerHTML:"",disabled:false,value:"",addEventListener:()=>{}};
  const doc={getElementById:id=>id==="plannerSavedStudent"?fakeSelect:null,querySelectorAll:()=>[]};
  const vault=new Function("document","fetch","crypto","plannerEsc","plannerKindButtons","plannerKind",vaultSrc+";return LuwipiStudentVault;")(doc,fakeFetch,crypto,s=>String(s),[], "individual");
  assert(await vault.init("provider-token")===true,"Drive init/create/read failed");
  assert(await vault.save({name:"Aluno 001",age:6,frequency:1,duration:30,experience:"first",approach:"luwipi",profile:"",priority:"",isGroup:false},{monthGoal:"Pulso",totalLessons:4,methods:["Luwipi"],lessons:[]})===true,"Drive save failed");
  assert(stored.students?.length===1&&stored.students[0].name==="Aluno 001","Drive persisted record differs");
});

await test("Google Drive: 401/403 exige reconexão sem perder a app",async()=>{
  const app=await read("app.html"),core=decodeCore(app),start=core.indexOf("const LuwipiStudentVault=(()=>{"),end=core.indexOf("const LuwipiProductionAccess",start);
  const vaultSrc=core.slice(start,end),fakeSelect={innerHTML:"",disabled:false,value:"",addEventListener:()=>{}},doc={getElementById:id=>id==="plannerSavedStudent"?fakeSelect:null,querySelectorAll:()=>[]};
  const vault=new Function("document","fetch","crypto","plannerEsc","plannerKindButtons","plannerKind",vaultSrc+";return LuwipiStudentVault;")(doc,async()=>response({},401),crypto,s=>String(s),[],"individual");
  assert(await vault.init("expired-token")===false,"Drive reconnect failure was not contained");
});

await test("Planeador: geração válida mantém 4 aulas e duração exata",async()=>{
  process.env.SUPABASE_URL="https://supabase.test";process.env.SUPABASE_PUBLISHABLE_KEY="pub";process.env.OPENAI_API_KEY="openai";process.env.OPENAI_MODEL="gpt-5.6-sol";
  const mod=await moduleFrom("api/prepare-lesson.js"),plan=validPlan();
  globalThis.fetch=async url=>{
    const u=String(url);
    if(u.includes("/auth/v1/user"))return response({id:"11111111-1111-4111-8111-111111111111",email:"teacher@example.com"});
    if(u.includes("product_entitlements"))return response([{status:"active",access_until:null}]);
    if(u.includes("api.openai.com"))return response({status:"completed",output:[{type:"message",content:[{type:"output_text",text:JSON.stringify(plan)}]}]});
    return response({},404);
  };
  const req=new Request("https://app.test/api/prepare-lesson",{method:"POST",headers:{authorization:"Bearer ok","content-type":"application/json"},body:JSON.stringify({age:6,duration:30,frequency:1,experience:"first",approach:"luwipi",profile:"",priority:""})});
  const res=await mod.POST(req),body=await res.json();
  assert(res.status===200&&body.plan.lessons.length===4,"planner valid response failed");
  assert(body.plan.lessons.every(l=>l.blocks.reduce((s,b)=>s+b.min,0)===30),"lesson duration invariant failed");
});

await test("Planeador/paywall: input inválido e acesso expirado falham fechados",async()=>{
  process.env.SUPABASE_URL="https://supabase.test";process.env.SUPABASE_PUBLISHABLE_KEY="pub";process.env.OPENAI_API_KEY="openai";
  const mod=await moduleFrom("api/prepare-lesson.js");
  let expired=false;
  globalThis.fetch=async url=>{
    const u=String(url);
    if(u.includes("/auth/v1/user"))return response({id:"11111111-1111-4111-8111-111111111111",email:"teacher@example.com"});
    if(u.includes("product_entitlements"))return response(expired?[{status:"expired",trial_ends_at:"2020-01-01T00:00:00Z"}]:[{status:"active"}]);
    return response({},500);
  };
  let res=await mod.POST(new Request("https://app.test/api/prepare-lesson",{method:"POST",headers:{authorization:"Bearer ok","content-type":"application/json"},body:JSON.stringify({age:1,duration:30,frequency:1,experience:"first",approach:"luwipi"})}));
  assert(res.status===400,"invalid planner input did not return 400");
  expired=true;
  res=await mod.POST(new Request("https://app.test/api/prepare-lesson",{method:"POST",headers:{authorization:"Bearer ok","content-type":"application/json"},body:JSON.stringify({age:6,duration:30,frequency:1,experience:"first",approach:"luwipi"})}));
  assert(res.status===402,"expired entitlement did not close planner");
});

await test("Aulas audiovisuais: catálogo respeita entitlement e audiência",async()=>{
  process.env.SUPABASE_URL="https://supabase.test";process.env.SUPABASE_PUBLISHABLE_KEY="pub";process.env.SUPABASE_SECRET_KEY="secret";
  const mod=await moduleFrom("api/videos.js");
  globalThis.fetch=async url=>{
    const u=String(url);
    if(u.includes("/auth/v1/user"))return response({id:"11111111-1111-4111-8111-111111111111",email:"teacher@example.com"});
    if(u.includes("product_entitlements"))return response([{status:"active",access_until:null}]);
    if(u.includes("video_lessons"))return response([
      {id:"1",title:"Aula 1",description:"",provider:"vimeo",video_id:"12345",video_hash:null,audience:"aprenda",age_track:"10+",sort_order:1},
      {id:"2",title:"Ensine",description:"",provider:"vimeo",video_id:"999",video_hash:null,audience:"ensine",age_track:"all",sort_order:2}
    ]);
    return response({},404);
  };
  const res=await mod.GET(new Request("https://app.test/api/videos?audience=aprenda&track=10+",{headers:{authorization:"Bearer ok"}})),body=await res.json();
  assert(res.status===200&&body.lessons.length===1&&body.lessons[0].title==="Aula 1","video lesson filtering failed");
});

await test("Paddle checkout: auth, custom_data e URL de retorno",async()=>{
  process.env.SUPABASE_URL="https://supabase.test";process.env.SUPABASE_PUBLISHABLE_KEY="pub";process.env.PADDLE_API_KEY="pdl";process.env.PADDLE_PRICE_ENSINE_MONTHLY="pri_ensine";process.env.APP_URL="https://app.test";process.env.PADDLE_ENV="sandbox";
  const mod=await moduleFrom("api/billing/checkout.js");let sent=null;
  globalThis.fetch=async(url,options={})=>{
    const u=String(url);
    if(u.includes("/auth/v1/user"))return response({id:"11111111-1111-4111-8111-111111111111"});
    if(u.includes("/transactions")){sent=JSON.parse(options.body);return response({data:{checkout:{url:"https://checkout.paddle.test/abc"}}})}
    return response({},404);
  };
  const res=await mod.POST(new Request("https://app.test/api/billing/checkout",{method:"POST",headers:{origin:"https://app.test",authorization:"Bearer ok","content-type":"application/json"},body:JSON.stringify({product:"ensine",plan:"monthly"})}));
  const body=await res.json();
  assert(res.status===200&&body.url.includes("checkout"),"checkout URL missing");
  assert(sent.custom_data.product==="ensine"&&sent.custom_data.user_id,"checkout custom_data missing");
  assert(sent.checkout.url==="https://app.test/ensine?billing=return","billing return URL mismatch");
  const forbidden=await mod.POST(new Request("https://app.test/api/billing/checkout",{method:"POST",headers:{origin:"https://evil.test"}}));
  assert(forbidden.status===403,"checkout cross-origin request not blocked");
});

await test("Paddle webhook: assinatura, idempotência e transaction.completed ativam acesso",async()=>{
  process.env.SUPABASE_URL="https://supabase.test";process.env.SUPABASE_SECRET_KEY="secret";process.env.PADDLE_WEBHOOK_SECRET="whsec_test";
  const mod=await moduleFrom("api/billing/webhook.js");let entitlementPatch=null;
  globalThis.fetch=async(url,options={})=>{
    const u=String(url);
    if(u.includes("billing_webhook_events?"))return response([]);
    if(u.includes("product_entitlements?")&&(!options.method||options.method==="GET"))return response([]);
    if(u.endsWith("/rest/v1/product_entitlements")&&options.method==="POST"){entitlementPatch=JSON.parse(options.body);return response({},201)}
    if(u.endsWith("/rest/v1/billing_webhook_events")&&options.method==="POST")return response({},201);
    return response({},404);
  };
  const event={event_id:"evt_1",event_type:"transaction.completed",occurred_at:new Date().toISOString(),data:{id:"txn_1",subscription_id:"sub_1",customer_id:"ctm_1",status:"completed",billing_period:{ends_at:"2026-10-26T00:00:00Z"},items:[{price:{id:"pri_1"}}],custom_data:{user_id:"11111111-1111-4111-8111-111111111111",product:"ensine",plan:"monthly"}}};
  const raw=JSON.stringify(event),ts=String(Math.floor(Date.now()/1000));
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(process.env.PADDLE_WEBHOOK_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=Buffer.from(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(ts+":"+raw))).toString("hex");
  const res=await mod.POST(new Request("https://app.test/api/billing/webhook",{method:"POST",headers:{"paddle-signature":"ts="+ts+";h1="+sig,"content-type":"application/json"},body:raw}));
  assert(res.status===200,"valid Paddle webhook failed");
  assert(entitlementPatch?.status==="active"&&entitlementPatch?.access_until==="2026-10-26T00:00:00Z","completed transaction did not provision access");
  const bad=await mod.POST(new Request("https://app.test/api/billing/webhook",{method:"POST",headers:{"paddle-signature":"ts=1;h1=bad"},body:raw}));
  assert(bad.status===401,"invalid Paddle signature was accepted");
});

await test("Angola billing: AO usa WhatsApp, exterior usa Paddle",async()=>{
  const mod=await moduleFrom("api/billing/angola.js");
  let r=await mod.GET(new Request("https://app.test/api/billing/angola",{headers:{"x-vercel-ip-country":"AO"}})),b=await r.json();
  assert(b.payment==="whatsapp","Angola routing is not WhatsApp");
  r=await mod.GET(new Request("https://app.test/api/billing/angola",{headers:{"x-vercel-ip-country":"PT"}}));b=await r.json();
  assert(b.payment==="paddle","outside-Angola routing is not Paddle");
});

await test("Biblioteca global: professor não publica global; admin pode",async()=>{
  process.env.SUPABASE_URL="https://supabase.test";process.env.SUPABASE_PUBLISHABLE_KEY="pub";
  const mod=await moduleFrom("api/reading-library.js");
  const score={title:"Teste",source:"midi",tempoBpm:120,meter:[4,4],events:[{id:"a",midi:60,startBeat:0,durationBeat:1,velocity:70}]};
  let role="teacher",posted=null;
  globalThis.fetch=async(url,options={})=>{
    const u=String(url);
    if(u.includes("/auth/v1/user"))return response({id:"11111111-1111-4111-8111-111111111111"});
    if(u.includes("/profiles?"))return response([{role}]);
    if(u.endsWith("/rest/v1/reading_library_scores")||u.includes("reading_library_scores?on_conflict")){posted=JSON.parse(options.body);return response({},201)}
    return response([],200);
  };
  let res=await mod.POST(new Request("https://app.test/api/reading-library",{method:"POST",headers:{origin:"https://app.test",authorization:"Bearer ok","content-type":"application/json"},body:JSON.stringify({kind:"music",visibility:"global",score,title:"Teste",fidelity:{rating:"high",score:100}})}));
  assert(res.status===403,"teacher was allowed to publish globally");
  role="admin";
  res=await mod.POST(new Request("https://app.test/api/reading-library",{method:"POST",headers:{origin:"https://app.test",authorization:"Bearer ok","content-type":"application/json"},body:JSON.stringify({kind:"music",visibility:"global",score,title:"Teste",fidelity:{rating:"high",score:100}})}));
  assert(res.status===200&&posted.visibility==="global","admin global publication failed");
});

await test("Static security: microfone, PDF, preview, paywall e serverless limit",async()=>{
  const vercel=JSON.parse(await read("vercel.json"));
  const headers=(vercel.headers||[]).flatMap(x=>x.headers||[]);
  const perm=headers.find(x=>x.key==="Permissions-Policy")?.value||"";
  const csp=headers.find(x=>x.key==="Content-Security-Policy")?.value||"";
  assert(perm.includes("microphone=(self)"),"Permissions-Policy blocks live microphone");
  assert(csp.includes("frame-src 'self' blob:"),"CSP blocks PDF blob preview");
  assert(csp.includes("object-src 'none'"),"CSP object-src defense was weakened");
  const app=await read("app.html"),core=decodeCore(app);
  assert(app.includes('id="livePublishModal"'),"score preview modal missing");
  assert(app.includes('id="livePdfFrame"'),"PDF iframe preview missing");
  assert(core.includes("product_entitlements"),"paywall is not reading product entitlements");
  assert(core.includes("drive.appdata"),"Google Drive appDataFolder scope missing");
  const apiDir=path.join(ROOT,"api");
  async function countJs(dir){let n=0;for(const ent of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())n+=await countJs(p);else if(ent.isFile()&&ent.name.endsWith(".js"))n++}return n}
  const count=await countJs(apiDir);assert(count<=12,"Vercel Hobby serverless limit exceeded: "+count);
});

console.log("\nLuwipi reliability gate: "+passed+" checks passed");
for(const line of notes)console.log(line);
