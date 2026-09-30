(()=>{
  'use strict';
  const query=new URLSearchParams(location.search);
  let last=null,genericTaskUrl='';
  const active=()=>document.querySelector('.view.active');
  const base=()=>new URL('/',location.origin);
  const task=(type,data={})=>{const url=base();url.searchParams.set('parent','1');url.searchParams.set('type',type);Object.entries(data).forEach(([key,value])=>url.searchParams.set(key,value));return url};
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-game],[data-rhythm-song],#soundBubblesCard,#animalPianoCard,.rhythm-menu-card,[data-reading-id]');
    if(!trigger)return;
    if(trigger.dataset.game)last={type:'game',id:trigger.dataset.game};
    else if(trigger.dataset.rhythmSong)last={type:'rhythm-song',id:trigger.dataset.rhythmSong};
    else if(trigger.dataset.readingId)last={type:'imported',id:trigger.dataset.readingId};
    else if(trigger.classList.contains('rhythm-menu-card'))last={type:'rhythm',id:String([...document.querySelectorAll('#rhythmView .rhythm-menu-card')].indexOf(trigger))};
    else last={type:'button',id:trigger.id};
  },true);
  async function encodeScore(score){
    let bytes=new TextEncoder().encode(JSON.stringify(score));
    if('CompressionStream'in window){const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));bytes=new Uint8Array(await new Response(stream).arrayBuffer())}
    let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  async function decodeScore(value){
    const binary=atob(value.replace(/-/g,'+').replace(/_/g,'/'));let bytes=Uint8Array.from(binary,ch=>ch.charCodeAt(0));
    if(bytes[0]===31&&bytes[1]===139){if(!('DecompressionStream'in window))throw Error('Este navegador não consegue abrir esta tarefa.');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  function modal(url){
    genericTaskUrl=String(url);
    const box=document.getElementById('taskModal'),input=document.getElementById('taskLinkInput');
    input.value=genericTaskUrl;box?.classList.remove('hidden');
    box?.querySelector('p')&&(box.querySelector('p').textContent='Envia este link. A família abre diretamente a atividade escolhida.');
  }
  document.getElementById('copyTaskLink')?.addEventListener('click',async event=>{
    if(!genericTaskUrl)return;event.preventDefault();event.stopImmediatePropagation();
    try{await navigator.clipboard.writeText(genericTaskUrl)}catch{const input=document.getElementById('taskLinkInput');input.select();document.execCommand('copy')}
    event.currentTarget.textContent='Copiado ✓';setTimeout(()=>event.currentTarget.textContent='Copiar link',1200);
  },true);
  document.getElementById('previewTask')?.addEventListener('click',event=>{if(!genericTaskUrl)return;event.preventDefault();event.stopImmediatePropagation();window.open(genericTaskUrl,'_blank')},true);
  async function share(){
    const view=active(),id=view?.id;
    document.querySelector('#experienceMenu .experience-menu-close')?.click();
    if(id==='exerciseView'){genericTaskUrl='';document.getElementById('shareExerciseBtn')?.click();return}
    if(id==='songView'){genericTaskUrl='';document.getElementById('shareSongBtn')?.click();return}
    if(id==='readingImportedView'){
      const item=await window.LuwipiReadingLibrary?.get(view.dataset.taskId||last?.id);
      if(!item?.score)return;
      const url=task('score');url.hash='score='+await encodeScore({title:item.title,kind:item.kind,score:item.score});modal(url);return;
    }
    if(id==='liveModeView'){
      const source=window.LuwipiLiveTaskSource?.score();
      if(source){const url=task('score');url.hash='score='+await encodeScore(source);modal(url);return}
      if(!document.getElementById('livePdfWrap')?.classList.contains('hidden')){alert('Este PDF ainda não tem notas estruturadas para enviar como tarefa. Usa MIDI ou MusicXML, ou envia a partitura já adicionada à Leitura.');return}
      modal(task('live'));return;
    }
    if(id==='gameView'&&last?.type==='game'){modal(task('game',{id:last.id}));return}
    if(last&&['rhythmReadView','pulseView','attackView','completeView','rhythmSongView','durationView','animalPianoView','soundBubblesView'].includes(id)){
      modal(task(last.type,{id:last.id}));return;
    }
    if(id==='noteFlowView'){modal(task('flow'));return}
    if(id==='readingView'){modal(task('reading'));return}
    if(id==='homeView'){alert('Abre primeiro a atividade que queres enviar como tarefa.');return}
    const nav={'gamesView':'games','rhythmView':'rhythm'}[id];
    if(nav)modal(task(nav));
  }
  document.getElementById('experienceMenuTask')?.addEventListener('click',()=>void share());
  async function openTask(){
    if(query.get('parent')!=='1')return;
    const type=query.get('type'),id=query.get('id');
    if(!type||['exercise','song'].includes(type))return;
    let selector='';
    if(type==='score'){
      try{const value=location.hash.match(/^#score=([A-Za-z0-9_-]+)$/)?.[1];if(value)window.LuwipiReadingLibrary?.openShared(await decodeScore(value))}catch(error){console.error('Tarefa inválida',error)}
      return;
    }
    if(type==='course')selector='[data-nav="reading"]'; // Existing shared links open a usable activity hub.
    if(type==='game'&&/^[a-zA-Z0-9_-]{1,40}$/.test(id||''))selector=`[data-game="${id}"]`;
    if(type==='rhythm'&&/^[0-9]$/.test(id||''))selector=`#rhythmView .rhythm-menu-card:nth-child(${Number(id)+1})`;
    if(type==='rhythm-song'&&/^[a-zA-Z0-9_-]{1,40}$/.test(id||''))selector=`[data-rhythm-song="${id}"]`;
    if(type==='button'&&['soundBubblesCard','animalPianoCard'].includes(id))selector='#'+id;
    if(type==='flow')selector='#readingView .reading-flow-entry';
    if(['reading','games','rhythm','live'].includes(type))selector=`[data-nav="${type}"]`;
    const target=selector&&document.querySelector(selector);
    if(target){target.click();document.body.classList.add('parent-mode')}
  }
  let tried=false;
  function ready(){if(tried||query.get('parent')!=='1'||!query.get('type'))return;if(document.getElementById('accessOverlay')?.classList.contains('hidden')){tried=true;void openTask()}}
  window.addEventListener('luwipi:access-ready',()=>setTimeout(ready,100));
  const overlay=document.getElementById('accessOverlay');if(overlay)new MutationObserver(ready).observe(overlay,{attributes:true,attributeFilter:['class']});
  setTimeout(ready,1800);
})();
