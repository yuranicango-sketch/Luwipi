(()=>{
 'use strict';
 const dock=document.getElementById('pianoDock'),exit=document.getElementById('pianoFullscreenExit');
 let active=false,returnFocus=null,pianoWasHidden=false;
 const buttons=[],blocked=[];
 const scroll=dock.querySelector('.piano-scroll');
 function blockOtherControls(){
  for(let node=dock;node.parentElement;node=node.parentElement){
   for(const sibling of node.parentElement.children){if(sibling===node||sibling.inert||['SCRIPT','STYLE','LINK'].includes(sibling.tagName))continue;blocked.push(sibling);sibling.inert=true}
  }
 }
 function restoreControls(){for(const node of blocked.splice(0))node.inert=false}

 function center(){
  const scroll=dock.querySelector('.piano-scroll'),key=dock.querySelector('[data-piano-note="C4"]');
  if(key)scroll.scrollLeft=Math.max(0,key.offsetLeft-scroll.clientWidth/2+key.offsetWidth/2);
 }
 function sync(){
  dock.classList.toggle('piano-fullscreen',active);
  document.body.classList.toggle('piano-fullscreen-open',active);
  exit.hidden=true;
  for(const button of buttons)button.setAttribute('aria-pressed',String(active));
 }
 async function close(restorePiano=true,restoreHistory=true){
  if(!active)return;
  active=false;releaseAllPianoKeys();dock.querySelectorAll('.down').forEach(key=>key.classList.remove('down'));
  sync();restoreControls();
  if(restoreHistory&&history.state?.pianoOnly)history.back();
  if(restorePiano&&pianoWasHidden)closePianoDock();
  if(document.fullscreenElement===dock)await document.exitFullscreen?.().catch(()=>{});
  screen.orientation?.unlock?.();returnFocus?.focus();
 }
 async function open(button){
  if(active){await close();return}
  returnFocus=button;pianoWasHidden=dock.classList.contains('hidden');
  if(document.fullscreenElement)await document.exitFullscreen?.().catch(()=>{});
  stopPlay();window.LuwipiReadingLibrary?.stop?.();
  document.querySelector('.reading-immersive-fallback')?.classList.remove('reading-immersive-fallback');
  openPiano();active=true;sync();blockOtherControls();
  history.pushState({...history.state,pianoOnly:true},'',location.href);dock.classList.remove('piano-fullscreen-fallback');
  try{if(dock.requestFullscreen)await dock.requestFullscreen();else dock.classList.add('piano-fullscreen-fallback')}catch{dock.classList.add('piano-fullscreen-fallback')}
  if(!active)return;
  try{await screen.orientation?.lock?.('landscape')}catch{}
  requestAnimationFrame(center);dock.tabIndex=-1;dock.focus();
 }
 for(const selector of ['#songView .transport','#readingImportedView .transport']){
  const button=document.createElement('button');button.type='button';button.className='piano-fullscreen-button';
  button.textContent='⛶ Só piano';button.setAttribute('aria-label','Abrir só o piano em ecrã inteiro');
  button.setAttribute('aria-controls','pianoDock');button.setAttribute('aria-pressed','false');
  button.onclick=()=>void open(button);document.querySelector(selector).append(button);buttons.push(button);
 }
 exit.onclick=()=>void close();
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active){event.preventDefault();void close()}});
 document.addEventListener('fullscreenchange',()=>{if(active&&!document.fullscreenElement&&!dock.classList.contains('piano-fullscreen-fallback'))void close()});
 document.addEventListener('luwipi:navigate',()=>{void close(false,false);if(history.state?.pianoOnly)history.replaceState(null,'',location.href);requestAnimationFrame(center)});
 new MutationObserver(()=>{if(active&&dock.classList.contains('hidden'))void close()}).observe(dock,{attributes:true,attributeFilter:['class']});
 window.addEventListener('popstate',()=>{if(active&&!history.state?.pianoOnly)void close(true,false)});
 window.LuwipiPianoFullscreen=Object.freeze({open,close});
 matchMedia('(max-height:500px) and (min-width:650px)').addEventListener('change',()=>{if(songs[songKey].illustrated)renderSong()});
 const blocks=document.getElementById('songBlocks');blocks.onclick=()=>{stopPlay();songIllustrated=true;renderSong()};
})();
