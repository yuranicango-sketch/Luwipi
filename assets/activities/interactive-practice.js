(function(){
"use strict";

const PT={C:"Dó",D:"Ré",E:"Mi",F:"Fá",G:"Sol",A:"Lá",B:"Si"};
let previewTimers=[],previewRunning=false,patternTimers=[];

function clearTimers(list){while(list.length)clearTimeout(list.pop())}
function noteLabel(note){return PT[String(note||"")[0]]||note||""}
function unlockAudio(){
  try{
    const c=typeof window.ctx==="function"?window.ctx():null;
    if(c&&c.state==="suspended")c.resume().catch(()=>{});
  }catch{}
}
function playPiano(note,beatMs){
  try{
    if(typeof window.pianoSample==="function"){window.pianoSample(note,1,beatMs,.92);return}
  }catch{}
}
function exerciseParts(){
  const svg=document.getElementById("exerciseSvg");
  if(!svg)return[];
  return Array.from(svg.querySelectorAll("g[data-note]")).map((el,index)=>({el,index,note:el.dataset.note||""})).filter(x=>x.note);
}
function clearExerciseHighlight(){
  exerciseParts().forEach(x=>x.el.classList.remove("exercise-preview-active","exercise-preview-dim"));
}
function stopExercisePreview(){
  clearTimers(previewTimers);previewRunning=false;clearExerciseHighlight();
  const btn=document.getElementById("exercisePreviewBtn");
  if(btn){btn.classList.remove("is-playing");btn.textContent="▶ Ver e ouvir"}
  const status=document.getElementById("exercisePreviewNote");
  if(status)status.textContent="";
}
function playExercisePreview(){
  const parts=exerciseParts();if(!parts.length)return;
  if(previewRunning){stopExercisePreview();return}
  stopExercisePreview();unlockAudio();previewRunning=true;
  const btn=document.getElementById("exercisePreviewBtn");
  const status=document.getElementById("exercisePreviewNote");
  if(btn){btn.classList.add("is-playing");btn.textContent="■ Parar preview"}
  const beatMs=620;
  parts.forEach((part,i)=>{
    previewTimers.push(setTimeout(()=>{
      if(!previewRunning)return;
      parts.forEach(x=>{x.el.classList.toggle("exercise-preview-active",x===part);x.el.classList.toggle("exercise-preview-dim",x!==part)});
      if(status)status.textContent=noteLabel(part.note);
      playPiano(part.note,beatMs);
    },i*beatMs));
  });
  previewTimers.push(setTimeout(()=>{
    clearExerciseHighlight();previewRunning=false;
    if(btn){btn.classList.remove("is-playing");btn.textContent="↻ Ver novamente"}
    if(status)status.textContent="Agora é a tua vez";
  },parts.length*beatMs+220));
}
function ensureExercisePreview(){
  const view=document.getElementById("exerciseView"),actions=view?.querySelector(".secondary-actions");
  if(!view||!actions||document.getElementById("exercisePreviewBtn"))return;
  const status=document.createElement("div");
  status.id="exercisePreviewNote";status.className="exercise-preview-note";status.setAttribute("aria-live","polite");
  view.querySelector(".score-wrap")?.insertAdjacentElement("afterend",status);
  const btn=document.createElement("button");
  btn.id="exercisePreviewBtn";btn.type="button";btn.className="exercise-preview-button";btn.textContent="▶ Ver e ouvir";
  btn.setAttribute("aria-label","Ouvir o exercício e ver cada nota destacada na partitura");
  btn.addEventListener("pointerdown",unlockAudio,{passive:true});
  btn.addEventListener("click",playExercisePreview);
  actions.prepend(btn);
}

function scheduleAutomaticPreview(){
  stopExercisePreview();
  previewTimers.push(setTimeout(()=>{
    const view=document.getElementById("exerciseView");
    if(view?.classList.contains("active"))playExercisePreview();
  },260));
}
document.addEventListener("pointerdown",e=>{
  if(e.target.closest("[data-ex],#exPrev,#exNext"))unlockAudio();
},{capture:true,passive:true});
document.addEventListener("click",e=>{
  if(e.target.closest("[data-ex],#exPrev,#exNext"))scheduleAutomaticPreview();
  if(e.target.closest("[data-nav]")&&!e.target.closest("[data-ex]"))stopExercisePreview();
});

const patterns=[
 {level:"1",tag:"Pulso",name:"Quatro passos",items:[["♩",1],["♩",1],["♩",1],["♩",1]],copy:"O padrão-base: um ataque em cada tempo."},
 {level:"1",tag:"Final",name:"Dois passos + segura",items:[["♩",1],["♩",1],["𝅗𝅥",2]],copy:"Muito comum para sentir começo, movimento e chegada."},
 {level:"2",tag:"Colcheias",name:"Duas rápidas + duas calmas",items:[["♫",1],["♩",1],["♩",1],["♩",1]],copy:"Introduz subdivisão sem perder o pulso principal."},
 {level:"2",tag:"Movimento",name:"Calma + duas rápidas + segura",items:[["♩",1],["♫",1],["𝅗𝅥",2]],copy:"Um desenho recorrente em melodias simples."},
 {level:"3",tag:"Síncope",name:"Curta · longa · curta",items:[["♪",.5],["♩",1],["♪",.5],["𝅗𝅥",2]],copy:"Prepara o ouvido para deslocamentos rítmicos comuns no pop."},
 {level:"3",tag:"Semicolcheias",name:"Quatro rápidas + chegada",items:[["♬",1],["♩",1],["𝅗𝅥",2]],copy:"Treina grupos rápidos como bloco, não como matemática."}
];
function stopPattern(){clearTimers(patternTimers);document.querySelectorAll(".pattern-beat.active").forEach(x=>x.classList.remove("active"))}
function rhythmClick(accent){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=window.__luwipiPatternCtx||(window.__luwipiPatternCtx=new AC());
  if(c.state==="suspended")c.resume().catch(()=>{});
  const o=c.createOscillator(),g=c.createGain(),now=c.currentTime;
  o.type="triangle";o.frequency.value=accent?980:720;
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(accent?.075:.052,now+.003);g.gain.exponentialRampToValueAtTime(.0001,now+.07);
  o.connect(g).connect(c.destination);o.start(now);o.stop(now+.08);
}
function playPattern(card,pattern){
  stopPattern();const beats=Array.from(card.querySelectorAll(".pattern-beat")),unit=430;
  let cursor=0;
  pattern.items.forEach((item,i)=>{
    patternTimers.push(setTimeout(()=>{
      beats.forEach((b,j)=>b.classList.toggle("active",j===i));rhythmClick(i===0);
    },cursor));
    cursor+=Math.max(.5,item[1])*unit;
  });
  patternTimers.push(setTimeout(()=>beats.forEach(b=>b.classList.remove("active")),cursor+120));
}
function ensurePatterns(){
  const view=document.getElementById("rhythmView"),anchor=view?.querySelector(".rhythm-song-section");if(!view||!anchor||view.querySelector(".pattern-library"))return;
  const section=document.createElement("section");section.className="pattern-library";
  section.innerHTML='<div class="pattern-library-head"><div><small>Aprender pelo que aparece na música</small><h3>Padrões essenciais</h3></div><span>ver · ouvir · repetir</span></div>';
  ["1","2","3"].forEach(level=>{
    const wrap=document.createElement("div");wrap.className="pattern-level";
    wrap.innerHTML='<div class="pattern-level-title"><strong>Nível '+level+'</strong><span>'+(level==="1"?"pulso e chegada":level==="2"?"subdivisão":"movimento e síncope")+'</span></div><div class="pattern-grid"></div>';
    const grid=wrap.querySelector(".pattern-grid");
    patterns.filter(p=>p.level===level).forEach(p=>{
      const card=document.createElement("article");card.className="pattern-card";
      card.innerHTML='<div class="pattern-card-top"><div><small>'+p.tag+'</small><strong>'+p.name+'</strong></div><button class="pattern-play" type="button" aria-label="Ouvir padrão">▶</button></div><div class="pattern-strip">'+p.items.map((it,i)=>'<span class="pattern-beat"><b>'+it[0]+'</b><em>'+(i+1)+'</em></span>').join("")+'</div><p>'+p.copy+'</p>';
      card.querySelector(".pattern-play").addEventListener("click",()=>playPattern(card,p));grid.appendChild(card);
    });
    section.appendChild(wrap);
  });
  anchor.parentNode.insertBefore(section,anchor);
}

function boot(){ensureExercisePreview();ensurePatterns()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();