/* MIDI performance -> editable MusicXML. Audio always retains the original MIDI. */
(()=>{
'use strict';
const D=960,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const figures=[{ticks:3840,type:'whole'},{ticks:2880,type:'half',dot:true},{ticks:1920,type:'half'},{ticks:1440,type:'quarter',dot:true},{ticks:960,type:'quarter'},{ticks:720,type:'eighth',dot:true},{ticks:640,type:'quarter',triplet:true},{ticks:480,type:'eighth'},{ticks:360,type:'16th',dot:true},{ticks:320,type:'eighth',triplet:true},{ticks:240,type:'16th'},{ticks:160,type:'16th',triplet:true},{ticks:120,type:'32nd'},{ticks:80,type:'32nd',triplet:true},{ticks:60,type:'64th'}];
// Prefer dotted values when they begin on a beat; split syncopations at beat boundaries.
function figureParts(start,length){const parts=[];let at=start,left=length;while(left>0){const room=at%960?960-at%960:left;let f=figures.find(f=>f.ticks<=left&&f.ticks<=room);if(!f)f={ticks:left,type:'64th'};parts.push({...f,start:at});at+=f.ticks;left-=f.ticks}return parts}
// A repeated short gate can describe articulation rather than written rhythm.
// Require three adjacent attacks on a regular pulse, and never bridge a long gap.
function prepareNotation(events,options={}){
 const ordered=events.map((e,i)=>({...e,id:e.id||'source-'+i})).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
 const attacks=[];
 for(const e of ordered){let a=attacks.at(-1);if(!a||Math.abs(a.beat-e.startBeat)>1/960){a={beat:e.startBeat,notes:[]};attacks.push(a)}a.notes.push(e)}
 const pulses=[1,.75,.5,1/3,.25,1/6,.125];
 const candidates=attacks.map((a,i)=>{
  const next=attacks[i+1],gap=next?.beat-a.beat;
  if(!next||gap>.999+1/960||gap<.125-1/960)return null;
  const pulse=pulses.find(p=>Math.abs(p-gap)<=.012);
  if(!pulse||a.notes.some(n=>n.durationBeat<=0||n.durationBeat/pulse>.55||n.startBeat+n.durationBeat>next.beat))return null;
  return {pulse,ratio:a.notes.reduce((sum,n)=>sum+n.durationBeat/pulse,0)/a.notes.length};
 });
 let articulationNotes=0;
 for(let i=0;i<candidates.length;){
  if(!candidates[i]){i++;continue}
  let end=i+1;while(end<candidates.length&&candidates[end]&&Math.abs(candidates[end].ratio-candidates[i].ratio)<.2)end++;
  if(options.articulation!==false&&end-i>=3)for(let j=i;j<end;j++)for(const n of attacks[j].notes){n.notationDurationBeat=candidates[j].pulse;n.staccato=true;articulationNotes++}
  i=end;
 }
 const prepared=ordered.map(n=>({...n,durationBeat:n.notationDurationBeat??n.durationBeat}));
 let grid=Number(options.grid)>0?Number(options.grid):window.LuwipiScoreEngine.inferNotationGrid(prepared);
 // Never collapse two distinct note attacks into one chord.
 while(grid>1/960&&attacks.some((a,i)=>i&&Math.round(a.beat/grid)===Math.round(attacks[i-1].beat/grid)))grid/=2;
 return {events:prepared,grid,articulationNotes};
}
function convert(events,score,title,options={}){
 if(!events.length)throw Error('A pista não tem notas.');
 const E=window.LuwipiScoreEngine,prepared=prepareNotation(events,options),grid=prepared.grid;
 // One source note always survives. Quantization affects notation only.
 const notes=prepared.events.map(e=>({...e,start:Math.max(0,Math.round(Math.round(e.startBeat/grid)*grid*D)),duration:Math.max(60,Math.round(Math.round(e.durationBeat/grid)*grid*D))})).sort((a,b)=>a.start-b.start||a.midi-b.midi);
 const groups=[];
 notes.forEach(n=>{let g=groups.findLast(g=>g.start===n.start&&g.duration===n.duration);if(!g){g={start:n.start,duration:n.duration,notes:[]};groups.push(g)}g.notes.push(n)});
 const voices=[];
 groups.forEach(g=>{let v=voices.find(v=>v.end<=g.start);if(!v){v={number:voices.length+1,end:0,groups:[]};voices.push(v)}v.groups.push(g);v.end=g.start+g.duration;g.voice=v.number});
 const total=Math.max(...notes.map(n=>n.start+n.duration),Math.round((score.durationBeats||0)*D)),meters=(score.meterMap||[]).slice().sort((a,b)=>a.beat-b.beat),keys=(score.keyMap||[]).slice().sort((a,b)=>a.beat-b.beat);
 const bars=[];let start=0;while(start<total){const meter=meters.filter(m=>m.beat*D<=start).at(-1)?.meter||score.meter||[4,4],length=Math.round(meter[0]*4/meter[1]*D);const change=meters.find(m=>m.beat*D>start&&m.beat*D<start+length);const end=change?Math.round(change.beat*D):start+length;bars.push({start,end,meter,key:keys.filter(k=>k.beat*D<=start).at(-1)?.fifths??score.keyFifths??0});start=end;if(bars.length>4000)throw Error('Esta partitura é demasiado longa.')}
 const pitches=notes.map(n=>n.midi).sort((a,b)=>a-b),bass=pitches[Math.floor(pitches.length/2)]<60;
 function pitch(n,key){const candidate=typeof n.notationSpelling==='string'&&/^[A-G](?:#|b)?-?\d+$/.test(n.notationSpelling)?n.notationSpelling:E.midiToSpelledName(n.midi,key),m=/^([A-G])([#b]?)(-?\d+)$/.exec(candidate);return '<pitch><step>'+m[1]+'</step>'+(m[2]?'<alter>'+(m[2]==='#'?1:-1)+'</alter>':'')+'<octave>'+m[3]+'</octave></pitch>'}
 function noteXML(n,f,voice,chord,tieStart,tieStop,key){return '<note>'+(chord?'<chord/>':'')+pitch(n,key)+'<duration>'+f.ticks+'</duration>'+(tieStop?'<tie type="stop"/>':'')+(tieStart?'<tie type="start"/>':'')+'<voice>'+voice+'</voice><type>'+f.type+'</type>'+(f.dot?'<dot/>':'')+(f.triplet?'<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>':'')+'<notations>'+(tieStop?'<tied type="stop"/>':'')+(tieStart?'<tied type="start"/>':'')+(n.staccato&&!tieStop?'<articulations><staccato/></articulations>':'')+'</notations></note>'}
 function restXML(at,dur,voice){return figureParts(at,dur).map(f=>'<note><rest/><duration>'+f.ticks+'</duration><voice>'+voice+'</voice><type>'+f.type+'</type>'+(f.dot?'<dot/>':'')+(f.triplet?'<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>':'')+'</note>').join('')}
 const measures=bars.map((bar,index)=>{
  const length=bar.end-bar.start;
  const previous=bars[index-1];
  let attributes=index===0?'<divisions>'+D+'</divisions>':'';
  if(!previous||previous.key!==bar.key)attributes+='<key><fifths>'+bar.key+'</fifths></key>';
  if(!previous||previous.meter.join('/')!==bar.meter.join('/'))attributes+='<time><beats>'+bar.meter[0]+'</beats><beat-type>'+bar.meter[1]+'</beat-type></time>';
  if(index===0)attributes+='<clef><sign>'+(bass?'F':'G')+'</sign><line>'+(bass?4:2)+'</line></clef>';
  let xml='<measure number="'+(index+1)+'">'+(attributes?'<attributes>'+attributes+'</attributes>':'');
  voices.forEach((voice,vi)=>{
   if(vi)xml+='<backup><duration>'+length+'</duration></backup>';
   let at=bar.start;
   for(const g of voice.groups){const end=g.start+g.duration;if(end<=bar.start||g.start>=bar.end)continue;const from=Math.max(g.start,bar.start),to=Math.min(end,bar.end);if(from>at)xml+=restXML(at-bar.start,from-at,voice.number);
    const parts=figureParts(from-bar.start,to-from);
    parts.forEach((f,pi)=>{g.notes.forEach((n,ni)=>{xml+=noteXML(n,f,voice.number,ni>0,from+f.start-(from-bar.start)+f.ticks<end,from>g.start||pi>0,bar.key)})});at=to;
   }
   if(at<bar.end)xml+=restXML(at-bar.start,bar.end-at,voice.number);
  });return xml+'</measure>';
 }).join('');
 const xml='<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>'+esc(title)+'</work-title></work><part-list><score-part id="P1"><part-name>'+esc(title)+'</part-name></score-part></part-list><part id="P1">'+measures+'</part></score-partwise>';
 return {xml,sourceNotes:events.length,voices:voices.length,gridBeat:grid,bars:bars.length,articulationNotes:prepared.articulationNotes,notationVersion:2,notes};
}
// Keep all metadata/controllers and remove only note events from other track/channel pairs.
function isolate(binary,key){
 const input=new Uint8Array(binary),view=new DataView(binary),[wantedTrack,wantedChannel]=key.split(':').map(Number),out=[...input.slice(0,8+view.getUint32(4))];let pos=8+view.getUint32(4);
 const variable=n=>{const b=[n&127];while(n>>=7)b.unshift((n&127)|128);return b};
 for(let track=0;track<view.getUint16(10);track++){
  const end=pos+8+view.getUint32(pos+4),bytes=[];let p=pos+8,running=0,held=0;
  function readVar(){let v=0,b;do{b=input[p++];v=(v<<7)|(b&127)}while(b&128);return v}
  while(p<end){held+=readVar();let status=input[p];if(status&128){p++;if(status<240)running=status}else status=running;let payload=[];
   if(status===255){const type=input[p++],n=readVar();payload=[type,...variable(n),...input.slice(p,p+n)];p+=n}
   else if(status===240||status===247){const n=readVar();payload=[...variable(n),...input.slice(p,p+n)];p+=n;running=0}
   else{const n=(status&240)===192||(status&240)===208?1:2;payload=[...input.slice(p,p+n)];p+=n}
   const note=(status&240)===128||(status&240)===144;
   if(!note||(track===wantedTrack&&(status&15)===wantedChannel)){bytes.push(...variable(held),status,...payload);held=0}
  }
  const n=bytes.length;out.push(77,84,114,107,(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255);for(const byte of bytes)out.push(byte);pos=end;
 }
 return Uint8Array.from(out).buffer;
}
window.LuwipiMidiNotation=Object.freeze({convert,isolate,prepareNotation});
})();
