(()=>{
'use strict';
const E=window.LuwipiScoreEngine;
const $=id=>document.getElementById(id);
const view=$('karaokeView'),files=$('karaokeFiles'),song=$('karaokeSong'),lead=$('karaokeLead'),staff=$('karaokeStaff');
if(!view||!E)return;
let playRequest=0,loading=false;let playlist=[],current=null,leadKey='',leadNotes=[],notation=[],backing=[],timer=0,startAt=0,playing=false,points=0,hit=new Set(),unsubscribe=null;
const keys=$('karaokeKeys');let keyboardBase=60;
$('karaokeOctaveDown').addEventListener('click',()=>{keyboardBase=Math.max(24,keyboardBase-12);drawKeys()});$('karaokeOctaveUp').addEventListener('click',()=>{keyboardBase=Math.min(96,keyboardBase+12);drawKeys()});
const noteName=m=>E.ptSolfege(m).replace(/-?\d+$/,'');
const keyOf=e=>`${e.track}:${e.channel}`;
function msAt(beat){const map=(current?.score?.tempoMap||[]).slice().sort((a,b)=>a.beat-b.beat);let cursor=0,ms=0,bpm=current?.score?.tempoBpm||120;for(const change of map){if(change.beat>beat)break;if(change.beat>cursor){ms+=(change.beat-cursor)*60000/bpm;cursor=change.beat}bpm=change.bpm||bpm}return ms+(beat-cursor)*60000/bpm}
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
  return {key,title,events:sorted,scoreValue};
 }).filter(x=>x.events.length>=2).sort((a,b)=>b.scoreValue-a.scoreValue);
}
function simplify(events){
 // Keep every melodic attack, including fast and repeated notes.
 const ordered=events.slice().sort((a,b)=>a.startBeat-b.startBeat||b.midi-a.midi),out=[];
 for(const event of ordered){
  const previous=out.at(-1);
  if(previous&&Math.abs(previous.startBeat-event.startBeat)<.001)continue;
  if(previous)previous.durationBeat=Math.min(previous.durationBeat,event.startBeat-previous.startBeat);
  out.push({...event});
 }
 return out;
}
function setSong(index){stop();current=playlist[index]||null;lead.innerHTML='';if(!current)return;
 const tracks=groups(current.score);
 tracks.forEach(g=>{const option=new Option(`${g.title} · ${g.events.length} notas`,g.key);lead.add(option)});
 if(!tracks.length){$('karaokeStatus').textContent='Este MIDI não tem uma pista melódica separada.';return}
 leadKey=tracks[0].key;setLead();$('karaokePlay').disabled=false;$('karaokeShare').disabled=false;
}
function setLead(){stop();leadKey=lead.value;const events=E.performanceEvents(current.score);leadNotes=simplify(events.filter(e=>keyOf(e)===leadKey));notation=E.transcribePerformance(leadNotes.map(n=>({...n,clef:'treble'})),current.score).events;keyboardBase=Math.max(36,Math.min(84,Math.floor((leadNotes[0]?.midi||60)/12)*12));drawKeys();backing=events.filter(e=>keyOf(e)!==leadKey).sort((a,b)=>a.startBeat-b.startBeat);hit=new Set();points=0;$('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');$('karaokeStatus').textContent='O MIDI toca completo. A partitura mostra apenas o solo escolhido.';render(0)}
function svg(name,attr,parent){const el=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v] of Object.entries(attr))el.setAttribute(k,v);parent.append(el);return el}
function drawKeys(){keys.replaceChildren();for(let i=0;i<12;i++){const midi=keyboardBase+i,button=document.createElement('button');button.type='button';button.className='karaoke-key'+([1,3,6,8,10].includes(i)?' black':'');button.textContent=[1,3,6,8,10].includes(i)?'':noteName(midi);button.setAttribute('aria-label',E.ptSolfege(midi));button.addEventListener('pointerdown',event=>{event.preventDefault();E.playNote(midi,1,500,80);input({type:'noteon',midi});button.classList.add('pressed')});button.addEventListener('pointerup',()=>button.classList.remove('pressed'));button.addEventListener('pointercancel',()=>button.classList.remove('pressed'));keys.append(button)}}
function render(beat){
 staff.replaceChildren();staff.setAttribute('viewBox','0 0 900 300');
 const score=current.score,meter=(score.meterMap||[]).filter(m=>m.beat<=beat).at(-1)?.meter||score.meter||[4,4];
 const barBeats=meter[0]*4/meter[1],bar=Math.floor(beat/barBeats),windowStart=bar*barBeats;
 const y0=82,bottom=y0+92,key=(score.keyMap||[]).filter(k=>k.beat<=beat).at(-1)?.fifths??score.keyFifths??0;
 const left=215,right=840,scale=(right-left)/barBeats;
 for(let i=0;i<5;i++)svg('line',{x1:32,x2:880,y1:y0+i*23,y2:y0+i*23,class:'staff-line'},staff);
 const clef=svg('text',{x:36,y:176,class:'staff-clef'},staff);clef.textContent='𝄞';
 const order=key>0?[8,5,9,6,3,7,4]:[4,7,3,6,2,5,1];
 for(let i=0;i<Math.abs(key);i++)svg('text',{x:86+i*13,y:bottom-order[i]*11.5+7,fill:'currentColor','font-size':24},staff).textContent=key>0?'♯':'♭';
 const signatureX=94+Math.abs(key)*13;
 [meter[0],meter[1]].forEach((n,i)=>svg('text',{x:signatureX,y:y0+29+i*39,'font-size':27,fill:'currentColor'},staff).textContent=n);
 svg('text',{x:32,y:30,'font-size':14,fill:'currentColor'},staff).textContent='Solo · Compasso '+(bar+1);
 [left-20,865].forEach(x=>svg('line',{x1:x,x2:x,y1:y0,y2:bottom,class:'staff-line'},staff));
 const visible=notation.filter(n=>n.startBeat>=windowStart-.0001&&n.startBeat<windowStart+barBeats-.0001);
 const accidentals=new Map(),sharpOrder=['F','C','G','D','A','E','B'],flatOrder=['B','E','A','D','G','C','F'];
 const keyLetters=new Set((key>0?sharpOrder:flatOrder).slice(0,Math.abs(key)));
 function rest(start,duration){
  let cursor=start,remaining=duration;
  while(remaining>.03){
   const choices=[4,3,2,1.5,1,.75,.5,.375,.25,.125,.0625];
   const dur=choices.find(d=>d<=remaining+.001)||remaining,kind=E.durationKind(dur);
   const x=left+(cursor-windowStart)*scale;
   svg('text',{x,y:y0+68,'font-size':34,fill:'currentColor','text-anchor':'middle'},staff).textContent=E.restSymbol(kind.name)==='whole'?'𝄻':E.restSymbol(kind.name)==='half'?'𝄼':E.restSymbol(kind.name)==='eighth'?'𝄾':E.restSymbol(kind.name)==='sixteenth'?'𝄿':E.restSymbol(kind.name)==='thirty-second'?'𝅀':'𝄽';
   if(kind.dots)svg('circle',{cx:x+16,cy:y0+48,r:2.5,fill:'currentColor'},staff);
   cursor+=dur;remaining-=dur;
  }
 }
 let cursor=windowStart;
 visible.forEach(n=>{
  if(n.startBeat>cursor+.03)rest(cursor,n.startBeat-cursor);
  cursor=Math.max(cursor,n.startBeat+n.durationBeat);
  const x=left+(n.startBeat-windowStart)*scale,name=E.midiToSpelledName(n.midi,key);
  const step=E.staffStep(n.midi,'treble',name),y=bottom-step*11.5,kind=E.durationKind(n.durationBeat);
  const original=leadNotes.findIndex(p=>p.id===n.sourceEventId);
  const color=hit.has(original)?'#238854':n.startBeat+n.durationBeat<beat?'#8392aa':'currentColor';
  if(step<0)for(let s=-2;s>=step;s-=2)svg('line',{x1:x-16,x2:x+16,y1:bottom-s*11.5,y2:bottom-s*11.5,class:'staff-line'},staff);
  if(step>8)for(let s=10;s<=step;s+=2)svg('line',{x1:x-16,x2:x+16,y1:bottom-s*11.5,y2:bottom-s*11.5,class:'staff-line'},staff);
  const m=/^([A-G])([#b]?)(-?\d+)$/.exec(name),letter=m[1],acc=m[2]||'',pitch=letter+m[3];
  const expected=accidentals.has(pitch)?accidentals.get(pitch):keyLetters.has(letter)?(key>0?'#':'b'):'';
  if(acc!==expected)svg('text',{x:x-22,y:y+8,'font-size':23,fill:color},staff).textContent=acc==='#'?'♯':acc==='b'?'♭':'♮';
  accidentals.set(pitch,acc);
  svg('ellipse',{cx:x,cy:y,rx:11,ry:7.5,fill:kind.open?'var(--karaoke-paper,white)':color,stroke:color,'stroke-width':2,transform:'rotate(-20 '+x+' '+y+')'},staff);
  if(kind.stem){
   const up=step<5,sx=x+(up?9:-9),sy=y+(up?-52:52);
   svg('line',{x1:sx,x2:sx,y1:y,y2:sy,stroke:color,'stroke-width':2},staff);
   for(let f=0;f<kind.flags;f++){
    const fy=sy+(up?f*9:-f*9),d=up?1:-1;
    svg('path',{d:'M '+sx+' '+fy+' Q '+(sx+20*d)+' '+(fy+10*d)+' '+(sx+12*d)+' '+(fy+26*d),fill:'none',stroke:color,'stroke-width':3},staff);
   }
  }
  if(kind.dots)svg('circle',{cx:x+18,cy:y-2,r:2.5,fill:color},staff);
  if(kind.tuplet)svg('text',{x,y:y-66,'font-size':13,fill:color},staff).textContent='3';
  if(n.tieStart||n.tieStop)svg('path',{d:'M '+(x-12)+' '+(y+20)+' Q '+x+' '+(y+32)+' '+(x+17)+' '+(y+20),fill:'none',stroke:color,'stroke-width':1.5},staff);
  svg('text',{x,y:273,class:'note-label'},staff).textContent=noteName(n.midi);
 });
 if(cursor<windowStart+barBeats-.03)rest(cursor,windowStart+barBeats-cursor);
 const cursorX=left+(beat-windowStart)*scale;svg('line',{x1:cursorX,x2:cursorX,y1:50,y2:240,class:'karaoke-cursor'},staff);
 const next=leadNotes.find(n=>n.startBeat+n.durationBeat>=beat);
 $('karaokeNow').textContent=next?'Solo · '+noteName(next.midi):'Fim do solo';
 $('karaokeNext').textContent=next?'Próxima nota: '+noteName(next.midi):'Boa! Terminaste a melodia.';
 $('karaokePoints').textContent=points+' pontos';
 const end=score.durationBeats||leadNotes.at(-1)?.startBeat+leadNotes.at(-1)?.durationBeat||1;
 $('karaokeProgress').style.width=Math.min(100,beat/end*100)+'%';
}
function stop(){playRequest++;loading=false;playing=false;clearInterval(timer);timer=0;window.LuwipiMidiPlayer.stop();$('karaokePlay').textContent='▶ Começar';$('karaokeStop').disabled=true}
function currentBeat(){
 const elapsed=window.LuwipiMidiPlayer.time*1000;
 let low=0,high=Math.max(current?.score?.durationBeats||0,...leadNotes.map(n=>n.startBeat+n.durationBeat),1)+4;
 for(let i=0;i<22;i++){const mid=(low+high)/2;if(msAt(mid)<elapsed)low=mid;else high=mid}
 return (low+high)/2;
}
async function play(){
 if(!current||!leadNotes.length)return;
 if(playing||loading){stop();render(0);return}
 if(!current.binary){$('karaokeStatus').textContent='Esta tarefa antiga não conserva os instrumentos. Importa o MIDI original para tocar a música completa.';return}
 const request=++playRequest;loading=true;
 $('karaokePlay').textContent='A carregar…';$('karaokeStop').disabled=false;
 $('karaokeStatus').textContent='A preparar os instrumentos da música…';
 try{
  const started=await window.LuwipiMidiPlayer.play(current.binary,current.name);
  if(request!==playRequest||!started)return;
  loading=false;playing=true;points=0;hit=new Set();
  $('karaokePlay').textContent='■ Parar';$('karaokeStatus').textContent='Música completa · acompanha o solo na partitura.';
  timer=setInterval(()=>{render(currentBeat());if(window.LuwipiMidiPlayer.finished){stop();$('karaokeStatus').textContent='Terminaste! '+points+' pontos.'}},35);
 }catch(error){if(request!==playRequest)return;stop();$('karaokeStatus').textContent=error.message||'Não foi possível carregar os instrumentos MIDI.'}
}
function input(e){if(!playing||e.type!=='noteon')return;const beat=currentBeat();let best=-1,error=Infinity;
 leadNotes.forEach((n,i)=>{const d=Math.abs(n.startBeat-beat);if(!hit.has(i)&&n.midi===e.midi&&d<.65&&d<error){best=i;error=d}});
 if(best>=0){hit.add(best);points+=error<.2?100:60;render(beat);staff.classList.remove('karaoke-flash');void staff.offsetWidth;staff.classList.add('karaoke-flash')}
}
async function upload(list){const incoming=[];for(const file of list){try{const binary=await file.arrayBuffer(),score=E.parseMIDI(binary);incoming.push({name:file.name.replace(/\.midi?$/i,''),score,binary})}catch(error){console.error('MIDI karaoke import:',error);$('karaokeStatus').textContent=`${file.name}: não foi possível ler este MIDI (${error?.message||'erro'}).`}}
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
$('karaokeShare').addEventListener('click',async()=>{if(!current)return;if(!current.binary){$('karaokeStatus').textContent='Importa o MIDI original para partilhar a música com os instrumentos.';return}let midiBinary='';for(const byte of new Uint8Array(current.binary))midiBinary+=String.fromCharCode(byte);const data={version:2,title:current.name,midi:btoa(midiBinary),leadKey};let bytes=new TextEncoder().encode(JSON.stringify(data));if('CompressionStream'in window){bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer())}if(bytes.length>18000){$('karaokeStatus').textContent='Este MIDI é demasiado grande para um link. Envia o ficheiro MIDI diretamente.';return}let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));const encoded=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL('/',location.origin);url.searchParams.set('parent','1');url.searchParams.set('type','karaoke');url.hash='karaoke='+encoded;$('karaokeTaskLink').value=url.href;$('karaokeTaskSheet').hidden=false});
async function openSharedTask(){try{const q=new URLSearchParams(location.search),encoded=location.hash.match(/^#karaoke=([\w-]+)$/)?.[1];if(q.get('type')!=='karaoke'||!encoded)return;const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));let bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytes[0]===31&&bytes[1]===139){if(!('DecompressionStream'in window))throw Error('Este navegador não consegue abrir esta tarefa.');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}const data=JSON.parse(new TextDecoder().decode(bytes));if(data.version===2&&typeof data.midi==='string'){
 const decoded=atob(data.midi),binary=Uint8Array.from(decoded,c=>c.charCodeAt(0)).buffer;
 const score=E.parseMIDI(binary);playlist.push({name:data.title,score,binary});song.add(new Option(data.title,'0'));song.value='0';setSong(0);
 if([...lead.options].some(o=>o.value===data.leadKey)){lead.value=data.leadKey;setLead()}
 view.classList.add('active');document.querySelectorAll('.view').forEach(v=>{if(v!==view)v.classList.remove('active')});
 }else if(Array.isArray(data.lead)&&Array.isArray(data.backing)){current={name:data.title,score:{tempoBpm:data.tempoBpm,tempoMap:data.tempoMap,meter:data.meter,keyFifths:data.keyFifths}};leadNotes=data.lead;notation=E.transcribePerformance(leadNotes.map((n,i)=>({...n,id:'legacy-'+i,clef:'treble'})),current.score).events;backing=data.backing;view.classList.add('active');document.querySelectorAll('.view').forEach(v=>{if(v!==view)v.classList.remove('active')});$('karaokeEmpty').classList.add('hidden');$('karaokeScore').classList.remove('hidden');$('karaokePlay').disabled=false;keyboardBase=Math.max(36,Math.min(84,Math.floor((leadNotes[0]?.midi||60)/12)*12));drawKeys();render(0)}}catch(error){console.warn('Tarefa MIDI inválida',error);$('karaokeStatus').textContent='Não foi possível abrir a tarefa MIDI.'}}
void openSharedTask();
})();
(()=>{const body=document.body,buttons=[document.getElementById('experienceMenuTheme'),document.getElementById('karaokeTheme')].filter(Boolean);function set(dark){body.classList.toggle('luwipi-dark',dark);buttons.forEach(button=>{button.setAttribute('aria-pressed',String(dark));if(button.id==='experienceMenuTheme')button.querySelector('b').textContent=dark?'Tema claro':'Tema escuro'});try{localStorage.setItem('luwipi_theme',dark?'dark':'light')}catch{}}try{set(localStorage.getItem('luwipi_theme')==='dark')}catch{}buttons.forEach(button=>button.addEventListener('click',()=>set(!body.classList.contains('luwipi-dark'))))})();
