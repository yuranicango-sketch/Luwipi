(function readingGuideBootstrap(){
  "use strict";
  const STORAGE_KEY="luwipi:reading-guide:enabled";
  const selectors={
    reading:"#readingView",exercise:"#exerciseView",song:"#songView",noteFlow:"#noteFlowView"
  };
  let enabled=false;
  let activeKind="";
  let sequence=[];
  let signature="";
  let index=0;
  let lastNodeKey="";
  let lastNote="";
  let openedByGuide=false;
  let raf=0;
  let initialized=false;

  function readEnabled(){
    try{return localStorage.getItem(STORAGE_KEY)==="1"}catch(_){return false}
  }
  function writeEnabled(value){
    try{localStorage.setItem(STORAGE_KEY,value?"1":"0")}catch(_){}
  }
  function activeSurface(){
    for(const [kind,sel] of Object.entries(selectors)){
      if(kind==="reading")continue;
      const view=document.querySelector(sel);
      if(view&&view.classList.contains("active"))return kind;
    }
    return "";
  }
  function syncToggles(){
    document.querySelectorAll("[data-reading-guide-toggle]").forEach(button=>{
      button.setAttribute("aria-pressed",String(enabled));
      const label=button.querySelector(".reading-guide-label");
      if(label)label.textContent=enabled?"Guia · ON":"Guia · OFF";
      button.setAttribute("aria-label",enabled?"Desativar guia de leitura":"Ativar guia de leitura");
    });
  }
  function guideIsActive(){return enabled&&!!activeSurface()}
  function clearScoreHighlights(){
    document.querySelectorAll(".reading-guide-current").forEach(el=>el.classList.remove("reading-guide-current"));
  }
  function setScoreHighlight(node){
    document.querySelectorAll(".reading-guide-current").forEach(el=>{
      if(el!==node)el.classList.remove("reading-guide-current");
    });
    if(node&&!node.classList.contains("reading-guide-current"))node.classList.add("reading-guide-current");
  }
  function clearPianoHighlights(){
    const board=document.getElementById("pianoBoard");
    if(!board)return;
    board.querySelectorAll(".reading-guide-target,.reading-guide-repeat").forEach(el=>{
      el.classList.remove("reading-guide-target","reading-guide-repeat");
      el.removeAttribute("aria-current");
    });
  }
  function closeGuidePianoIfNeeded(){
    if(!openedByGuide)return;
    const dock=document.getElementById("pianoDock");
    const close=document.getElementById("closePiano");
    if(dock&&!dock.classList.contains("hidden")&&close)close.click();
    openedByGuide=false;
  }
  function ensurePianoOpen(kind){
    if(!enabled||window.innerWidth<700||!kind)return;
    const dock=document.getElementById("pianoDock");
    if(!dock||!dock.classList.contains("hidden"))return;
    const buttonId=kind==="exercise"?"exercisePianoBtn":kind==="song"?"songPianoBtn":kind==="noteFlow"?"noteFlowPianoBtn":"";
    const button=buttonId?document.getElementById(buttonId):null;
    if(button){button.click();openedByGuide=true}
  }
  function scrollPianoTo(key){
    const scroller=document.querySelector("#pianoDock .piano-scroll");
    if(!scroller||!key||scroller.clientWidth<=0)return;
    const target=Math.max(0,key.offsetLeft-scroller.clientWidth/2+key.offsetWidth/2);
    scroller.scrollTo({left:target,behavior:"smooth"});
  }
  function setPianoTarget(note,nodeKey){
    clearPianoHighlights();
    if(!guideIsActive()||!note)return;
    const board=document.getElementById("pianoBoard");
    const key=board?.querySelector('[data-piano-note="'+CSS.escape(note)+'"]');
    if(!key)return;
    const repeated=lastNodeKey&&nodeKey!==lastNodeKey&&note===lastNote;
    key.classList.add("reading-guide-target");
    if(repeated)key.classList.add("reading-guide-repeat");
    key.setAttribute("aria-current","true");
    lastNodeKey=nodeKey;
    lastNote=note;
    requestAnimationFrame(()=>scrollPianoTo(key));
  }
  function collectStructured(kind){
    if(kind==="exercise"){
      return Array.from(document.querySelectorAll('#exerciseSvg g[id^="ex-"][data-note]'));
    }
    if(kind==="song"){
      return Array.from(document.querySelectorAll('#songSvg g[id^="R-"][data-note]'));
    }
    return [];
  }
  function nodeSignature(nodes){
    return nodes.map(node=>(node.id||"")+":"+String(node.dataset.note||"")).join("|");
  }
  function syncStructured(kind){
    const nodes=collectStructured(kind);
    const nextSig=nodeSignature(nodes);
    if(kind!==activeKind||nextSig!==signature){
      activeKind=kind;sequence=nodes;signature=nextSig;index=0;lastNodeKey="";lastNote="";
    }else{
      sequence=nodes;
      if(index>=sequence.length)index=sequence.length;
    }
    if(!enabled||!sequence.length||index>=sequence.length){clearScoreHighlights();clearPianoHighlights();return}
    const node=sequence[index];
    setScoreHighlight(node);
    setPianoTarget(node.dataset.note,node.id||kind+"-"+index);
  }
  function currentFlowItem(){
    const track=document.getElementById("noteFlowTrack");
    if(!track)return null;
    return track.querySelector(".note-flow-item.current")||null;
  }
  function syncNoteFlow(){
    if(!enabled){clearScoreHighlights();clearPianoHighlights();return}
    const item=currentFlowItem();
    if(!item){clearScoreHighlights();clearPianoHighlights();return}
    setScoreHighlight(item);
    const idx=item.dataset.noteFlowIndex||"0";
    setPianoTarget(item.dataset.noteFlowNote,"flow-"+idx);
  }
  function completeStructured(kind){
    clearScoreHighlights();clearPianoHighlights();
    if(kind==="song"){
      const next=document.getElementById("songNext");
      if(next&&!next.disabled){
        setTimeout(()=>{if(enabled&&activeSurface()==="song")next.click()},280);
      }
    }
  }
  function advanceStructured(kind){
    if(kind!==activeKind)return;
    index+=1;
    if(index>=sequence.length){completeStructured(kind);return}
    syncStructured(kind);
  }
  function expectedNote(){
    const kind=activeSurface();
    if(!enabled||!kind)return "";
    if(kind==="noteFlow")return currentFlowItem()?.dataset.noteFlowNote||"";
    if(kind==="exercise"||kind==="song"){
      const nodes=collectStructured(kind);
      const sig=nodeSignature(nodes);
      if(kind!==activeKind||sig!==signature)syncStructured(kind);
      return sequence[index]?.dataset.note||"";
    }
    return "";
  }
  function animateWrong(key){
    key.classList.remove("reading-guide-wrong");
    void key.offsetWidth;
    key.classList.add("reading-guide-wrong");
    setTimeout(()=>key.classList.remove("reading-guide-wrong"),280);
  }
  function onPianoPointerDown(event){
    if(!guideIsActive())return;
    const key=event.target.closest?.("[data-piano-note]");
    if(!key)return;
    const expected=expectedNote();
    if(!expected)return;
    const played=key.dataset.pianoNote||"";
    if(played!==expected){
      event.preventDefault();
      event.stopImmediatePropagation();
      animateWrong(key);
      return;
    }
    const kind=activeSurface();
    if(kind==="exercise"||kind==="song")setTimeout(()=>advanceStructured(kind),0);
  }
  function scheduleSync(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;sync()});
  }
  function sync(){
    const kind=activeSurface();
    document.body.classList.toggle("reading-guide-enabled",enabled&&!!kind);
    syncToggles();
    if(!enabled||!kind){
      clearScoreHighlights();clearPianoHighlights();
      if(!kind||!enabled)closeGuidePianoIfNeeded();
      return;
    }
    ensurePianoOpen(kind);
    if(kind==="noteFlow")syncNoteFlow();
    else syncStructured(kind);
  }
  function setEnabled(next){
    enabled=!!next;writeEnabled(enabled);
    lastNodeKey="";lastNote="";
    sync();
  }
  function init(){
    if(initialized)return;
    const board=document.getElementById("pianoBoard");
    if(!board||!board.querySelector("[data-piano-note]"))return false;
    initialized=true;
    enabled=readEnabled();
    document.querySelectorAll("[data-reading-guide-toggle]").forEach(button=>{
      button.addEventListener("click",()=>setEnabled(!enabled));
    });
    board.addEventListener("pointerdown",onPianoPointerDown,true);

    const viewObserver=new MutationObserver(scheduleSync);
    Object.values(selectors).forEach(sel=>{
      const el=document.querySelector(sel);
      if(el)viewObserver.observe(el,{attributes:true,attributeFilter:["class"]});
    });
    const ex=document.getElementById("exerciseSvg"),song=document.getElementById("songSvg"),track=document.getElementById("noteFlowTrack");
    const scoreObserver=new MutationObserver(scheduleSync);
    if(ex)scoreObserver.observe(ex,{childList:true});
    if(song)scoreObserver.observe(song,{childList:true});
    if(track){
      const flowObserver=new MutationObserver(mutations=>{
        const meaningful=mutations.some(mutation=>{
          if(mutation.type==="childList")return true;
          const before=String(mutation.oldValue||"").split(/\s+/).includes("current");
          const after=mutation.target.classList.contains("current");
          return before!==after;
        });
        if(meaningful)scheduleSync();
      });
      flowObserver.observe(track,{childList:true,subtree:true,attributes:true,attributeFilter:["class"],attributeOldValue:true});
    }

    document.addEventListener("click",event=>{
      if(event.target.closest("[data-ex-aid],[data-song-aid],#exPrev,#exNext,#songPrev,#songNext,[data-note-flow-theme],#noteFlowStart"))scheduleSync();
    });
    window.addEventListener("resize",scheduleSync);
    window.addEventListener("pagehide",()=>{if(raf)cancelAnimationFrame(raf)});
    sync();
    return true;
  }
  let tries=0;
  const timer=setInterval(()=>{
    tries+=1;
    if(init()||tries>240)clearInterval(timer);
  },50);
})();