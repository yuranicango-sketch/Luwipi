(()=>{
"use strict";
const canvas=document.getElementById("workspaceCanvas"),viewport=canvas?.querySelector(".workspace-canvas-viewport");
if(!canvas||!viewport)return;
const query=new URLSearchParams(location.search);
if(query.get("parent")==="1"||["karaoke","exercise","song"].includes(query.get("type")))return;
const roots={reading:"readingView",diagnostic:"diagnosticView",midi:"karaokeView",practice:"liveModeView",games:"gamesView",rhythm:"rhythmView"};
const child={exerciseView:"reading",songView:"reading",noteFlowView:"reading",readingImportedView:"reading",rhythmReadView:"rhythm",rhythmSongView:"rhythm",pulseView:"rhythm",attackView:"rhythm",durationView:"rhythm",gameView:"games"};
const storage="luwipi:workspace:route:v2",scrollKey="luwipi:workspace:scroll:v1",active=()=>viewport.querySelector(".view.active");
const scrollSelectors=[".page",".reading-library",".karaoke-rail","#karaokeStaff",".live-sidebar",".score-wrap",".live-svg-wrap",".rhythm-menu"];
const scrollName=s=>[s.section||"reading",s.activity||"",s.library?"library":"normal"].join("|");
function scrollNodes(){const view=active();return view?[view,...scrollSelectors.map(sel=>view.querySelector(sel)).filter(Boolean)]:[]}
function remember(){
 if(!booted||restoring)return;
 try{
  const saved=JSON.parse(sessionStorage.getItem(scrollKey)||"{}");
  saved[scrollName(state)]={positions:scrollNodes().map((el,index)=>({index,top:el.scrollTop,left:el.scrollLeft})).filter(p=>p.top>0||p.left>0),at:Date.now()};
  sessionStorage.setItem(scrollKey,JSON.stringify(Object.fromEntries(Object.entries(saved).sort((a,b)=>b[1].at-a[1].at).slice(0,20))));
 }catch{}
}
function recall(s){
 const key=scrollName(s);
 const apply=()=>{
  if(scrollName(state)!==key)return;
  let saved;try{saved=JSON.parse(sessionStorage.getItem(scrollKey)||"{}")[key]}catch{}
  if(!saved)return;
  const nodes=scrollNodes();saved.positions.forEach(p=>{const el=nodes[p.index];if(el){el.scrollTop=p.top;el.scrollLeft=p.left}});
 };
 requestAnimationFrame(()=>requestAnimationFrame(apply));setTimeout(apply,280);
}
let scrollTimer=0;
viewport.addEventListener("scroll",()=>{if(!booted||restoring)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(remember,120)},{capture:true,passive:true});
window.addEventListener("pagehide",remember);
let state={section:"reading"},restoring=true,booted=false,last="",intent="",queued=false;
function section(id){if(id==="homeView")return null;return Object.keys(roots).find(k=>roots[k]===id)||child[id]||null}
function readStored(){try{const s=JSON.parse(sessionStorage.getItem(storage)||"null");return roots[s?.section]?s:null}catch{return null}}
function parse(fallback){
 const q=new URLSearchParams(location.search),section=roots[q.get("section")]?q.get("section"):q.get("open")==="games"?"games":fallback?.section||"reading";
 const s={section};for(const k of ["activity","song","version","ex","hand","level","game","rhythmSong","readingId","midi"]){const v=q.get(k)||(q.has("section")?null:fallback?.[k]);if(v&&v.length<80)s[k]=v}
 if(q.get("library")==="1"||(!q.has("section")&&fallback?.library))s.library=true;
 if(s.activity&&child[s.activity]!==section)delete s.activity;
 return s;
}
function path(s){
 const u=new URL(location.href);for(const k of ["open","section","activity","song","version","ex","hand","level","game","rhythmSong","readingId","midi","library"])u.searchParams.delete(k);
 u.searchParams.set("section",s.section);
 for(const k of ["activity","song","version","ex","hand","level","game","rhythmSong","readingId","midi"])if(s[k])u.searchParams.set(k,String(s[k]).slice(0,80));
 if(s.library)u.searchParams.set("library","1");
 return u.pathname+u.search+u.hash;
}
function persist(s,method="replace"){
 state={...s};try{sessionStorage.setItem(storage,JSON.stringify(s))}catch{}
 const dest=path(s),current=location.pathname+location.search+location.hash;
 if(dest!==current)history[method==="push"?"pushState":"replaceState"]({...history.state,workspace:s},"",dest);
}
function activate(id){const wanted=document.getElementById(id);if(!wanted)return false;viewport.querySelectorAll(".view.active").forEach(v=>{if(v!==wanted)v.classList.remove("active")});wanted.classList.add("active");return true}
function clearLibrary(){canvas.dataset.library="";document.getElementById("readingView")?.classList.remove("workspace-library-open")}
function navigate(sectionName,push=true,library=false){
 if(!roots[sectionName])return;
 remember();restoring=true;clearLibrary();activate(roots[sectionName]);
 if(library&&sectionName==="reading"){canvas.dataset.library="reading";document.getElementById("readingView")?.classList.add("workspace-library-open")}
 const s={section:sectionName,...(library?{library:true}:{})};persist(s,push?"push":"replace");last=roots[sectionName];restoring=false;
 document.querySelector("#experienceMenu:not(.hidden) [data-experience-close]")?.click();window.dispatchEvent(new CustomEvent("luwipi:workspace-route",{detail:{...state}}));window.scrollTo(0,0);
}
function select(selector){const node=document.querySelector(selector);if(!node)return false;node.click();return true}
let pendingReadingId="";
function restoreReadingItem(id){
 const library=window.LuwipiReadingLibrary;
 if(!id||!library?.open||pendingReadingId===id)return;
 pendingReadingId=id;
 Promise.resolve(library.open(id)).then(()=>{
  if(state.readingId===id&&active()?.id==="readingImportedView")recall(state);
 }).catch(()=>{}).finally(()=>{if(pendingReadingId===id)pendingReadingId=""});
}
function replay(s){
 if(s.section==="reading"&&s.activity==="songView"&&s.song){
  if(select('[data-song="'+CSS.escape(s.song)+'"]'+(s.version?'[data-version="'+CSS.escape(s.version)+'"]':"")))return;
 }
 if(s.section==="reading"&&s.activity==="exerciseView"&&s.ex){
  if(s.hand)select('[data-hand="'+CSS.escape(s.hand)+'"]');
  if(s.level)select('[data-reading-level="'+CSS.escape(s.level)+'"]');
  if(select('[data-ex="'+CSS.escape(s.ex)+'"]'))return;
 }
 if(s.section==="games"&&s.activity==="gameView"&&s.game){
  if(select('[data-game="'+CSS.escape(s.game)+'"]'))return;
 }
 if(s.section==="rhythm"&&s.activity==="rhythmSongView"&&s.rhythmSong){
  if(select('[data-rhythm-song="'+CSS.escape(s.rhythmSong)+'"]'))return;
 }
 if(s.section==="reading"&&s.activity==="readingImportedView"&&s.readingId){restoreReadingItem(s.readingId);return}
 const generic={noteFlowView:"noteFlow",rhythmReadView:"rhythmRead",pulseView:"pulse",attackView:"attack",durationView:"duration"};
 if(generic[s.activity]&&select('[data-nav="'+generic[s.activity]+'"]'))return;
}
function restore(s,normalize=true){
 if(!roots[s.section])s={section:"reading"};
 restoring=true;clearLibrary();activate(roots[s.section]);
 if(s.section==="reading"&&s.library){canvas.dataset.library="reading";document.getElementById("readingView")?.classList.add("workspace-library-open")}
 else if(s.activity)replay(s);
 last=active()?.id||roots[s.section];state={...s};restoring=false;
 recall(s);
 if(normalize)persist(s);
 if(s.section==="midi"&&s.midi)window.dispatchEvent(new CustomEvent("luwipi:restore-midi",{detail:{id:s.midi}}));window.dispatchEvent(new CustomEvent("luwipi:workspace-route",{detail:{...state}}));
}
function sync(){
 queued=false;if(!booted||restoring)return;
 const v=active();if(!v||v.id==="homeView"){restore({...state});return}
 const mode=section(v.id);if(!mode)return;
 const library=mode==="reading"&&canvas.dataset.library==="reading";
 if(v.id===last&&Boolean(state.library)===library&&!intent)return;
 const next={section:mode};
 if(library)next.library=true;
 else if(v.id!==roots[mode]){
  next.activity=v.id;
  if(state.activity===v.id||intent==="detail")for(const k of ["song","version","ex","hand","level","game","rhythmSong","readingId"])if(state[k])next[k]=state[k];
 }
 if(mode==="midi"&&state.midi)next.midi=state.midi;
 persist(next,["push","detail"].includes(intent)?"push":"replace");last=v.id;intent="";window.dispatchEvent(new CustomEvent("luwipi:workspace-route",{detail:{...state}}));
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(sync)}}
viewport.querySelectorAll(".view").forEach(v=>new MutationObserver(schedule).observe(v,{attributes:true,attributeFilter:["class"]}));
new MutationObserver(schedule).observe(canvas,{attributes:true,attributeFilter:["data-library"]});
/* Navigation is handled before legacy onclick handlers, which otherwise reopen homeView. */
const navAliases={home:"reading",live:"practice",karaoke:"midi",reading:"reading",practice:"practice",midi:"midi",games:"games",rhythm:"rhythm",diagnostic:"diagnostic"};
function previous(){
 if(active()?.id==="diagnosticView"){navigate("reading",true,true);return}
 if(state.activity){navigate(state.section,true,state.section==="reading");return}
 if(state.library){navigate("reading");return}
 navigate("reading");
}
document.addEventListener("click",event=>{
 if(!booted||restoring)return;
 const button=event.target.closest("button,a");if(!button)return;
 const menu=button.closest("[data-experience-nav]"),side=button.closest("[data-workspace-nav]"),legacy=button.closest("[data-nav]"),home=button.closest("[data-home-path]");
 const key=menu?.dataset.experienceNav||side?.dataset.workspaceNav||legacy?.dataset.nav||home?.dataset.homePath;
 if(menu&&key==="back"){
  event.preventDefault();event.stopImmediatePropagation();previous();return;
 }
 if(key&&Object.hasOwn(navAliases,key)){
  const nestedBack=Boolean(legacy&&legacy.classList.contains("back")&&active()?.id!==roots[navAliases[key]]);
  event.preventDefault();event.stopImmediatePropagation();
  navigate(navAliases[key],true,nestedBack&&navAliases[key]==="reading");
  return;
 }
 if(button.closest("[data-karaoke-open]")){
  event.preventDefault();event.stopImmediatePropagation();navigate("midi");return;
 }
 if(button.closest('[data-library-toggle]')){
  event.preventDefault();event.stopImmediatePropagation();
  navigate("reading",true,canvas.dataset.library!=="reading");
  return;
 }
 if(button.closest('[data-workspace-action="library"]')){
  /* The shared shell opens and closes the same canonical library route. */
  intent="push";return;
 }
 const selection=button.closest("[data-reading-id],[data-song],[data-game],[data-rhythm-song],[data-ex],[data-hand],[data-reading-level]");
 if(selection){
  const next={...state};
  for(const [attr,key] of [["data-reading-id","readingId"],["data-song","song"],["data-game","game"],["data-rhythm-song","rhythmSong"],["data-ex","ex"],["data-hand","hand"],["data-reading-level","level"]]){
   if(selection.hasAttribute(attr))next[key]=String(selection.getAttribute(attr)).slice(0,75);
  }
  if(selection.hasAttribute("data-reading-id")){next.activity="readingImportedView";delete next.song;delete next.ex}
  else if(selection.hasAttribute("data-song")){delete next.readingId;
   next.version=selection.dataset.version||"right";next.activity="songView";
  }else if(selection.hasAttribute("data-ex"))next.activity="exerciseView";
  else if(selection.hasAttribute("data-game"))next.activity="gameView";
  else if(selection.hasAttribute("data-rhythm-song"))next.activity="rhythmSongView";
  state=next;intent="detail";
 }
},true);
window.addEventListener("popstate",()=>restore(parse(null),false));
window.LuwipiWorkspaceRouter=Object.freeze({go:navigate,back:previous,current:()=>({...state}),setMidi(id){if(id&&typeof id==="string"){state.midi=id;if(section(active()?.id)==="midi")persist(state)}},clearMidi(){delete state.midi;if(section(active()?.id)==="midi")persist(state)}});
function start(){if(booted)return;booted=true;restore(query.has("section")||query.has("open")?parse(null):readStored()||{section:"reading"});schedule()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.addEventListener("luwipi:core-ready",()=>{
 if(!booted)return;
 if(active()?.id==="homeView"){restore({...state});return}
 if(state.activity&&active()?.id===roots[state.section]){restoring=true;replay(state);restoring=false;last=active()?.id||roots[state.section];recall(state)}
},{once:true});
window.addEventListener("luwipi:access-ready",()=>{
 if(!booted)return;
 if(state.activity==="readingImportedView"&&state.readingId&&active()?.id!=="readingImportedView")restoreReadingItem(state.readingId);
 if(state.section==="midi"&&state.midi&&active()?.id==="karaokeView"){
  window.dispatchEvent(new CustomEvent("luwipi:restore-midi",{detail:{id:state.midi}}));
 }
});
window.addEventListener("pageshow",event=>{if(!booted)start();else if(event.persisted)schedule()});
})();