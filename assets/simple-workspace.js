(()=>{
'use strict';
const $=id=>document.getElementById(id),menu=$('simpleMenu'),button=$('simpleMenuButton');
function closeMenu(){menu.hidden=true;button.setAttribute('aria-expanded','false')}
button.onclick=()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))};
menu.addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
let restoring=false;
function route(){
 const active=document.querySelector('.view.active');if(!active)return 'reading';
 if(active.id==='songView')return 'song/'+encodeURIComponent(songKey)+'/'+songVersionKey+'/'+songTranspose+'/'+songPage;
 if(active.id==='readingImportedView')return 'score/'+encodeURIComponent(active.dataset.taskId||'');
 return {readingView:'reading',gamesView:'games',tasksView:'tasks',printablesView:'printables',soundBubblesView:'bubbles'}[active.id]||'reading';
}
function remember(){if(restoring||new URLSearchParams(location.search).get('parent')==='1')return;const value=route();if(location.hash!=='#'+value)history.replaceState(null,'','#'+value)}
async function restore(){
 restoring=true;
 try{
 const [name,id,version,transpose,page]=location.hash.slice(1).split('/');
 if(name==='song'&&songs[decodeURIComponent(id||'')]){songKey=decodeURIComponent(id);songVersionKey=version==='both'?'both':'right';songTranspose=Math.max(-5,Math.min(5,Number(transpose)||0));songPage=Math.max(0,Math.min(Math.ceil(songs[songKey].right.length/2)-1,Number(page)||0));tempo=songs[songKey].tempo;renderSong();nav('song');requestAnimationFrame(()=>syncSongPosition('instant'))}
 else if(name==='score'&&id)await window.LuwipiReadingLibrary.open(decodeURIComponent(id));
 else if(name==='bubbles')$('soundBubblesCard').click();
 else nav(['reading','games','tasks','printables'].includes(name)?name:'reading');
 }finally{restoring=false}
}
new MutationObserver(remember).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('luwipi:navigate',()=>{closeMenu();remember()});
$('songScoreMode').setAttribute('aria-label','Alternar entre partitura inteira e pauta horizontal');
for(const id of ['songPrev','songNext','transposeDown','transposeUp'])$(id).addEventListener('click',remember);
const historyKey='luwipi:tasks:v2';
function tasks(){try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch{return[]}}
function renderTasks(){const list=$('taskHistory');list.replaceChildren();const entries=tasks();if(!entries.length){list.textContent='Ainda não criaste tarefas.';return}for(const task of entries){const card=document.createElement('article');card.className='song-card';const title=document.createElement('strong');title.textContent=task.title;const link=document.createElement('a');link.textContent='Abrir tarefa';link.href=task.url;card.append(title,link);list.append(card)}}
window.LuwipiRememberTask=url=>{const entries=tasks().filter(t=>t.url!==url);entries.unshift({title:document.querySelector('.view.active h2,.view.active .page-head strong')?.textContent||'Atividade',url,at:Date.now()});try{localStorage.setItem(historyKey,JSON.stringify(entries.slice(0,40)))}catch{}renderTasks()};
function taskUrl(type,id){const url=new URL('/app',location.origin);url.searchParams.set('parent','1');url.searchParams.set('type',type);if(id)url.searchParams.set('id',id);return url.toString()}
$('shareBubblesBtn').onclick=()=>openTaskModal(taskUrl('button','soundBubblesCard'));
const paintCard=document.querySelector('a[href="/pintar-teclas"]');const paintShare=document.createElement('button');paintShare.type='button';paintShare.textContent='Enviar como tarefa';paintShare.onclick=()=>{const url=new URL('/pintar-teclas',location.origin);url.searchParams.set('parent','1');openTaskModal(url.toString())};const paintItem=document.createElement('div');paintItem.className='paint-game-item';paintCard.before(paintItem);paintItem.append(paintCard,paintShare);
$('songShareQuick').onclick=()=>$('shareSongBtn').click();
const importedShare=document.createElement('button');importedShare.textContent='Enviar como tarefa';importedShare.onclick=async()=>{const item=window.LuwipiReadingLibrary.current();if(!item)return;const url=new URL(taskUrl('score',item.builtin?item.id:''));if(!item.builtin)url.hash='score='+encodeURIComponent(JSON.stringify({title:item.title,score:item.score}));openTaskModal(url.toString())};$('readingImportedView').querySelector('.page-head').append(importedShare);
async function openTask(){
 const q=new URLSearchParams(location.search);if(q.get('parent')!=='1'){await restore();return}restoring=true;document.body.classList.add('parent-mode');
 try{if(q.get('type')==='song'&&songs[q.get('id')]){songKey=q.get('id');songVersionKey=q.get('version')==='both'?'both':'right';songTranspose=Math.max(-5,Math.min(5,Number(q.get('transpose'))||0));tempo=songs[songKey].tempo;renderSong();nav('song')}
 else if(q.get('type')==='button'&&q.get('id')==='soundBubblesCard')$('soundBubblesCard').click();
 else if(q.get('type')==='score'){
  if(q.get('id')?.startsWith('piano-public-'))await window.LuwipiReadingLibrary.open(q.get('id'));
  else {const raw=location.hash.slice(1);if(raw.startsWith('score=')){let item;const value=raw.slice(6);try{item=JSON.parse(decodeURIComponent(value))}catch{let data=Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));if(data[0]===31&&data[1]===139)data=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());item=JSON.parse(new TextDecoder().decode(data))}window.LuwipiReadingLibrary.openShared(item)}}
 }else nav('reading');
 }catch{nav('tasks');$('taskHistory').textContent='Não foi possível abrir esta tarefa. Pede um novo link ao professor.'}finally{restoring=false}
}
window.addEventListener('hashchange',()=>{if(new URLSearchParams(location.search).get('parent')!=='1')void restore()});
window.addEventListener('luwipi:access-ready',()=>{if(location.hash.startsWith('#score/'))void restore()});
renderTasks();void openTask();
})();
(()=>{
 const score=document.getElementById('songSvg'),wrap=score.parentElement;
 function fit(){const [, ,width,height]=score.getAttribute('viewBox').split(' ').map(Number);if(wrap.classList.contains('whole-score')){score.style.width='100%';score.style.height=score.classList.contains('illustrated-score')?'100%':'auto';score.setAttribute('preserveAspectRatio','xMidYMid meet');return}const available=wrap.clientHeight;if(width&&height&&available){score.style.width=Math.ceil(width*Math.min(available/height,wrap.clientWidth/(wrap.clientWidth<650?550:920)))+'px';score.style.height=available+'px'}score.setAttribute('preserveAspectRatio','xMinYMid meet');if(document.getElementById('songView').classList.contains('active'))syncSongPosition('instant')}
 new ResizeObserver(fit).observe(wrap);new MutationObserver(fit).observe(score,{attributes:true,attributeFilter:['viewBox']});document.addEventListener('luwipi:navigate',()=>requestAnimationFrame(fit));
})();
