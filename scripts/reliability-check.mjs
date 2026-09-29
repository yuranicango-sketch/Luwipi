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

await test("Score engine: figuras musicais usam desenho estável",async()=>{
  const E=await engine();
  assert(E.restSymbol("whole")==="whole","whole rest classification failed");
  assert(E.restSymbol("half")==="half","half rest classification failed");
  assert(E.restSymbol("quarter")==="quarter","quarter rest classification failed");
  assert(E.restSymbol("eighth")==="eighth","eighth rest classification failed");
  assert(E.restSymbol("sixteenth")==="sixteenth","sixteenth rest classification failed");
  assert(E.durationKind(.5).flags===1&&E.durationKind(.25).flags===2,"flag count regression");
  const source=await read("assets/music/score-engine.js");
  assert(source.includes('svgEl("circle",{cx:x+18,cy:y-1,r:2.35'),"augmentation dot is not vector-rendered");
  assert(source.includes('for(let flag=0;flag<kind.flags;flag++)')&&source.includes('fill:"#292d34"'),"filled note flags missing");
  assert(source.includes("function restGlyph(type)")&&source.includes("𝄻")&&source.includes("𝄼")&&source.includes("𝄾")&&source.includes("𝄿"),"music rest glyph rendering missing");
});

await test("Partituras: nome editável e identidade independente do título",async()=>{
  const app=await read("app.html");
  const live=await read("assets/live/live-mode.js");
  const library=await read("assets/reading/reading-library.js");
  const api=await read("api/reading-library.js");
  assert(app.includes('id="livePublishName"'),"score name field missing from publish preview");
  assert(live.includes("suggestedScoreTitle()"),"score title suggestion flow missing");
  assert(live.includes("explicitTitle")===false,"live mode should not depend on library internals");
  assert(library.includes('explicitTitle=""'),"explicit score title is not accepted by library");
  const clientFingerprint=library.slice(library.indexOf("function fingerprint(score,kind)"),library.indexOf("function localClean",library.indexOf("function fingerprint(score,kind)")));
  assert(!clientFingerprint.includes("score.title"),"client score identity still depends on title");
  const serverFingerprint=api.slice(api.indexOf("async function fingerprint(score,kind)"),api.indexOf("async function parseBody",api.indexOf("async function fingerprint(score,kind)")));
  assert(!serverFingerprint.includes("title:"),"server score identity still depends on title");
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
  assert(!core.includes("/api/prepare-lesson")&&!core.includes("/api/videos"),"obsolete lesson/video runtime remains");
  const apiDir=path.join(ROOT,"api");
  async function countJs(dir){let n=0;for(const ent of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())n+=await countJs(p);else if(ent.isFile()&&ent.name.endsWith(".js"))n++}return n}
  const count=await countJs(apiDir);assert(count<=12,"Vercel Hobby serverless limit exceeded: "+count);
});

await test("Super Paw Paw: 10 níveis rítmicos e compassos completos",async()=>{
  const html=await read("super-paw-paw.html"),app=await read("app.html");
  assert(app.includes('href="/super-paw-paw.html"')&&app.includes('Super Paw Paw'),"game is not linked from Jogos");
  assert(html.includes('id="speed"')&&html.includes('id="levelSelect"')&&!html.includes('id="song"'),"rhythm-only controls incorrect");
  const from=html.indexOf("const baseLevels=["),to=html.indexOf("let index=0,ev=[]",from);
  assert(from>=0&&to>from,"game data missing");
  const {levels}=new Function(html.slice(from,to)+";return {levels}")();
  assert(levels.length===10,"expected 10 rhythm levels");
  for(const [index,level] of levels.entries()){
    assert(level.patterns.length>=8,"level "+(index+1)+" is too short");
    for(const pattern of level.patterns){
      const ticks=pattern.split(" ").reduce((sum,kind)=>sum+({q:4,e:2,s:1,r:4}[kind]||0),0);
      assert(ticks===16,"invalid 4/4 bar in level "+(index+1)+": "+pattern);
    }
  }
  assert(levels[0].patterns.every(p=>p==="q q q q"),"first level must teach a simple quarter-note pulse");
  assert(levels.at(-1).patterns.some(p=>p.includes("s")),"last level must include sixteenth notes");
  assert(html.includes("hat(ac.currentTime,.16)"),"rhythm input has no audible percussion");
  assert(html.includes("X=480")&&html.indexOf('id="jump"')<html.indexOf('class="overlay"'),"in-game timing button or desktop hit zone missing");
  assert(html.includes("c.addEventListener('pointerdown'"),"tapping the score does not trigger the note");
  assert(html.includes("visible*.16")&&html.includes("run/lead"),"mobile hit zone does not preserve room for a four-beat preview");
  assert(html.includes('min="50"')&&html.includes('id="preview"'),"slow tempo or upcoming-bar preview missing");
});

await test("Paw Paw Notas: mãos, leitura e alturas musicais",async()=>{
  const html=await read("paw-paw-notas.html"),app=await read("app.html");
  assert(app.includes('href="/paw-paw-notas.html"'),"pitch game missing from Jogos");
  for(const mode of ["right","left","both"])assert(html.includes('value="'+mode+'"'),"hand mode missing: "+mode);
  const from=html.indexOf("const $=id=>"),songsStart=html.indexOf("songs=[",from),end=html.indexOf(";let events=[]",songsStart);
  assert(songsStart>=0&&end>songsStart,"song data missing");
  const songs=new Function("return "+html.slice(songsStart+6,end))();
  assert(songs.length===1,"pitch exercise should not claim invented songs");
  for(const song of songs){
    assert(song.melody.length===32&&song.bass.length===8,"piece must have eight 4/4 bars");
    assert([...song.melody,...song.bass].every(n=>Number.isInteger(n)&&n>=0&&n<7),"note outside displayed keyboard");
  }
  assert(html.includes("choice.note!==note")&&html.includes("midi(event.hand,event.note)"),"pitch matching or played note missing");
  assert(html.includes("hand==='both'")&&html.includes("hand!=='left'")&&html.includes("hand!=='right'"),"combined hand lanes missing");
});

await test("Entrada: script descodificado arranca e não deixa o ecrã de sessão preso",async()=>{
  const app=await read("app.html"),core=decodeCore(app);
  new Function("window",core);
  assert(!core.includes("ZSSSSS"),"stray statement after access bootstrap");
  assert(core.includes("loadingTimer=setTimeout")&&core.includes("show('error',true)"),"session-loading timeout missing");
  assert(app.includes('id="accessLoading"')&&app.includes('id="retryAccessButton"'),"loading/error recovery UI missing");
});

await test("Publicação: ambos os jogos entram no build estático",async()=>{
  const build=await read("scripts/build-static.sh"),app=await read("app.html");
  for(const name of ["super-paw-paw.html","paw-paw-notas.html"]){
    assert(build.includes("cp "+name+" public/"+name),name+" is omitted from Vercel output");
    assert(app.includes('href="/'+name+'"'),name+" has no matching game link");
  }
});

await test("Jogos: ritmo e alturas sem músicas inventadas",async()=>{
  const rhythm=await read("super-paw-paw.html"),pitch=await read("paw-paw-notas.html");
  assert(!rhythm.includes('id="song"')&&!pitch.includes('id="song"'),"invented game songs are still selectable");
  assert(rhythm.includes("let y=170;")&&rhythm.includes("hat(ac.currentTime,.16)"),"rhythm lane is still pretending to be a pitch score");
  assert(pitch.includes("choice.note!==note")&&pitch.includes("staffNoteY"),"pitch game does not validate displayed notes");
  assert(!rhythm.includes("object-fit:cover")&&!pitch.includes("object-fit:cover"),"mobile score is clipped");
});

await test("Paw Paw Notas: alturas corretas nas claves de Sol e Fá",async()=>{
  const html=await read("paw-paw-notas.html"),start=html.indexOf("function staffNoteY("),end=html.indexOf("function note(",start);
  assert(start>=0&&end>start,"staff placement function missing");
  const y=new Function(html.slice(start,end)+";return staffNoteY")();
  assert(y("right",0,0)===135&&y("right",2,0)===108&&y("right",6,0)===54,"treble C4, E4 or B4 is off the staff");
  assert(y("left",0,0)===67.5&&y("left",3,0)===27&&y("left",5,0)===0,"bass C3, F3 or A3 is off the staff");
  assert(html.includes("e.hand==='right'&&e.note===0"),"middle C ledger line missing");
});

await test("Piano: margem de volume, fade final e notas repetidas",async()=>{
  const core=decodeCore(await read("app.html"));
  assert(core.includes("pianoMaster.gain.value=.95")&&core.includes("pianoOutput.gain.value=.82"),"piano master lacks headroom");
  assert(core.includes("Math.min(.78,Math.max(.14,.72*level))"),"sample voices are too loud");
  assert(core.includes("buffer.duration-.03")&&core.includes("gain.gain.exponentialRampToValueAtTime(.0001,now+dur)"),"sample can stop before its release fade");
  assert(core.includes("pianoNoteOffVoice(previous,.05)"),"rapid retrigger layers the same note");
  assert(core.includes("o.connect(g).connect(pianoMaster)"),"metronome bypasses the audio bus");
  for(const file of ["assets/games/piano-dos-bichinhos.js","assets/games/bolhas-do-som.js"]){
    const src=await read(file);
    assert(src.includes(".58")&&/duration\s*-\s*0?\.012/.test(src),"children's piano lacks gain headroom or end fade: "+file);
  }
});

await test("Pinta o Piano: pincel e três teclados publicados",async()=>{
  const html=await read("pintar-teclas.html"),app=await read("app.html"),build=await read("scripts/build-static.sh");
  assert(app.includes('href="/pintar-teclas.html"')&&build.includes('cp pintar-teclas.html public/pintar-teclas.html'),"painting game missing from site");
  for(const mode of ['data-mode="two"','data-mode="three"','data-mode="all"'])assert(html.includes(mode),"missing keyboard option "+mode);
  assert(html.includes("canvas.addEventListener('pointermove'")&&html.includes("ctx.arc(x,y,radius"),"painting should follow a brush stroke");
  assert(html.includes("document.addEventListener('contextmenu'"),"long press should not open tools");
});

await test("Jogos: miniaturas e visual Luwipi consistentes",async()=>{
  const app=await read("app.html"),cards=await read("assets/games/game-cards.css"),shell=await read("assets/games/luwipi-game-shell.css");
  assert(app.includes('/assets/games/game-cards.css')&&cards.includes('.game-thumb-card')&&cards.includes('.paint-piano-entry'),"illustrated cards are not styled");
  for(const [game,thumb] of [["super-paw-paw","super-paw-paw"],["paw-paw-notas","paw-paw-notas"],["pintar-teclas","pinta-o-piano"]]){
    const html=await read(game+".html"),svg=await read("assets/images/games/"+thumb+"-thumb.svg");
    assert(html.includes('/assets/games/luwipi-game-shell.css')&&html.includes('class="site-brand"')||html.includes('class="head site-brand"'),game+" lacks Luwipi framing");
    assert(app.includes('/assets/images/games/'+thumb+'-thumb.svg')&&svg.includes('<svg'),game+" thumbnail missing");
  }
  assert(shell.includes('--luwipi-primary:#4568ff'),"game shell differs from site palette");
});

await test("Jogos: todos os cartões mostram miniaturas",async()=>{
  const app=await read("app.html"),start=app.indexOf('<section id="gamesView"'),end=app.indexOf('</main></section>',start);
  assert(start>=0&&end>start,"games view missing");
  const cards=[...app.slice(start,end).matchAll(/<(?:button|a)[^>]*class="(?:tiny-card|game-card)[^"]*"[^>]*>[\s\S]*?<\/(?:button|a)>/g)];
  assert(cards.length>=15,"expected curated Luwipi game cards");
  for(const card of cards){const src=card[0].match(/src="\/assets\/images\/games\/([^"]+\.svg)"/);assert(src,"game card lacks thumbnail");await read("assets/images/games/"+src[1])}
});

await test("Acesso: rede pendente termina e sessão tem limite",async()=>{
  const core=decodeCore(await read("app.html"));
  assert(core.includes("withDeadline(client.auth.getSession(),8000,'session')"),"session can hang indefinitely");
  assert(core.includes("withDeadline(readProfile(session.user.id),15000,'profile')"),"profile can hang indefinitely");
  assert(core.includes("fetch(supabaseUrl+'/rest/v1/'+table")&&core.includes("authorization:'Bearer '+session.access_token"),"profile lookup should bypass SDK auth lock while preserving RLS");
  const start=core.indexOf("async function fetchAccessJson("),end=core.indexOf("function parentLink()",start);
  assert(start>=0&&end>start,"bounded access fetch missing");
  const fetchJson=new Function("fetch","AbortController",core.slice(start,end)+"return fetchAccessJson")(async(_path,{signal})=>new Promise((_,reject)=>signal.addEventListener("abort",()=>reject(Object.assign(new Error("aborted"),{name:"AbortError"})))),AbortController);
  let failure=null;try{await fetchJson("/api/public-config",25)}catch(error){failure=error}
  assert(failure?.name==="AbortError","hung access request was not aborted");
});

await test("Acesso: observador espera pela sessão e há recuperação local",async()=>{
  const app=await read("app.html"),core=decodeCore(app);
  const refresh=core.slice(core.indexOf("async function refresh("),core.indexOf("async function start()"));
  assert(refresh.includes("await withDeadline(client.auth.getSession()"),"session read missing");
  assert(refresh.indexOf("await withDeadline(client.auth.getSession()")<refresh.indexOf("client.auth.onAuthStateChange("),"auth observer starts before stored session resolves");
  assert(core.includes("localStorage.removeItem('sb-'+supabaseRef+'-auth-token')"),"local session recovery missing");
  assert(app.includes('id="restartAccessButton"')&&app.includes('Entrar de novo'),"recovery action not visible");
  assert(core.includes("lastFailure='access_timeout'"),"generic loading timeout lacks recovery state");
  const unlock=core.slice(core.indexOf("function unlock(){"),core.indexOf("function hasAccess("));
  assert(unlock.includes("clearTimeout(loadingTimer)"),"successful access leaves loading error timer active");
});

await test("Leitura: jornada imersiva, peças tradicionais e alturas certas",async()=>{
  const app=await read("app.html"),core=decodeCore(app),guide=await read("assets/reading/guide.js"),css=await read("assets/reading/guide.css");
  const journey=await read("assets/reading/immersive-journey.js"),layout=await read("assets/reading/immersive-journey.css");
  assert(app.includes('id="readingStage"')&&app.includes('data-journey-start')&&app.includes('data-library-toggle'),"visual journey is missing");
  assert(journey.includes("journey-note")&&journey.includes("LuwipiAudioBridge")&&layout.includes("#songView .transport"),"score, piano and immersive reader are disconnected");
  assert(!core.includes("const studyDefinitions=")&&!core.includes("const originalThemes=")&&!core.includes("const solfegePatterns="),"invented music remains in catalog");
  const start=core.indexOf("const publicMelodies="),end=core.indexOf("for(const [key,piece]",start);
  assert(start>=0&&end>start,"traditional melodies are missing");
  const pieces=new Function(core.slice(start,end)+";return publicMelodies")();
  assert(Object.keys(pieces).length===4,"expected four additional public-domain melodies");
  for(const piece of Object.values(pieces))for(const bar of piece.right)assert(bar.reduce((sum,n)=>sum+n.d,0)===piece.meter[0],"incomplete traditional measure");
  assert((app.match(/data-preview-song=/g)||[]).length===7,"preview missing from a public-domain song card");
  assert(core.includes("return 106-(idx-e4)*6"),"moving score still places E4 on the wrong line");
  const noteStart=core.indexOf("function noteFlowY("),noteEnd=core.indexOf("function noteFlowSvg(",noteStart);
  const y=new Function("const parsePitch=n=>({l:n[0],o:Number(n.slice(-1))});"+core.slice(noteStart,noteEnd)+";return noteFlowY")();
  assert(y("C4")===118&&y("E4")===106&&y("G4")===94,"C4, E4 or G4 is shown on the wrong staff position");
  assert(core.includes("pianoSample(item.n,item.d,beatMs,.8)")&&core.includes("syncReadingPiano(name)")&&app.includes('id="pianoDock"'),"audible piano missing");
  assert(guide.includes("if(!enabled||!kind)return")&&css.includes("body.piano-open .piano-dock:not(.hidden)"),"mobile piano guide missing");
});

await test("Activity-first: sem aulas, piano reativo e formatos musicais",async()=>{
  const app=await read("app.html"),live=await read("assets/live/live-mode.js"),engine=await read("assets/music/score-engine.js"),practice=await read("assets/activities/interactive-practice.js");
  const journey=await read("assets/reading/immersive-journey.js"),layout=await read("assets/reading/immersive-journey.css");
  assert(!app.includes('id="videosView"')&&!app.includes('id="plannerView"'),"lesson/video views should be removed");
  assert(app.includes("Continuar a jornada")&&app.includes('id="homeStart"'),"activity-first home missing");
  for(const path of ["reading","rhythm","games","live"])assert(app.includes('data-home-path="'+path+'"'),"learner path missing: "+path);
  assert(app.includes('id="gamesPathGrid"')&&journey.includes('gameGrid.appendChild(card)')&&layout.includes('#gamesView:not(.library-open) .games-library'),"games still expose a competing legacy index");
  assert(layout.includes('body[data-mode="aprenda"] #homeView .home-tool-list{display:none}'),"duplicate learner navigation remains");
  assert(practice.includes("activity-piano-key")&&practice.includes("LuwipiAudioBridge"),"reactive piano preview missing");
  assert(live.includes(".abc")&&live.includes(".kar")&&live.includes(".json"),"extended score formats missing");
  assert(engine.includes("function parseABC"),"ABC parser missing");
});

console.log("\nLuwipi reliability gate: "+passed+" checks passed");
for(const line of notes)console.log(line);
