(function(){
"use strict";

const Engine=window.LuwipiScoreEngine;
const Input=window.LuwipiLiveInput;
const view=document.getElementById("liveModeView");
if(!view||!Engine||!Input)return;

const fileInput=document.getElementById("liveScoreFile");
const fileState=document.getElementById("liveFileState");
const fileName=document.getElementById("liveFileName");
const fileMeta=document.getElementById("liveFileMeta");
const clearButton=document.getElementById("liveClearFiles");
const svg=document.getElementById("liveScoreSvg");
const svgWrap=document.getElementById("liveSvgWrap");
const pdfWrap=document.getElementById("livePdfWrap");
const pdfObject=document.getElementById("livePdfObject");
const pdfFallback=document.getElementById("livePdfFallback");
const empty=document.getElementById("liveScoreEmpty");
const tabs=document.getElementById("liveViewTabs");
const originalTab=document.getElementById("liveOriginalTab");
const interactiveTab=document.getElementById("liveInteractiveTab");
const playButton=document.getElementById("livePlay");
const stopButton=document.getElementById("liveStop");
const hearButton=document.getElementById("liveHear");
const addReadingButton=document.getElementById("liveAddReading");
const practiceButton=document.getElementById("livePractice");
const tempoDown=document.getElementById("liveTempoDown");
const tempoUp=document.getElementById("liveTempoUp");
const tempoLabel=document.getElementById("liveTempoLabel");
const guideToggle=document.getElementById("liveGuideToggle");
const rhythmToggle=document.getElementById("liveRhythmToggle");
const sourceMidi=document.getElementById("liveSourceMidi");
const sourceMic=document.getElementById("liveSourceMic");
const inputState=document.getElementById("liveInputState");
const sessionDot=document.getElementById("liveSessionDot");
const sessionTitle=document.getElementById("liveSessionTitle");
const feedback=document.getElementById("liveFeedback");
const detected=document.getElementById("liveDetected");
const accuracyMetric=document.getElementById("liveAccuracy");
const progressMetric=document.getElementById("liveProgressMetric");
const timingMetric=document.getElementById("liveTimingMetric");
const pdfWarning=document.getElementById("livePdfWarning");

let score=null,groups=[],pdfUrl="",pdfFileName="",structuredFileName="",activeView="interactive";
let tempo=120,guideOn=true,rhythmOn=true,practice=false,practiceIndex=0,practiceAnchor=0,practiceFirstBeat=0;
let correctCount=0,attempts=0,timingSamples=[],chordSeen=new Set(),noteOnTimes=new Map(),playTimers=[],playing=false;
let inputMode="none",unsubscribe=null,lastDetected="-";

const PT={C:"Dó","C#":"Dó♯",D:"Ré","D#":"Ré♯",E:"Mi",F:"Fá","F#":"Fá♯",G:"Sol","G#":"Sol♯",A:"Lá","A#":"Lá♯",B:"Si"};

function ptNote(midi){
  const name=Engine.midiToName(midi),match=/^([A-G]#?)(-?\d+)$/.exec(name);
  return match?(PT[match[1]]||match[1])+match[2]:name;
}
function setFeedback(text,tone){
  feedback.textContent=text||"";
  feedback.classList.remove("good","near","bad");
  if(tone)feedback.classList.add(tone);
}
function setInputState(text){inputState.textContent=text||""}
function setSession(active,title){
  sessionDot.classList.toggle("active",Boolean(active));
  sessionTitle.textContent=title||"Pronto";
}
function clearTimers(){
  playTimers.forEach(clearTimeout);playTimers=[];
  playing=false;
  playButton.textContent="▶ Tocar";
}
function stopPlayback(){
  clearTimers();
  renderScore();
}
function audio(){
  return window.LuwipiAudioBridge||null;
}
function playNoteEvent(event,delayMs,baseBeatMs,level){
  const bridge=audio();
  if(!bridge||typeof bridge.play!=="function")return;
  const timer=setTimeout(()=>{
    bridge.play(event.note,event.durationBeat,baseBeatMs,level||Math.max(.42,Math.min(1.05,event.velocity/92)));
  },Math.max(0,delayMs));
  playTimers.push(timer);
}
function renderScore(){
  if(!score){
    svgWrap.classList.add("hidden");empty.classList.toggle("hidden",Boolean(pdfUrl));
    return;
  }
  svgWrap.classList.remove("hidden");empty.classList.add("hidden");
  const current=practice&&guideOn?practiceIndex:-1;
  Engine.render(svg,score,{currentGroupIndex:current});
  if(practice&&guideOn){
    const currentEl=svg.querySelector('[data-live-group="'+practiceIndex+'"]');
    if(currentEl&&currentEl.scrollIntoView)currentEl.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
  }
}
function updateTabs(){
  const hasPdf=Boolean(pdfUrl),hasStructured=Boolean(score);
  tabs.classList.toggle("hidden",!(hasPdf&&hasStructured));
  originalTab.disabled=!hasPdf;interactiveTab.disabled=!hasStructured;
  originalTab.classList.toggle("active",activeView==="original");
  interactiveTab.classList.toggle("active",activeView==="interactive");
  pdfWrap.classList.toggle("hidden",activeView!=="original"||!hasPdf);
  svgWrap.classList.toggle("hidden",activeView!=="interactive"||!hasStructured);
  empty.classList.toggle("hidden",hasPdf||hasStructured);
  pdfWarning.classList.toggle("hidden",!(hasPdf&&!hasStructured));
}
function chooseView(which){
  if(which==="original"&&!pdfUrl)return;
  if(which==="interactive"&&!score)return;
  activeView=which;updateTabs();
}
function updateFileState(){
  const bits=[];
  if(structuredFileName)bits.push(structuredFileName);
  if(pdfFileName)bits.push(pdfFileName);
  fileState.classList.toggle("is-empty",bits.length===0);
  fileName.textContent=bits.length?bits.join(" + "):"Nenhuma partitura carregada";
  const stageTitle=document.getElementById("liveStageTitle");
  if(stageTitle)stageTitle.textContent=score?score.title:(pdfFileName||"Modo ao Vivo");
  if(score){
    fileMeta.textContent=Math.round(score.tempoBpm)+" BPM · "+score.meter[0]+"/"+score.meter[1]+" · "+score.events.length+" notas · "+score.keyName;
  }else if(pdfFileName){
    fileMeta.textContent="PDF preservado como original · associa MIDI/MusicXML para Play, Guia e avaliação";
  }else{
    fileMeta.textContent="MIDI e MusicXML estruturam a partitura; PDF é mantido como documento visual.";
  }
  tempo=score?Math.round(score.tempoBpm):tempo;
  tempoLabel.textContent=tempo+" BPM";
  playButton.disabled=!score;
  practiceButton.disabled=!score;
  hearButton.disabled=!score;
  if(addReadingButton){addReadingButton.disabled=!score;addReadingButton.textContent="＋ Adicionar à Leitura";}
  clearButton.classList.toggle("hidden",bits.length===0);
  updateTabs();
}
function resetPractice(){
  practice=false;practiceIndex=0;practiceAnchor=0;practiceFirstBeat=groups[0]?groups[0].startBeat:0;
  correctCount=0;attempts=0;timingSamples=[];chordSeen.clear();noteOnTimes.clear();
  practiceButton.textContent="Começar treino";
  setSession(false,"Pronto");
  setFeedback(score?"Liga um piano MIDI ou o microfone e começa quando estiveres pronto.":"Importa uma partitura estruturada para começar.","");
  updateMetrics();
  renderScore();
}
function updateMetrics(){
  const accuracy=attempts?Math.round(correctCount/attempts*100):0;
  accuracyMetric.innerHTML="<b>"+accuracy+"%</b> notas";
  progressMetric.innerHTML="<b>"+(score?Math.min(practiceIndex,groups.length):0)+"/"+groups.length+"</b> passos";
  const mean=timingSamples.length?Math.round(timingSamples.reduce((a,b)=>a+Math.abs(b),0)/timingSamples.length):0;
  timingMetric.innerHTML="<b>"+(timingSamples.length?mean+" ms":"—")+"</b> ritmo";
}
function setScore(next,name){
  score=Engine.normalizeScore(next);groups=Engine.groupEvents(score);structuredFileName=name||score.title;
  tempo=Math.round(score.tempoBpm);activeView="interactive";
  resetPractice();updateFileState();renderScore();
}
function clearAll(){
  stopPlayback();resetPractice();
  score=null;groups=[];structuredFileName="";pdfFileName="";
  if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl="";
  pdfObject.removeAttribute("data");pdfFallback.replaceChildren();
  activeView="interactive";updateFileState();renderScore();
}
function readableError(code){
  const map={
    midi_header_invalid:"Este ficheiro não parece ser um MIDI válido.",
    midi_format_unsupported:"Este tipo de MIDI ainda não é suportado.",
    midi_smpte_unsupported:"MIDI com relógio SMPTE ainda não é suportado.",
    midi_no_notes:"O MIDI não contém notas de piano utilizáveis.",
    musicxml_invalid:"O MusicXML não pôde ser lido.",
    musicxml_root_unsupported:"Este XML não é uma partitura MusicXML compatível.",
    musicxml_timewise_unsupported:"MusicXML timewise ainda não é suportado.",
    musicxml_no_notes:"O MusicXML não contém notas reconhecíveis."
  };
  return map[code]||"Não foi possível interpretar este ficheiro com segurança.";
}
async function importFile(file){
  if(!file)return;
  const name=String(file.name||"ficheiro"),lower=name.toLowerCase();
  try{
    if(lower.endsWith(".mid")||lower.endsWith(".midi")||/midi/i.test(file.type||"")){
      if(file.size>8*1024*1024)throw new Error("file_too_large");
      const parsed=Engine.parseMIDI(await file.arrayBuffer());
      setScore(parsed,name);setFeedback("MIDI lido. A partitura interativa e o treino já estão prontos.","good");
    }else if(lower.endsWith(".musicxml")||lower.endsWith(".xml")||/musicxml|xml/i.test(file.type||"")){
      if(file.size>12*1024*1024)throw new Error("file_too_large");
      const parsed=Engine.parseMusicXML(await file.text());
      setScore(parsed,name);setFeedback("MusicXML lido com notação estruturada.","good");
    }else if(lower.endsWith(".pdf")||file.type==="application/pdf"){
      if(file.size>30*1024*1024)throw new Error("file_too_large");
      if(pdfUrl)URL.revokeObjectURL(pdfUrl);
      pdfUrl=URL.createObjectURL(file);pdfFileName=name;
      pdfObject.data=pdfUrl;
      pdfFallback.replaceChildren();
      const link=document.createElement("a");link.href=pdfUrl;link.target="_blank";link.rel="noopener";link.textContent="Abrir PDF";
      pdfFallback.append("O browser não conseguiu mostrar o PDF. ",link);
      activeView="original";
      updateFileState();
      setFeedback(score?"PDF associado à partitura estruturada. Usa Original ou Interativo conforme precisares.":"PDF preservado. Para tocar ou avaliar, adiciona o MIDI/MusicXML correspondente.","near");
    }else{
      setFeedback("Formato não suportado. Usa MIDI, MusicXML ou PDF.","bad");
    }
  }catch(error){
    setFeedback(error&&error.message==="file_too_large"?"O ficheiro é demasiado grande para processamento local.":readableError(error&&error.message), "bad");
  }finally{
    fileInput.value="";
  }
}
function playScore(){
  if(!score||playing)return;
  stopPlayback();
  playing=true;playButton.textContent="■ Parar";
  const beatMs=60000/tempo,first=score.events.length?score.events[0].startBeat:0;
  score.events.forEach(event=>playNoteEvent(event,(event.startBeat-first)*beatMs,beatMs));
  groups.forEach(group=>{
    const timer=setTimeout(()=>{
      if(!playing)return;
      const idx=group.index;
      Engine.render(svg,score,{currentGroupIndex:guideOn?idx:-1});
    },Math.max(0,(group.startBeat-first)*beatMs));
    playTimers.push(timer);
  });
  const end=Math.max.apply(null,score.events.map(e=>(e.startBeat-first+e.durationBeat)*beatMs));
  playTimers.push(setTimeout(()=>{playing=false;playButton.textContent="▶ Tocar";renderScore()},end+120));
}
function hearPhrase(){
  if(!score||!groups.length)return;
  const bridge=audio();
  if(!bridge){setFeedback("O piano do Luwipi ainda não está disponível nesta sessão.","bad");return}
  clearTimers();
  const beatMs=60000/tempo,start=Math.min(practiceIndex,groups.length-1),slice=groups.slice(Math.max(0,start-1),Math.min(groups.length,start+3));
  const first=slice[0].startBeat;
  slice.forEach(group=>group.events.forEach(event=>playNoteEvent(event,(event.startBeat-first)*beatMs,beatMs,.9)));
  const total=(slice[slice.length-1].startBeat-first+slice[slice.length-1].durationBeat)*beatMs;
  playTimers.push(setTimeout(()=>{playTimers=[];renderScore()},total+80));
  setFeedback("Ouve o ataque e o espaço até à nota seguinte. Depois repete.","near");
}
async function selectSource(kind){
  if(kind===inputMode)return;
  setInputState("A ligar…");
  try{
    if(kind==="midi"){
      const result=await Input.connectMIDI();
      inputMode="midi";
      sourceMidi.classList.add("active");sourceMic.classList.remove("active");
      setInputState(result.count?result.count+" entrada(s) MIDI ligada(s): "+result.names.join(", "):"MIDI autorizado, mas nenhum teclado foi encontrado.");
    }else{
      await Input.connectMicrophone();
      inputMode="microphone";
      sourceMic.classList.add("active");sourceMidi.classList.remove("active");
      setInputState("Microfone ativo · melhor para uma nota de cada vez. Acordes não são avaliados pelo microfone.");
    }
  }catch(error){
    inputMode="none";sourceMidi.classList.remove("active");sourceMic.classList.remove("active");
    const code=error&&error.message;
    if(code==="midi_not_supported")setInputState("Este browser não suporta Web MIDI. Usa um browser compatível ou o microfone.");
    else if(code==="microphone_not_supported")setInputState("Este browser não permite escuta pelo microfone.");
    else setInputState("Não foi possível ativar esta entrada. Verifica a permissão do browser.");
  }
}
function startPractice(){
  if(!score||!groups.length)return;
  chooseView("interactive");
  if(inputMode==="none"){
    setFeedback("Primeiro liga o piano MIDI ou o microfone.","bad");return;
  }
  stopPlayback();practice=true;practiceIndex=0;practiceAnchor=0;practiceFirstBeat=groups[0].startBeat;
  correctCount=0;attempts=0;timingSamples=[];chordSeen.clear();noteOnTimes.clear();
  practiceButton.textContent="Parar treino";
  setSession(true,"A ouvir");
  setFeedback(guideOn?"Toca a nota destacada.":"Começa pela primeira nota da partitura.","");
  updateMetrics();renderScore();
}
function stopPractice(){
  practice=false;chordSeen.clear();noteOnTimes.clear();practiceButton.textContent="Começar treino";
  setSession(false,"Pausado");renderScore();
}
function expectedGroup(){return groups[practiceIndex]||null}
function directionText(diff){
  if(Math.abs(diff)<35)return"no tempo";
  return diff<0?Math.abs(Math.round(diff))+" ms cedo":Math.abs(Math.round(diff))+" ms tarde";
}
function advancePractice(tone,message){
  correctCount++;practiceIndex++;chordSeen.clear();
  if(practiceIndex>=groups.length){
    practice=false;practiceButton.textContent="Repetir treino";setSession(false,"Concluído");
    setFeedback("Terminaste a partitura. Revê a precisão de notas e o ritmo abaixo.","good");
  }else{
    setFeedback(message||"Certo. Continua.",tone||"good");
  }
  updateMetrics();renderScore();
}
function handleNoteOn(detail){
  lastDetected=ptNote(detail.midi);detected.textContent=lastDetected;
  if(!practice)return;
  const group=expectedGroup();if(!group)return;
  if(inputMode==="microphone"&&group.pitches.length>1){
    setFeedback("Este ponto é um acorde. Para avaliar acordes com precisão, liga um teclado MIDI.","near");
    return;
  }
  if(!group.pitches.includes(detail.midi)){
    attempts++;
    setFeedback("Nota diferente. Esperava "+group.pitches.map(ptNote).join(" + ")+".","bad");
    updateMetrics();return;
  }
  chordSeen.add(detail.midi);
  noteOnTimes.set(detail.midi,{at:detail.at,groupIndex:practiceIndex,durationBeat:group.events.find(e=>e.midi===detail.midi)?.durationBeat||group.durationBeat});
  if(group.pitches.some(p=>!chordSeen.has(p))){
    setFeedback("Continua o acorde: "+group.pitches.filter(p=>!chordSeen.has(p)).map(ptNote).join(" + ")+".","");
    return;
  }
  attempts++;
  const beatMs=60000/tempo;
  if(!practiceAnchor){
    practiceAnchor=detail.at-(group.startBeat-practiceFirstBeat)*beatMs;
    advancePractice("good","Certo. O relógio rítmico começou agora.");
    return;
  }
  const expected=practiceAnchor+(group.startBeat-practiceFirstBeat)*beatMs;
  const diff=detail.at-expected;
  if(rhythmOn){
    timingSamples.push(diff);
    const beats=Math.abs(diff)/beatMs;
    if(beats>.46){
      chordSeen.clear();
      setFeedback("Quase — "+directionText(diff)+". Ouve o trecho e repete antes de avançar.","near");
      updateMetrics();renderScore();return;
    }
    if(beats>.22){
      advancePractice("near","Quase — "+directionText(diff)+". Continua.");
      return;
    }
  }
  advancePractice("good","Certo · "+directionText(diff)+".");
}
function handleNoteOff(detail){
  if(!rhythmOn||detail.source!=="midi")return;
  const started=noteOnTimes.get(detail.midi);
  if(!started)return;
  noteOnTimes.delete(detail.midi);
  const held=detail.at-started.at,expected=started.durationBeat*(60000/tempo);
  const ratio=held/Math.max(1,expected);
  if(ratio<.48)setFeedback("A duração ficou curta. Sustenta esta nota um pouco mais.","near");
  else if(ratio>1.65)setFeedback("A duração ficou longa. Liberta a tecla mais cedo.","near");
}
function onInput(detail){
  if(!detail)return;
  if(detail.type==="noteon")handleNoteOn(detail);
  else if(detail.type==="noteoff")handleNoteOff(detail);
}
function toggle(button,next){
  button.setAttribute("aria-pressed",String(next));
}
function cleanupWhenHidden(){
  if(view.classList.contains("active"))return;
  stopPlayback();stopPractice();
  Input.disconnect();inputMode="none";sourceMidi.classList.remove("active");sourceMic.classList.remove("active");
  setInputState("Entrada desligada ao sair do Modo ao Vivo.");
}

fileInput.addEventListener("change",()=>importFile(fileInput.files&&fileInput.files[0]));
clearButton.addEventListener("click",clearAll);
originalTab.addEventListener("click",()=>chooseView("original"));
interactiveTab.addEventListener("click",()=>chooseView("interactive"));
playButton.addEventListener("click",()=>playing?stopPlayback():playScore());
stopButton.addEventListener("click",()=>{stopPlayback();if(practice)stopPractice()});
hearButton.addEventListener("click",hearPhrase);
if(addReadingButton)addReadingButton.addEventListener("click",async()=>{
  if(!score)return;
  const library=window.LuwipiReadingLibrary;
  if(!library||typeof library.add!=="function"){setFeedback("A biblioteca de Leitura não está disponível nesta sessão.","bad");return}
  addReadingButton.disabled=true;
  addReadingButton.textContent="A guardar…";
  try{
    const result=await library.add(score,structuredFileName||score.title);
    addReadingButton.textContent=result&&result.existed?"✓ Já está na Leitura":"✓ Adicionada à Leitura";
    setFeedback(result&&result.existed?"Esta música já estava na Leitura.":"Música adicionada à Leitura. Só foi guardada porque escolheste adicionar.","good");
  }catch(error){
    console.error("Reading library save failed",error);
    addReadingButton.disabled=false;
    addReadingButton.textContent="＋ Adicionar à Leitura";
    setFeedback("Não foi possível guardar esta música na Leitura neste browser.","bad");
  }
});
practiceButton.addEventListener("click",()=>practice?stopPractice():startPractice());
tempoDown.addEventListener("click",()=>{tempo=Math.max(30,tempo-4);tempoLabel.textContent=tempo+" BPM";if(practice)resetPractice()});
tempoUp.addEventListener("click",()=>{tempo=Math.min(240,tempo+4);tempoLabel.textContent=tempo+" BPM";if(practice)resetPractice()});
guideToggle.addEventListener("click",()=>{guideOn=!guideOn;toggle(guideToggle,guideOn);renderScore()});
rhythmToggle.addEventListener("click",()=>{rhythmOn=!rhythmOn;toggle(rhythmToggle,rhythmOn);if(practice)resetPractice()});
sourceMidi.addEventListener("click",()=>selectSource("midi"));
sourceMic.addEventListener("click",()=>selectSource("microphone"));

unsubscribe=Input.subscribe(onInput);
const observer=new MutationObserver(cleanupWhenHidden);
observer.observe(view,{attributes:true,attributeFilter:["class"]});
window.addEventListener("pagehide",()=>{stopPlayback();Input.disconnect();if(unsubscribe)unsubscribe()});

toggle(guideToggle,guideOn);toggle(rhythmToggle,rhythmOn);
updateFileState();resetPractice();
})();