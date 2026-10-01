(()=>{
  "use strict";
  const view=document.getElementById("readingView"),stage=document.getElementById("readingStage");
  if(!view||!stage)return;
  const labels={C:"Dó",D:"Ré",E:"Mi",F:"Fá",G:"Sol",A:"Lá",B:"Si"};
  const sequence=[0,1,2,3,5,4,6,7,8,9,10,11,12,13];
  const svg=stage.querySelector("svg"),keyboard=stage.querySelector(".journey-keyboard"),status=stage.querySelector(".journey-sub");
  let notes=[],next=0,timers=[],playing=false;
  const clear=()=>{timers.forEach(clearTimeout);timers=[];playing=false;stage.querySelectorAll(".lit").forEach(el=>el.classList.remove("lit"));keyboard.querySelectorAll(".lit").forEach(el=>el.classList.remove("lit"));stage.querySelector("[data-journey-listen]").textContent="▶ Ouvir e ver"};
  function progress(){try{return JSON.parse(localStorage.getItem("luwipi:reading-progress:v1")||"{}")||{}}catch{return {}}}
  function draw(){
    const lines=[67,88,109,130,151].map(y=>`<line x1="35" y1="${y}" x2="865" y2="${y}" stroke="#b9c8df" stroke-width="2"/>`).join("");
    const gap=Math.min(110,650/Math.max(1,notes.length-1)),first=Math.max(155,(900-gap*(notes.length-1))/2);
    svg.innerHTML=`<rect width="900" height="205" rx="12" fill="#fff"/>${lines}<text x="44" y="143" font-size="86" fill="#233967">𝄞</text>`+notes.map((note,i)=>{
      const y=172-(note.charCodeAt(0)-67)*10.5,x=first+i*gap;
      return `<g class="journey-note" data-note="${note}"><ellipse cx="${x}" cy="${y}" rx="14" ry="10" transform="rotate(-18 ${x} ${y})" fill="#253a73"/><line x1="${x+12}" y1="${y-2}" x2="${x+12}" y2="${y-61}" stroke="#253a73" stroke-width="3"/>${note==="C4"?`<line x1="${x-21}" y1="${y}" x2="${x+21}" y2="${y}" stroke="#526482" stroke-width="2"/>`:""}</g>`;
    }).join("");
    keyboard.innerHTML=["C4","D4","E4","F4","G4","A4","B4"].map(n=>`<button type="button" data-note="${n}" aria-label="${labels[n[0]]}">${labels[n[0]]}</button>`).join("");
  }
  function light(note,index){
    stage.querySelectorAll(".lit").forEach(el=>el.classList.remove("lit"));
    keyboard.querySelector(`[data-note="${note}"]`)?.classList.add("lit");
    const mark=index===undefined?svg.querySelector(`.journey-note[data-note="${note}"]`):svg.querySelectorAll(".journey-note")[index];
    mark?.classList.add("lit");
    const score=stage.querySelector(".journey-score");
    if(score&&mark){const x=Number(mark.querySelector("ellipse")?.getAttribute("cx"))||0;score.scrollTo({left:Math.max(0,x*svg.getBoundingClientRect().width/900-score.clientWidth*.45),behavior:"smooth"})}
  }
  function sound(note){const bridge=window.LuwipiAudioBridge;if(bridge?.play)bridge.play(note,1,560,.98);else if(window.LuwipiScoreEngine?.playNote)window.LuwipiScoreEngine.playNote(window.LuwipiScoreEngine.nameToMidi(note),1,560,.9)}
  function refresh(){
    const exercises=window.LuwipiJourneyExercises;if(!exercises)return;
    const completed=progress(),found=sequence.find(i=>!completed["right:"+i]);
    next=found===undefined?0:found;
    const exercise=exercises[next];if(!exercise)return;
    if(notes.join()!==exercise.notes.join()){clear();notes=exercise.notes.slice();draw()}
    const done=sequence.filter(i=>completed["right:"+i]).length;
    stage.querySelector(".journey-stage-top small").textContent=`Próximo exercício · ${done===sequence.length?1:done+1} de ${sequence.length}`;
    stage.querySelector("[data-journey-title]").textContent=exercise.n;
    if(!playing)status.textContent=exercise.h;
    stage.querySelector("[data-journey-start]").textContent=done?"Tocar este exercício":"Começar a tocar";
  }
  stage.querySelector("[data-journey-listen]").addEventListener("click",()=>{
    if(playing){clear();refresh();return}if(!notes.length)return;
    playing=true;status.textContent="Ouve e segue as notas";stage.querySelector("[data-journey-listen]").textContent="■ Parar";
    notes.forEach((n,i)=>timers.push(setTimeout(()=>{light(n,i);sound(n)},i*560)));
    timers.push(setTimeout(()=>{clear();status.textContent="Agora toca tu"},notes.length*560+180));
  });
  keyboard.addEventListener("click",event=>{const key=event.target.closest("[data-note]");if(!key)return;light(key.dataset.note);sound(key.dataset.note);window.LuwipiWorkspacePiano?.emit(window.LuwipiScoreEngine?.nameToMidi(key.dataset.note),"on")});
  stage.querySelector("[data-journey-start]").addEventListener("click",()=>{
    refresh();clear();const level=next<4||next===5?"sounds":next<11?"phrases":"fluency";
    view.querySelector(`[data-reading-level="${level}"]`)?.click();
    view.querySelector(`[data-ex="${next}"]`)?.click();
  });
  const toggle=view.querySelector("[data-library-toggle]");toggle?.addEventListener("click",()=>{const open=view.classList.toggle("library-open");toggle.textContent=open?"Fechar escolhas":"Ver todas as atividades e músicas";toggle.setAttribute("aria-expanded",String(open))});
  new MutationObserver(()=>{if(view.classList.contains("active"))refresh()}).observe(view,{attributes:true,attributeFilter:["class"]});
  document.addEventListener("luwipi:journey-ready",refresh);refresh();
  // Games are now a single curated catalog; cards stay in their original DOM order.
})();
