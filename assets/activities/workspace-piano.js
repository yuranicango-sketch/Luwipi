/* One persistent piano surface; existing musical engines retain their own event handlers. */
(()=>{
'use strict';
const canvas=document.getElementById('workspaceCanvas'),host=document.getElementById('workspacePiano'),body=document.getElementById('workspacePianoBody'),toggle=document.getElementById('workspacePianoToggle');
const viewport=canvas?.querySelector('.workspace-canvas-viewport');
const journey=document.querySelector('#readingStage .journey-keyboard'),midi=document.querySelector('#karaokeView .karaoke-piano-shell'),legacy=document.getElementById('pianoDock');
if(!canvas||!host||!body||!toggle||!viewport)return;
const scoreViews=new Set(['readingView','exerciseView','songView','readingImportedView','noteFlowView','karaokeView','liveModeView']);
let current=null,lastView='',collapsed=false,scheduled=false;
const adapters=new Map();
try{collapsed=sessionStorage.getItem('luwipi:workspace-piano-collapsed')==='1'}catch{}
function active(){return viewport.querySelector('.view.active')}
function select(view){
 if(!view||canvas.dataset.library==='reading')return null;
 const custom=[...adapters.values()].find(adapter=>adapter.views.includes(view.id));if(custom)return custom.element;
 if(!scoreViews.has(view.id))return null;
 if(['karaokeView','readingView','liveModeView'].includes(view.id))return midi||journey;
 if(['songView','exerciseView','readingImportedView','noteFlowView'].includes(view.id)&&legacy&&!legacy.classList.contains('hidden')&&legacy.querySelector('[data-piano-note]'))return legacy;
 return midi||journey;
}
function update(){
 scheduled=false;
 const view=active(),wanted=select(view);
 if(!wanted){
  host.hidden=true;host.dataset.source='none';return;
 }
 host.hidden=false;
 const source=wanted===midi?'midi':wanted===legacy?'legacy':'journey';
 if(current!==wanted||wanted.parentElement!==body){
  body.replaceChildren(wanted);
  current=wanted;
 }
 host.dataset.source=source;
 const viewId=view?.id||'';
 if(lastView!==viewId){
  if(current===midi)midi.querySelectorAll('[data-midi]').forEach(key=>key.classList.remove('target'));
  lastView=viewId;
 }
 host.classList.toggle('collapsed',collapsed);
 body.hidden=collapsed;
 toggle.textContent=collapsed?'⌃':'⌄';
 toggle.setAttribute('aria-label',collapsed?'Mostrar piano':'Recolher piano');
 toggle.setAttribute('title',collapsed?'Mostrar piano':'Recolher piano');
 toggle.setAttribute('aria-expanded',String(!collapsed));
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(update)}
toggle.addEventListener('click',()=>{
 collapsed=!collapsed;
 try{sessionStorage.setItem('luwipi:workspace-piano-collapsed',collapsed?'1':'0')}catch{}
 schedule();window.dispatchEvent(new CustomEvent('luwipi:piano-visibility',{detail:{collapsed}}));
});
/* Future games can reuse the slot without constructing another piano. */
window.LuwipiWorkspacePiano=Object.freeze({
 get collapsed(){return collapsed},
 get available(){return !host.hidden},
 get element(){return current},
 register(name,element,{views=[]}={}){
  if(typeof name!=='string'||!name||!(element instanceof Element)||!Array.isArray(views))throw new TypeError('Invalid piano adapter');
  adapters.set(name,{element,views});schedule();
  return()=>{adapters.delete(name);schedule()};
 },
 show(){collapsed=false;schedule()},
 hide(){collapsed=true;schedule()},
 toggle(){toggle.click()},
 refresh:schedule,
 subscribe(fn){if(typeof fn!=='function')return()=>{};const listener=e=>fn(e.detail);window.addEventListener('luwipi:piano-note',listener);return()=>window.removeEventListener('luwipi:piano-note',listener)},
 emit(midi,phase='on'){window.dispatchEvent(new CustomEvent('luwipi:piano-note',{detail:{midi:Number(midi),phase}}))}
});
new MutationObserver(schedule).observe(viewport,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
if(legacy)new MutationObserver(schedule).observe(legacy,{attributes:true,attributeFilter:['class']});
document.addEventListener('click',event=>{
 if(event.target.closest('[data-nav],[data-workspace-nav],[data-workspace-action],#karaokeLead,#songPianoToggle'))schedule()
},true);
body.addEventListener('pointerdown',event=>{
 const key=event.target.closest('[data-piano-note]');if(!key)return;
 const midi=window.LuwipiScoreEngine?.nameToMidi(key.dataset.pianoNote);
 if(Number.isFinite(midi))window.LuwipiWorkspacePiano.emit(midi,'on');
});
for(const eventName of ['pointerup','pointercancel']){
 body.addEventListener(eventName,event=>{
  const key=event.target.closest('[data-piano-note]');if(!key)return;
  const midi=window.LuwipiScoreEngine?.nameToMidi(key.dataset.pianoNote);
  if(Number.isFinite(midi))window.LuwipiWorkspacePiano.emit(midi,'off');
 });
}
window.addEventListener('luwipi:piano-light',event=>{
 if(host.hidden||current!==midi)return;
 const score=event.detail?.notes||[];
 const engine=window.LuwipiScoreEngine;
 const target=new Set(score.map(n=>typeof n==='number'?n:engine?.nameToMidi?.(n)).filter(Number.isFinite));
 midi.querySelectorAll('[data-midi]').forEach(key=>key.classList.toggle('target',target.has(Number(key.dataset.midi))));
});
window.addEventListener('resize',schedule,{passive:true});
schedule();
})();