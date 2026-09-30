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

await test("Piano: amostras, ressonância leve e fim de nota natural",async()=>{
  const core=decodeCore(await read("app.html"));
  assert(core.includes("pianoCompressor.ratio.value=2.4")&&core.includes("pianoOutput.gain.value=.84"),"audio bus is still over-compressed or lacks headroom");
  assert(core.includes("c.createConvolver")&&core.includes("pianoInput.connect(send).connect(room).connect(wet).connect(pianoMaster)"),"recorded piano has no subtle room resonance");
  assert(core.includes("loadPlayableSample(n)")&&core.includes("rate:Math.pow(2,(target-noteMidi(candidate))/12)"),"missing keys fall back to synthetic audio before nearby recordings");
  assert(core.includes("sample.buffer.duration/sample.rate")&&core.includes("releaseStart+.22")&&core.includes("gain.gain.exponentialRampToValueAtTime(.0001,now+Math.max(releaseStart+.01,fadeEnd))"),"recording is clipped before its release tail");
  const resolverStart=core.indexOf("async function loadPlayableSample(n){"),resolverEnd=core.indexOf("function preloadPiano(n)",resolverStart);
  assert(resolverStart>=0&&resolverEnd>resolverStart,"recorded sample resolver missing");
  const fetches=[];
  const resolve=new Function("loadPianoBuffer","pianoPlayableCache","noteMidi","midiNote",core.slice(resolverStart,resolverEnd)+";return loadPlayableSample")(
    async note=>{fetches.push(note);return note==="G4"?{duration:2}:null},new Map(),
    note=>({"F#4":66,"G4":67,"F4":65})[note],midi=>({65:"F4",67:"G4"})[midi]||"F#4"
  );
  const chosen=await resolve("F#4");
  assert(chosen.buffer.duration===2&&Math.abs(chosen.rate-Math.pow(2,-1/12))<1e-8&&fetches.join(",")==="F#4,G4","missing F# does not use its nearest recorded G");
  assert(core.includes("return pianoSample(n,1,560,level)"),"manual piano does not use the exact journey preview voice");
  assert(core.includes("function pianoSamplePeak(level)")&&core.includes("function pianoSampleAttack(gain,now,peak)"),"shared piano playback helpers are missing");
  assert(core.includes("o.connect(g).connect(pianoMaster)"),"metronome bypasses the audio bus");
  for(const file of ["assets/games/piano-dos-bichinhos.js","assets/games/bolhas-do-som.js"]){
    const src=await read(file);
    assert(src.includes(".58")&&/duration\s*-\s*0?\.012/.test(src),"children's piano lacks gain headroom or end fade: "+file);
  }
});

await test("Piano manual: ataque suave e teclado imóvel durante o toque",async()=>{
  const core=decodeCore(await read("app.html")),guide=await read("assets/reading/guide.js"),practice=await read("assets/activities/interactive-practice.js");
  const start=core.indexOf("async function pianoNoteOn(n,level=.98){"),end=core.indexOf("function pianoNoteOff(n)",start),manual=core.slice(start,end);
  assert(manual.includes("return pianoSample(n,1,560,level)"),"manual piano is not playing the same full note as the journey card");
  assert(core.includes("pianoNoteOn(n,.98)")&&core.includes("pianoNoteOff(n)"),"physical keys do not match the journey preview volume");
  assert(!core.includes("pianoNoteOffVoice("),"manual key release still truncates the sample");
  assert(core.includes("performance.now()-lastPianoTouchAt<900")&&guide.includes("window.LuwipiPianoInteracting?.()"),"guided piano scrolls during touch");
  assert(practice.includes("!lightReactivePiano.fromPointer")&&practice.includes("lightReactivePiano.fromPointer=true"),"reactive key scrolls as soon as a finger touches it");
  assert(!core.includes("?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});renderExerciseSteps()")&&core.includes("scoreScroller.scrollBy"),"exercise moves the whole page while playing");
});

await test("Ateliê musical: seis jogos individuais publicados",async()=>{
  const html=await read("app.html"),page=await read("atelie-musical.html"),game=await read("assets/games/atelie-musical.js"),build=await read("scripts/build-static.sh");
  for(const id of ["partitura","jardim","ritmo","melodia","compassos","pinta"]){
    assert(html.includes(`/atelie-musical.html?jogo=${id}`),`missing independent game ${id}`);
    assert((await read(`assets/images/games/atelie-${id}.svg`)).includes("<svg"),`missing game artwork ${id}`);
  }
  assert(page.includes("atelie-musical.js")&&build.includes("cp atelie-musical.html public/atelie-musical.html"),"atelier is absent from static build");
  const group=html.slice(html.indexOf('<section class="tiny-section atelie-section">'),html.indexOf('<div class="game-groups">'));
  assert(group.includes("Pinta o Piano")&&group.includes("Pinta a Partitura")&&group.includes("Pinta e Toca"),"painting games are split across categories");
  assert(game.includes("function partitura()")&&game.includes("function jardim()")&&game.includes("function rhythmGame(kind)")&&game.includes("function melodia()")&&game.includes("function pinta()"),"one or more games has no interaction");
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
  assert(core.includes("window.LuwipiJourneyExercises=exercises.right")&&journey.includes("exercise.notes.slice()")&&journey.includes('view.querySelector(`[data-ex="${next}"]`)?.click()'),"stage preview and next exercise use different notes");
  assert(!app.includes('id="readingJourney"')&&!journey.includes('const notes=["C4"'),"duplicate journey or fixed demonstration remains");
  assert(journey.includes('A:"Lá",B:"Si"')&&!journey.includes('labels[n[0]]||n'),"piano displays pitch codes instead of note names");
  assert(layout.includes('#songView .transport .tempo span{color:#172e64}')&&layout.includes('#songView #songPianoBtn{display:none!important}'),"song controls are unreadable or duplicated");

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

await test("Leitor de uma e duas claves: pauta deslizante e controlos no topo",async()=>{
  const core=decodeCore(await read("app.html")),css=await read("assets/reading/score-experience.css"),ui=await read("assets/reading/score-experience.js");
  assert(core.includes("songFullScore")&&core.includes("songScoreWrap.addEventListener('scroll'")&&core.includes("for(let bi=start;bi<end;bi++)"),"song is still paginated into four bars");
  assert(core.includes("event.code!=='Space'")&&core.includes("playBtn.click()"),"spacebar does not control playback");
  assert(css.includes("overflow-x:auto!important")&&css.includes(".score-wrap.whole-score")&&css.includes(".pager,\nbody[data-mode=\"aprenda\"] #songView .secondary-actions"),"score canvas still has controls below the piano");
  assert(ui.includes("toolbar.append(transport)")&&ui.includes("experience-score-actions"),"playback and hidden controls are not in the top/menu");
});

await test("Minueto de Petzold: Sol maior na partitura e no áudio",async()=>{
  const app=await read("app.html"),core=decodeCore(app),roadmap=await read("assets/reading/repertoire-roadmap.js");
  const start=core.indexOf(" minuet:{title:"),end=core.indexOf("\n ]}",start)+4;
  assert(start>=0&&end>start,"Minueto ausente");
  const score=core.slice(start,end);
  assert(score.includes("title:'Minueto em Sol maior · BWV Anh. 114'")&&score.includes("keyOffset:7"),"title or key still in C");
  assert(score.includes("[{n:'D5',d:1},{n:'G4',d:.5},{n:'A4',d:.5},{n:'B4',d:.5},{n:'C5',d:.5}]")&&score.includes("{n:'F#5'"),"right hand does not match the original G-major melody");
  assert(score.includes("[{n:'B2',d:2},{n:'A2',d:1}]")&&score.includes("{n:'F#2'"),"left hand not restored to G major");
  assert(core.includes("keySignature==='G'&&p.l==='F'")&&core.includes("songKey==='minuet'&&songTranspose===0?'G':'C'"),"F-sharp key signature missing");
  assert(app.includes('<h3>Minueto em Sol maior</h3>')&&!app.includes('Minuet em G → Dó maior')&&!roadmap.includes('transposto para Dó'),"old transposed label remains");
});

await test("Repertório: 40 peças em oito níveis sem prometer partituras ausentes",async()=>{
  const app=await read("app.html"),roadmap=await read("assets/reading/repertoire-roadmap.js"),css=await read("assets/reading/immersive-journey.css");
  const start=roadmap.indexOf("const works=["),end=roadmap.indexOf("const names=",start);
  assert(start>=0&&end>start,"repertoire data missing");
  const works=new Function(roadmap.slice(start,end)+";return works")();
  assert(works.length===40,"expected exactly 40 distinct works");
  assert(new Set(works.map(work=>work[0])).size===40,"duplicate repertoire work");
  assert(works.every(work=>["C","P"].includes(work[1])&&["public","protected"].includes(work[4])),"genre or rights status missing");
  const playable=works.filter(work=>work[3]);
  assert(playable.length===4&&playable.every(work=>app.includes('data-song="'+work[3]+'"')),"repertoire promises an unavailable excerpt");
  assert(roadmap.includes('partitura não incluída')&&roadmap.includes('Trecho disponível'),"availability is ambiguous");
  assert(css.includes('.song-list[hidden]{display:none!important}'),"opening repertoire duplicates the song list");
});

await test("Activity-first: sem aulas, piano reativo e formatos musicais",async()=>{
  const app=await read("app.html"),live=await read("assets/live/live-mode.js"),engine=await read("assets/music/score-engine.js"),practice=await read("assets/activities/interactive-practice.js");
  const journey=await read("assets/reading/immersive-journey.js"),layout=await read("assets/reading/immersive-journey.css");
  assert(!app.includes('id="videosView"')&&!app.includes('id="plannerView"'),"lesson/video views should be removed");
  assert(app.includes('Atividades musicais')&&app.includes('id="homePaths"')&&!app.includes('id="homeStart"'),"home still promotes the paused course");
  for(const path of ["reading","rhythm","games","live"])assert(app.includes('data-home-path="'+path+'"'),"learner path missing: "+path);
  assert(app.includes('id="gamesPathGrid"')&&journey.includes('gameGrid.appendChild(card)')&&layout.includes('#gamesView:not(.library-open) .games-library'),"games still expose a competing legacy index");
  assert(!app.includes('class="home-tool-list"')&&!app.includes('id="homeResume"'),"duplicate learner navigation remains");
  assert(practice.includes("activity-piano-key")&&practice.includes("LuwipiAudioBridge"),"reactive piano preview missing");
  assert(live.includes(".abc")&&live.includes(".kar")&&live.includes(".json"),"extended score formats missing");
  assert(engine.includes("function parseABC"),"ABC parser missing");
});

await test("Interação infantil: sem menu de contexto nem seleção, com edição preservada",async()=>{
  const code=await read("assets/activities/interaction-guard.js");
  const css=await read("assets/activities/interaction-guard.css");
  const handlers={};
  class MockElement{constructor(isEditable){this.isEditable=isEditable}closest(){return this.isEditable?this:null}}
  new Function("document","Element",code)({addEventListener:(name,handler)=>handlers[name]=handler},MockElement);
  for(const name of ["contextmenu","selectstart","dragstart"]){
    assert(typeof handlers[name]==="function",name+" is not blocked");
    let blocked=false;handlers[name]({target:new MockElement(false),preventDefault:()=>blocked=true});
    assert(blocked,name+" remains enabled on an activity");
    blocked=false;handlers[name]({target:new MockElement(true),preventDefault:()=>blocked=true});
    assert(!blocked,name+" breaks editable fields");
  }
  assert(css.includes("-webkit-touch-callout:none")&&css.includes("user-select:none"),"long press still opens mobile callouts");
  for(const file of ["app.html","pintar-teclas.html","super-paw-paw.html","paw-paw-notas.html","atelie-musical.html"]){
    const page=await read(file);
    assert(page.includes("interaction-guard.css")&&page.includes("interaction-guard.js"),file+" lacks the guard");
  }
});

await test("Música a duas claves: partitura legível e piano opcional",async()=>{
  const html=await read("app.html"),core=decodeCore(html),css=await read("assets/activities/interface-refinement.css");
  assert(html.includes('id="songPianoToggle"')&&html.includes('aria-controls="pianoDock"'),"hide piano control is missing");
  assert(core.includes("const W=full?920:left+count*mw+35")&&core.includes("const x=left+(full?bi-start:bi)*mw"),"two clefs are not laid out as a continuous horizontal score");
  assert(core.includes("if(name==='song'&&!songPianoVisible)closePianoDock();else openPiano()"),"song navigation reopens a hidden piano");
  assert(core.includes("songLayoutSize=2;syncPianoTargets()")&&core.includes("const active=document.fullscreenElement===reader"),"fullscreen or piano state was lost");
  assert(css.includes("#songView .song-piano-toggle")&&css.includes("#songView.song-piano-hidden .score-wrap"),"song score does not reclaim space when piano is hidden");
});

await test("Refinamento: pauta completa e espaços responsivos azuis",async()=>{
  const html=await read("app.html"),css=await read("assets/activities/interface-refinement.css");
  assert(html.includes('id="exerciseSvg" viewBox="0 30 900 245"'),"exercise score retains excess blank space");
  assert(html.includes("interface-refinement.css")&&css.includes("transform:none!important"),"score may crop the clef");
  assert(css.includes("max-width:700px")&&css.includes("max-height:620px")&&css.includes("min-width:701px"),"phone, tablet and short landscape layouts are incomplete");
  assert(css.includes("#songView .reader:fullscreen")&&css.includes("background:#dce8ff"),"legacy grey fullscreen remains");
});

await test("Trilha inicial: onboarding por idade, progresso e tarefas em todas as superfícies",async()=>{
  const app=await read("app.html"),path=await read("assets/activities/learning-path.js"),tasks=await read("assets/activities/universal-tasks.js"),library=await read("assets/reading/reading-library.js"),live=await read("assets/live/live-mode.js");
  assert(!app.includes('id="courseView"')&&!app.includes('learning-path.js')&&!app.includes('data-menu-course')&&path.includes('const tracks='),"course was deleted or remains mounted before the curriculum is ready");
  for(const age of ["5-8","9-12","13-17","18+"])assert(path.includes(`'${age}':[`)&&path.includes(`ageNames[profile.age]`),"age-specific activities missing: "+age);
  assert(path.includes("localStorage.setItem(KEY")&&path.includes("exerciseAttempt==='done'")&&path.includes("courseFinish"),"completion is not saved or linked to the next step");
  assert(path.includes("startingPoint")&&path.includes("profile.goal==='reading'"),"onboarding choices do not alter the journey");
  assert(tasks.includes("CompressionStream")&&tasks.includes("openShared")&&library.includes("function openShared(item)"),"imported score task cannot be opened by a recipient");
  assert(tasks.includes("LuwipiLiveTaskSource?.score()")&&live.includes("window.LuwipiLiveTaskSource"),"uploaded structured score cannot be sent as a task");
  for(const file of ["atelie-musical.html","pintar-teclas.html","paw-paw-notas.html","super-paw-paw.html"])assert((await read(file)).includes("/assets/tasks/standalone-task.js"),"standalone game has no task link: "+file);
});

await test('Aulas interativas: demonstração, compreensão e prática por idade',async()=>{
  const path=await read('assets/activities/learning-path.js'),css=await read('assets/activities/learning-path.css');
  const ideas=Function(`return (${path.match(/const lessonIdeas=(\{[\s\S]*?\n  \});/)?.[1]||'null'})`)();
  assert(ideas,'conteúdo das aulas não foi encontrado');
  const titles=[...path.slice(path.indexOf('const tracks='),path.indexOf('const introCount=')).matchAll(/\{title:'([^']+)'/g)].map(m=>m[1]);
  for(const title of titles){const lesson=ideas[title];assert(lesson&&lesson.length===6,`aula sem objetivo: ${title}`);assert(lesson[2].length===3&&lesson[2][lesson[3]],`pergunta sem resposta: ${title}`)}
  assert(path.includes('function openLesson(index)')&&path.includes('function launchPractice(index)')&&path.includes('lessonState.answered=true'),'atividade abre sem demonstrar e verificar compreensão');
  assert(path.includes("item.kind==='exercise')coachDone.hidden=true")&&path.includes("exerciseAttempt==='done'"),'exercício pode ser dado como concluído sem execução');
  assert(css.includes('.course-lesson.active')&&css.includes('max-height:500px')&&css.includes('orientation:landscape'),'aula não cabe em ecrãs curtos');
});

await test('Área de atividades: navegação única e estilos sem duplicação antiga',async()=>{
  const app=await read('app.html'),tasks=await read('assets/activities/universal-tasks.js'),css=await read('assets/activities/activity-workspace.css'),build=await read('scripts/build-static.sh');
  assert(app.includes('activity-workspace.css')&&app.includes('Atividades musicais')&&app.includes('data-karaoke-open'),'entrada de atividades incompleta');
  assert(!app.includes('home-feature')&&!app.includes('home-tool-list')&&!app.includes('data-menu-course'),'chamadas da interface antiga permanecem');
  assert(!tasks.includes("task('course')")&&!tasks.includes('teacher-task-action')&&tasks.includes("task('reading')"),'partilha usa percurso inativo ou ação duplicada');
  assert(css.includes('repeat(5,minmax(0,1fr))')&&css.includes('max-width:650px')&&css.includes('orientation:landscape'),'grelha não se adapta aos dispositivos');
  assert(!build.includes('public/app.html')&&build.includes('rm -f public/assets/activities/learning-path.js'),'build publica código antigo ou uma entrada duplicada');
});

await test('Karaokê preserva MIDI original e ataques do solo',async()=>{
 const karaoke=await read('assets/karaoke/karaoke.js'),player=await read('assets/karaoke/midi-player.js');
 assert(karaoke.includes('score,binary')&&player.includes('binary:binary.slice(0)'),'MIDI original não chega ao sequenciador');
 assert(!karaoke.includes('E.playNote(n.midi')&&player.includes('WorkletSynthesizer'),'acompanhamento ainda usa apenas piano');
 assert(player.includes('currentHighResolutionTime')&&karaoke.includes('currentBeat()'),'pauta desligada do relógio do áudio');
 assert(karaoke.includes('version:2')&&karaoke.includes('data.midi'),'tarefas perdem os instrumentos originais');
 const begin=karaoke.indexOf('function simplify('),end=karaoke.indexOf('function setSong',begin);
 const select=new Function(karaoke.slice(begin,end)+';return simplify')();
 const events=[0,.125,.25,.375].map((startBeat,i)=>({id:String(i),midi:i<2?60:62+i,startBeat,durationBeat:.125}));
 const notes=select(events);
 assert(notes.length===4&&notes.every((n,i)=>n.startBeat===events[i].startBeat),'notas rápidas ou repetidas eliminadas');
 assert(karaoke.includes('e.channel!==9'),'bateria pode ser escolhida como solo');
 const config=JSON.parse(await read('vercel.json')),csp=config.headers[0].headers.find(x=>x.key==='Content-Security-Policy').value;
 assert(csp.includes('connect-src')&&csp.includes('https://spessasus.github.io'),'banco de instrumentos bloqueado por CSP');
 assert(csp.includes("'wasm-unsafe-eval'")&&!/script-src[^;]* 'unsafe-eval'/.test(csp),'decoder MIDI bloqueado ou permissões demasiado amplas');
});

await test('MusicXML: acordes, vozes, durações e isolamento de pista',async()=>{
 const w={LuwipiScoreEngine:await engine()};new Function('window',await read('assets/karaoke/midi-notation.js'))(w);
 const result=w.LuwipiMidiNotation.convert([
 {id:'a',midi:60,startBeat:0,durationBeat:4},{id:'b',midi:64,startBeat:0,durationBeat:4},
 {id:'c',midi:67,startBeat:1,durationBeat:.5},{id:'d',midi:69,startBeat:1.5,durationBeat:.5},
 {id:'e',midi:72,startBeat:3,durationBeat:2}],{meter:[4,4],keyFifths:0},'A & B');
 assert(result.sourceNotes===5&&result.voices===2&&result.bars===2,'acordes ou vozes perdidos');
 assert(result.xml.includes('<chord/>')&&result.xml.includes('<backup>')&&result.xml.includes('<tied type="start"/>')&&result.xml.includes('A &amp; B'),'MusicXML incompleto');
 const input=midiBuffer([0,0xc0,24,0,0xc1,40,0,0x90,60,100,0,0x91,64,100,0x83,0x60,0x80,60,0,0,0x81,64,0,0,0xff,0x2f,0]);
 const isolated=w.LuwipiMidiNotation.isolate(input,'0:1'),score=w.LuwipiScoreEngine.parseMIDI(isolated),events=w.LuwipiScoreEngine.performanceEvents(score);
 assert(events.length===1&&events[0].midi===64&&events[0].channel===1&&events[0].durationBeat===1,'audição de pista altera notas ou tempo');
 assert(score.transcription.programs.some(p=>p.channel===1&&p.program===40),'instrumento da pista perdido');
});

await test('MuseScore: MIDI inválido recusado e conversão autenticada',async()=>{
 const {validateMidi}=await import('../server/musescore.mjs');
 const valid=Buffer.from(midiBuffer([0,0xc0,24,0,0x90,60,100,0x83,0x60,0x80,60,0,0,255,47,0]));
 assert(validateMidi(valid)===1,'MIDI válido recusado');
 const meta=Buffer.from(midiBuffer([0,255,81,3,7,161,32,0,144,60,100,131,96,128,60,0,0,255,47,0]));
 assert(validateMidi(meta)===1,'metadados mudam posição do parser');
 for(const bad of [valid.subarray(0,valid.length-1),Buffer.from('not midi'),Buffer.from(midiBuffer([0,144,255,100,0,255,47,0]))]){
  let rejected=false;try{validateMidi(bad)}catch{rejected=true}assert(rejected,'MIDI corrompido aceite');
 }
 const src=(await read('api/midi-score.js')).replace("import { convertMidi, validateMidi } from '../server/musescore.mjs';","const convertMidi=()=>{throw Error('must not run')};const validateMidi=()=>1;");
 const api=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
 const r=await api.POST(new Request('https://luwipi.vercel.app/api/midi-score',{method:'POST',headers:{'content-type':'audio/midi'},body:valid}));
 assert(r.status===401,'conversor aberto sem sessão');
 const foreign=await api.POST(new Request('https://luwipi.vercel.app/api/midi-score',{method:'POST',headers:{origin:'https://other.example'},body:valid}));
 assert(foreign.status===403,'origem externa aceite');
 const client=await read('assets/karaoke/karaoke.js');
 assert(client.includes('scoreAbort?.abort()')&&client.includes('request!==scoreRequest')&&client.includes('notation:current.nativeScores'),'seleção concorrente ou partilha perde partitura nativa');
 assert((await read('app.html')).includes('/assets/karaoke/musescore-client.js'),'cliente MuseScore não carregado');
});

await test('Entrada única, menu, tema e karaokê MIDI',async()=>{
  const app=await read('app.html'),config=JSON.parse(await read('vercel.json'));
  const core=decodeCore(app);
  assert(core.includes("const initialMode='aprenda'"),'a entrada ainda escolhe duas experiências');
  assert(core.includes('product=in.(aprenda,ensine)'),'acessos antigos não são considerados');
  assert(app.includes('id="experienceMenuButton"')&&app.includes('id="experienceMenuTheme"')&&app.includes('id="karaokeBack"'),'menu, tema ou voltar ausente');
  assert(!app.includes('.parent-mode header{display:none}')&&!((await read('assets/reading/score-experience.css')).includes('body.parent-mode .experience-menu-trigger{display:none!important}')),'modo tarefa oculta navegação interna');
  assert(app.includes('id="karaokeFiles"')&&app.includes('multiple'),'importação de vários MIDI ausente');
  assert(config.redirects.some(x=>x.source==='/ensine'&&x.destination==='/')&&config.redirects.some(x=>x.source==='/aprenda'&&x.destination==='/'),'rotas antigas não convergem');
  const karaoke=await read('assets/karaoke/karaoke.js');
  assert(karaoke.includes('E.parseMIDI')&&karaoke.includes('E.performanceEvents')&&karaoke.includes('backing=events.filter(e=>keyOf(e)!==selected)'),'separação de melodia não está ligada aos eventos MIDI');
  assert(karaoke.includes('LuwipiLiveInput.connectMIDI')&&karaoke.includes('LuwipiLiveInput.connectMicrophone'),'entrada instrumental ausente');
  assert(app.includes('id="karaokeTaskSheet"')&&karaoke.includes('CompressionStream')&&karaoke.includes('DecompressionStream'),'partilha MIDI não apresenta link ou não o consegue reabrir');
  const css=await read('assets/karaoke/karaoke.css');assert(css.includes('max-height:540px')&&css.includes('orientation:landscape')&&css.includes('max-width:650px')&&css.includes('minmax(0,1.6fr)'),'karaokê sem adaptação vertical e horizontal');
  const E=await engine(),name=bytes=>[...bytes];
  const t1=[0,255,3,6,...name(Buffer.from('Melody')),0,192,73,0,144,60,100,131,96,128,60,0,0,255,47,0];
  const t2=[0,255,3,5,...name(Buffer.from('Piano')),0,193,0,0,145,48,70,131,96,129,48,0,0,255,47,0];
  const fixture=new Uint8Array([77,84,104,100,0,0,0,6,0,1,0,2,1,224,77,84,114,107,...u32(t1.length),...t1,77,84,114,107,...u32(t2.length),...t2]);
  const score=E.parseMIDI(fixture.buffer);assert(score.transcription.trackNames.some(x=>x.title==='Melody')&&score.transcription.programs.some(x=>x.program===73)&&E.performanceEvents(score).some(x=>x.track===1),'pistas MIDI independentes não foram preservadas');
});

console.log("\nLuwipi reliability gate: "+passed+" checks passed");
for(const line of notes)console.log(line);
