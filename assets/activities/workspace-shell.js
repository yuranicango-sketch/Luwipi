(()=>{
'use strict';
const sidebar=document.getElementById('workspaceSidebar');if(!sidebar)return;
const q=new URLSearchParams(location.search);
const isTask=q.get('parent')==='1'||q.get('type');
function open(target){
  if(target==='karaoke'){document.querySelector('[data-karaoke-open]')?.click();return}
  if(target==='home'){const view=document.getElementById('homeView');if(view){document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));view.classList.add('active');window.scrollTo(0,0)}return}
  const btn=[...document.querySelectorAll('[data-nav="'+target+'"]')].find(el=>!el.closest('#experienceMenu')&&!el.closest('#workspaceSidebar'));
  if(btn)btn.click();
  else{
    const id=target==='reading'?'readingView':target==='live'?'liveModeView':target==='games'?'gamesView':target==='rhythm'?'rhythmView':'';
    const view=id&&document.getElementById(id);if(view){document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));view.classList.add('active')}
  }
  window.scrollTo(0,0);
}
sidebar.querySelectorAll('[data-workspace-nav]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.workspaceNav)));
sidebar.querySelector('[data-workspace-action="back"]')?.addEventListener('click',()=>{const view=document.querySelector('.view.active');(view?.querySelector('.page-head .back')||view?.querySelector('#karaokeBack')||document.querySelector('[data-workspace-nav="reading"]'))?.click()});
sidebar.querySelector('[data-workspace-action="guide"]')?.addEventListener('click',()=>{const view=document.querySelector('.view.active'),button=view?.querySelector('.reading-guide-toggle,[data-reading-guide-toggle]');if(button)button.click();else document.getElementById('experienceMenuGuide')?.click()});
sidebar.querySelector('[data-workspace-action="task"]')?.addEventListener('click',()=>document.getElementById('experienceMenuTask')?.click());
sidebar.querySelector('[data-workspace-action="theme"]')?.addEventListener('click',()=>document.getElementById('experienceMenuTheme')?.click());
sidebar.querySelector('[data-workspace-action="account"]')?.addEventListener('click',()=>document.getElementById('accountButton')?.click());
function sync(){
 const active=document.querySelector('.view.active'),id=active?.id||'';
 let key=id==='homeView'?'home':id==='karaokeView'?'karaoke':id==='liveModeView'?'live':id==='gamesView'||id==='gameView'?'games':id==='rhythmView'||/rhythm|pulse|attack|complete/i.test(id)?'rhythm':'reading';
 sidebar.querySelectorAll('[data-workspace-nav]').forEach(b=>b.classList.toggle('active',b.dataset.workspaceNav===key));
}
new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',()=>setTimeout(sync,0),true);
if(!isTask&&q.get('open')!=='games'){
 const boot=()=>{const current=document.querySelector('.view.active');if(!current||current.id==='homeView')open('reading');sync()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,80),{once:true});else setTimeout(boot,80);
}
sync();
})();