(()=>{
'use strict';

const E=window.LuwipiScoreEngine;
const $=id=>document.getElementById(id);
const view=$('karaokeView'),files=$('karaokeFiles'),song=$('karaokeSong'),lead=$('karaokeLead'),staff=$('karaokeStaff'),keys=$('karaokeKeys');
if(!view||!E)return;

let scoreRequest=0,scoreAbort,aiRequest=0,aiAbort;
let playRequest=0,loading=false,audition=false,notationDocument=null;
let playlist=[],current=null,leadKey='',leadNotes=[],backing=[],timer=0,playing=false,points=0,hit=new Set(),unsubscribe=null;
let keyboardBase=48,scoreMode='ai',leadTouched=false,libraryItems=[];
const notationMode=$('karaokeNotationMode'),saveMidi=$('karaokeSaveMidi'),savedMidi=$('karaokeSavedMidi'),refreshLibrary=$('karaokeRefreshLibrary');

const noteName=m=>E.ptSolfege(m).replace(/-?\d+$/,'');
const keyOf=e=>`${e.track}:${e.channel}`;
const round=n=>Math.round(Number(n||0)*1000000)/1000000;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function access(){try{return typeof LuwipiProductionAccess!=='undefined'?LuwipiProductionAccess:null}catch{return null}}
async function accessToken(){const gate=access();return gate&&typeof gate.getAccessToken==='function'?await gate.getAccessToken():null}
async function midiApi(path,options={}){
 const token=await accessToken();if(!token)throw new Error('unauthorized');
 const headers=new Headers(options.headers||{});headers.set('authorization','Bearer '+token);
 const r=await fetch('/api/midi-library'+(path||''),{...options,headers,cache:'no-store'});
 if(options.raw){if(!r.ok)throw new Error('library_unavailable');return r}
 const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.error||'library_unavailable');return body;
}
async function refreshMidiLibrary(){
 if(!savedMidi)return;
 try{
  const body=await midiApi('');libraryItems=body.items||[];
  const value=savedMidi.value;savedMidi.replaceChildren(new Option('Músicas guardadas',''));
  libraryItems.forEach(item=>savedMidi.add(new Option(item.title+(item.ai_analyzed_at?' · IA pronta':''),item.id)));
  if([...savedMidi.options].some(o=>o.value===value))savedMidi.value=value;
 }catch{savedMidi.replaceChildren(new Option('Biblioteca indisponível',''))}
}
async function saveCurrentMidi(){
 if(!current?.binary||!saveMidi)return;
 saveMidi.disabled=true;saveMidi.textContent='A guardar…';
 try{
  const meta={title:current.name,score:current.score,aiReview:current.ai||{},leadKey,notationMode:notationMode.value,scoreMode,aiModel:current.ai?'gpt-6-luna':''};
  const form=new FormData();form.append('file',new File([current.binary],current.originalName||current.name+'.mid',{type:'audio/midi'}));form.append('meta',JSON.stringify(meta));
  const body=await midiApi('',{method:'POST',body:form});current.libraryId=body.item?.id||current.libraryId;
  saveMidi.classList.add('saved');saveMidi.textContent='✓ Guardado';$('karaokeStatus').textContent='MIDI guardado na tua biblioteca. Na próxima vez não precisas carregar nem voltar a analisar.';
  await refreshMidiLibrary();
 }catch(error){saveMidi.textContent='♡ Guardar MIDI';$('karaokeStatus').textContent=error.message==='unauthorized'?'Inicia sessão para guardar o MIDI.':'Não foi possível guardar este MIDI agora.'}
 finally{saveMidi.disabled=!current?.binary;setTimeout(()=>{if(current?.binary)saveMidi.textContent=current.libraryId?'✓ Guardado':'♡ Guardar MIDI'},1500)}
}
async function updateSavedMidi(item){
 if(!item?.libraryId)return;
 try{await midiApi('',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id:item.libraryId,leadKey,notationMode:notationMode.value,scoreMode,aiReview:item.ai||undefined,aiModel:item.ai?'gpt-6-luna':''})});await refreshMidiLibrary()}catch{}
}
async function loadSavedMidi(id){
 if(!id)return;
 try{
  $('karaokeStatus').textContent='A abrir MIDI guardado…';
  const meta=(await midiApi('?id='+encodeURIComponent(id))).item;
  const response=await midiApi('?id='+encodeURIComponent(id)+'&download=1',{raw:true});
  const binary=await response.arrayBuffer(),score=E.parseMIDI(binary);
  const item={name:meta.title,originalName:meta.original_name||meta.title+'.mid',score,binary,nativeScores:{},ai:meta.ai_review&&Object.keys(meta.ai_review).length?meta.ai_review:null,libraryId:meta.id};
  playlist.push(item);song.add(new Option(item.name,String(playlist.length-1)));song.value=String(playlist.length-1);
  notationMode.value=meta.notation_mode==='literal'?'literal':'organized';scoreMode=meta.score_mode==='original'?'original':'ai';setSong(playlist.length-1);
  if(meta.lead_key&&[...lead.options].some(o=>o.value===meta.lead_key)){lead.value=meta.lead_key;leadKey=meta.lead_key;leadTouched=true;await setLead()}
  saveMidi.classList.add('saved');saveMidi.textContent='✓ Guardado';$('karaokeStatus').textContent=item.ai?'MIDI aberto · análise IA reutilizada.':'MIDI aberto da biblioteca.';
 }catch{$('karaokeStatus').textContent='Não foi possível abrir este MIDI guardado.'}
}

function msAt(beat){
 const map=(current?.score?.tempoMap||[]).slice().sort((a,b)=>a.beat-b.beat);
 let cursor=0,ms=0,bpm=current?.score?.tempoBpm||120;
 for(const change of map){if(change.beat>beat)break;if(change.beat>cursor){ms+=(change.beat-cursor)*60000/bpm;cursor=change.beat}bpm=change.bpm||bpm}
 return ms+(beat-cursor)*60000/bpm;
}
function families(program){
 const names=['Piano','Percussão afinada','Órgão','Guitarra','Baixo','Cordas','Ensemble','Metais','Sopros','Flautas','Sintetizador lead','Sintetizador pad','Efeitos','Étnicos','Percussão','Efeitos sonoros'];
 return names[Math.floor((Number(program)||0)/8)]||'Instrumento';
}
function groups(score){
 const map=new Map();
 E.performanceEvents(score).filter(e=>e.channel!==9).forEach(e=>{const k=keyOf(e);if(!map.has(k))map.set(k,[]);map.get(k).push(e)});
 return [...map].map(([key,events])=>{
  const track=Number(key.split(':')[0]),channel=Number(key.split(':')[1]);
  const title=score.transcription?.trackNames?.find(t=>t.track===track)?.title||`Pista ${track+1}`;
  const program=score.transcription?.programs?.find(p=>p.track===track&&p.channel===channel)?.program;
  const sorted=events.slice().sort((a,b)=>a.startBeat-b.startBeat),avg=events.reduce((n,e)=>n+e.midi,0)/events.length;
  let overlap=0;for(let i=1;i<sorted.length;i++)if(sorted[i].startBeat<sorted[i-1].startBeat+sorted[i-1].durationBeat-.1)overlap++;
  const melodic=/melod|solo|lead|voice|vocal|flute|sax|violin|canto|voz|flauta/i.test(title);
  const instrument=(program>=64&&program<=79)||(program>=40&&program<=47);
  const scoreValue=(melodic?6:0)+(instrument?2:0)+(avg>=58&&avg<=90?2:0)+Math.min(2,events.length/30)-overlap/Math.max(1,events.length)*7;
  return {key,track,channel,title,instrument:families(program),program,events:sorted,scoreValue};
 }).filter(x=>x.events.length).sort((a,b)=>a.track-b.track||a.channel-b.channel);
}
function simplify(events){return events.map(e=>({...e})).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi)}
function localBest(tracks){return tracks.slice().sort((a,b)=>b.scoreValue-a.scoreValue)[0]||null}

function updateSongTitle(){
 $('karaokeSongTitle').textContent=current?current.name:'Importa uma música para começar';
}
function updateScoreModeUI(){
 const ai=$('karaokeAiMode'),original=$('karaokeOriginalMode'),usingAI=scoreMode==='ai';
 ai.classList.toggle('active',usingAI);original.classList.toggle('active',!usingAI);
 ai.setAttribute('aria-pressed',String(usingAI));original.setAttribute('aria-pressed',String(!usingAI));
 $('karaokeScoreLabel').textContent=usingAI&&current?.ai?'PARTITURA · IA LIMPA':'PARTITURA · ORIGINAL';
}
function aiMessage(error){
 const map={unauthorized:'Inicia sessão para usar a análise inteligente.',openai_not_configured:'A chave da OpenAI ainda não está disponível no servidor.',analysis_busy:'A IA já está a analisar outra música nesta sessão.',openai_busy:'A OpenAI está ocupada. Tenta novamente.',analysis_timeout:'A análise demorou demasiado. O motor local continua disponível.',analysis_incomplete:'A análise não ficou completa.',analysis_invalid:'A resposta da IA não passou a validação.',payload_too_large:'Este MIDI é demasiado grande para a análise inteligente.'};
 return map[error]||'A IA não ficou disponível agora. A partitura local continua pronta.';
}
function setAiUI(state,review,error){
 const panel=$('karaokeAiPanel'),light=$('karaokeAiLight'),title=$('karaokeAiTitle'),text=$('karaokeAiState'),button=$('karaokeAiButton'),metrics=$('karaokeAiMetrics'),issues=$('karaokeAiIssues'),badge=$('karaokeAiBadge');
 panel.dataset.state=state;light.className='karaoke-ai-light '+state;badge.dataset.state=state;
 issues.replaceChildren();
 if(state==='idle'){
  title.textContent='Pronto para analisar';text.textContent='A IA usa a música inteira e altera apenas a leitura da partitura, nunca o áudio original.';
  metrics.classList.add('hidden');button.disabled=!current;button.textContent='✦ Analisar música inteira';return;
 }
 if(state==='loading'){
  title.textContent='A organizar a música inteira…';text.textContent='Luna está a comparar pistas, ataques, durações, métrica e contexto musical.';
  metrics.classList.add('hidden');button.disabled=true;button.textContent='A analisar…';return;
 }
 if(state==='error'){
  title.textContent='Motor local ativo';text.textContent=aiMessage(error);metrics.classList.add('hidden');button.disabled=!current;button.textContent='↻ Tentar IA novamente';return;
 }
 if(state==='ready'&&review){
  title.textContent='Partitura revista pela IA';text.textContent=review.summary||'A leitura foi organizada com o contexto da música inteira.';
  metrics.classList.remove('hidden');$('karaokeAiConfidence').textContent=Math.round((Number(review.confidence)||0)*100)+'%';$('karaokeAiChanges').textContent=String(review.operations?.length||0);
  (review.issues||[]).slice(0,4).forEach(issue=>{const chip=document.createElement('span');chip.className='karaoke-ai-issue '+issue.severity;chip.textContent=issue.detail;issues.append(chip)});
  button.disabled=false;button.textContent='↻ Reanalisar música inteira';
 }
}
function scoreDoctorPayload(item){
 const score=item.score,completeEvents=[...E.performanceEvents(score),...(Array.isArray(score.percussionEvents)?score.percussionEvents:[])];
 const events=completeEvents.map((e,i)=>[
  String(e.id||e.sourceEventId||('event-'+i)),Number(e.track)||0,Number(e.channel)||0,Number(e.midi)||60,
  round(e.startBeat),round(e.durationBeat),Number(e.velocity)||72,e.pedal?1:0
 ]);
 const grouped=new Map();
 completeEvents.forEach(e=>{const key=keyOf(e),bucket=grouped.get(key)||[];bucket.push(e);grouped.set(key,bucket)});
 const tracks=[...grouped].map(([key,list])=>{
  const [track,channel]=key.split(':').map(Number),title=score.transcription?.trackNames?.find(t=>t.track===track)?.title||`Pista ${track+1}`;
  const program=score.transcription?.programs?.find(p=>p.track===track&&p.channel===channel)?.program;
  return{key,track,channel,title,instrument:channel===9?'Bateria':families(program),program:Number.isFinite(program)?program:null,notes:list.length};
 });
 return{
  version:1,title:item.name,tempoBpm:score.tempoBpm,meter:score.meter,keyFifths:score.keyFifths,keyMinor:score.keyMinor,
  durationBeats:score.durationBeats,tempoMap:score.tempoMap||[],meterMap:score.meterMap||[],keyMap:score.keyMap||[],
  tracks,events
 };
}
function reviewKey(review){return review?.lead?`${Number(review.lead.track)||0}:${Number(review.lead.channel)||0}`:''}
function applyAiCorrections(notes,review){
 if(!review||!Array.isArray(review.operations))return notes;
 const map=new Map(review.operations.map(op=>[String(op.eventId),op]));
 return notes.map(note=>{
  const op=map.get(String(note.id||note.sourceEventId||''));if(!op)return note;
  const out={...note},start=Number(op.startBeat),duration=Number(op.durationBeat);
  if(Number.isFinite(start)&&start>=0&&Math.abs(start-Number(note.startBeat||0))<=1.5)out.startBeat=start;
  if(Number.isFinite(duration)&&duration>=.03125&&duration<=32)out.durationBeat=duration;
  if(typeof op.spelling==='string'&&/^[A-G](?:#|b)?-?\d+$/.test(op.spelling))out.notationSpelling=op.spelling;
  if(typeof op.staccato==='boolean')out.staccato=op.staccato;
  return out;
 });
}
function aiScoreMeta(score,review){
 if(!review||Number(review.confidence)<.55)return score;
 const n=review.notation||{},den=[1,2,4,8,16].includes(Number(n.meterDenominator))?Number(n.meterDenominator):score.meter?.[1]||4;
 const num=Number.isFinite(Number(n.meterNumerator))?Math.max(1,Math.min(32,Math.round(Number(n.meterNumerator)))):score.meter?.[0]||4;
 const key=Number.isFinite(Number(n.keyFifths))?Math.max(-7,Math.min(7,Math.round(Number(n.keyFifths)))):score.keyFifths||0;
 return {...score,meter:[num,den],keyFifths:key};
}
function aiNotationOptions(review){
 const grid=Number(review?.notation?.grid);
 return{articulation:review?.notation?.mode!=='literal',...(Number.isFinite(grid)&&grid>=.0625&&grid<=4?{grid}:{})};
}
async function analyzeAI(force=false){
 const item=current;if(!item)return;
 if(item.ai&&!force){setAiUI('ready',item.ai);if(scoreMode==='ai')await setLead();return}
 const request=++aiRequest;aiAbort?.abort();aiAbort=new AbortController();
 setAiUI('loading');$('karaokeStatus').textContent='IA a analisar a música inteira. Podes continuar a usar o motor local.';
 try{
  const token=await accessToken();if(!token)throw Object.assign(new Error('unauthorized'),{code:'unauthorized'});
  const timeout=AbortSignal.timeout(72000),signal=AbortSignal.any?AbortSignal.any([aiAbort.signal,timeout]):aiAbort.signal;
  const response=await fetch('/api/score-doctor',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(scoreDoctorPayload(item)),signal,cache:'no-store'});
  const body=await response.json().catch(()=>({}));
  if(request!==aiRequest||item!==current)return;
  if(!response.ok)throw Object.assign(new Error(body.error||'analysis_unavailable'),{code:body.error||'analysis_unavailable'});
  item.ai=body.review;item.aiUsage=body.usage||null;
  if(item.libraryId)void updateSavedMidi(item);
  setAiUI('ready',item.ai);
  const suggested=reviewKey(item.ai);
  if(!leadTouched&&suggested&&[...lead.options].some(o=>o.value===suggested)){lead.value=suggested;leadKey=suggested}
  scoreMode='ai';updateScoreModeUI();await setLead();
  $('karaokeStatus').textContent='IA pronta · o áudio continua 100% original; apenas a notação foi organizada.';
 }catch(error){
  if(request!==aiRequest||item!==current||aiAbort.signal.aborted)return;
  const code=error?.code||error?.message||'analysis_unavailable';item.aiError=code;setAiUI('error',null,code);
  $('karaokeStatus').textContent=aiMessage(code);
 }
}
function bestKeyboardBase(notes){
 if(!notes.length)return 48;const sorted=notes.map(n=>n.midi).sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)]||60;
 return Math.max(24,Math.min(84,Math.floor((median-6)/12)*12));
}
function drawKeys(){
 const whites={0:0,2:1,4:2,5:3,7:4,9:5,11:6},blackBoundary={1:1,3:2,6:4,8:5,10:6},whiteCount=14,whiteWidth=100/whiteCount,blackWidth=whiteWidth*.62;
 keys.replaceChildren();
 for(let i=0;i<24;i++){
  const midi=keyboardBase+i,pc=i%12,oct=Math.floor(i/12),black=Object.prototype.hasOwnProperty.call(blackBoundary,pc),button=document.createElement('button');
  button.type='button';button.className='karaoke-key'+(black?' black':'');button.dataset.midi=String(midi);button.setAttribute('aria-label',E.ptSolfege(midi));
  if(black){button.style.left=(100*(oct*7+blackBoundary[pc])/whiteCount-blackWidth/2)+'%';button.style.width=blackWidth+'%'}
  else{button.style.left=(100*(oct*7+whites[pc])/whiteCount)+'%';button.style.width=whiteWidth+'%';button.textContent=noteName(midi)}
  button.addEventListener('pointerdown',event=>{event.preventDefault();E.playNote(midi,1,500,80);input({type:'noteon',midi});button.classList.add('pressed');button.setPointerCapture?.(event.pointerId)});
  const up=()=>button.classList.remove('pressed');button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);
  keys.append(button);
 }
 $('karaokeOctaveLabel').textContent=E.midiToName(keyboardBase)+'–'+E.midiToName(keyboardBase+23);
}
function syncKeyboardTarget(next){
 if(next&&(next.midi<keyboardBase||next.midi>=keyboardBase+24)){keyboardBase=Math.max(24,Math.min(84,Math.floor(next.midi/12)*12));drawKeys()}
 keys.querySelectorAll('.karaoke-key').forEach(key=>key.classList.toggle('target',Boolean(next)&&Number(key.dataset.midi)===Number(next.midi)));
}
$('karaokeOctaveDown').addEventListener('click',()=>{keyboardBase=Math.max(24,keyboardBase-12);drawKeys();render(playing?currentBeat():0)});
$('karaokeOctaveUp').addEventListener('click',()=>{keyboardBase=Math.min(84,keyboardBase+12);drawKeys();render(playing?currentBeat():0)});

function setSong(index){
 scoreRequest++;scoreAbort?.abort();aiRequest++;aiAbort?.abort();stop();
 current=playlist[index]||null;lead.innerHTML='';leadTouched=false;scoreMode='ai';updateScoreModeUI();setAiUI('idle');updateSongTitle();
 if(!current){$('karaokeAiButton').disabled=true;if(saveMidi)saveMidi.disabled=true;return}
 if(saveMidi){saveMidi.disabled=!current.binary;saveMidi.classList.toggle('saved',Boolean(current.libraryId));saveMidi.textContent=current.libraryId?'✓ Guardado':'♡ Guardar MIDI'}
 const tracks=groups(current.score);
 lead.add(new Option('Escolher pista para a partitura',''));
 tracks.forEach(g=>lead.add(new Option(`${g.title} · ${g.instrument} · ${g.events.length} notas`,g.key)));
 if(!tracks.length){$('karaokeStatus').textContent='Este MIDI não tem uma pista melódica separada.';return}
 const preferred=current.ai?tracks.find(t=>t.key===reviewKey(current.ai)):localBest(tracks);
 lead.value=preferred?.key||'';leadKey=lead.value;leadNotes=[];notationDocument=null;staff.replaceChildren();
 $('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');
 $('karaokeListenTrack').disabled=!leadKey;$('karaokeExportXML').disabled=true;$('karaokePlay').disabled=false;$('karaokeShare').disabled=false;$('karaokeAiButton').disabled=false;
 if(leadKey)void setLead();
 if(current.ai)setAiUI('ready',current.ai);else if(!document.body.classList.contains('parent-mode'))void analyzeAI(false);
}
async function setLead(){
 stop();const request=++scoreRequest;scoreAbort?.abort();scoreAbort=new AbortController();const signal=scoreAbort.signal;
 leadKey=lead.value;
 if(!leadKey){
  leadNotes=[];notationDocument=null;staff.replaceChildren();$('karaokeScore').classList.add('hidden');$('karaokeEmpty').classList.remove('hidden');
  $('karaokeListenTrack').disabled=true;$('karaokeExportXML').disabled=true;return;
 }
 const item=current,selected=leadKey,events=E.performanceEvents(item.score);
 let selectedNotes=simplify(events.filter(e=>keyOf(e)===selected));
 const useAI=scoreMode==='ai'&&item.ai;
 if(useAI)selectedNotes=applyAiCorrections(selectedNotes,item.ai);
 leadNotes=selectedNotes;
 const meta=useAI?aiScoreMeta(item.score,item.ai):item.score;
 const opts=useAI?aiNotationOptions(item.ai):{articulation:notationMode.value!=='literal'};
 notationDocument=window.LuwipiMidiNotation.convert(leadNotes,meta,item.name+' · '+lead.selectedOptions[0].textContent,opts);
 keyboardBase=bestKeyboardBase(leadNotes);drawKeys();
 backing=events.filter(e=>keyOf(e)!==selected).sort((a,b)=>a.startBeat-b.startBeat);hit=new Set();points=0;
 $('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');$('karaokeListenTrack').disabled=false;$('karaokeExportXML').disabled=true;$('karaokeShare').disabled=true;
 updateScoreModeUI();$('karaokeStatus').textContent=useAI?'A desenhar a versão revista pela IA…':'A organizar a partitura desta pista…';
 try{
  item.nativeScores??={};
  const cached=!useAI&&!notationDocument.articulationNotes?item.nativeScores[selected]:null;
  if(cached)notationDocument={...notationDocument,...cached};
  await window.LuwipiNotationDisplay.load(notationDocument.xml);
  if(request!==scoreRequest)return;
  render(0);let warning='';
  if(!useAI&&!cached&&item.binary&&!notationDocument.articulationNotes){
   $('karaokeStatus').textContent='Partitura disponível · a finalizar com o motor de notação…';
   try{const native=await window.LuwipiMuseScore.prepare(item.binary,selected,signal);if(request!==scoreRequest)return;if(native){item.nativeScores[selected]=native;notationDocument={...notationDocument,...native};await window.LuwipiNotationDisplay.load(native.xml)}}catch(error){if(signal.aborted||request!==scoreRequest)return;warning=error.message}
  }
  if(request!==scoreRequest)return;
  const prefix=useAI?'IA · ':'';$('karaokeStatus').textContent=warning||prefix+notationDocument.sourceNotes+' notas · partitura pronta.';render(0);
 }catch(error){if(request===scoreRequest)$('karaokeStatus').textContent=error.message||'Não foi possível desenhar esta partitura.'}
 finally{if(request===scoreRequest){$('karaokeExportXML').disabled=false;$('karaokeShare').disabled=false}}
}
function render(beat){
 window.LuwipiNotationDisplay.update(beat);
 const upcoming=leadNotes.filter(n=>n.startBeat+n.durationBeat>=beat-.02),next=upcoming[0]||null,nextAfter=upcoming.find(n=>next&&n.startBeat>next.startBeat+.02)||null;
 const active=leadNotes.find(n=>n.startBeat<=beat+.05&&n.startBeat+n.durationBeat>=beat-.05)||next;
 $('karaokeNow').textContent=active?'Toca '+noteName(active.midi):'Fim da pista';
 $('karaokeCueNow').textContent=active?noteName(active.midi):'—';$('karaokeNext').textContent=nextAfter?noteName(nextAfter.midi):'—';
 $('karaokePoints').textContent=points+' pontos';
 const accuracy=leadNotes.length?Math.round(hit.size/leadNotes.length*100):0;$('karaokeAccuracy').textContent=accuracy+'% acertos';
 const meter=current?.score?.meter||[4,4],beatsPerMeasure=(meter[0]||4)*(4/(meter[1]||4));$('karaokeMeasure').textContent='Compasso '+(Math.floor(Math.max(0,beat)/beatsPerMeasure)+1);
 const end=current?.score?.durationBeats||1;$('karaokeProgress').style.width=Math.min(100,Math.max(0,beat/end*100))+'%';
 $('karaokePianoHint').textContent=active?'Próxima: '+noteName(active.midi):'Pista concluída.';syncKeyboardTarget(active);
}
function setPlayLabel(icon,label){$('karaokePlay').innerHTML='<span>'+icon+'</span><b>'+label+'</b>'}
function stop(){
 playRequest++;loading=false;playing=false;clearInterval(timer);timer=0;window.LuwipiMidiPlayer.stop();setPlayLabel('▶','Começar');$('karaokeStop').disabled=true;$('karaokeListenTrack').textContent='▶ Ouvir só esta pista';
}
function currentBeat(){
 const elapsed=window.LuwipiMidiPlayer.time*1000;
 let low=0,high=Math.max(current?.score?.durationBeats||0,...leadNotes.map(n=>n.startBeat+n.durationBeat),1)+4;
 for(let i=0;i<22;i++){const mid=(low+high)/2;if(msAt(mid)<elapsed)low=mid;else high=mid}
 return (low+high)/2;
}
async function play(onlyTrack=false){
 if(!current)return;if(onlyTrack&&!leadKey)return;
 if(playing||loading){stop();render(0);return}
 if(!current.binary){$('karaokeStatus').textContent='Esta tarefa antiga não conserva os instrumentos. Importa o MIDI original para tocar a música completa.';return}
 const request=++playRequest;loading=true;audition=onlyTrack;setPlayLabel('…','A carregar');$('karaokeStop').disabled=false;$('karaokeStatus').textContent='A preparar os instrumentos da música…';
 try{
  const started=await window.LuwipiMidiPlayer.play(onlyTrack?window.LuwipiMidiNotation.isolate(current.binary,leadKey):current.binary,current.name);
  if(request!==playRequest||!started)return;
  loading=false;playing=true;points=0;hit=new Set();setPlayLabel('■','Parar');$('karaokeListenTrack').textContent=onlyTrack?'■ Parar pista':'▶ Ouvir só esta pista';
  $('karaokeStatus').textContent=onlyTrack?'A ouvir apenas a melodia escolhida.':'MIDI completo · segue a partitura e toca a melodia.';
  timer=setInterval(()=>{render(currentBeat());if(window.LuwipiMidiPlayer.finished){stop();$('karaokeStatus').textContent='Terminaste · '+points+' pontos · '+Math.round((hit.size/Math.max(1,leadNotes.length))*100)+'% de acertos.'}},35);
 }catch(error){if(request!==playRequest)return;stop();$('karaokeStatus').textContent=error.message||'Não foi possível carregar os instrumentos MIDI.'}
}
function input(e){
 if(!playing||audition||e.type!=='noteon')return;
 const beat=currentBeat();let best=-1,error=Infinity;
 leadNotes.forEach((n,i)=>{const d=Math.abs(n.startBeat-beat);if(!hit.has(i)&&n.midi===e.midi&&d<.65&&d<error){best=i;error=d}});
 if(best>=0){hit.add(best);points+=error<.2?100:60;render(beat);staff.classList.remove('karaoke-flash');void staff.offsetWidth;staff.classList.add('karaoke-flash')}
}
async function upload(list){
 const incoming=[];
 for(const file of list){
  try{
   const binary=await file.arrayBuffer(),score=E.parseMIDI(binary);
   incoming.push({name:file.name.replace(/\.midi?$/i,''),originalName:file.name,score,binary,nativeScores:{},ai:null,libraryId:null});
  }catch(error){console.error('MIDI karaoke import:',error);$('karaokeStatus').textContent=`${file.name}: não foi possível ler este MIDI (${error?.message||'erro'}).`}
 }
 playlist.push(...incoming);song.replaceChildren();playlist.forEach((item,i)=>song.add(new Option(item.name,String(i))));
 if(incoming.length){song.value=String(playlist.length-incoming.length);setSong(Number(song.value))}
}
files.addEventListener('change',()=>void upload(files.files));
$('karaokeEmptyImport').addEventListener('click',()=>files.click());
const drop=$('karaokeDropzone');
['dragenter','dragover'].forEach(type=>drop.addEventListener(type,event=>{event.preventDefault();drop.classList.add('dragging')}));
['dragleave','drop'].forEach(type=>drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove('dragging')}));
drop.addEventListener('drop',event=>{const list=[...(event.dataTransfer?.files||[])].filter(file=>/\.midi?$/i.test(file.name));if(list.length)void upload(list)});
song.addEventListener('change',()=>setSong(Number(song.value)));
lead.addEventListener('change',()=>{leadTouched=true;void setLead()});
notationMode.addEventListener('change',()=>{if(leadKey&&scoreMode==='original')void setLead()});
$('karaokeAiMode').addEventListener('click',async()=>{scoreMode='ai';updateScoreModeUI();if(!current?.ai)await analyzeAI(false);else if(leadKey)await setLead()});
$('karaokeOriginalMode').addEventListener('click',()=>{scoreMode='original';updateScoreModeUI();if(leadKey)void setLead()});
$('karaokeAiButton').addEventListener('click',()=>void analyzeAI(true));
$('karaokePlay').addEventListener('click',()=>void play(false));
$('karaokeListenTrack').addEventListener('click',()=>void play(true));
$('karaokeExportXML').addEventListener('click',()=>{if(!notationDocument)return;const url=URL.createObjectURL(new Blob([notationDocument.xml],{type:'application/vnd.recordare.musicxml+xml'})),a=document.createElement('a');a.href=url;a.download=(current.name||'pista')+(scoreMode==='ai'&&current?.ai?'-ia':'')+'.musicxml';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('karaokeStop').addEventListener('click',()=>{stop();render(0)});
$('karaokeBack').addEventListener('click',()=>{stop();aiAbort?.abort();view.classList.remove('active');$('homeView').classList.add('active')});
document.querySelectorAll('[data-karaoke-open]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));view.classList.add('active');document.querySelector('.experience-menu-close')?.click();void refreshMidiLibrary();scrollTo(0,0)}));
$('karaokeMidi').addEventListener('click',async()=>{try{const data=await window.LuwipiLiveInput.connectMIDI();$('karaokeStatus').textContent=`Teclado MIDI ligado · ${data.count} entrada(s)`;$('karaokeMidi').classList.add('connected')}catch{$('karaokeStatus').textContent='Não foi possível ligar o teclado MIDI.'}});
$('karaokeMic').addEventListener('click',async()=>{try{await window.LuwipiLiveInput.connectMicrophone();$('karaokeStatus').textContent='Microfone ligado. Toca a melodia.';$('karaokeMic').classList.add('connected')}catch{$('karaokeStatus').textContent='Não foi possível ligar o microfone.'}});
unsubscribe=window.LuwipiLiveInput?.subscribe(input);
document.addEventListener('click',event=>{if(view.classList.contains('active')&&event.target.closest('[data-nav],[data-menu-course],[data-experience-nav]')){stop();view.classList.remove('active')}},true);
document.addEventListener('keydown',event=>{if(view.classList.contains('active')&&event.code==='Space'&&!event.target.closest('button,input,select,summary')){event.preventDefault();void play(false)}});

$('karaokeTaskClose').addEventListener('click',()=>$('karaokeTaskSheet').hidden=true);
$('karaokeTaskSheet').addEventListener('click',event=>{if(event.target.id==='karaokeTaskSheet')event.currentTarget.hidden=true});
$('karaokeTaskCopy').addEventListener('click',async()=>{const input=$('karaokeTaskLink');try{await navigator.clipboard.writeText(input.value);$('karaokeTaskCopy').textContent='Copiado ✓'}catch{input.focus();input.select();$('karaokeTaskCopy').textContent='Seleciona e copia'}setTimeout(()=>$('karaokeTaskCopy').textContent='Copiar link',1800)});
$('karaokeShare').addEventListener('click',async()=>{
 if(!current)return;if(!current.binary){$('karaokeStatus').textContent='Importa o MIDI original para partilhar a música com os instrumentos.';return}
 let midiBinary='';for(const byte of new Uint8Array(current.binary))midiBinary+=String.fromCharCode(byte);
 const data={version:3,title:current.name,midi:btoa(midiBinary),leadKey,notationMode:notationMode.value,scoreMode,ai:current.ai||null,notation:scoreMode==='original'&&!notationDocument?.articulationNotes?current.nativeScores?.[leadKey]||null:null};
 let bytes=new TextEncoder().encode(JSON.stringify(data));if('CompressionStream'in window)bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
 if(bytes.length>18000){$('karaokeStatus').textContent='Este MIDI é demasiado grande para um link. Envia o ficheiro MIDI diretamente.';return}
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const encoded=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL('/app',location.origin);url.searchParams.set('parent','1');url.searchParams.set('type','karaoke');url.hash='karaoke='+encoded;
 $('karaokeTaskLink').value=url.href;$('karaokeTaskSheet').hidden=false;
});
async function openSharedTask(){
 try{
  const q=new URLSearchParams(location.search),encoded=location.hash.match(/^#karaoke=([\w-]+)$/)?.[1];if(q.get('type')!=='karaoke'||!encoded)return;
  const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));let bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  if(bytes[0]===31&&bytes[1]===139){if(!('DecompressionStream'in window))throw Error('Este navegador não consegue abrir esta tarefa.');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}
  const data=JSON.parse(new TextDecoder().decode(bytes));
  if((data.version===2||data.version===3)&&typeof data.midi==='string'){
   const decoded=atob(data.midi),binary=Uint8Array.from(decoded,c=>c.charCodeAt(0)).buffer,score=E.parseMIDI(binary),nativeScores={};
   if(data.notation?.engine==='MuseScore'&&typeof data.notation.xml==='string'&&data.notation.xml.length<6000000&&!/<!ENTITY/i.test(data.notation.xml))nativeScores[data.leadKey]=data.notation;
   const item={name:data.title,score,binary,nativeScores,ai:data.version===3&&data.ai?data.ai:null};playlist.push(item);song.add(new Option(data.title,'0'));song.value='0';setSong(0);
   notationMode.value=data.notationMode==='literal'?'literal':'organized';scoreMode=data.version===3&&data.scoreMode==='original'?'original':'ai';updateScoreModeUI();
   if([...lead.options].some(o=>o.value===data.leadKey)){lead.value=data.leadKey;leadTouched=true;await setLead()}
   view.classList.add('active');document.querySelectorAll('.view').forEach(v=>{if(v!==view)v.classList.remove('active')});document.body.classList.add('parent-mode');
  }else if(Array.isArray(data.lead)&&Array.isArray(data.backing)){
   current={name:data.title,score:{tempoBpm:data.tempoBpm,tempoMap:data.tempoMap,meter:data.meter,keyFifths:data.keyFifths}};leadNotes=data.lead;notationDocument=window.LuwipiMidiNotation.convert(leadNotes,current.score,current.name);
   await window.LuwipiNotationDisplay.load(notationDocument.xml);backing=data.backing;view.classList.add('active');document.querySelectorAll('.view').forEach(v=>{if(v!==view)v.classList.remove('active')});$('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');$('karaokePlay').disabled=false;keyboardBase=bestKeyboardBase(leadNotes);drawKeys();render(0);
  }
 }catch(error){console.warn('Tarefa MIDI inválida',error);$('karaokeStatus').textContent='Não foi possível abrir a tarefa MIDI.'}
}
if(saveMidi)saveMidi.addEventListener('click',()=>void saveCurrentMidi());if(refreshLibrary)refreshLibrary.addEventListener('click',()=>void refreshMidiLibrary());if(savedMidi)savedMidi.addEventListener('change',()=>void loadSavedMidi(savedMidi.value));
drawKeys();setAiUI('idle');updateScoreModeUI();void refreshMidiLibrary();void openSharedTask();
window.addEventListener('pagehide',()=>{stop();aiAbort?.abort();scoreAbort?.abort();if(unsubscribe)unsubscribe()});
})();

(()=>{const body=document.body,buttons=[document.getElementById('experienceMenuTheme'),document.getElementById('karaokeTheme')].filter(Boolean);function set(dark){body.classList.toggle('luwipi-dark',dark);buttons.forEach(button=>{button.setAttribute('aria-pressed',String(dark));if(button.id==='experienceMenuTheme')button.querySelector('b').textContent=dark?'Tema claro':'Tema escuro'});try{localStorage.setItem('luwipi_theme',dark?'dark':'light')}catch{}}try{set(localStorage.getItem('luwipi_theme')==='dark')}catch{}buttons.forEach(button=>button.addEventListener('click',()=>set(!body.classList.contains('luwipi-dark'))))})();
