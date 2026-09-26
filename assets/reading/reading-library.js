(function(){
"use strict";
const Engine=window.LuwipiScoreEngine;
if(!Engine)return;

const DB_NAME="luwipi-reading-library-v1",STORE="scores",FALLBACK_KEY="luwipi_reading_library_v1";
const listEl=document.getElementById("importedReadingList");
const emptyEl=document.getElementById("importedReadingEmpty");
const exerciseListEl=document.getElementById("importedExerciseList");
const exerciseEmptyEl=document.getElementById("importedExerciseEmpty");
const view=document.getElementById("readingImportedView");
const svg=document.getElementById("readingImportedSvg");
const titleEl=document.getElementById("readingImportedTitle");
const headingEl=document.getElementById("readingImportedHeading");
const metaEl=document.getElementById("readingImportedMeta");
const guideBtn=document.getElementById("readingImportedGuide");
const playBtn=document.getElementById("readingImportedPlay");
const pianoBtn=document.getElementById("readingImportedPiano");
const removeBtn=document.getElementById("readingImportedRemove");
const tempoDown=document.getElementById("readingImportedTempoDown");
const tempoUp=document.getElementById("readingImportedTempoUp");
const tempoEl=document.getElementById("readingImportedTempo");

let current=null,groups=[],guide=false,currentGroup=0,tempo=120,timers=[],playing=false,pianoSeen=new Set();
let remoteCache=[],permissionCache=null,lastRemoteError="";

function access(){
  try{return typeof LuwipiProductionAccess!=="undefined"?LuwipiProductionAccess:null}catch{return null}
}
async function token(){
  const gate=access();
  return gate&&typeof gate.getAccessToken==="function"?await gate.getAccessToken():null;
}
async function api(path,options={}){
  const t=await token();
  if(!t)throw new Error("unauthorized");
  const headers=new Headers(options.headers||{});
  headers.set("authorization","Bearer "+t);
  if(options.body&&!headers.has("content-type"))headers.set("content-type","application/json");
  const r=await fetch("/api/reading-library"+(path||""),{...options,headers,cache:"no-store"});
  const body=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(body.error||"library_unavailable");e.status=r.status;throw e}
  return body;
}
async function permissions(force=false){
  if(permissionCache&&!force)return permissionCache;
  try{permissionCache=await api("?meta=1");return permissionCache}
  catch{permissionCache={role:"teacher",canPublishGlobal:false};return permissionCache}
}

function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function fingerprint(score,kind){
  const perf=Engine.performanceEvents?Engine.performanceEvents(score):score.performanceEvents||score.events||[];
  return hashString(JSON.stringify([kind||"music",score.title,score.tempoBpm,score.meter,score.keyFifths,score.events.map(e=>[e.midi,e.startBeat,e.durationBeat,e.velocity]),perf.map(e=>[e.midi,e.startBeat,e.durationBeat,e.velocity,e.pedal])]));
}
function localClean(score,sourceName,kind,fidelity){
  const s=Engine.normalizeScore(score),now=new Date().toISOString();
  return{
    id:"local-"+(kind==="exercise"?"exercise-":"score-")+fingerprint(s,kind),
    remote:false,editable:true,visibility:"personal",localOnly:true,
    title:s.title||String(sourceName||"Partitura"),kind:kind==="exercise"?"exercise":"music",
    sourceName:String(sourceName||s.title||"").slice(0,180),createdAt:now,updatedAt:now,
    fidelity:fidelity||{},score:s
  };
}
function idbOpen(){return new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error("indexeddb_unavailable"));const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("indexeddb_open_failed"))})}
async function idbAll(){const db=await idbOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
async function idbGet(id){const db=await idbOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
async function idbPut(item){const db=await idbOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(item);tx.oncomplete=()=>{db.close();resolve(item)};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function idbDelete(id){const db=await idbOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
function fallbackRead(){try{const v=JSON.parse(localStorage.getItem(FALLBACK_KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function fallbackWrite(items){try{localStorage.setItem(FALLBACK_KEY,JSON.stringify(items))}catch{}}
async function localAll(){try{return await idbAll()}catch{return fallbackRead()}}
async function localGet(id){try{return await idbGet(id)}catch{return fallbackRead().find(x=>x.id===id)||null}}
async function localPut(item){try{return await idbPut(item)}catch{const items=fallbackRead(),i=items.findIndex(x=>x.id===item.id);if(i>=0)items[i]=item;else items.push(item);fallbackWrite(items);return item}}
async function localDelete(id){try{return await idbDelete(id)}catch{fallbackWrite(fallbackRead().filter(x=>x.id!==id))}}

function mapRemote(row){
  return{
    id:row.id,remote:true,editable:Boolean(row.editable),visibility:row.visibility||"personal",
    localOnly:false,kind:row.kind||"music",title:row.title||"Partitura",
    sourceName:row.source_name||"",sourceType:row.source_type||"structured",
    createdAt:row.created_at,updatedAt:row.updated_at,publishedAt:row.published_at,
    fidelity:row.fidelity||{},score:row.score||null
  };
}
async function remoteList(){
  try{
    const body=await api("");
    lastRemoteError="";
    remoteCache=(body.items||[]).map(mapRemote);
    return remoteCache;
  }catch(error){
    lastRemoteError=error.message||"library_unavailable";
    return [];
  }
}
async function all(){
  const [remote,local]=await Promise.all([remoteList(),localAll()]);
  const remoteKeys=new Set(remote.map(x=>(x.kind||"music")+"|"+(x.title||"")+"|"+(x.sourceName||"")));
  const locals=local.map(x=>({...x,remote:false,localOnly:true,editable:true,visibility:"personal"})).filter(x=>!remoteKeys.has((x.kind||"music")+"|"+(x.title||"")+"|"+(x.sourceName||"")));
  return remote.concat(locals).sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
}
async function get(id){
  if(String(id||"").startsWith("local-"))return localGet(id);
  const cached=remoteCache.find(x=>x.id===id&&x.score);
  if(cached)return cached;
  try{
    const body=await api("?id="+encodeURIComponent(id));
    const item=mapRemote(body.item||{});
    const idx=remoteCache.findIndex(x=>x.id===id);
    if(idx>=0)remoteCache[idx]=item;else remoteCache.push(item);
    return item;
  }catch{return null}
}
async function remove(id){
  if(String(id||"").startsWith("local-")){await localDelete(id);return{ok:true,local:true}}
  await api("?id="+encodeURIComponent(id),{method:"DELETE"});
  remoteCache=remoteCache.filter(x=>x.id!==id);
  return{ok:true,local:false};
}
async function publish(score,sourceName,kind="music",scope="personal",fidelity){
  const s=Engine.normalizeScore(score);
  const report=fidelity||(Engine.auditScore?Engine.auditScore(s):null);
  if(report?.blocked)throw new Error("fidelity_blocked");
  if(scope==="global"&&!report?.canPublishGlobal)throw new Error("fidelity_blocked");
  const body={
    kind:kind==="exercise"?"exercise":"music",
    visibility:scope==="global"?"global":"personal",
    title:s.title||String(sourceName||"Partitura"),
    sourceName:String(sourceName||"").slice(0,220),
    score:s,
    fidelity:report||{}
  };
  try{
    await api("",{method:"POST",body:JSON.stringify(body)});
    await renderList();
    return{scope:body.visibility,remote:true};
  }catch(error){
    if(scope==="global"||error.message==="admin_required"||error.status===403)throw error;
    const item=localClean(s,sourceName,kind,report);
    const existing=await localGet(item.id);
    if(existing)item.createdAt=existing.createdAt||item.createdAt;
    await localPut(item);
    await renderList();
    return{scope:"personal",remote:false,localFallback:true};
  }
}
async function add(score,sourceName,kind="music"){return publish(score,sourceName,kind,"personal",Engine.auditScore?Engine.auditScore(score):null)}

function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function badgeHtml(item){
  if(item.visibility==="global")return'<span class="reading-library-badge global">Para todos</span>';
  if(item.localOnly)return'<span class="reading-library-badge local">Este dispositivo</span>';
  return'<span class="reading-library-badge personal">Pessoal</span>';
}
async function renderList(){
  const items=await all(),musics=items.filter(x=>(x.kind||"music")!=="exercise"),exercises=items.filter(x=>x.kind==="exercise");
  if(listEl){
    listEl.replaceChildren();emptyEl?.classList.toggle("hidden",musics.length>0);
    musics.forEach(item=>{
      const card=document.createElement("article");card.className="song-card reading-imported-card";
      const meter=Array.isArray(item.score?.meter)?item.score.meter.join("/"):"—";
      const bpm=item.score?.tempoBpm?Math.round(item.score.tempoBpm)+" BPM":item.fidelity?.score?("fidelidade "+item.fidelity.score+"%"):"partitura";
      card.innerHTML='<div class="song-icon">𝄞</div><div><h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(meter)+' · '+escapeHtml(bpm)+'</p><span class="reading-imported-source">Modo ao Vivo</span>'+badgeHtml(item)+'</div><div class="song-actions"><button type="button">Abrir na Leitura</button></div>';
      card.querySelector("button").addEventListener("click",()=>open(item.id));listEl.appendChild(card);
    });
  }
  if(exerciseListEl){
    exerciseListEl.replaceChildren();exerciseEmptyEl?.classList.toggle("hidden",exercises.length>0);
    exercises.forEach(item=>{
      const row=document.createElement("article");row.className="exercise-row reading-imported-card";
      const bpm=item.score?.tempoBpm?Math.round(item.score.tempoBpm)+" BPM":"importado";
      row.innerHTML='<div class="song-icon">𝄞</div><div><strong>'+escapeHtml(item.title)+'</strong><span>'+escapeHtml(bpm)+' · '+badgeHtml(item)+'</span></div><button type="button">Abrir exercício</button>';
      row.querySelector("button").addEventListener("click",()=>open(item.id));exerciseListEl.appendChild(row);
    });
  }
}
function clearTimers(){timers.forEach(clearTimeout);timers=[];playing=false;if(playBtn)playBtn.textContent="▶ Tocar"}
function bridge(){return window.LuwipiAudioBridge||null}
function render(){
  if(!current||!svg)return;
  Engine.render(svg,current.score,{currentGroupIndex:guide?currentGroup:-1});
  headingEl.textContent=current.title;titleEl.textContent=current.title;
  metaEl.textContent=(current.kind==="exercise"?"Exercício · ":"Música · ")+current.score.meter.join("/")+" · "+Math.round(tempo)+" BPM"+(current.visibility==="global"?" · Para todos":current.localOnly?" · Este dispositivo":" · Pessoal");
  tempoEl.textContent="♩ = "+Math.round(tempo);
  if(removeBtn){
    removeBtn.classList.toggle("hidden",!current.editable);
    removeBtn.textContent=current.visibility==="global"?"Remover da plataforma":"Remover da Leitura";
  }
  syncPianoTarget();
}
function syncPianoTarget(){
  const board=document.getElementById("pianoBoard");if(!board)return;
  board.querySelectorAll(".reading-library-target").forEach(k=>k.classList.remove("reading-library-target"));
  if(!guide||!groups[currentGroup])return;
  groups[currentGroup].pitches.forEach(midi=>{const note=Engine.midiToName(midi),key=board.querySelector('[data-piano-note="'+note+'"]');if(key)key.classList.add("reading-library-target")});
}
function openPiano(){const dock=document.getElementById("pianoDock");if(!dock)return;dock.classList.remove("hidden");document.body.classList.add("piano-open","reading-imported-open");syncPianoTarget()}
function closeImported(){clearTimers();document.body.classList.remove("reading-imported-open");current=null;groups=[];currentGroup=0;pianoSeen.clear()}
async function open(id){
  const item=await get(id);if(!item?.score)return;
  current=item;current.score=Engine.normalizeScore(item.score);groups=Engine.groupEvents(current.score);currentGroup=0;tempo=Math.round(current.score.tempoBpm||120);guide=false;pianoSeen.clear();
  guideBtn.setAttribute("aria-pressed","false");guideBtn.querySelector(".reading-guide-label").textContent="Guia · OFF";
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));view.classList.add("active");document.body.classList.add("reading-imported-open");render();scrollTo(0,0);
}
function play(){
  if(!current||playing)return;
  const audio=bridge();if(!audio||typeof audio.play!=="function")return;
  clearTimers();playing=true;playBtn.textContent="■ Parar";
  const events=Engine.performanceEvents?Engine.performanceEvents(current.score):current.score.events;
  const first=events[0]?.startBeat||0,firstMs=Engine.beatToMs?Engine.beatToMs(current.score,first,tempo):first*(60000/tempo),baseBeat=60000/tempo;
  events.forEach(e=>{
    const at=(Engine.beatToMs?Engine.beatToMs(current.score,e.startBeat,tempo):e.startBeat*baseBeat)-firstMs;
    const duration=Engine.durationToMs?Engine.durationToMs(current.score,e.startBeat,e.durationBeat,tempo):e.durationBeat*baseBeat;
    timers.push(setTimeout(()=>audio.play(e.note,Math.max(.03,duration/baseBeat),baseBeat,Math.max(.45,Math.min(1.05,e.velocity/92))),Math.max(0,at)));
  });
  if(guide)groups.forEach(g=>{
    const at=(Engine.beatToMs?Engine.beatToMs(current.score,g.startBeat,tempo):g.startBeat*baseBeat)-firstMs;
    timers.push(setTimeout(()=>{currentGroup=g.index;render()},Math.max(0,at)));
  });
  const end=Math.max(...events.map(e=>(Engine.beatToMs?Engine.beatToMs(current.score,e.startBeat+e.durationBeat,tempo):(e.startBeat+e.durationBeat)*baseBeat)-firstMs),0);
  timers.push(setTimeout(()=>{playing=false;playBtn.textContent="▶ Tocar";currentGroup=0;render()},Math.max(0,end)+100));
}

guideBtn?.addEventListener("click",()=>{guide=!guide;guideBtn.setAttribute("aria-pressed",String(guide));guideBtn.querySelector(".reading-guide-label").textContent=guide?"Guia · ON":"Guia · OFF";currentGroup=0;pianoSeen.clear();render()});
playBtn?.addEventListener("click",()=>playing?clearTimers():play());
pianoBtn?.addEventListener("click",openPiano);
tempoDown?.addEventListener("click",()=>{tempo=Math.max(30,tempo-4);render()});
tempoUp?.addEventListener("click",()=>{tempo=Math.min(240,tempo+4);render()});
removeBtn?.addEventListener("click",async()=>{if(!current||!current.editable)return;const id=current.id;try{await remove(id);closeImported();await renderList();document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById("readingView")?.classList.add("active")}catch(error){console.error("Reading removal failed",error)}});
document.querySelector('#readingImportedView [data-nav="reading"]')?.addEventListener("click",closeImported,{capture:true});
document.getElementById("pianoBoard")?.addEventListener("pointerdown",event=>{
  if(!view.classList.contains("active")||!guide||!current)return;
  const key=event.target.closest?.("[data-piano-note]");if(!key)return;
  const group=groups[currentGroup];if(!group)return;
  const midi=Engine.nameToMidi(key.dataset.pianoNote);if(!group.pitches.includes(midi))return;
  pianoSeen.add(midi);
  if(group.pitches.every(p=>pianoSeen.has(p))){pianoSeen.clear();currentGroup=Math.min(groups.length-1,currentGroup+1);setTimeout(render,0)}
},true);

window.addEventListener("luwipi:reading-library-change",renderList);
window.addEventListener("pagehide",clearTimers);
window.addEventListener("luwipi:access-ready",()=>{permissionCache=null;renderList()});
document.querySelectorAll('[data-nav="reading"]').forEach(button=>button.addEventListener("click",()=>setTimeout(renderList,0)));
setTimeout(renderList,1800);
setTimeout(renderList,5000);
window.LuwipiReadingLibrary=Object.freeze({add,publish,permissions,list:all,get,remove,render:renderList,open,lastRemoteError:()=>lastRemoteError});
renderList();
})();