/* Engrave MIDI score in two directions; follow the cursor without obscuring any notes. */
(()=>{
'use strict';
let library,osmd,request=0,queue=Promise.resolve(),lastBeat=0,lastXml='';
let direction=null,rendering=false;
const host=()=>document.getElementById('karaokeStaff');
function loadLibrary(){
 if(!library)library=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),timer=setTimeout(()=>{library=null;reject(Error('O motor da partitura não respondeu.'))},20000);
  script.src='https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.9.9/build/opensheetmusicdisplay.min.js';
  script.onload=()=>{clearTimeout(timer);resolve()};script.onerror=()=>{clearTimeout(timer);library=null;reject(Error('Não foi possível carregar o motor da partitura.'))};
  document.head.append(script);
 });
 return library;
}
function controls(){
 const header=document.querySelector('#karaokeScore .karaoke-score-head');
 if(!header)return;
 let button=document.getElementById('karaokeScoreDirection');
 if(!button){
  button=document.createElement('button');button.id='karaokeScoreDirection';button.type='button';button.className='karaoke-score-direction';
  header.append(button);
  button.addEventListener('click',()=>{
   direction=direction==='horizontal'?'vertical':'horizontal';
   syncControls();
   if(lastXml)void load(lastXml,{preserveBeat:lastBeat});
  });
 }
 syncControls();
}
function syncControls(){
 const stage=host(),button=document.getElementById('karaokeScoreDirection');if(!stage||!button)return;
 stage.dataset.direction=direction||'horizontal';
 button.textContent=direction==='horizontal'?'↕':'↔';
 button.setAttribute('aria-label',direction==='horizontal'?'Ver partitura vertical':'Ver partitura horizontal');
 button.setAttribute('title',direction==='horizontal'?'Partitura vertical':'Partitura horizontal');
 button.setAttribute('aria-pressed',direction==='vertical'?'true':'false');
}
async function load(xml,{preserveBeat=0}={}){
 lastXml=xml;
 const stage=host();if(!stage)throw Error('A partitura não está disponível.');
 if(!direction)direction=stage.clientWidth<540?'vertical':'horizontal';
 controls();
 const id=++request;
 await loadLibrary();
 queue=queue.catch(()=>{}).then(async()=>{
  if(id!==request)return;
  rendering=true;
  try{
  osmd?.clear();stage.replaceChildren();stage.scrollLeft=0;stage.scrollTop=0;
  osmd=new window.opensheetmusicdisplay.OpenSheetMusicDisplay(stage,{
   autoResize:false,backend:'svg',drawTitle:false,drawPartNames:false,drawMeasureNumbers:true,
   renderSingleHorizontalStaffline:direction==='horizontal',followCursor:false,
   drawingParameters:'compacttight',cursorsOptions:[{type:0,color:'#285bd4',alpha:.36,follow:false}]
  });
  osmd.Zoom=stage.clientWidth<540?(direction==='vertical'?.88:1.15):direction==='vertical'?1.15:1.45;
  await osmd.load(xml);if(id!==request)return;
  osmd.render();osmd.cursor.reset();osmd.cursor.show();lastBeat=0;rendering=false;
  update(preserveBeat);
  syncControls();
  }finally{rendering=false}
 });
 await queue;
}
function update(beat){
 if(rendering||!osmd?.cursor?.Iterator)return;
 const cursor=osmd.cursor;
 if(beat<lastBeat)cursor.reset();
 lastBeat=beat;let guard=0;
 while(!cursor.Iterator.EndReached&&cursor.Iterator.CurrentSourceTimestamp.RealValue*4<beat-.015&&guard++<20000)cursor.next();
 const stage=host(),line=cursor.cursorElement;
 if(!stage||!line||stage.clientWidth===0)return;
 const r=line.getBoundingClientRect(),s=stage.getBoundingClientRect();
 const moveX=direction==='horizontal'&&(r.left<s.left+stage.clientWidth*.18||r.right>s.right-stage.clientWidth*.19);
 const moveY=direction==='vertical'&&(r.top<s.top+stage.clientHeight*.18||r.bottom>s.bottom-stage.clientHeight*.20);
 if(moveX)stage.scrollLeft=Math.max(0,stage.scrollLeft+r.left-(s.left+stage.clientWidth*.38));
 if(moveY)stage.scrollTop=Math.max(0,stage.scrollTop+r.top-(s.top+stage.clientHeight*.30));
}
window.LuwipiNotationDisplay=Object.freeze({load,update,get direction(){return direction}});
})();