(()=>{
'use strict';
const P=window.LuwipiPedagogyV1,E=window.LuwipiScoreEngine,S=window.LuwipiSpecializedStudies,S2=window.LuwipiSpecializedN2,S3=window.LuwipiSpecializedN3,host=document.getElementById('workspaceCanvas');
if(!P||!E||!host)return;
const KEY='luwipi:pedagogy:device-draft:v1',STEPS=[
 ['Aquecimento rítmico','2 min · Conta, bate e toca um padrão com metrónomo.'],
 ['Reconhecimento','4 min · Reconhece uma figura visual antes de tocar.'],
 ['Padrões','4 min · Aprende a forma visual em dois compassos.'],
 ['Leitura real','8 min · Lê oito compassos novos sem parar nem voltar atrás.'],
 ['Revisão','2 min · Regista precisão, paragens e padrões que falharam.']
],QUIZ={
 A:['Na clave de Sol, a linha inferior é…',['Mi','Sol','Fá','Ré'],0,'Mi4 é a primeira linha; memoriza esta âncora e lê as distâncias a partir dela.'],
 B:['Dó–Mi, tocados como duas semínimas em 4/4, desenham…',['2.ª','3.ª','4.ª','5.ª'],1,'Dó–Ré–Mi forma uma terça; no pentagrama, linha–linha ou espaço–espaço.'],
 C:['Antes de tocar uma frase em Sol maior, procura…',['1 sustenido','1 bemol','2 sustenidos','nenhum acidente'],0,'Sol maior tem Fá sustenido na armadura, válido para todas as oitavas.'],
 D:['Dó–Mi–Sol, tocados simultaneamente em 4/4, formam…',['3.ª','tríade de Dó','quinta oca','acorde de sétima'],1,'A tríade contém fundamental, terça e quinta; procura a sua forma vertical.'],
 E:['No baixo Dó–Sol em mínimas, a mão esquerda usa…',['quinta oca','arpejo completo','walking bass','stride'],0,'Duas notas separadas por uma quinta desenham um baixo–quinta, sem a terça.'],
 F:['Em 4/4, mínima mais duas semínimas preenchem…',['três tempos','quatro tempos','cinco tempos','dois tempos'],1,'Dois pulsos e mais um e um: o compasso completo sem interromper o pulso.'],
 G:['Quatro semínimas marcadas staccato pedem…',['ligar as quatro','encurtar cada ataque','acelerar','aumentar o pedal'],1,'O ponto altera a articulação, não a posição rítmica de cada nota.'],
 H:['Quando uma mão sustenta a mínima e a outra toca duas semínimas, deves…',['soltar ambas juntas','manter a voz longa','ignorar a voz longa','parar o pulso'],1,'As duas vozes são independentes em duração mas partilham a métrica.'],
 I:['Nos 30 segundos anteriores a uma leitura nova, observa primeiro…',['a última nota','clave, compasso e armadura','somente as teclas','o dedo mais rápido'],1,'Preparar as referências e o ritmo reduz paragens durante a leitura.'],
 J:['Num lead sheet em Dó, o símbolo G7 costuma indicar…',['acorde de Sol com sétima','tom de Sol com 7 sustenidos','nota Sol durante 7 compassos','7 oitavas'],0,'A cifra resume uma estrutura harmónica: Sol–Si–Ré–Fá.']
};
const panel=document.createElement('section');
panel.id='workspacePathPanel';panel.className='workspace-path-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','O meu percurso de leitura');panel.hidden=true;
panel.innerHTML='<div class="workspace-path-head"><h2>Meu percurso</h2><button type="button" id="pathClose" aria-label="Fechar o meu percurso">×</button></div><div class="workspace-path-sub">10 trilhas independentes · níveis N0–N7. A pauta e o piano continuam no espaço de trabalho.</div><div class="workspace-path-map" id="pathMap"></div><section class="workspace-path-workout" id="pathWorkout" hidden></section>';
host.append(panel);
const map=panel.querySelector('#pathMap'),workout=panel.querySelector('#pathWorkout');
const syncState=document.createElement('p');syncState.className='workspace-path-sync';
syncState.setAttribute('role','status');
syncState.textContent='Progresso provisório · neste dispositivo';
panel.insertBefore(syncState,map);
window.addEventListener('luwipi:progress-sync',event=>{syncState.textContent=event.detail?.status||syncState.textContent});
window.addEventListener('luwipi:progress-merged',event=>{
 if(event.detail?.draft){profile=event.detail.draft;persistLocal();render()}
});
const copyCard=document.createElement('button');
copyCard.type='button';copyCard.className='workspace-path-copy';copyCard.textContent='Copiar cartão de progresso';
panel.insertBefore(copyCard,workout);
copyCard.addEventListener('click',async()=>{
 const levels=P.trackIds.map(t=>{
  const level=profile.levels?.[t]||{},last=level.sessions?.at(-1);
  return t+': N'+(level.level||0)+(level.certified?' certificado':' em formação')+(last?' · '+last.bpm+' BPM':'');
 });
 const errors=(profile.mistakes||[]).map(e=>e.track+' N'+e.level+' '+e.pattern+' · revisão '+(e.due?.join(', ')||'pendente'));
 const exploratory=(profile.exploration||[]).slice(-8).map(x=>x.track+' N'+x.level+' · '+x.bpm+' BPM (exploração sem certificação)');
 const card=['LUWIPI · CARTÃO DE PROGRESSO','Níveis:',...levels,'Estudos exploratórios:',...(exploratory.length?exploratory:['Nenhum registado']),'Erros:',...(errors.length?errors:['Nenhum registado']),
 'Rever: '+(errors[0]||'exercício inédito da trilha atual'),
 'Próxima sessão: 2 min aquecimento, 4 min reconhecimento, 4 min padrões, 8 min leitura nova e 2 min revisão.',
 'Estado: desempenho provisório neste dispositivo; o sistema não certifica por autorrelato.'].join('\n');
 try{await navigator.clipboard.writeText(card);copyCard.textContent='Cartão copiado ✓';setTimeout(()=>copyCard.textContent='Copiar cartão de progresso',1800)}
 catch{copyCard.textContent='Não foi possível copiar neste navegador'}
});
let profile=P.newProfile(),selected='',exercise=null,stage=3,verified=false,store=window.sessionStorage;
let syncRevision=0,signedIn=false,localEdits=0,explorationLevel=null,reviewTask=null;
function todayLocal(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function currentStudyLevel(track){
 const formal=profile.levels?.[track]?.level||0;
 if(track!==selected||explorationLevel===null||explorationLevel<=formal)return formal;
 const study=S?.get(track,explorationLevel)||S2?.get(track,explorationLevel)||S3?.get(track,explorationLevel);
 return study?explorationLevel:formal;
}
const trackName=t=>P.tracks[t].name;
function safeRead(storage,key){try{return JSON.parse(storage.getItem(key)||'null')}catch{return null}}
function loadProfile(){
 const revision=++syncRevision;
 const editsAtLoad=localEdits;
 let address=document.getElementById('accountEmail')?.textContent?.trim().toLowerCase();
 if(address&&!address.includes('@'))address='';
 // A signed-in person's data is namespaced independently on this device.
 // Until server storage is installed, these are explicitly non-certified device drafts.
 let key=KEY;
 signedIn=Boolean(address);
 if(address){let hash=2166136261;for(const char of address){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}key+=':user-'+(hash>>>0).toString(16);store=window.localStorage}
 else{key+=':guest';store=window.sessionStorage}
 const stored=safeRead(store,key);
 profile=stored?.version===1&&stored?.levels&&stored?.seen?stored:P.newProfile();
 loadProfile.key=key;
 try{
  const diag=JSON.parse(localStorage.getItem('luwipi:sightreading:diagnostic:v1')||'null');
  if(diag&&!profile.placement){profile.placement=P.placementFromDiagnostic({tests:[0,1,2,3,4].map(i=>diag.tests?.[i]),extra:Object.fromEntries(['C','G','H','I','J'].map(t=>[t,diag.tests?.[t]]))})}
 }catch{}
 render();
 if(signedIn&&window.LuwipiProgressSync){
  const sync=window.LuwipiProgressSync;
  void sync.load(profile).then(draft=>{
   if(revision!==syncRevision||!signedIn||!draft)return;
   // A student may start an activity before the first remote GET completes.
   // Merge, never overwrite, notes and sight-read pieces recorded in that interval.
   const edited=localEdits!==editsAtLoad;
   profile=edited?sync.mergeDrafts(draft,profile):draft;
   persistLocal();render();
   if(edited)void sync.save(profile);
  }).catch(()=>{syncState.textContent='Sem ligação · progresso local mantido'});

 }
}
function persistLocal(){try{store.setItem(loadProfile.key,JSON.stringify(profile))}catch{}}
function save(){
 localEdits++;
 persistLocal();
 if(signedIn&&window.LuwipiProgressSync)void window.LuwipiProgressSync.save(profile);
}
function el(tag,cl,text){const x=document.createElement(tag);if(cl)x.className=cl;if(text!==undefined)x.textContent=text;return x}
function open(){panel.hidden=false;render();panel.querySelector('#pathClose').focus()}
function close(){panel.hidden=true}
window.addEventListener('luwipi:path-toggle',()=>panel.hidden?open():close());
panel.querySelector('#pathClose').addEventListener('click',close);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});
window.addEventListener('luwipi:workspace-route',()=>{if(!panel.hidden)close()});
window.addEventListener('luwipi:access-ready',loadProfile);
window.addEventListener('luwipi:access-signed-out',()=>{
 syncRevision++;localEdits++;signedIn=false;selected='';exercise=null;explorationLevel=null;reviewTask=null;
 profile=P.newProfile();store=window.sessionStorage;loadProfile.key=KEY+':guest';
 try{store.removeItem(loadProfile.key)}catch{}
 window.LuwipiProgressSync?.reset();
 close();render();
});
window.addEventListener('luwipi:pedagogy-measured',event=>{
 if(exercise?.id===event.detail?.exerciseId)exercise.measured=event.detail;
});
function render(){
 map.replaceChildren();
 for(const t of P.trackIds){
  const l=profile.levels?.[t]||{level:0},mod=P.moduleFor(t,l.level||0);
  const card=el('article','workspace-path-track');
  const head=el('header'),title=el('strong','',t+' · '+trackName(t)),status=el('small','', 'N'+(l.level||0)+(l.certified?' · certificado':' · em formação'));
  head.append(title,status);
  card.append(head,el('p','',mod.objective));
  const candidate=profile.placement?.[t]?.status;
  if(candidate&&candidate!=='não avaliado')card.append(el('small','', 'Diagnóstico: '+candidate));
  if(S?.get(t,l.level||0)||S2?.get(t,l.level||0)||S3?.get(t,l.level||0))card.append(el('small','', 'Estudo musical específico disponível'));
  const launch=el('button','',selected===t?'Selecionado · organizar sessão':'Preparar sessão');
  launch.type='button';launch.onclick=()=>{selected=t;stage=3;exercise=null;explorationLevel=null;reviewTask=null;render()};
  card.append(launch);map.append(card);
 }
 const due=P.dueReviews(profile,todayLocal());
 if(due.length){
  const hint=el('div','workspace-path-banner',due.length+' revisão(ões) de padrão disponíveis:');
  due.slice(0,4).forEach(task=>{
   const button=el('button','workspace-path-due-action',
    task.track+' · N'+task.level+' · '+task.pattern+' · '+task.nextDue);
   button.type='button';
   button.addEventListener('click',()=>{
    selected=task.track;stage=2;exercise=null;explorationLevel=null;reviewTask={...task};render();
   });
   hint.append(button);
  });
  map.prepend(hint);
 }
 workout.hidden=!selected;if(!selected)return;
 workout.replaceChildren();
 const formalLevel=profile.levels?.[selected]?.level||0;
 const level=currentStudyLevel(selected),mod=P.moduleFor(selected,level);
 workout.append(el('h3','',selected+' · N'+level+' · '+mod.objective));
 if(reviewTask&&reviewTask.track===selected){
  workout.append(el('div','workspace-path-banner',
    'Revisão vencida: '+reviewTask.pattern+'. Escolhe o treino de padrões. Confirma no fim se este excerto trabalhou o erro pretendido. A revisão não certifica níveis.'));
 }
 const canExploreN1=formalLevel===0&&Boolean(S?.get(selected,1));
 const canExploreN2=formalLevel<2&&Boolean(S2?.get(selected,2))&&
  (formalLevel>=1||profile.seen.includes(S?.get(selected,1)?.id||'unavailable'));
 const canExploreN3=formalLevel<3&&Boolean(S3?.get(selected,3))&&
  (formalLevel>=2||profile.seen.includes(S2?.get(selected,2)?.id||'unavailable'));
 for(const target of [1,2,3]){
  if(target===1&&!canExploreN1||target===2&&!canExploreN2||target===3&&!canExploreN3)continue;
  const active=explorationLevel===target;
  const button=el('button','',active?'Regressar ao N'+formalLevel:'Explorar estudo N'+target+' (sem avançar)');
  button.type='button';button.className='workspace-path-explore';
  button.setAttribute('aria-pressed',String(active));
  button.addEventListener('click',()=>{explorationLevel=active?null:target;stage=3;exercise=null;render()});
  workout.append(button);
 }
 if(explorationLevel!==null&&explorationLevel>formalLevel)
  workout.append(el('div','workspace-path-banner','Exploração do N'+explorationLevel+' sem certificação. O teu nível confirmado permanece N'+formalLevel+'.'));

 const stages=el('label','','Etapa da sessão');
 const sel=el('select');STEPS.forEach(([name,desc],i)=>{const op=el('option','',String(i+1)+'. '+name);op.value=String(i);sel.append(op)});
 sel.value=String(stage);sel.addEventListener('change',()=>{stage=Number(sel.value);render()});
 stages.append(sel);workout.append(stages,el('p','',STEPS[stage][1]));
 const actions=el('div','workout-actions');
 if(stage===1){
  const q=QUIZ[selected];workout.append(el('p','',q[0]));
  let msg=el('p','workout-result','');const answers=el('div','workout-actions');
  q[1].forEach((label,i)=>{const b=el('button','',label);b.onclick=()=>{answers.querySelectorAll('button').forEach(x=>x.disabled=true);msg.textContent=(i===q[2]?'Correto. ':'Ainda não. ')+q[3];};answers.append(b)});
  workout.append(answers,msg);
 }else if(stage===4){
  buildReview(workout,actions);
 }else{
  const button=el('button','',stage===0?'Abrir aquecimento':stage===2?'Tocar padrão curto':'Abrir leitura nova');
  button.addEventListener('click',()=>launch(stage));actions.append(button);
  if(stage===3)workout.append(el('div','workspace-path-banner','Leitura de treino: ouvir previamente torna a tentativa repetição, não primeira vista. A passagem de nível continua bloqueada sem provas específicas verificadas.'));
 }
 if(stage!==4)workout.append(actions);
}
function splitABC(seed){
 const headers=seed.abc.split('\n').filter(l=>/^(?:X|T|M|L|Q|K):/.test(l));
 function read(hand,clef){
  const line=seed.abc.split('\n').find(x=>x.startsWith('[V:'+hand+'] '));
  if(!line)throw Error('Voz em falta: '+hand);
  // parseABC currently handles one staff per file; parse both separately to retain simultaneous onsets.
  const body=line.replace(/^\[V:[A-Z0-9]+\]\s*/,'').replace(/\s*\|\]\s*$/,'').replace(/![^!]+!/g,'').replace(/"[^"]*"/g,'');
  const result=E.parseABC(headers.join('\n')+'\n'+body);
  return{events:result.events.map((x,i)=>({...x,id:hand+'-'+i,clef})),rests:(result.rests||[]).map((x,i)=>({...x,id:hand+'-rest-'+i,clef}))};
 }
 const rh=read('RH','treble'),lh=read('LH','bass');
 const rh2=seed.secondTrebleVoice?read('RH2','treble'):{events:[],rests:[]};
 if(seed.pedalEveryBar){
  const meterBeats=seed.meter==='3/4'?3:seed.meter==='6/8'?3:4;
  const marked=new Set();
  lh.events.forEach(e=>{
   const measure=Math.floor(e.startBeat/meterBeats);
   if(marked.has(measure))return;
   marked.add(measure);e.pedal=true;e.pedalAction=measure===0?'start':'change';
  });
 }
 if(seed.secondTrebleVoice){
  rh.events.forEach(e=>e.voiceDirection='up');
  rh2.events.forEach(e=>e.voiceDirection='down');
 }
 const base=E.parseABC(headers.join('\n')+'\nC2 C2 C2 C2 | C2 C2 C2 C2 |');
 const events=rh.events.concat(rh2.events,lh.events);
 if(!events.length)throw Error('Exercício vazio');
 const result=E.normalizeScore({title:seed.title,source:'pedagogy',tempoBpm:seed.meter==="6/8"?base.tempoBpm*1.5:base.tempoBpm,
 pulseUnit:seed.meter==="6/8"?"dotted-quarter":"quarter",meter:base.meter,keyFifths:base.keyFifths,
 events,rests:rh.rests.concat(rh2.rests,lh.rests),keyMinor:base.keyMinor});
 if(seed.expression){
  result.events.forEach(e=>{
   if(e.clef==='treble'){
    const measure=Math.floor(e.startBeat/result.beatsPerMeasure);
    if(seed.expression==='staccato-tenuto'||seed.expression==='accent'){
     e.articulations=seed.expression==='staccato-tenuto'?(measure%2===0?['staccato']:['tenuto']):(measure%2===0?['accent']:[]);
     if(seed.expression==='accent'){e.dynamic=measure<4?'p':'f';e.velocity=measure<4?48:104;}
    }
    if(seed.expression==='cresc-dim'){
     const velocities=[50,63,78,100,101,86,66,50];
     const markings=['p','cresc.','cresc.','f','f','dim.','dim.','p'];
     e.velocity=velocities[measure]||50;e.dynamic=markings[measure]||'p';
    }
   }
  });
 }
 return result;
}
// A pure selection rule shared by training and first-sight attempts.
function chooseSeed(track,level,which,seen){
 const secondary=level===3&&S3?Array.from({length:S3.count(track)},(_,index)=>S3.get(track,level,index)).filter(Boolean):[];
 const special=S?.get(track,level)||S2?.get(track,level)||secondary[0]||null,
  variants=P.availableVariants(track,level);
 if(which!==3&&special)return special;
 if(which===3){
  const fresh=secondary.length?secondary.find(seed=>!seen.includes(seed.id)):(special&&!seen.includes(special.id)?special:null);
  if(fresh)return fresh;
 }
 const variant=which===3
  ?Array.from({length:variants},(_,i)=>i).find(i=>!seen.includes(track+'N'+level+'-s'+i))
  :(seen.length+which)%variants;
 return variant===undefined?null:P.makeSeed(track,level,variant);
}
function launch(which){
 if(typeof window.LuwipiLiveLoadPedagogy!=='function'){workout.append(el('p','workout-result','A Prática ainda não está pronta. Atualiza a aplicação.'));return}
 const currentLevel=profile.levels[selected]?.level||0,assigned=which===2?reviewTask:null;
 const track=assigned?.track||(which===0?'F':selected);
 const level=assigned?.level??(which===0?0:currentStudyLevel(selected));
 const seed=chooseSeed(track,level,assigned?3:which,profile.seen)||
  (assigned?(S?.get(track,level)||S2?.get(track,level)||S3?.get(track,level,0)||P.makeSeed(track,level,0)):null);
 if(!seed){workout.append(el('p','workout-result','O material inédito terminou. É necessário acrescentar novas partituras.'));return}
 let score;
 try{score=splitABC(seed)}catch(error){workout.append(el('p','workout-result','Partitura não disponível: '+error.message));return}
 if(which===2&&!assigned){
  const beats=score.meter[0]*(4/score.meter[1])*2;
  score=E.normalizeScore({...score,events:score.events.filter(x=>x.startBeat<beats),rests:score.rests?.filter(x=>x.startBeat<beats)});
  score.title=seed.title+' · padrão de 2 compassos';
 }
 exercise={...seed,id:seed.id,track,level,exploratory:track===selected&&level!==currentLevel,
  reviewTask:assigned?{...assigned}:null,
  kind:which===3?'first_sight':'practice',stage:which,sessionId:String(Date.now())+'-'+seed.id};
 const opened=window.LuwipiLiveLoadPedagogy(score,score.title,{
  firstSight:which===3,exerciseId:seed.id,transposeSemitones:seed.transposeSemitones||0,
  instruction:seed.pedalEveryBar?'Troca o pedal nos símbolos Ped., a cada mudança de harmonia. A qualidade da pedalação exige observação.':
   seed.crossingMeasures?'Cruza a esquerda por cima da direita nos compassos '+seed.crossingMeasures.map(n=>n+1).join(' e ')+'.':
   seed.intent
 });
 if(opened){
  // A warm-up or short pattern exposes musical content too: never re-label it
  // as an unseen first-sight exercise, even when only two bars were previewed.
  if(!profile.seen.includes(seed.id)){profile.seen.push(seed.id);save()}
  if(seed.cues)window.dispatchEvent(new CustomEvent('luwipi:pedagogy-cues',{detail:{cues:seed.cues,track:seed.track}}));
  close();
 }else{workout.append(el('p','workout-result','Não foi possível iniciar o exercício.'))}
}
function buildReview(container,actions){
 if(!exercise||exercise.track!==selected){
  container.append(el('div','workspace-path-banner','Abre primeiro uma partitura desta sessão. Depois regressa aqui para registar o resultado.'));
  return;
 }
 if(exercise.measured){
  const m=exercise.measured,n=m.attemptedGroups?Math.round(100*m.correctGroups/m.attemptedGroups):null,
    rhythmic=m.rhythmSamples?Math.round(100*m.rhythmWithinTolerance/m.rhythmSamples):null;
  const report='Medição local ('+(m.input==='midi'?'teclado MIDI':m.input==='virtual'?'piano virtual':'outra entrada')+'): grupos de notas '+
   (n===null?'sem dados':n+'%')+'; ataques dentro da tolerância '+(rhythmic===null?'sem dados':rhythmic+'%')+
   '; '+m.bpm+' BPM. Não mede paragens nem certifica articulação ou leitura profissional.';
  container.append(el('div','workspace-path-banner',report));
 }
 const fields=[
  ['bpm','Andamento real',Array.from({length:19},(_,i)=>(40+i*5)+' BPM')],
  ['stops','Quantas vezes paraste?',['Nenhuma','Uma','Duas','Três ou mais']],
  ['notes','Precisão das notas',['0 · Muitas falhas','1 · Poucas corretas','2 · Maioria correta','3 · Sem erros percebidos']],
  ['rhythm','Precisão do ritmo',['0 · Pulso perdido','1 · Várias falhas','2 · Ritmo maioritariamente certo','3 · Sem erros percebidos']],
  ['where','Padrão a rever',['Sem erro identificado','Notas na clave de Fá','Salto intervalar','Inversão ou acorde','Padrão da mão esquerda','Pulso/subdivisão','Articulação','Coordenação das vozes','Antecipação do olhar']]
 ];
 let reviewCoverage=null;
 if(exercise.reviewTask){
  const label=el('label','','O excerto permitiu praticar "'+exercise.reviewTask.pattern+'"?');
  reviewCoverage=el('select');
  [['0','Não · preciso de outro exercício'],['1','Sim · pratiquei esse padrão']].forEach(([value,title])=>{
   const opt=el('option','',title);opt.value=value;reviewCoverage.append(opt);
  });
  label.append(reviewCoverage);container.append(label);
 }
 const selects={};for(const [id,name,opts] of fields){
  const label=el('label','',name),select=el('select');selects[id]=select;
  for(let i=0;i<opts.length;i++){const o=el('option','',opts[i]);o.value=String(i);select.append(o)}
  if(id==='bpm'){const current=P.stages[exercise.level].q;select.value=String(Math.max(0,Math.min(opts.length-1,Math.round((current-40)/5))))}
  label.append(select);container.append(label);
 }
 container.append(el('div','workspace-path-banner','Estes dados são autorrelatados e provisórios. 3/3 não equivale a 90% medido. Sem MIDI validado ou professor e prova específica, não há certificação.'));
 const submit=el('button','','Guardar revisão');
 const result=el('p','workout-result','');submit.onclick=()=>{
  const scale=[0,.35,.75,1],bpm=40+Number(selects.bpm.value)*5;
  const attempt={track:exercise.track,level:exercise.level,exerciseId:exercise.id,sessionId:exercise.sessionId,date:todayLocal(),kind:'practice',notes:scale[Number(selects.notes.value)],rhythm:scale[Number(selects.rhythm.value)],stops:Number(selects.stops.value),bpm,stablePulse:Number(selects.stops.value)===0&&Number(selects.rhythm.value)===3,evidence:'self_report',errors:Number(selects.where.value)?[{pattern:fields[4][2][Number(selects.where.value)]}]:[]};
  try{
   if(exercise.reviewTask){
    if(reviewCoverage?.value!=='1'){
     result.textContent='Escolhe uma partitura que contenha o padrão de erro indicado. Esta tarefa não foi concluída.';
     return;
    }
    // A self-reported spaced review records PRACTICE only, not verified mastery.
    const reviewed=exercise.reviewTask;
    if(attempt.level===(profile.levels[attempt.track]?.level||0)){
     const ordinary={...attempt,errors:(attempt.errors||[]).filter(e=>e.pattern!==reviewed.pattern)};
     profile=P.record(profile,ordinary).profile;
    }else{
     profile.exploration=[...(profile.exploration||[]),{
      track:attempt.track,level:attempt.level,sessionId:attempt.sessionId,exerciseId:attempt.exerciseId,
      date:attempt.date,bpm:attempt.bpm,notes:attempt.notes,rhythm:attempt.rhythm,stops:attempt.stops,
      error:attempt.errors?.[0]?.pattern||'',kind:'exploration',verified:false,certified:false
     }].slice(-120);
    }
    const practised=attempt.notes>=.75&&attempt.rhythm>=.75&&attempt.stops===0;
    const resultReview=P.completeReview(profile,reviewed,attempt.date,practised);
    profile=resultReview.profile;save();
    result.textContent=practised
     ?(resultReview.completed?'Quatro revisões praticadas. O ciclo está concluído (sem certificação).':'Revisão praticada. Próxima: '+resultReview.nextDue)
     :'Revisão registada com dificuldades; repete o padrão a partir de '+resultReview.nextDue+'.';
    reviewTask=null;
   }else if(exercise.exploratory){
    if((profile.exploration||[]).some(x=>x.sessionId===attempt.sessionId))throw Error('Esta revisão já foi guardada');
    const error=attempt.errors?.[0]?.pattern||'';
    const observation={track:attempt.track,level:attempt.level,sessionId:attempt.sessionId,
     exerciseId:attempt.exerciseId,date:attempt.date,bpm:attempt.bpm,
     notes:attempt.notes,rhythm:attempt.rhythm,stops:attempt.stops,error,
     kind:'exploration',verified:false,certified:false};
    profile.exploration=[...(profile.exploration||[]),observation].slice(-120);
    if(error){
      const existing=profile.mistakes.find(x=>x.track===attempt.track&&x.level===attempt.level&&x.pattern===error);
      if(existing){
       existing.lastSeen=attempt.date;existing.due=P.dueDates(attempt.date);
       existing.review={next:0,nextDue:existing.due[0],history:[]};
      }else{
       const dates=P.dueDates(attempt.date);
       profile.mistakes.push({track:attempt.track,level:attempt.level,pattern:error,lastSeen:attempt.date,due:dates,
        review:{next:0,nextDue:dates[0],history:[]}});
      }
    }
    save();result.textContent='Estudo exploratório N1 guardado. O nível formal continua N0.';
   }else{
    const outcome=P.record(profile,attempt);profile=outcome.profile;save();
    result.textContent=outcome.recommendation+'. Próxima revisão: '+(profile.mistakes.at(-1)?.due?.[0]||'na próxima sessão')+'.';
   }
   submit.disabled=true;
  }catch(error){result.textContent=error.message}
 };
 actions.append(submit);container.append(actions,result);
}
window.LuwipiPedagogyWorkspace=Object.freeze({splitABC,open,close,getProfile:()=>JSON.parse(JSON.stringify(profile))});
loadProfile();
})();
