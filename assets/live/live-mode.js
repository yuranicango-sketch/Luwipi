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
const pdfFrame=document.getElementById("livePdfFrame");
const pdfFallback=document.getElementById("livePdfFallback");
const empty=document.getElementById("liveScoreEmpty");
const tabs=document.getElementById("liveViewTabs");
const originalTab=document.getElementById("liveOriginalTab");
const interactiveTab=document.getElementById("liveInteractiveTab");
const playButton=document.getElementById("livePlay");
const stopButton=document.getElementById("liveStop");
const hearButton=document.getElementById("liveHear");
const addReadingButton=document.getElementById("liveAddReading");
const addExerciseButton=document.getElementById("liveAddExercise");
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
const fidelityState=document.getElementById("liveFidelityState");
const fidelityBadge=document.getElementById("liveFidelityBadge");
const fidelityTitle=document.getElementById("liveFidelityTitle");
const fidelityText=document.getElementById("liveFidelityText");
const publishModal=document.getElementById("livePublishModal");
const publishClose=document.getElementById("livePublishClose");
const publishCancel=document.getElementById("livePublishCancel");
const publishConfirm=document.getElementById("livePublishConfirm");
const publishTitle=document.getElementById("livePublishTitle");
const publishSvg=document.getElementById("livePublishSvg");
const publishFidelityBadge=document.getElementById("livePublishFidelityBadge");
const publishFidelityTitle=document.getElementById("livePublishFidelityTitle");
const publishFidelityText=document.getElementById("livePublishFidelityText");
const publishIssues=document.getElementById("livePublishIssues");
const scopePersonal=document.getElementById("liveScopePersonal");
const scopeGlobal=document.getElementById("liveScopeGlobal");
const scopeHelp=document.getElementById("livePublishScopeHelp");

let score=null,groups=[],pdfUrl="",pdfFileName="",structuredFileName="",activeView="interactive";
let tempo=120,guideOn=true,rhythmOn=true,practice=false,practiceIndex=0,practiceAnchor=0,practiceFirstBeat=0;
let correctCount=0,attempts=0,timingSamples=[],chordSeen=new Set(),noteOnTimes=new Map(),playTimers=[],playing=false;
let inputMode="none",unsubscribe=null,lastDetected="-";
let fidelityReport=null,publishKind="music",publishScope="personal",publishOpener=null;

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
function playNoteEvent(event,delayMs,durationMs,level){
  const bridge=audio();
  if(!bridge||typeof bridge.play!=="function")return;
  const baseBeatMs=60000/Math.max(20,tempo);
  const effectiveBeats=Math.max(.03,Number(durationMs||baseBeatMs)/baseBeatMs);
  const timer=setTimeout(()=>{
    bridge.play(event.note,effectiveBeats,baseBeatMs,level||Math.max(.42,Math.min(1.05,event.velocity/92)));
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
function fidelityLabel(report){
  if(!report)return{label:"—",title:"Sem verificação",tone:""};
  if(report.rating==="blocked")return{label:"Bloqueado",title:"Inconsistência encontrada",tone:"bad"};
  if(report.rating==="high")return{label:"Alta · "+report.score+"%",title:"Alta confiabilidade",tone:"good"};
  if(report.rating==="review")return{label:"Rever · "+report.score+"%",title:"Boa, com revisão recomendada",tone:"near"};
  return{label:"Baixa · "+report.score+"%",title:"Revisão necessária",tone:"bad"};
}
function updateFidelityState(){
  fidelityReport=score&&Engine.auditScore?Engine.auditScore(score):null;
  if(!fidelityState)return;
  fidelityState.classList.toggle("hidden",!fidelityReport);
  if(!fidelityReport)return;
  const label=fidelityLabel(fidelityReport);
  fidelityState.dataset.tone=label.tone;
  fidelityBadge.textContent=label.label;
  fidelityTitle.textContent=label.title;
  fidelityText.textContent=fidelityReport.issues.length
    ? fidelityReport.issues[0]
    : fidelityReport.warnings.length
      ? fidelityReport.warnings[0]
      : "Notas e alturas preservadas; a notação foi comparada com a origem.";
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
    const perfCount=Engine.performanceEvents?Engine.performanceEvents(score).length:score.events.length;
    const trans=score.transcription;
    const fidelity=score.source==="midi"&&trans
      ?" · MIDI preservado: "+perfCount+" eventos · notação automática "+(trans.gridBeat?("grade "+String(trans.gridBeat.toFixed(3)).replace(/0+$/,"").replace(/\.$/,"")+" tempo"):"")
      :"";
    fileMeta.textContent=Math.round(score.tempoBpm)+" BPM · "+score.meter[0]+"/"+score.meter[1]+" · "+score.events.length+" eventos notados · "+score.keyName+fidelity;
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
  if(addReadingButton){addReadingButton.disabled=!score;addReadingButton.textContent="＋ Música na Leitura";}
  if(addExerciseButton){addExerciseButton.disabled=!score;addExerciseButton.textContent="＋ Exercício na Leitura";}
  clearButton.classList.toggle("hidden",bits.length===0);
  updateFidelityState();
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
  if(pdfFrame)pdfFrame.removeAttribute("src");pdfFallback.replaceChildren();
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
      if(pdfFrame)pdfFrame.src=pdfUrl;
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
  const perfEvents=Engine.performanceEvents?Engine.performanceEvents(score):score.events;
  const firstBeat=perfEvents.length?perfEvents[0].startBeat:0;
  const firstMs=Engine.beatToMs?Engine.beatToMs(score,firstBeat,tempo):firstBeat*(60000/tempo);
  perfEvents.forEach(event=>{
    const at=(Engine.beatToMs?Engine.beatToMs(score,event.startBeat,tempo):event.startBeat*(60000/tempo))-firstMs;
    const duration=Engine.durationToMs?Engine.durationToMs(score,event.startBeat,event.durationBeat,tempo):event.durationBeat*(60000/tempo);
    playNoteEvent(event,at,duration);
  });
  groups.forEach(group=>{
    const at=(Engine.beatToMs?Engine.beatToMs(score,group.startBeat,tempo):group.startBeat*(60000/tempo))-firstMs;
    const timer=setTimeout(()=>{
      if(!playing)return;
      Engine.render(svg,score,{currentGroupIndex:guideOn?group.index:-1});
    },Math.max(0,at));
    playTimers.push(timer);
  });
  const end=Math.max.apply(null,perfEvents.map(e=>{
    const finish=e.startBeat+e.durationBeat;
    return (Engine.beatToMs?Engine.beatToMs(score,finish,tempo):finish*(60000/tempo))-firstMs;
  }));
  playTimers.push(setTimeout(()=>{playing=false;playButton.textContent="▶ Tocar";renderScore()},Math.max(0,end)+120));
}
function hearPhrase(){
  if(!score||!groups.length)return;
  const bridge=audio();
  if(!bridge){setFeedback("O piano do Luwipi ainda não está disponível nesta sessão.","bad");return}
  clearTimers();
  const start=Math.min(practiceIndex,groups.length-1),slice=groups.slice(Math.max(0,start-1),Math.min(groups.length,start+3));
  const first=slice[0].startBeat;
  const firstMs=Engine.beatToMs?Engine.beatToMs(score,first,tempo):first*(60000/tempo);
  slice.forEach(group=>group.events.forEach(event=>{
    const at=(Engine.beatToMs?Engine.beatToMs(score,event.startBeat,tempo):event.startBeat*(60000/tempo))-firstMs;
    const duration=Engine.durationToMs?Engine.durationToMs(score,event.startBeat,event.durationBeat,tempo):event.durationBeat*(60000/tempo);
    playNoteEvent(event,at,duration,.9);
  }));
  const last=slice[slice.length-1];
  const total=(Engine.beatToMs?Engine.beatToMs(score,last.startBeat+last.durationBeat,tempo):(last.startBeat+last.durationBeat)*(60000/tempo))-firstMs;
  playTimers.push(setTimeout(()=>{playTimers=[];renderScore()},Math.max(0,total)+80));
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
  noteOnTimes.set(detail.midi,{at:detail.at,groupIndex:practiceIndex,startBeat:group.startBeat,durationBeat:group.events.find(e=>e.midi===detail.midi)?.durationBeat||group.durationBeat});
  if(group.pitches.some(p=>!chordSeen.has(p))){
    setFeedback("Continua o acorde: "+group.pitches.filter(p=>!chordSeen.has(p)).map(ptNote).join(" + ")+".","");
    return;
  }
  attempts++;
  const firstMs=Engine.beatToMs?Engine.beatToMs(score,practiceFirstBeat,tempo):practiceFirstBeat*(60000/tempo);
  const groupMs=Engine.beatToMs?Engine.beatToMs(score,group.startBeat,tempo):group.startBeat*(60000/tempo);
  const relativeMs=groupMs-firstMs;
  const localBeatMs=Engine.durationToMs?Engine.durationToMs(score,group.startBeat,1,tempo):(60000/tempo);
  if(!practiceAnchor){
    practiceAnchor=detail.at-relativeMs;
    advancePractice("good","Certo. O relógio rítmico começou agora.");
    return;
  }
  const expected=practiceAnchor+relativeMs;
  const diff=detail.at-expected;
  if(rhythmOn){
    timingSamples.push(diff);
    const beats=Math.abs(diff)/Math.max(1,localBeatMs);
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
  const held=detail.at-started.at,expected=Engine.durationToMs?Engine.durationToMs(score,started.startBeat,started.durationBeat,tempo):started.durationBeat*(60000/tempo);
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
function renderPublishIssues(report){
  publishIssues.replaceChildren();
  const rows=[...(report.issues||[]).map(text=>({text,tone:"bad"})),...(report.warnings||[]).map(text=>({text,tone:"near"}))];
  if(!rows.length)rows.push({text:"Nenhuma divergência estrutural detetada entre os eventos de origem e a notação gerada.",tone:"good"});
  rows.slice(0,8).forEach(row=>{
    const p=document.createElement("p");p.className=row.tone;p.textContent=row.text;publishIssues.appendChild(p);
  });
}
async function openPublishPreview(kind,opener){
  if(!score)return;
  publishKind=kind;publishScope="personal";publishOpener=opener||null;
  fidelityReport=Engine.auditScore?Engine.auditScore(score):{rating:"review",score:0,blocked:false,canPublishGlobal:false,warnings:["Relatório de fidelidade indisponível."],issues:[]};
  const label=fidelityLabel(fidelityReport);
  publishTitle.textContent=kind==="exercise"?"Preview do exercício":"Preview da música";
  publishFidelityBadge.textContent=label.label;
  publishFidelityBadge.dataset.tone=label.tone;
  publishFidelityTitle.textContent=label.title;
  publishFidelityText.textContent="Eventos notados: "+fidelityReport.notationEvents+" · origem: "+fidelityReport.performanceEvents+" · preservação: "+Math.round((fidelityReport.notePreservation||0)*100)+"%.";
  renderPublishIssues(fidelityReport);
  Engine.render(publishSvg,score,{currentGroupIndex:-1});
  scopePersonal.classList.add("active");scopeGlobal.classList.remove("active");scopeGlobal.classList.add("hidden");
  scopeGlobal.disabled=true;
  scopeHelp.textContent="Esta partitura ficará apenas na tua biblioteca.";
  publishConfirm.disabled=Boolean(fidelityReport.blocked);
  publishConfirm.textContent=fidelityReport.blocked?"Corrige antes de adicionar":"Confirmar e adicionar";
  const library=window.LuwipiReadingLibrary;
  if(library&&typeof library.permissions==="function"){
    try{
      const permission=await library.permissions();
      if(permission?.canPublishGlobal){
        scopeGlobal.classList.remove("hidden");
        scopeGlobal.disabled=!fidelityReport.canPublishGlobal;
        if(!fidelityReport.canPublishGlobal)scopeGlobal.title="A publicação global exige uma verificação de fidelidade sem erros críticos.";
      }
    }catch{}
  }
  publishModal.classList.remove("hidden");
  document.body.classList.add("live-publish-open");
  publishConfirm.focus();
}
function closePublishPreview(){
  publishModal.classList.add("hidden");
  document.body.classList.remove("live-publish-open");
  publishConfirm.disabled=false;
  if(publishOpener&&publishOpener.focus)publishOpener.focus();
  publishOpener=null;
}
function selectPublishScope(scope){
  if(scope==="global"&&(scopeGlobal.hidden||scopeGlobal.disabled))return;
  publishScope=scope==="global"?"global":"personal";
  scopePersonal.classList.toggle("active",publishScope==="personal");
  scopeGlobal.classList.toggle("active",publishScope==="global");
  scopeHelp.textContent=publishScope==="global"
    ?"Como administrador, esta partitura ficará disponível para todos os utilizadores com acesso à plataforma."
    :"Esta partitura ficará apenas na tua biblioteca.";
}
async function confirmPublish(){
  if(!score||publishConfirm.disabled)return;
  const library=window.LuwipiReadingLibrary;
  if(!library||typeof library.publish!=="function"){setFeedback("A biblioteca de Leitura não está disponível nesta sessão.","bad");return}
  publishConfirm.disabled=true;publishConfirm.textContent="A guardar…";
  try{
    const result=await library.publish(score,structuredFileName||score.title,publishKind,publishScope,fidelityReport);
    closePublishPreview();
    const button=publishKind==="exercise"?addExerciseButton:addReadingButton;
    if(button)button.textContent=publishKind==="exercise"?"✓ Exercício adicionado":"✓ Música adicionada";
    setFeedback(result?.scope==="global"?"Partitura publicada para toda a plataforma.":"Partitura adicionada à tua Leitura depois do preview.","good");
  }catch(error){
    console.error("Reading publish failed",error);
    publishConfirm.disabled=false;publishConfirm.textContent="Tentar novamente";
    const message=error?.message==="admin_required"
      ?"Só uma conta administradora pode publicar para toda a plataforma."
      :error?.message==="fidelity_blocked"
        ?"A verificação encontrou um erro crítico. Revê a partitura antes de adicionar."
        :"Não foi possível guardar a partitura agora.";
    const p=document.createElement("p");p.className="bad";p.textContent=message;publishIssues.prepend(p);
  }
}
if(addReadingButton)addReadingButton.addEventListener("click",()=>openPublishPreview("music",addReadingButton));
if(addExerciseButton)addExerciseButton.addEventListener("click",()=>openPublishPreview("exercise",addExerciseButton));
scopePersonal?.addEventListener("click",()=>selectPublishScope("personal"));
scopeGlobal?.addEventListener("click",()=>selectPublishScope("global"));
publishClose?.addEventListener("click",closePublishPreview);
publishCancel?.addEventListener("click",closePublishPreview);
publishConfirm?.addEventListener("click",confirmPublish);
publishModal?.addEventListener("click",event=>{if(event.target===publishModal)closePublishPreview()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!publishModal?.classList.contains("hidden"))closePublishPreview()});
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