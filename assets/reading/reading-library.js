(function(){
"use strict";
const Engine=window.LuwipiScoreEngine;
if(!Engine)return;

const DB_NAME="luwipi-reading-library-v1";
const STORE="scores";
const FALLBACK_KEY="luwipi_reading_library_v1";

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

let current=null;
let groups=[];
let guide=false;
let currentGroup=0;
let tempo=120;
let timers=[];
let playing=false;
let pianoSeen=new Set();

function hashString(s){
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return(h>>>0).toString(36);
}
function fingerprint(score,kind){
  return hashString(JSON.stringify([kind||"music",
    score.title,
    score.tempoBpm,
    score.meter,
    score.events.map(e=>[e.midi,e.startBeat,e.durationBeat,e.velocity])
  ]));
}
function clean(score,sourceName,kind){
  const s=Engine.normalizeScore(score);
  return{
    id:(kind==="exercise"?"exercise-":"score-")+fingerprint(s,kind),
    title:s.title||String(sourceName||"Partitura"),
    kind:kind==="exercise"?"exercise":"music",
    sourceName:String(sourceName||s.title||"").slice(0,180),
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    score:s
  };
}
function idbOpen(){
  return new Promise((resolve,reject)=>{
    if(!window.indexedDB)return reject(new Error("indexeddb_unavailable"));
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error("indexeddb_open_failed"));
  });
}
async function idbAll(){
  const db=await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly");
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
  });
}
async function idbGet(id){
  const db=await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly");
    const req=tx.objectStore(STORE).get(id);
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
  });
}
async function idbPut(item){
  const db=await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete=()=>{db.close();resolve(item)};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function idbDelete(id){
  const db=await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
function fallbackRead(){
  try{
    const v=JSON.parse(localStorage.getItem(FALLBACK_KEY)||"[]");
    return Array.isArray(v)?v:[];
  }catch{return[]}
}
function fallbackWrite(items){
  localStorage.setItem(FALLBACK_KEY,JSON.stringify(items));
}
async function all(){try{return await idbAll()}catch{return fallbackRead()}}
async function get(id){try{return await idbGet(id)}catch{return fallbackRead().find(x=>x.id===id)||null}}
async function put(item){
  try{return await idbPut(item)}
  catch{
    const items=fallbackRead();
    const i=items.findIndex(x=>x.id===item.id);
    if(i>=0)items[i]=item;else items.push(item);
    fallbackWrite(items);
    return item;
  }
}
async function del(id){
  try{return await idbDelete(id)}
  catch{fallbackWrite(fallbackRead().filter(x=>x.id!==id))}
}
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
async function renderList(){
  const items=(await all()).sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
  const musics=items.filter(item=>(item.kind||"music")!=="exercise");
  const exercises=items.filter(item=>item.kind==="exercise");
  if(listEl){
    listEl.replaceChildren();
    emptyEl?.classList.toggle("hidden",musics.length>0);
    musics.forEach(item=>{
      const card=document.createElement("article");
      card.className="song-card reading-imported-card";
      const meter=Array.isArray(item.score?.meter)?item.score.meter.join("/"):"—";
      card.innerHTML='<div class="song-icon">𝄞</div><div><h3>'+escapeHtml(item.title||"Partitura")+'</h3><p>'+escapeHtml(meter)+' · '+Math.round(item.score?.tempoBpm||120)+' BPM</p><span class="reading-imported-source">Modo ao Vivo</span></div><div class="song-actions"><button type="button">Abrir na Leitura</button></div>';
      card.querySelector("button").addEventListener("click",()=>open(item.id));
      listEl.appendChild(card);
    });
  }
  if(exerciseListEl){
    exerciseListEl.replaceChildren();
    exerciseEmptyEl?.classList.toggle("hidden",exercises.length>0);
    exercises.forEach(item=>{
      const row=document.createElement("article");
      row.className="exercise-row reading-imported-card";
      row.innerHTML='<div class="song-icon">𝄞</div><div><strong>'+escapeHtml(item.title||"Exercício")+'</strong><span>'+escapeHtml(item.score?.meter?.join("/")||"—")+' · '+Math.round(item.score?.tempoBpm||120)+' BPM · importado</span></div><button type="button">Abrir exercício</button>';
      row.querySelector("button").addEventListener("click",()=>open(item.id));
      exerciseListEl.appendChild(row);
    });
  }
}
function clearTimers(){
  timers.forEach(clearTimeout);
  timers=[];
  playing=false;
  if(playBtn)playBtn.textContent="▶ Tocar";
}
function bridge(){return window.LuwipiAudioBridge||null}
function render(){
  if(!current||!svg)return;
  Engine.render(svg,current.score,{currentGroupIndex:guide?currentGroup:-1});
  headingEl.textContent=current.title;
  titleEl.textContent=current.title;
  metaEl.textContent=(current.kind==="exercise"?"Exercício · ":"Música · ")+current.score.meter.join("/")+" · "+Math.round(tempo)+" BPM";
  tempoEl.textContent="♩ = "+Math.round(tempo);
  syncPianoTarget();
}
function syncPianoTarget(){
  const board=document.getElementById("pianoBoard");
  if(!board)return;
  board.querySelectorAll(".reading-library-target").forEach(k=>k.classList.remove("reading-library-target"));
  if(!guide||!groups[currentGroup])return;
  groups[currentGroup].pitches.forEach(midi=>{
    const note=Engine.midiToName(midi);
    const key=board.querySelector('[data-piano-note="'+note+'"]');
    if(key)key.classList.add("reading-library-target");
  });
}
function openPiano(){
  const dock=document.getElementById("pianoDock");
  if(!dock)return;
  dock.classList.remove("hidden");
  document.body.classList.add("piano-open","reading-imported-open");
  syncPianoTarget();
}
function closeImported(){
  clearTimers();
  document.body.classList.remove("reading-imported-open");
  current=null;
  groups=[];
  currentGroup=0;
  pianoSeen.clear();
}
async function open(id){
  const item=await get(id);
  if(!item)return;
  current=item;
  current.score=Engine.normalizeScore(item.score);
  groups=Engine.groupEvents(current.score);
  currentGroup=0;
  tempo=Math.round(current.score.tempoBpm||120);
  guide=false;
  pianoSeen.clear();
  guideBtn.setAttribute("aria-pressed","false");
  guideBtn.querySelector(".reading-guide-label").textContent="Guia · OFF";
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  view.classList.add("active");
  document.body.classList.add("reading-imported-open");
  render();
  scrollTo(0,0);
}
function play(){
  if(!current||playing)return;
  const audio=bridge();
  if(!audio||typeof audio.play!=="function")return;
  clearTimers();
  playing=true;
  playBtn.textContent="■ Parar";
  const beatMs=60000/tempo;
  const events=Engine.performanceEvents?Engine.performanceEvents(current.score):current.score.events;
  const first=events[0]?.startBeat||0;
  events.forEach(e=>{
    timers.push(setTimeout(
      ()=>audio.play(e.note,e.durationBeat,beatMs,Math.max(.45,Math.min(1.05,e.velocity/92))),
      Math.max(0,(e.startBeat-first)*beatMs)
    ));
  });
  if(guide){
    groups.forEach(g=>{
      timers.push(setTimeout(()=>{
        currentGroup=g.index;
        render();
      },Math.max(0,(g.startBeat-first)*beatMs)));
    });
  }
  const end=Math.max(...events.map(e=>(e.startBeat-first+e.durationBeat)*beatMs),0);
  timers.push(setTimeout(()=>{
    playing=false;
    playBtn.textContent="▶ Tocar";
    currentGroup=0;
    render();
  },end+100));
}
async function add(score,sourceName,kind="music"){
  const item=clean(score,sourceName,kind);
  const existing=await get(item.id);
  if(existing)item.createdAt=existing.createdAt||item.createdAt;
  await put(item);
  await renderList();
  window.dispatchEvent(new CustomEvent("luwipi:reading-library-change",{detail:{id:item.id}}));
  return{id:item.id,existed:Boolean(existing)};
}

guideBtn?.addEventListener("click",()=>{
  guide=!guide;
  guideBtn.setAttribute("aria-pressed",String(guide));
  guideBtn.querySelector(".reading-guide-label").textContent=guide?"Guia · ON":"Guia · OFF";
  currentGroup=0;
  pianoSeen.clear();
  render();
});
playBtn?.addEventListener("click",()=>playing?clearTimers():play());
pianoBtn?.addEventListener("click",openPiano);
tempoDown?.addEventListener("click",()=>{tempo=Math.max(30,tempo-4);render()});
tempoUp?.addEventListener("click",()=>{tempo=Math.min(240,tempo+4);render()});
removeBtn?.addEventListener("click",async()=>{
  if(!current)return;
  const id=current.id;
  await del(id);
  closeImported();
  await renderList();
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("readingView")?.classList.add("active");
});
document.querySelector('#readingImportedView [data-nav="reading"]')?.addEventListener("click",closeImported,{capture:true});
document.getElementById("pianoBoard")?.addEventListener("pointerdown",event=>{
  if(!view.classList.contains("active")||!guide||!current)return;
  const key=event.target.closest?.("[data-piano-note]");
  if(!key)return;
  const group=groups[currentGroup];
  if(!group)return;
  const midi=Engine.nameToMidi(key.dataset.pianoNote);
  if(!group.pitches.includes(midi))return;
  pianoSeen.add(midi);
  if(group.pitches.every(p=>pianoSeen.has(p))){
    pianoSeen.clear();
    currentGroup=Math.min(groups.length-1,currentGroup+1);
    setTimeout(render,0);
  }
},true);

window.addEventListener("luwipi:reading-library-change",renderList);
window.addEventListener("pagehide",clearTimers);
window.LuwipiReadingLibrary=Object.freeze({add,list:all,get,remove:del,render:renderList,open});
renderList();
})();