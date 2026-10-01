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
const reader=view?.querySelector('.reader-top'),hint=document.getElementById('readingImportedHint');
const category=reader?.querySelector('small');
const lessonPanel=document.createElement('div');lessonPanel.className='reading-lesson-panel';lessonPanel.hidden=true;
const lessonStart=document.createElement('button');lessonStart.type='button';lessonStart.id='readingLessonStart';lessonStart.textContent='Começar exercício';
const lessonStatus=document.createElement('span');lessonStatus.id='readingLessonStatus';lessonStatus.setAttribute('role','status');
const lessonMidi=document.createElement('button');lessonMidi.type='button';lessonMidi.id='readingLessonMidi';lessonMidi.textContent='Ligar MIDI';
lessonPanel.append(lessonStart,lessonStatus,lessonMidi);
view?.querySelector('.reading-imported-transport')?.prepend(lessonPanel);
const LESSON_STORAGE='luwipi:reading:lesson:v1';
let lesson=null,lessonTimer=null,lessonMidiOff=null;
function lessonSave(){
 if(!lesson)return;
 try{sessionStorage.setItem(LESSON_STORAGE,JSON.stringify({version:1,at:Date.now(),score:current.score,options:lesson.options,index:lesson.index,attempts:lesson.attempts,correct:lesson.correct}))}catch{}
}
function lessonStopTimer(){if(lessonTimer!==null){clearInterval(lessonTimer);lessonTimer=null}}
function resetLesson(){
 view?.classList.remove('reading-curriculum-lesson');
 lessonStopTimer();lessonMidiOff?.();lessonMidiOff=null;lesson=null;lessonPanel.hidden=true;
 playBtn.disabled=false;guideBtn.disabled=false;pianoBtn.hidden=false;
 if(hint)hint.textContent='Adicionada a partir da Prática.';
 if(category)category.textContent='Biblioteca pessoal';
}

let current=null,groups=[],guide=false,currentGroup=0,tempo=120,timers=[],playing=false,pianoSeen=new Set();
let remoteCache=[],permissionCache=null,lastRemoteError="";

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
      card.innerHTML='<div class="song-icon">𝄞</div><div><h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(meter)+' · '+escapeHtml(bpm)+'</p><span class="reading-imported-source">Prática</span>'+badgeHtml(item)+'</div><div class="song-actions"><button type="button">Abrir na Leitura</button></div>';
      card.querySelector("button").dataset.readingId=item.id;
      card.querySelector("button").addEventListener("click",()=>open(item.id));listEl.appendChild(card);
    });
  }
  if(exerciseListEl){
    exerciseListEl.replaceChildren();exerciseEmptyEl?.classList.toggle("hidden",exercises.length>0);
    document.getElementById("importedExerciseSection")?.classList.toggle("hidden",exercises.length===0);
    exercises.forEach(item=>{
      const row=document.createElement("article");row.className="exercise-row reading-imported-card";
      const bpm=item.score?.tempoBpm?Math.round(item.score.tempoBpm)+" BPM":"importado";
      row.innerHTML='<div class="song-icon">𝄞</div><div><strong>'+escapeHtml(item.title)+'</strong><span>'+escapeHtml(bpm)+' · '+badgeHtml(item)+'</span></div><button type="button">Abrir exercício</button>';
      row.querySelector("button").dataset.readingId=item.id;
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
  if(lesson)lessonStatus.textContent=lesson.status;
  syncPianoTarget();
}
function syncPianoTarget(){
  const board=document.getElementById("pianoBoard");if(!board)return;
  board.querySelectorAll(".reading-library-target").forEach(k=>k.classList.remove("reading-library-target"));
  if(!guide||!groups[currentGroup])return;
  groups[currentGroup].pitches.forEach(midi=>{const note=Engine.midiToName(midi),key=board.querySelector('[data-piano-note="'+note+'"]');if(key)key.classList.add("reading-library-target")});
}
function openPiano(){const dock=document.getElementById("pianoDock");if(!dock)return;dock.classList.remove("hidden");document.body.classList.add("piano-open","reading-imported-open");syncPianoTarget()}
function closeImported(){
 clearTimers();resetLesson();document.body.classList.remove("reading-imported-open");
 current=null;groups=[];currentGroup=0;pianoSeen.clear();
}
function lessonMessage(text){if(lesson){lesson.status=text;lessonStatus.textContent=text}}
function beginLesson(){
 if(!lesson||lesson.remaining>0)return;
 clearTimers();lesson.started=true;lesson.done=false;lesson.index=0;lesson.attempts=0;lesson.correct=0;
 lesson.pressed.clear();lessonStart.disabled=true;lessonStart.textContent='Em curso';
 currentGroup=0;
 lessonMessage('Toca a partitura no piano. '+(lesson.options.firstSight?'Continua mesmo que te enganes.':'Segue as notas, uma de cada vez.'));
 lessonSave();render();
}
function lessonNote(midi){
 if(!lesson?.started||lesson.done||!view.classList.contains('active')||!Number.isInteger(midi))return;
 const group=lesson.expected[lesson.index];if(!group)return;
 if(!group.pitches.includes(midi)){
  lesson.attempts++;
  lessonMessage(lesson.options.firstSight?'Nota diferente. Continua a leitura sem voltares atrás.':'Nota diferente. Experimenta novamente.');
  if(lesson.options.firstSight){lesson.index++;lesson.pressed.clear();currentGroup=lesson.index}
 }else{
  lesson.pressed.add(midi);
  if(group.pitches.every(p=>lesson.pressed.has(p))){
   lesson.correct++;lesson.attempts++;lesson.index++;lesson.pressed.clear();currentGroup=lesson.index;
   lessonMessage('Correto · '+Math.min(lesson.index,lesson.expected.length)+' / '+lesson.expected.length+' grupos.');
  }else lessonMessage('Continua o acorde.');
 }
 if(lesson.index>=lesson.expected.length){
  lesson.started=false;lesson.done=true;lessonStart.disabled=false;lessonStart.textContent='Repetir exercício';
  lessonMessage('Exercício concluído · '+lesson.correct+' / '+lesson.attempts+' respostas corretas. Podes rever o resultado em Aprender partitura.');
  window.dispatchEvent(new CustomEvent('luwipi:pedagogy-measured',{detail:{
   exerciseId:lesson.options.exerciseId,bpm:tempo,input:lesson.input||'virtual',
   observedClient:true,correctGroups:lesson.correct,attemptedGroups:lesson.attempts,
   rhythmWithinTolerance:0,rhythmSamples:0
  }}));
 }
 lessonSave();if(guide&&!lesson.options.firstSight)render();
}
lessonStart.addEventListener('click',beginLesson);
lessonMidi.addEventListener('click',async()=>{
 if(!lesson||!window.LuwipiLiveInput)return;
 try{
  const result=await window.LuwipiLiveInput.connectMIDI();
  lessonMidiOff?.();lessonMidiOff=window.LuwipiLiveInput.subscribe(data=>{
   if(data?.type==='noteon'){if(lesson)lesson.input='midi';lessonNote(data.midi)}
  });
  lessonMessage(result.count?'MIDI ligado · '+result.count+' teclado(s).':'Nenhum teclado MIDI encontrado.');
 }catch{lessonMessage('Não foi possível ligar o teclado MIDI. Podes usar o piano no ecrã.')}
});
window.addEventListener('luwipi:piano-note',e=>{if(e.detail?.phase==='on')lessonNote(e.detail.midi)});
function openLesson(rawScore,options={},restoring=false){
 if(!rawScore?.events?.length||!options.exerciseId)return false;
 try{
  const score=Engine.normalizeScore(rawScore),next=Engine.groupEvents(score);
  if(!next.length)return false;
  clearTimers();resetLesson();
  current={id:'lesson:'+options.exerciseId,title:score.title,kind:'exercise',score,editable:false,visibility:'curriculum'};
  groups=next;currentGroup=0;tempo=Math.round(score.tempoBpm||120);guide=false;pianoSeen.clear();
  const firstSight=Boolean(options.firstSight),transposed=Number(options.transposeSemitones)||0;
  const byVoice=options.transposeByVoice&&typeof options.transposeByVoice==='object'?options.transposeByVoice:null;
  const expectedScore=transposed||byVoice?Engine.normalizeScore({...score,events:score.events.map(e=>{
   const voice=String(e.id).split('-')[0];
   const shift=byVoice&&Object.hasOwn(byVoice,voice)?Number(byVoice[voice]):transposed;
   return {...e,midi:Math.max(0,Math.min(127,e.midi+(Number.isFinite(shift)?shift:0)))}
  })}):score;
  const expected=Engine.groupEvents(expectedScore);
  lesson={options:{...options,firstSight},expected,pressed:new Set(),
   remaining:firstSight?30:0,index:0,attempts:0,correct:0,started:false,done:false,
   input:'virtual',status:firstSight?'Observa a partitura: 30 segundos antes de começar.':'A partitura está pronta. Carrega em Começar exercício.'};
  view.classList.add('reading-curriculum-lesson');
  lessonPanel.hidden=false;lessonStart.disabled=firstSight;
  lessonStart.textContent=firstSight?'Preparação · 30 s':'Começar exercício';
  if(category)category.textContent='Aprender partitura · N'+(options.level??0);
  if(hint)hint.textContent=options.instruction||'Lê e toca no piano. A partitura é a atividade.';
  guideBtn.setAttribute('aria-pressed','false');guideBtn.querySelector('.reading-guide-label').textContent='Guia · OFF';
  guideBtn.disabled=firstSight||!!transposed||!!byVoice;
  playBtn.disabled=firstSight||!!transposed||!!byVoice;
  pianoBtn.hidden=true;view.dataset.taskId=current.id;
  render();if(!svg?.childElementCount)throw Error('Partitura vazia');
  if(firstSight)lessonTimer=setInterval(()=>{
   if(!lesson)return;lesson.remaining=Math.max(0,lesson.remaining-1);
   if(lesson.remaining){lessonStart.textContent='Preparação · '+lesson.remaining+' s';lessonMessage('Observa a clave, o compasso e os padrões: '+lesson.remaining+' s.')}
   else{lessonStopTimer();lessonStart.disabled=false;lessonStart.textContent='Começar leitura';lessonMessage('Preparação concluída. Começa a ler sem ouvir primeiro.')}
  },1000);
  if(restoring){
   // Route restore already selected the Leitura view, so never push another history entry.
   document.querySelectorAll('.workspace-canvas-viewport>.view.active').forEach(v=>v.classList.remove('active'));
   view.classList.add('active');
  }else if(window.LuwipiWorkspaceRouter?.openLesson)window.LuwipiWorkspaceRouter.openLesson(current.id);
  else{document.querySelectorAll('.workspace-canvas-viewport>.view.active').forEach(v=>v.classList.remove('active'));view.classList.add('active')}
  document.body.classList.add('reading-imported-open');
  window.LuwipiWorkspacePiano?.show();
  lessonSave();return true;
 }catch(error){
  console.error('Não foi possível abrir a Leitura do nível',error);
  resetLesson();return false;
 }
}
async function open(id){
  if(String(id).startsWith('lesson:')){
   let saved;try{saved=JSON.parse(sessionStorage.getItem(LESSON_STORAGE)||'null')}catch{return false}
   if(saved?.version!==1||'lesson:'+saved.options?.exerciseId!==id||Date.now()-saved.at>86400000)return false;
   return openLesson(saved.score,saved.options,true);
  }
  resetLesson();
  const item=await get(id);if(!item?.score)return;
  view.dataset.taskId=id;
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
function openShared(item){
  if(!item?.score)return;
  resetLesson();
  current={...item,id:"shared-task",editable:false,localOnly:false,visibility:"task"};
  current.score=Engine.normalizeScore(current.score);groups=Engine.groupEvents(current.score);currentGroup=0;tempo=Math.round(current.score.tempoBpm||120);guide=false;pianoSeen.clear();
  guideBtn.setAttribute("aria-pressed","false");guideBtn.querySelector(".reading-guide-label").textContent="Guia · OFF";
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));view.classList.add("active");document.body.classList.add("reading-imported-open","parent-mode");render();scrollTo(0,0);
}
window.LuwipiReadingLibrary=Object.freeze({add,publish,permissions,list:all,get,remove,render:renderList,open,openLesson,openShared,lastRemoteError:()=>lastRemoteError});
renderList();
})();
