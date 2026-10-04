(()=>{
'use strict';
const Engine=window.LuwipiScoreEngine;
const DB_NAME="luwipi-reading-library-v1",STORE="scores",FALLBACK_KEY="luwipi_reading_library_v1";
let remoteCache=[],permissionCache=null,lastRemoteError="",current=null,timers=[],playing=false,tempo=120;
const $=id=>document.getElementById(id),svg=$('readingImportedSvg'),view=$('readingImportedView');
function access(){
  try{return typeof LuwipiProductionAccess!=="undefined"?LuwipiProductionAccess:null}catch{return null}
}
async function token(){
  if(typeof window.LuwipiGetAccessToken==="function")return await window.LuwipiGetAccessToken();
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
  return hashString(JSON.stringify([kind||"music",score.source||"",score.tempoBpm,score.meter,score.keyFifths,score.events.map(e=>[e.midi,e.startBeat,e.durationBeat,e.velocity]),perf.map(e=>[e.midi,e.startBeat,e.durationBeat,e.velocity,e.pedal])]));
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
async function publish(score,sourceName,kind="music",scope="personal",fidelity,explicitTitle=""){
  const chosenTitle=String(explicitTitle||score?.title||"").trim().replace(/\s+/g," ").slice(0,160);
  const s=Engine.normalizeScore({...score,title:chosenTitle||score?.title||String(sourceName||"Partitura")});
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


function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function renderList(){
 const list=$('importedReadingList');list.replaceChildren();
 const items=(await all()).filter(item=>item.kind!=='exercise');
 $('importedReadingEmpty').hidden=items.length>0;
 for(const item of items){const card=document.createElement('article');card.className='song-card';card.innerHTML='<div><h3>'+escapeHtml(item.title)+'</h3><p>'+(item.visibility==='global'?'Para todos':item.localOnly?'Este dispositivo':'Pessoal')+'</p></div><button type="button">Abrir partitura</button>';card.querySelector('button').onclick=()=>open(item.id);list.append(card)}
 const perms=await permissions();$('scoreScopeLabel').hidden=!perms.canPublishGlobal;
}
function stop(){timers.forEach(clearTimeout);timers=[];playing=false;$('pianoBoard').querySelectorAll('.down').forEach(k=>k.classList.remove('down'));$('readingImportedPlay').textContent='▶ Tocar';svg.querySelectorAll('.reading-current-note').forEach(n=>n.classList.remove('reading-current-note'))}
function render(){
 Engine.render(svg,current.score,{});
 $('readingImportedTitle').textContent=current.title;$('readingImportedHeading').textContent=current.title;
 $('readingImportedMeta').textContent=current.score.meter.join('/')+' · Partitura';
 $('readingImportedTempo').textContent='♩ = '+tempo;$('readingImportedRemove').hidden=!current.editable;
}
function openShared(item){
 stop();current={...item,score:Engine.normalizeScore(item.score),editable:false};tempo=Math.round(current.score.tempoBpm);render();view.dataset.taskId=current.id||'';nav('readingImported');document.dispatchEvent(new CustomEvent('luwipi:score-open',{detail:{id:current.id}}));
}
async function open(id){const item=await get(id);if(!item?.score){$('scoreUploadStatus').textContent='Não foi possível abrir a partitura. Tenta novamente.';return}openShared(item);current.editable=item.editable;$('readingImportedRemove').hidden=!current.editable}
$('readingImportedPlay').onclick=()=>{
 if(playing){stop();return}if(!current)return;stop();playing=true;$('readingImportedPlay').textContent='■ Parar';
 const groups=Engine.groupEvents(current.score),bm=60000/tempo;
 const end=Math.max(...current.score.events.map(e=>e.startBeat+e.durationBeat));
 for(const [i,group] of groups.entries()){timers.push(setTimeout(()=>{
  Engine.render(svg,current.score,{currentGroupIndex:i});
  svg.querySelector('[data-group-index="'+i+'"]')?.scrollIntoView({block:'nearest',inline:'center'});
  for(const event of current.score.events.filter(e=>Math.abs(e.startBeat-group.startBeat)<.001)){
   const note=Engine.midiToName(event.midi);window.LuwipiAudioBridge?.play(note,event.durationBeat,bm,event.velocity/127);
   const key=$('pianoBoard').querySelector('[data-piano-note="'+note+'"]');key?.classList.add('down');if(key)timers.push(setTimeout(()=>key.classList.remove('down'),event.durationBeat*bm));
  }
 },group.startBeat*bm))}
 timers.push(setTimeout(stop,end*bm+200));
};
$('readingImportedTempoDown').onclick=()=>{stop();tempo=Math.max(30,tempo-4);render()};
$('readingImportedTempoUp').onclick=()=>{stop();tempo=Math.min(200,tempo+4);render()};
$('readingImportedPiano').onclick=()=>{const dock=$('pianoDock');dock.classList.toggle('hidden');document.body.classList.toggle('piano-open',!dock.classList.contains('hidden'))};
$('readingImportedRemove').onclick=async()=>{if(!current?.editable)return;try{await remove(current.id);nav('reading');await renderList()}catch{$('scoreUploadStatus').textContent='Não foi possível remover a partitura.'}};
$('scoreUploadForm').onsubmit=async event=>{
 event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;
 try{const file=$('scoreFiles').files[0];if(file.size>10*1024*1024)throw Error('O ficheiro deve ter até 10 MB.');let score;
 if(/\.mxl$/i.test(file.name))score=await Engine.parseMXL(await file.arrayBuffer());else if(/\.abc$/i.test(file.name))score=Engine.parseABC(await file.text());else score=Engine.parseMusicXML(await file.text());
 const result=await publish(score,file.name,'music',$('scoreGlobal').checked?'global':'personal',null,$('scoreUploadTitle').value);
 $('scoreUploadStatus').textContent=result.localFallback?'Guardada neste dispositivo. Não foi possível sincronizar com a conta.':'Partitura adicionada.';event.target.reset();
 }catch(error){$('scoreUploadStatus').textContent='Não foi possível adicionar: '+error.message}finally{button.disabled=false}
};
window.LuwipiReadingLibrary={all,get,open,openShared,publish,add,permissions,stop,current:()=>current};
window.addEventListener('luwipi:access-ready',()=>{permissionCache=null;void renderList()});
window.addEventListener('luwipi:access-signed-out',()=>{stop();current=null;remoteCache=[];permissionCache=null;$('importedReadingList').replaceChildren();$('scoreScopeLabel').hidden=true});
void renderList();
})();
