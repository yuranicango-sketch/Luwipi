(()=>{
'use strict';
const sidebar=document.getElementById('workspaceSidebar');if(!sidebar)return;
const q=new URLSearchParams(location.search),isTask=q.get('parent')==='1'||Boolean(q.get('type'));
document.body.classList.toggle('workspace-task-mode',isTask);

const views=[...document.body.children].filter(node=>node.classList?.contains('view'));
const canvas=document.createElement('main');canvas.id='workspaceCanvas';canvas.className='workspace-canvas';
const bar=document.createElement('div');bar.className='workspace-canvas-bar';
bar.innerHTML='<button type="button" class="workspace-canvas-back" aria-label="Voltar">←</button><div class="workspace-canvas-heading"><small>LUWIPI</small><strong id="workspaceCanvasTitle">Leitura</strong><span id="workspaceCanvasContext">Ouve. Vê. Toca.</span></div><div class="workspace-canvas-actions"><button id="workspaceCanvasPrimary" type="button" hidden></button></div>';
const viewport=document.createElement('div');viewport.className='workspace-canvas-viewport';
const pianoArea=document.createElement('section');pianoArea.id='workspacePiano';pianoArea.className='workspace-piano';pianoArea.setAttribute('aria-label','Piano partilhado');
pianoArea.innerHTML='<div class="workspace-piano-edge"><button id="workspacePianoToggle" type="button" aria-label="Recolher piano" title="Recolher piano" aria-expanded="true" aria-controls="workspacePianoBody">⌄</button></div><div id="workspacePianoBody" class="workspace-piano-body"></div>';
canvas.append(bar,viewport,pianoArea);sidebar.after(canvas);views.forEach(view=>viewport.append(view));

const barBack=bar.querySelector('.workspace-canvas-back'),barTitle=bar.querySelector('#workspaceCanvasTitle'),barContext=bar.querySelector('#workspaceCanvasContext'),barPrimary=bar.querySelector('#workspaceCanvasPrimary');
const roots=new Set(['readingView','karaokeView','liveModeView','gamesView','rhythmView']);
let libraryOpen=false;
function activeView(){return viewport.querySelector('.view.active')}
function modeOf(view){
 const id=view?.id||'';
 if(id==='diagnosticView')return'diagnostic';if(id==='karaokeView')return'karaoke';
 if(id==='liveModeView')return'live';
 if(id==='gamesView'||id==='gameView'||id==='animalPianoView'||id==='soundBubblesView')return'games';
 if(id==='rhythmView'||/rhythm|pulse|attack|complete|duration/i.test(id))return'rhythm';
 return'reading';
}
function labelOf(mode){return mode==='diagnostic'?'Diagnóstico':mode==='karaoke'?'MIDI':mode==='live'?'Prática':mode==='games'?'Jogos':mode==='rhythm'?'Ritmo':'Leitura'}
function clearLibrary(){
 libraryOpen=false;canvas.dataset.library='';
 document.getElementById('readingView')?.classList.remove('workspace-library-open');
}
function localContext(view,mode){
 if(libraryOpen&&view?.id==='readingView')return'Músicas e atividades';if(mode==='diagnostic')return'Leitura · avaliação inicial';
 if(!view)return'';
 if(mode==='karaoke'){const song=document.getElementById('karaokeSongTitle')?.textContent?.trim();return song&&song!=='Importa uma música para começar'?song:'Importa, lê e toca.'}
 const specific=view.querySelector('.page-head strong,.reader-top h2,.rhythm-activity-head h2,.game-stage-head h2,[data-journey-title],.section-title h2,.live-file-state strong,h2');
 const text=specific?.textContent?.replace(/\s+/g,' ').trim();
 if(text&&text!==labelOf(mode))return text;
 return mode==='live'?'Partitura · piano · execução':mode==='games'?'Escolhe uma atividade':mode==='rhythm'?'Pulso, leitura e execução':'Partitura e piano';
}
function localBack(view){return view?.querySelector('.page-head .back,#karaokeBack,#courseBack')}
function open(target){
 if(window.LuwipiWorkspaceRouter){window.LuwipiWorkspaceRouter.go(target==='live'?'practice':target==='karaoke'?'midi':target);return}
 clearLibrary();
 if(target==='karaoke'){document.querySelector('[data-karaoke-open]')?.click();return}
 const btn=[...document.querySelectorAll('[data-nav="'+target+'"]')].find(el=>!el.closest('#experienceMenu')&&!el.closest('#workspaceSidebar'));
 if(btn)btn.click();
 else{
  const id=target==='diagnostic'?'diagnosticView':target==='reading'?'readingView':target==='live'?'liveModeView':target==='games'?'gamesView':target==='rhythm'?'rhythmView':'';
  const view=id&&document.getElementById(id);if(view){document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));view.classList.add('active')}
 }
 window.scrollTo(0,0);setTimeout(sync,0);
}
function openReadingLibrary(){
 if(window.LuwipiWorkspaceRouter){window.LuwipiWorkspaceRouter.go('reading',true,true);sync();return}
 open('reading');libraryOpen=true;canvas.dataset.library='reading';
 document.getElementById('readingView')?.classList.add('workspace-library-open');sync();
}
function goBack(){
 if(window.LuwipiWorkspaceRouter){window.LuwipiWorkspaceRouter.back();return}
 const view=activeView();
 if(libraryOpen&&view?.id==='readingView'){clearLibrary();sync();return}
 const button=localBack(view);
 if(button){
  if(button.dataset.nav==='home'){open(modeOf(view));return}
  button.click();return;
 }
 if(modeOf(view)!=='reading')open('reading');
}
function primaryFor(mode){
 if(mode==='karaoke')return{label:'＋ Importar MIDI',run:()=>document.getElementById('karaokeFiles')?.click()};
 if(mode==='live')return{label:'＋ Importar ficheiro',run:()=>document.getElementById('liveScoreFile')?.click()};
 return null;
}
function sync(){
 const view=activeView();
 libraryOpen=canvas.dataset.library==='reading'&&view?.id==='readingView';
 const mode=modeOf(view),root=roots.has(view?.id)&&!libraryOpen;
 canvas.dataset.mode=mode;canvas.dataset.view=view?.id||'';
 sidebar.querySelectorAll('[data-workspace-nav]').forEach(b=>b.classList.toggle('active',b.dataset.workspaceNav===mode));
 const library=sidebar.querySelector('[data-workspace-action="library"]');if(library)library.classList.toggle('active',libraryOpen);
 barTitle.textContent=labelOf(mode);barContext.textContent=localContext(view,mode);
 barBack.hidden=root||isTask;
 const sideBack=sidebar.querySelector('[data-workspace-action="back"]');if(sideBack)sideBack.disabled=root||isTask;
 const guide=sidebar.querySelector('[data-workspace-action="guide"]');if(guide)guide.hidden=mode!=='reading'||libraryOpen;
 const task=sidebar.querySelector('[data-workspace-action="task"]');if(task)task.hidden=isTask||libraryOpen;
 const primary=primaryFor(mode);barPrimary.hidden=!primary||isTask;
 if(primary){barPrimary.textContent=primary.label;barPrimary.onclick=primary.run}else barPrimary.onclick=null;
}
sidebar.querySelectorAll('[data-workspace-nav]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.workspaceNav)));
sidebar.querySelector('[data-workspace-action="library"]')?.addEventListener('click',()=>libraryOpen?goBack():openReadingLibrary());
sidebar.querySelector('[data-workspace-action="back"]')?.addEventListener('click',goBack);
sidebar.querySelector('[data-workspace-action="guide"]')?.addEventListener('click',()=>{const view=activeView(),button=view?.querySelector('.reading-guide-toggle,[data-reading-guide-toggle]');if(button)button.click();else document.getElementById('experienceMenuGuide')?.click()});
sidebar.querySelector('[data-workspace-action="task"]')?.addEventListener('click',()=>document.getElementById('experienceMenuTask')?.click());
sidebar.querySelector('[data-workspace-action="theme"]')?.addEventListener('click',()=>document.getElementById('experienceMenuTheme')?.click());
sidebar.querySelector('[data-workspace-action="account"]')?.addEventListener('click',()=>document.getElementById('accountButton')?.click());
barBack.addEventListener('click',goBack);
new MutationObserver(sync).observe(viewport,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',()=>setTimeout(sync,0),true);
document.addEventListener('change',event=>{if(event.target?.id==='karaokeSong'||event.target?.id==='karaokeLead')setTimeout(sync,0)},true);
window.addEventListener('luwipi:workspace-route',sync);
sync(); // The canonical router restores the active section and browser history.
})();