(()=>{
 'use strict';
 const dock=document.getElementById('pianoDock'),exit=document.getElementById('pianoFullscreenExit');
 let active=false,returnFocus=null,pianoWasHidden=false;
 const buttons=[],blocked=[];
 const scroll=dock.querySelector('.piano-scroll');
 const slide=document.createElement('label');slide.className='piano-slide-control';slide.hidden=true;
 slide.append(document.createTextNode('Desliza o teclado'));
 const position=document.createElement('input');position.type='range';position.min='0';position.max='1000';position.step='1';position.setAttribute('aria-label','Posição do teclado');slide.append(position);dock.append(slide);
 function syncSlider(){position.value=String(Math.round(1000*scroll.scrollLeft/Math.max(1,scroll.scrollWidth-scroll.clientWidth)))}
 position.addEventListener('input',()=>{scroll.scrollLeft=Number(position.value)/1000*(scroll.scrollWidth-scroll.clientWidth)});
 scroll.addEventListener('scroll',syncSlider,{passive:true});
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
  exit.hidden=!active;slide.hidden=!active;
  for(const button of buttons)button.setAttribute('aria-pressed',String(active));
 }
 async function close(restorePiano=true){
  if(!active)return;
  active=false;releaseAllPianoKeys();dock.querySelectorAll('.down').forEach(key=>key.classList.remove('down'));
  sync();restoreControls();
  if(restorePiano&&pianoWasHidden)closePianoDock();
  if(document.fullscreenElement===dock)await document.exitFullscreen?.().catch(()=>{});
  screen.orientation?.unlock?.();returnFocus?.focus();
 }
 async function open(button){
  if(active){await close();return}
  returnFocus=button;pianoWasHidden=dock.classList.contains('hidden');
  if(document.fullscreenElement)await document.exitFullscreen?.().catch(()=>{});
  openPiano();active=true;sync();blockOtherControls();dock.classList.remove('piano-fullscreen-fallback');
  try{if(dock.requestFullscreen)await dock.requestFullscreen();else dock.classList.add('piano-fullscreen-fallback')}catch{dock.classList.add('piano-fullscreen-fallback')}
  if(!active)return;
  try{await screen.orientation?.lock?.('landscape')}catch{}
  requestAnimationFrame(()=>{center();syncSlider()});exit.focus();
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
 document.addEventListener('luwipi:navigate',()=>{void close(false);requestAnimationFrame(center)});
 new MutationObserver(()=>{if(active&&dock.classList.contains('hidden'))void close()}).observe(dock,{attributes:true,attributeFilter:['class']});
 new ResizeObserver(()=>{if(active)syncSlider()}).observe(scroll);
 matchMedia('(max-height:500px) and (min-width:650px)').addEventListener('change',()=>{if(songs[songKey].illustrated)renderSong()});
 const blocks=document.getElementById('songBlocks');blocks.onclick=()=>{stopPlay();songIllustrated=true;renderSong()};
})();
