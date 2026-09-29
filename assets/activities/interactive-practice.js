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
    const bridge=window.LuwipiAudioBridge;
    if(bridge&&typeof bridge.play==="function"){bridge.play(note,1,beatMs,.96);return}
    if(typeof window.pianoSample==="function"){window.pianoSample(note,1,beatMs,.96);return}
    const engine=window.LuwipiScoreEngine;
    if(engine&&typeof engine.playNote==="function"&&typeof engine.nameToMidi==="function"){engine.playNote(engine.nameToMidi(note),1,beatMs,.92)}
  }catch{}
}

const pianoSurfaces=new Map();
function midiName(m){
  const engine=window.LuwipiScoreEngine;
  if(engine&&typeof engine.midiToName==="function")return engine.midiToName(m);
  const names=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  return names[((m%12)+12)%12]+(Math.floor(m/12)-1);
}
function midiForName(note){
  const engine=window.LuwipiScoreEngine;
  if(engine&&typeof engine.nameToMidi==="function")return engine.nameToMidi(note);
  const match=/^([A-G])([#b]?)(-?\d+)$/.exec(String(note||""));if(!match)return-1;
  const pcs={C:0,D:2,E:4,F:5,G:7,A:9,B:11};let pc=pcs[match[1]];
  if(match[2]==="#")pc++;if(match[2]==="b")pc--;
  return (Number(match[3])+1)*12+pc;
}
function buildReactivePiano(surface,host,label){
  if(!host||pianoSurfaces.has(surface))return pianoSurfaces.get(surface);
  const shell=document.createElement("div");shell.className="activity-piano";shell.dataset.pianoSurface=surface;
  shell.innerHTML='<div class="activity-piano-head"><strong>🎹 Piano</strong><span>'+label+'</span></div><div class="activity-piano-scroll"><div class="activity-piano-board"></div></div><div class="activity-piano-flash"></div>';
  const board=shell.querySelector(".activity-piano-board"),scroll=shell.querySelector(".activity-piano-scroll");
  const start=36,end=84,whiteWidth=36;let whiteIndex=0;
  for(let m=start;m<=end;m++){
    const pc=((m%12)+12)%12,isBlack=[1,3,6,8,10].includes(pc),name=midiName(m);
    const key=document.createElement("span");key.className="activity-piano-key "+(isBlack?"black":"white");key.dataset.midi=String(m);key.dataset.note=name;
    if(!isBlack){
      key.style.left=(whiteIndex*whiteWidth)+"px";key.innerHTML="<span>"+name.replace(/\d+$/,"")+"</span>";whiteIndex++;
    }else{
      key.style.left=(whiteIndex*whiteWidth-12)+"px";
    }
    board.appendChild(key);
  }
  board.style.minWidth=(whiteIndex*whiteWidth)+"px";host.appendChild(shell);
  const api={shell,board,scroll};pianoSurfaces.set(surface,api);return api;
}
function lightReactivePiano(surface,notes,hold=520){
  const api=pianoSurfaces.get(surface);
  if(!api&&["exercise","song","noteFlow"].includes(surface)){
    const board=document.getElementById("pianoBoard"),scroll=document.querySelector("#pianoDock .piano-scroll");
    if(!board)return;
    board.querySelectorAll(".reading-preview-key").forEach(key=>key.classList.remove("reading-preview-key"));
    const note=(notes||[])[0];
    const key=note&&board.querySelector('[data-piano-note="'+CSS.escape(note)+'"]');
    if(key){key.classList.add("reading-preview-key");scroll?.scrollTo({left:Math.max(0,key.offsetLeft-scroll.clientWidth*.42),behavior:"smooth"})}
    clearTimeout(lightReactivePiano.readingTimer);
    if(key)lightReactivePiano.readingTimer=setTimeout(()=>key.classList.remove("reading-preview-key"),hold);
    return;
  }
  if(!api)return;
  const mids=(notes||[]).map(midiForName).filter(m=>m>=0);
  api.board.querySelectorAll(".activity-piano-key.lit").forEach(k=>k.classList.remove("lit"));
  if(!mids.length){api.shell.classList.remove("is-playing");return}
  api.shell.classList.add("is-playing");
  let first=null;
  mids.forEach(m=>{const k=api.board.querySelector('[data-midi="'+m+'"]');if(k){k.classList.add("lit");if(!first)first=k}});
  if(first){
    const left=Math.max(0,first.offsetLeft-api.scroll.clientWidth*.42);
    api.scroll.scrollTo({left,behavior:"smooth"});
  }
  clearTimeout(api.offTimer);
  api.offTimer=setTimeout(()=>{api.board.querySelectorAll(".activity-piano-key.lit").forEach(k=>k.classList.remove("lit"));api.shell.classList.remove("is-playing")},hold);
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
  if(["active","done"].includes(document.getElementById("exerciseView")?.dataset.exerciseAttempt))return;
  stopExercisePreview();unlockAudio();previewRunning=true;
  const btn=document.getElementById("exercisePreviewBtn");
  const status=document.getElementById("exercisePreviewNote");
  if(btn){btn.classList.add("is-playing");btn.textContent="■ Parar preview"}
  const beatMs=620;
  parts.forEach((part,i)=>{
    previewTimers.push(setTimeout(()=>{
      if(!previewRunning)return;
      parts.forEach(x=>{x.el.classList.toggle("exercise-preview-active",x===part);x.el.classList.toggle("exercise-preview-dim",x!==part)});
      part.el.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
      if(status)status.textContent=noteLabel(part.note);
      lightReactivePiano("exercise",[part.note],beatMs*.82);
      playPiano(part.note,beatMs);
    },i*beatMs));
  });
  previewTimers.push(setTimeout(()=>{
    clearExerciseHighlight();previewRunning=false;
    if(btn){btn.classList.remove("is-playing");btn.textContent="↻ Ver novamente"}
    if(status)status.textContent="Agora é a tua vez";
  },parts.length*beatMs+220));
}
window.LuwipiStopExercisePreview=stopExercisePreview;
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
    if(view?.classList.contains("active")&&!["active","done"].includes(view.dataset.exerciseAttempt))playExercisePreview();
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

function ensurePracticePiano(){
  const view=document.getElementById("liveModeView"),stage=view?.querySelector(".live-stage"),session=stage?.querySelector(".live-session");
  if(!view||!stage||!session||pianoSurfaces.has("practice"))return;
  const host=document.createElement("div");session.insertAdjacentElement("beforebegin",host);
  buildReactivePiano("practice",host,"preview e notas tocadas");
}
window.addEventListener("luwipi:piano-light",event=>{
  const detail=event.detail||{},surface=detail.surface||"practice";
  lightReactivePiano(surface,Array.isArray(detail.notes)?detail.notes:[],Number(detail.hold)||560);
});
document.addEventListener("pointerdown",event=>{
  const key=event.target.closest?.("[data-piano-note]");
  if(key){
    const note=key.dataset.pianoNote;
    if(document.getElementById("exerciseView")?.classList.contains("active"))lightReactivePiano("exercise",[note],500);
  }
},{capture:true,passive:true});
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


let durationPreviewTimers=[];
function stopDurationPreview(){
  clearTimers(durationPreviewTimers);
  document.querySelectorAll("#durationView svg g.duration-preview-active").forEach(g=>g.classList.remove("duration-preview-active"));
  document.querySelectorAll("#durationView .duration-listen.is-playing").forEach(b=>{b.classList.remove("is-playing");b.textContent="▶ Ouvir"});
  lightReactivePiano("duration",[]);
}
function durationEvents(svg){
  if(!svg)return[];
  return Array.from(svg.querySelectorAll("g[data-note]")).map(g=>({
    el:g,note:g.dataset.note||"",duration:Math.max(.125,Number(g.dataset.duration)||1)
  })).filter(x=>x.note);
}
function playDurationExample(svg,button){
  const events=durationEvents(svg);if(!events.length)return;
  stopDurationPreview();unlockAudio();button.classList.add("is-playing");button.textContent="■ Parar";
  const beatMs=560;let cursor=0;
  events.forEach(ev=>{
    durationPreviewTimers.push(setTimeout(()=>{
      events.forEach(x=>x.el.classList.toggle("duration-preview-active",x===ev));
      lightReactivePiano("duration",[ev.note],Math.max(300,ev.duration*beatMs*.9));
      playPiano(ev.note,beatMs*ev.duration);
    },cursor));
    cursor+=ev.duration*beatMs;
  });
  durationPreviewTimers.push(setTimeout(()=>{
    events.forEach(x=>x.el.classList.remove("duration-preview-active"));
    button.classList.remove("is-playing");button.textContent="↻ Ouvir novamente";
    lightReactivePiano("duration",[]);
  },cursor+100));
}
function ensureDurationInteraction(){
  const view=document.getElementById("durationView");if(!view||view.dataset.interactiveReady)return;
  view.dataset.interactiveReady="1";
  const firstDemo=view.querySelector(".duration-demo");
  if(firstDemo){
    const host=document.createElement("div");
    firstDemo.insertAdjacentElement("beforebegin",host);
    buildReactivePiano("duration",host,"a duração fica visível e audível");
  }
  view.querySelectorAll(".measure-demo").forEach(demo=>{
    const svg=demo.querySelector("svg");if(!svg||demo.querySelector(".duration-listen"))return;
    const button=document.createElement("button");button.type="button";button.className="duration-listen";button.textContent="▶ Ouvir";
    button.addEventListener("click",()=>button.classList.contains("is-playing")?stopDurationPreview():playDurationExample(svg,button));
    demo.appendChild(button);
  });
}

function ensureSongReactivePiano(){
  const view=document.getElementById("songView"),scoreWrap=view?.querySelector(".score-wrap");
  if(!view||!scoreWrap||view.dataset.previewObserverReady)return;
  view.dataset.previewObserverReady="1";
  const svg=document.getElementById("songSvg");if(!svg)return;
  let lastLit="";
  const sync=()=>{
    const current=svg.querySelector("g.note-current[data-note], g[data-note].note-current");
    if(current&&current.dataset.note){
      const note=current.dataset.note;
      if(note!==lastLit){lastLit=note;lightReactivePiano("song",[note],650)}
    }else if(lastLit){
      lastLit="";lightReactivePiano("song",[]);
    }
  };
  const observer=new MutationObserver(sync);
  observer.observe(svg,{attributes:true,subtree:true,attributeFilter:["class"],childList:true});
}

function ensureNoteFlowGuide(){
  const view=document.getElementById("noteFlowView");if(!view||view.dataset.pianoGuideReady)return;
  view.dataset.pianoGuideReady="1";
  const track=document.getElementById("noteFlowTrack");if(!track)return;
  let last=-1;
  const sync=()=>{
    const current=track.querySelector(".note-flow-item.current");
    const visual=String(document.getElementById("noteFlowWindow")?.dataset.theme||"")==="train";
    if(!visual||!current){if(last!==-1){last=-1;lightReactivePiano("noteFlow",[])}return}
    const idx=Number(current.dataset.noteFlowIndex);
    if(idx!==last){last=idx;lightReactivePiano("noteFlow",[current.dataset.noteFlowNote],720)}
  };
  new MutationObserver(sync).observe(track,{attributes:true,subtree:true,attributeFilter:["class"],childList:true});
}
function boot(){ensureExercisePreview();ensurePracticePiano();ensureSongReactivePiano();ensureDurationInteraction();ensureNoteFlowGuide();ensurePatterns()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();