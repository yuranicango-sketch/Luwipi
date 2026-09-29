(()=>{
  "use strict";
  const view=document.getElementById("readingView"),stage=document.getElementById("readingStage");
  if(!view||!stage)return;
  const notes=["C4","D4","E4","F4","G4","F4","E4","D4"],labels={C:"Dó",D:"Ré",E:"Mi",F:"Fá",G:"Sol"};
  const svg=stage.querySelector("svg"),keyboard=stage.querySelector(".journey-keyboard"),status=stage.querySelector(".journey-sub");
  let timers=[],playing=false;
  const clear=()=>{timers.forEach(clearTimeout);timers=[];playing=false;stage.querySelectorAll(".lit").forEach(el=>el.classList.remove("lit"));stage.querySelector("[data-journey-listen]").textContent="▶ Ouvir e ver"};
  const lines=[67,88,109,130,151].map(y=>`<line x1="35" y1="${y}" x2="865" y2="${y}" stroke="#b9c8df" stroke-width="2"/>`).join("");
  svg.innerHTML=`<rect width="900" height="205" rx="12" fill="#fff"/>${lines}<text x="44" y="143" font-size="86" fill="#233967">𝄞</text>`+notes.map((note,i)=>{
    const y=172-(note.charCodeAt(0)-67)*10.5,x=155+i*96;
    return `<g class="journey-note" data-note="${note}"><ellipse cx="${x}" cy="${y}" rx="14" ry="10" transform="rotate(-18 ${x} ${y})" fill="#253a73"/><line x1="${x+12}" y1="${y-2}" x2="${x+12}" y2="${y-61}" stroke="#253a73" stroke-width="3"/>${note==="C4"?`<line x1="${x-21}" y1="${y}" x2="${x+21}" y2="${y}" stroke="#526482" stroke-width="2"/>`:""}</g>`}).join("");
  keyboard.innerHTML=["C4","D4","E4","F4","G4","A4","B4"].map(n=>`<button type="button" data-note="${n}" aria-label="${labels[n[0]]||n}">${labels[n[0]]||n}</button>`).join("");
  function light(note,index){
    stage.querySelectorAll(".lit").forEach(el=>el.classList.remove("lit"));
    keyboard.querySelector(`[data-note="${note}"]`)?.classList.add("lit");
    const mark=index===undefined?svg.querySelector(`.journey-note[data-note="${note}"]`):svg.querySelectorAll(".journey-note")[index];
    mark?.classList.add("lit");
    const score=stage.querySelector(".journey-score");
    if(score&&mark){const x=Number(mark.querySelector("ellipse")?.getAttribute("cx"))||0;score.scrollTo({left:Math.max(0,x*svg.getBoundingClientRect().width/900-score.clientWidth*.45),behavior:"smooth"})}
  }
  function sound(note){const bridge=window.LuwipiAudioBridge;if(bridge?.play)bridge.play(note,1,560,.98);else if(window.LuwipiScoreEngine?.playNote)window.LuwipiScoreEngine.playNote(window.LuwipiScoreEngine.nameToMidi(note),1,560,.9)}
  function progress(){try{return JSON.parse(localStorage.getItem("luwipi:reading-progress:v1")||"{}")||{}}catch{return {}}}
  function refresh(){
    const done=Object.values(progress()).filter(Boolean).length,step=done>=11?4:done>=5?3:done>=1?2:1;
    stage.querySelector(".journey-stage-top small").textContent=`Jornada de leitura · ${step}.º passo`;
    stage.querySelector(".journey-progress").setAttribute("aria-label",`Etapa ${step} de 4`);
    stage.querySelectorAll(".journey-progress i").forEach((item,index)=>item.classList.toggle("active",index<=step-1));
    stage.querySelector("[data-journey-start]").textContent=done?"Continuar a tocar":"Começar a tocar";
  }
  stage.querySelector("[data-journey-listen]").addEventListener("click",()=>{
    if(playing){clear();return}playing=true;status.textContent="Segue as luzes e canta as notas";stage.querySelector("[data-journey-listen]").textContent="■ Parar";
    notes.forEach((n,i)=>timers.push(setTimeout(()=>{light(n,i);sound(n)},i*560)));
    timers.push(setTimeout(()=>{clear();status.textContent="Agora toca tu"},notes.length*560+180));
  });
  keyboard.addEventListener("click",event=>{const key=event.target.closest("[data-note]");if(!key)return;light(key.dataset.note);sound(key.dataset.note)});
  stage.querySelector("[data-journey-start]").addEventListener("click",()=>{
    clear();const completed=progress();
    const sequence=[0,1,2,3,5,4,6,7,8,9,10,11,12,13];let next=sequence.find(i=>!completed["right:"+i]);if(next===undefined)next=0;
    const level=next<4||next===5?"sounds":next<11?"phrases":"fluency";
    view.querySelector(`[data-reading-level="${level}"]`)?.click();
    const entry=view.querySelector(`[data-ex="${next}"]`)||view.querySelector("[data-ex]");entry?.click();
  });
  const toggle=view.querySelector("[data-library-toggle]");toggle?.addEventListener("click",()=>{const open=view.classList.toggle("library-open");toggle.textContent=open?"Fechar escolhas":"Ver todas as atividades e músicas";toggle.setAttribute("aria-expanded",String(open))});
  view.querySelectorAll("[data-journey]").forEach(button=>button.addEventListener("click",()=>{view.classList.add("library-open");toggle?.setAttribute("aria-expanded","true");if(toggle)toggle.textContent="Fechar escolhas"},true));
  new MutationObserver(()=>{if(view.classList.contains("active"))refresh()}).observe(view,{attributes:true,attributeFilter:["class"]});
  refresh();
  const games=document.getElementById("gamesView"),gameGrid=document.getElementById("gamesPathGrid"),gameToggle=document.getElementById("gamesLibraryToggle");
  if(games&&gameGrid&&gameToggle){
    [games.querySelector('[data-game="noteHunt"]'),games.querySelector('[href="/paw-paw-notas.html"]'),games.querySelector('[href="/super-paw-paw.html"]')].forEach(card=>{if(card)gameGrid.appendChild(card)});
    gameToggle.addEventListener("click",()=>{const open=games.classList.toggle("library-open");gameToggle.setAttribute("aria-expanded",String(open));gameToggle.textContent=open?"Fechar jogos":"Ver todos os jogos"});
  }
})();
