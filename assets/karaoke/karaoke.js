(()=>{
'use strict';
const E=window.LuwipiScoreEngine;
const $=id=>document.getElementById(id);
const view=$('karaokeView'),files=$('karaokeFiles'),song=$('karaokeSong'),lead=$('karaokeLead'),staff=$('karaokeStaff');
if(!view||!E)return;
let playlist=[],current=null,leadKey='',leadNotes=[],backing=[],timer=0,startAt=0,playing=false,points=0,hit=new Set(),unsubscribe=null;
const keys=$('karaokeKeys');let keyboardBase=60;
$('karaokeOctaveDown').addEventListener('click',()=>{keyboardBase=Math.max(24,keyboardBase-12);drawKeys()});$('karaokeOctaveUp').addEventListener('click',()=>{keyboardBase=Math.min(96,keyboardBase+12);drawKeys()});
const noteName=m=>E.ptSolfege(m).replace(/-?\d+$/,'');
const keyOf=e=>`${e.track}:${e.channel}`;
function msAt(beat){const map=(current?.score?.tempoMap||[]).slice().sort((a,b)=>a.beat-b.beat);let cursor=0,ms=0,bpm=current?.score?.tempoBpm||120;for(const change of map){if(change.beat>beat)break;if(change.beat>cursor){ms+=(change.beat-cursor)*60000/bpm;cursor=change.beat}bpm=change.bpm||bpm}return ms+(beat-cursor)*60000/bpm}
function groups(score){
 const map=new Map();
 E.performanceEvents(score).forEach(e=>{const k=keyOf(e);if(!map.has(k))map.set(k,[]);map.get(k).push(e)});
 return [...map].map(([key,events])=>{
  const track=Number(key.split(':')[0]),channel=Number(key.split(':')[1]);
  const title=score.transcription?.trackNames?.find(t=>t.track===track)?.title||`Pista ${track+1}`;
  const program=score.transcription?.programs?.find(p=>p.track===track&&p.channel===channel)?.program;
  const sorted=events.slice().sort((a,b)=>a.startBeat-b.startBeat),avg=events.reduce((n,e)=>n+e.midi,0)/events.length;
  let overlap=0;for(let i=1;i<sorted.length;i++)if(sorted[i].startBeat<sorted[i-1].startBeat+sorted[i-1].durationBeat-.1)overlap++;
  const melodic=/melod|solo|lead|voice|vocal|flute|sax|violin|canto|voz|flauta/i.test(title);
  const instrument=(program>=64&&program<=79)||(program>=40&&program<=47);
  const scoreValue=(melodic?6:0)+(instrument?2:0)+(avg>=58&&avg<=90?2:0)+Math.min(2,events.length/30)-overlap/Math.max(1,events.length)*7;
  return {key,title,events:sorted,scoreValue};
 }).filter(x=>x.events.length>=2).sort((a,b)=>b.scoreValue-a.scoreValue);
}
function simplify(events){
 const ordered=events.slice().sort((a,b)=>a.startBeat-b.startBeat||b.midi-a.midi),out=[];
 for(const event of ordered){
  const start=Math.round(event.startBeat*4)/4,duration=Math.max(.25,Math.round(event.durationBeat*4)/4);
  const previous=out.at(-1);
  if(previous&&Math.abs(previous.startBeat-start)<.12){if(event.midi>previous.midi)out[out.length-1]={midi:event.midi,startBeat:start,durationBeat:duration};continue}
  if(previous&&previous.midi===event.midi&&start<=previous.startBeat+previous.durationBeat+.06){previous.durationBeat=Math.max(previous.durationBeat,start+duration-previous.startBeat);continue}
  if(duration<=.25&&ordered.some(e=>e.startBeat>event.startBeat&&e.startBeat<event.startBeat+.32&&e.midi!==event.midi))continue;
  out.push({midi:event.midi,startBeat:start,durationBeat:duration});
 }
 return out;
}
function setSong(index){stop();current=playlist[index]||null;lead.innerHTML='';if(!current)return;
 const tracks=groups(current.score);
 tracks.forEach(g=>{const option=new Option(`${g.title} · ${g.events.length} notas`,g.key);lead.add(option)});
 if(!tracks.length){$('karaokeStatus').textContent='Este MIDI não tem uma pista melódica separada.';return}
 leadKey=tracks[0].key;setLead();$('karaokePlay').disabled=false;$('karaokeShare').disabled=false;
}
function setLead(){stop();leadKey=lead.value;const events=E.performanceEvents(current.score);leadNotes=simplify(events.filter(e=>keyOf(e)===leadKey));keyboardBase=Math.max(36,Math.min(84,Math.floor((leadNotes[0]?.midi||60)/12)*12));drawKeys();backing=events.filter(e=>keyOf(e)!==leadKey).sort((a,b)=>a.startBeat-b.startBeat);hit=new Set();points=0;$('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');$('karaokeStatus').textContent='Melodia removida do acompanhamento. Toca as notas quando a linha azul passar.';render(0)}
function svg(name,attr,parent){const el=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v] of Object.entries(attr))el.setAttribute(k,v);parent.append(el);return el}
function drawKeys(){keys.replaceChildren();for(let i=0;i<12;i++){const midi=keyboardBase+i,button=document.createElement('button');button.type='button';button.className='karaoke-key'+([1,3,6,8,10].includes(i)?' black':'');button.textContent=[1,3,6,8,10].includes(i)?'':noteName(midi);button.setAttribute('aria-label',E.ptSolfege(midi));button.addEventListener('pointerdown',event=>{event.preventDefault();E.playNote(midi,1,500,80);input({type:'noteon',midi});button.classList.add('pressed')});button.addEventListener('pointerup',()=>button.classList.remove('pressed'));button.addEventListener('pointercancel',()=>button.classList.remove('pressed'));keys.append(button)}}
function render(beat){
 staff.replaceChildren();staff.setAttribute('viewBox','0 0 900 260');
 const windowStart=Math.max(0,Math.floor(beat/8)*8),scale=95,y0=78;
 for(let i=0;i<5;i++)svg('line',{x1:40,x2:870,y1:y0+i*23,y2:y0+i*23,class:'staff-line'},staff);
 const clef=svg('text',{x:43,y:172,class:'staff-clef'},staff);clef.textContent='𝄞';
 const first=leadNotes.findIndex(n=>n.startBeat+n.durationBeat>=beat-.25);
 const next=first>=0?leadNotes[first]:null;
 leadNotes.forEach((n,i)=>{if(n.startBeat<windowStart||n.startBeat>=windowStart+8)return;
  const x=125+(n.startBeat-windowStart)*scale,step=E.staffStep(n.midi,'treble'),y=y0+92-step*11.5,passed=n.startBeat+.15<beat;
  if(step<0)for(let s=-2;s>=step;s-=2)svg('line',{x1:x-19,x2:x+19,y1:y0+92-s*11.5,y2:y0+92-s*11.5,class:'staff-line'},staff);
  const c=hit.has(i)?'note-hit':passed?'note-past':'note-wait';
  svg('ellipse',{cx:x,cy:y,rx:14,ry:10,class:c},staff);
  if(n.durationBeat>=.75)svg('line',{x1:x+13,x2:x+13,y1:y,y2:y-58,class:'note-stem'},staff);
  const label=svg('text',{x,y:226,class:'note-label'},staff);label.textContent=noteName(n.midi);
 });
 const cursorX=125+(beat-windowStart)*scale;svg('line',{x1:cursorX,x2:cursorX,y1:53,y2:202,class:'karaoke-cursor'},staff);
 $('karaokeNow').textContent=next?`Agora · ${noteName(next.midi)}`:'Fim da melodia';$('karaokeNext').textContent=next?`Próxima nota: ${noteName(next.midi)}`:'Boa! Terminaste a melodia.';
 $('karaokePoints').textContent=`${points} pontos`;
 const end=leadNotes.at(-1)?.startBeat+leadNotes.at(-1)?.durationBeat||1;$('karaokeProgress').style.width=Math.min(100,beat/end*100)+'%';
}
function stop(){playing=false;clearInterval(timer);timer=0;$('karaokePlay').textContent='▶ Começar';$('karaokeStop').disabled=true}
function play(){if(!current||!leadNotes.length)return;if(playing){stop();return}points=0;hit=new Set();playing=true;startAt=performance.now();let cursor=0;const bpm=current.score.tempoBpm||120,beatMs=60000/bpm,end=Math.max(leadNotes.at(-1).startBeat+leadNotes.at(-1).durationBeat,backing.at(-1)?.startBeat||0);
 $('karaokePlay').textContent='↻ Reiniciar';$('karaokeStop').disabled=false;
 timer=setInterval(()=>{const elapsed=performance.now()-startAt;let low=0,high=end+2;for(let i=0;i<17;i++){const mid=(low+high)/2;if(msAt(mid)<elapsed)low=mid;else high=mid}const beat=(low+high)/2;
  while(cursor<backing.length&&backing[cursor].startBeat<=beat+.08){const n=backing[cursor++];E.playNote(n.midi,Math.min(4,n.durationBeat),beatMs,n.velocity||70)}
  render(beat);if(beat>end+1){stop();$('karaokeStatus').textContent=`Terminaste! ${points} pontos.`}
 },35);
}
function input(e){if(!playing||e.type!=='noteon')return;const elapsed=performance.now()-startAt;let low=0,high=(leadNotes.at(-1)?.startBeat||0)+3;for(let i=0;i<16;i++){const mid=(low+high)/2;if(msAt(mid)<elapsed)low=mid;else high=mid}const beat=(low+high)/2;let best=-1,error=Infinity;
 leadNotes.forEach((n,i)=>{const d=Math.abs(n.startBeat-beat);if(!hit.has(i)&&n.midi===e.midi&&d<.65&&d<error){best=i;error=d}});
 if(best>=0){hit.add(best);points+=error<.2?100:60;render(beat);staff.classList.remove('karaoke-flash');void staff.offsetWidth;staff.classList.add('karaoke-flash')}
}
async function upload(list){const incoming=[];for(const file of list){try{const score=E.parseMIDI(await file.arrayBuffer());incoming.push({name:file.name.replace(/\.midi?$/i,''),score})}catch(error){console.error('MIDI karaoke import:',error);$('karaokeStatus').textContent=`${file.name}: não foi possível ler este MIDI (${error?.message||'erro'}).`}}
 playlist.push(...incoming);song.replaceChildren();playlist.forEach((item,i)=>song.add(new Option(item.name,String(i))));if(incoming.length){song.value=String(playlist.length-incoming.length);setSong(Number(song.value))}}
files.addEventListener('change',()=>void upload(files.files));song.addEventListener('change',()=>setSong(Number(song.value)));lead.addEventListener('change',setLead);$('karaokePlay').addEventListener('click',play);$('karaokeStop').addEventListener('click',()=>{stop();render(0)});
$('karaokeBack').addEventListener('click',()=>{stop();view.classList.remove('active');$('homeView').classList.add('active')});
document.querySelectorAll('[data-karaoke-open]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));view.classList.add('active');document.querySelector('.experience-menu-close')?.click()}));
$('karaokeMidi').addEventListener('click',async()=>{try{const data=await window.LuwipiLiveInput.connectMIDI();$('karaokeStatus').textContent=`Teclado MIDI ligado · ${data.count} entrada(s)`}catch{$('karaokeStatus').textContent='Não foi possível ligar o teclado MIDI.'}});
$('karaokeMic').addEventListener('click',async()=>{try{await window.LuwipiLiveInput.connectMicrophone();$('karaokeStatus').textContent='Microfone ligado. Toca a melodia.'}catch{$('karaokeStatus').textContent='Não foi possível ligar o microfone.'}});
unsubscribe=window.LuwipiLiveInput?.subscribe(input);
document.addEventListener('click',event=>{if(view.classList.contains('active')&&event.target.closest('[data-nav],[data-menu-course],[data-experience-nav]')){stop();view.classList.remove('active')}},true);
document.addEventListener('keydown',event=>{if(view.classList.contains('active')&&event.code==='Space'&&!event.target.closest('button,input,select')){event.preventDefault();play()}});
$('karaokeTaskClose').addEventListener('click',()=>$('karaokeTaskSheet').hidden=true);
$('karaokeTaskSheet').addEventListener('click',event=>{if(event.target.id==='karaokeTaskSheet')event.currentTarget.hidden=true});
$('karaokeTaskCopy').addEventListener('click',async()=>{const input=$('karaokeTaskLink');try{await navigator.clipboard.writeText(input.value);$('karaokeTaskCopy').textContent='Copiado ✓'}catch{input.focus();input.select();$('karaokeTaskCopy').textContent='Seleciona e copia'}setTimeout(()=>$('karaokeTaskCopy').textContent='Copiar link',1800)});
$('karaokeShare').addEventListener('click',async()=>{if(!current)return;const data={title:current.name,tempoBpm:current.score.tempoBpm,tempoMap:current.score.tempoMap,meter:current.score.meter,keyFifths:current.score.keyFifths,lead:leadNotes,backing:backing.map(n=>({midi:n.midi,startBeat:n.startBeat,durationBeat:n.durationBeat,velocity:n.velocity}))};let bytes=new TextEncoder().encode(JSON.stringify(data));if('CompressionStream'in window){bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer())}if(bytes.length>18000){$('karaokeStatus').textContent='Este MIDI é demasiado grande para um link. Envia o ficheiro MIDI diretamente.';return}let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));const encoded=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL('/',location.origin);url.searchParams.set('parent','1');url.searchParams.set('type','karaoke');url.hash='karaoke='+encoded;$('karaokeTaskLink').value=url.href;$('karaokeTaskSheet').hidden=false});
async function openSharedTask(){try{const q=new URLSearchParams(location.search),encoded=location.hash.match(/^#karaoke=([\w-]+)$/)?.[1];if(q.get('type')!=='karaoke'||!encoded)return;const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));let bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytes[0]===31&&bytes[1]===139){if(!('DecompressionStream'in window))throw Error('Este navegador não consegue abrir esta tarefa.');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}const data=JSON.parse(new TextDecoder().decode(bytes));if(Array.isArray(data.lead)&&Array.isArray(data.backing)){current={name:data.title,score:{tempoBpm:data.tempoBpm,tempoMap:data.tempoMap,meter:data.meter,keyFifths:data.keyFifths}};leadNotes=data.lead;backing=data.backing;view.classList.add('active');document.querySelectorAll('.view').forEach(v=>{if(v!==view)v.classList.remove('active')});$('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');$('karaokePlay').disabled=false;keyboardBase=Math.max(36,Math.min(84,Math.floor((leadNotes[0]?.midi||60)/12)*12));drawKeys();render(0)}}catch(error){console.warn('Tarefa MIDI inválida',error);$('karaokeStatus').textContent='Não foi possível abrir a tarefa MIDI.'}}
void openSharedTask();
})();
(()=>{const body=document.body,buttons=[document.getElementById('experienceMenuTheme'),document.getElementById('karaokeTheme')].filter(Boolean);function set(dark){body.classList.toggle('luwipi-dark',dark);buttons.forEach(button=>{button.setAttribute('aria-pressed',String(dark));if(button.id==='experienceMenuTheme')button.querySelector('b').textContent=dark?'Tema claro':'Tema escuro'});try{localStorage.setItem('luwipi_theme',dark?'dark':'light')}catch{}}try{set(localStorage.getItem('luwipi_theme')==='dark')}catch{}buttons.forEach(button=>button.addEventListener('click',()=>set(!body.classList.contains('luwipi-dark'))))})();
