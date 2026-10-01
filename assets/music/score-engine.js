(function(){
"use strict";

const LETTERS=["C","D","E","F","G","A","B"];
const SHARP_NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const BASE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const DYNAMIC_VELOCITY={ppp:20,pp:32,p:45,mp:58,mf:72,f:88,ff:104,fff:120};
const KEY_NAMES_MAJOR=["Cb","Gb","Db","Ab","Eb","Bb","F","C","G","D","A","E","B","F#","C#"];
const KEY_NAMES_MINOR=["Abm","Ebm","Bbm","Fm","Cm","Gm","Dm","Am","Em","Bm","F#m","C#m","G#m","D#m","A#m"];

function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function roundBeat(n){return Math.round(n*10000)/10000}
function midiToName(midi){
  midi=clamp(Math.round(Number(midi)||60),0,127);
  return SHARP_NAMES[midi%12]+(Math.floor(midi/12)-1);
}
function nameToMidi(name){
  const m=/^([A-G])([#b]?)(-?\d+)$/.exec(String(name||""));
  if(!m)return null;
  return (Number(m[3])+1)*12+BASE[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0);
}
function parseName(name){
  const m=/^([A-G])([#b]?)(-?\d+)$/.exec(String(name||""));
  return m?{letter:m[1],accidental:m[2],octave:Number(m[3])}:null;
}
function diatonicIndexFromName(name){
  const p=parseName(name);
  return p?p.octave*7+LETTERS.indexOf(p.letter):0;
}
function staffStep(midi,clef,noteName){
  const note=noteName||midiToName(midi);
  const base=clef==="bass"?"G2":clef==="alto"?"F3":clef==="tenor"?"D3":"E4";
  return diatonicIndexFromName(note)-diatonicIndexFromName(base);
}
function staffY(midi,clef,bottom,noteName){
  return bottom-staffStep(midi,clef,noteName)*6;
}
function dynamicFromVelocity(v){
  v=clamp(Number(v)||64,1,127);
  if(v<26)return"ppp";
  if(v<39)return"pp";
  if(v<52)return"p";
  if(v<65)return"mp";
  if(v<80)return"mf";
  if(v<96)return"f";
  if(v<113)return"ff";
  return"fff";
}
function velocityFromDynamic(name){
  return DYNAMIC_VELOCITY[String(name||"").toLowerCase()]||72;
}
function keyName(fifths,minor){
  const idx=clamp(Number(fifths)||0,-7,7)+7;
  return(minor?KEY_NAMES_MINOR:KEY_NAMES_MAJOR)[idx]||"C";
}

const FLAT_NAMES=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
function midiToSpelledName(midi,keyFifths){
  midi=clamp(Math.round(Number(midi)||60),0,127);
  const names=Number(keyFifths)<0?FLAT_NAMES:SHARP_NAMES;
  return names[midi%12]+(Math.floor(midi/12)-1);
}
function quantizeValue(value,grid){
  if(!Number.isFinite(value)||!Number.isFinite(grid)||grid<=0)return value;
  return Math.round(value/grid)*grid;
}
function inferNotationGrid(events){
  if(!events||!events.length)return .25;
  const grids=[1,.5,.25,.125,1/3,1/6,.0625];
  const samples=[];
  events.slice(0,5000).forEach(e=>{
    if(Number.isFinite(e.startBeat))samples.push(e.startBeat);
    if(Number.isFinite(e.durationBeat))samples.push(e.durationBeat);
  });
  let best={grid:.25,score:Infinity,error:Infinity};
  grids.forEach(grid=>{
    let err=0;
    for(const v of samples)err+=Math.min(grid/2,Math.abs(v-quantizeValue(v,grid)));
    const avg=samples.length?err/samples.length:0;
    const complexity=grid<.125?.045:grid<.25?.020:0;
    const score=avg+complexity;
    if(score<best.score)best={grid,score,error:avg};
  });
  return best.grid;
}
function splitAcrossBars(event,beatsPerMeasure){
  const out=[];
  let start=event.startBeat,remaining=event.durationBeat,part=0;
  while(remaining>.0001){
    const inMeasure=((start%beatsPerMeasure)+beatsPerMeasure)%beatsPerMeasure;
    const room=beatsPerMeasure-inMeasure;
    const dur=Math.min(remaining,room||beatsPerMeasure);
    out.push(Object.assign({},event,{
      id:event.id+(part?("-tie-"+part):""),
      startBeat:roundBeat(start),
      durationBeat:roundBeat(dur),
      tieStart:remaining>dur||Boolean(event.tieStart),
      tieStop:part>0||Boolean(event.tieStop),
      sourceEventId:event.sourceEventId||event.id
    }));
    start+=dur;remaining-=dur;part++;
    if(part>32)break;
  }
  return out;
}
function transcribePerformance(rawEvents,meta){
  const meter=Array.isArray(meta?.meter)?meta.meter:[4,4];
  const beatsPerMeasure=(Number(meter[0])||4)*(4/(Number(meter[1])||4));
  const grid=inferNotationGrid(rawEvents);
  let totalErr=0,count=0;
  const notated=[];
  const trackStats=new Map();
  rawEvents.forEach(raw=>{
    const key=Number(raw.track)||0,arr=trackStats.get(key)||[];
    arr.push(Number(raw.midi)||60);trackStats.set(key,arr);
  });
  const trackMode=new Map();
  trackStats.forEach((arr,key)=>{
    const sorted=arr.slice().sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)]||60,min=sorted[0]||60,max=sorted[sorted.length-1]||60;
    trackMode.set(key,{split:min<55&&max>65,fixed:median<60?"bass":"treble"});
  });
  rawEvents.forEach((raw,index)=>{
    const perfStart=Math.max(0,Number(raw.startBeat)||0);
    const perfDur=Math.max(.03125,Number(raw.durationBeat)||1);
    const qStart=Math.max(0,quantizeValue(perfStart,grid));
    const qDur=Math.max(grid,quantizeValue(perfDur,grid));
    totalErr+=Math.abs(perfStart-qStart)+Math.abs(perfDur-qDur);count+=2;
    const base=Object.assign({},raw,{
      id:String(raw.id||"midi-"+index),
      sourceEventId:String(raw.id||"midi-"+index),
      performanceStartBeat:roundBeat(perfStart),
      performanceDurationBeat:roundBeat(perfDur),
      startBeat:roundBeat(qStart),
      durationBeat:roundBeat(qDur),
      note:midiToSpelledName(raw.midi,meta?.keyFifths),
      clef:raw.clef||((trackMode.get(Number(raw.track)||0)||{}).split?(raw.midi<60?"bass":"treble"):((trackMode.get(Number(raw.track)||0)||{}).fixed||(raw.midi<60?"bass":"treble")))
    });
    splitAcrossBars(base,beatsPerMeasure).forEach(e=>notated.push(e));
  });
  notated.sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
  const meanError=count?totalErr/count:0;
  const confidence=clamp(1-(meanError/Math.max(grid,.125)),0,1);
  return{
    events:notated,
    gridBeat:grid,
    confidence,
    meanQuantizationError:roundBeat(meanError)
  };
}
function performanceEvents(score){
  return Array.isArray(score?.performanceEvents)&&score.performanceEvents.length?score.performanceEvents:score?.events||[];
}
function durationKind(beats){
  const n=Number(beats)||1;
  const candidates=[
    {beats:4,name:"whole",open:true,stem:false,flags:0,dots:0},
    {beats:3,name:"dotted-half",open:true,stem:true,flags:0,dots:1},
    {beats:2,name:"half",open:true,stem:true,flags:0,dots:0},
    {beats:1.5,name:"dotted-quarter",open:false,stem:true,flags:0,dots:1},
    {beats:1,name:"quarter",open:false,stem:true,flags:0,dots:0},
    {beats:.75,name:"dotted-eighth",open:false,stem:true,flags:1,dots:1},
    {beats:.5,name:"eighth",open:false,stem:true,flags:1,dots:0},
    {beats:1/3,name:"eighth-triplet",open:false,stem:true,flags:1,dots:0,tuplet:3},
    {beats:.375,name:"dotted-sixteenth",open:false,stem:true,flags:2,dots:1},
    {beats:.25,name:"sixteenth",open:false,stem:true,flags:2,dots:0},
    {beats:1/6,name:"sixteenth-triplet",open:false,stem:true,flags:2,dots:0,tuplet:3},
    {beats:.125,name:"thirty-second",open:false,stem:true,flags:3,dots:0}
  ];
  return candidates.reduce((best,item)=>Math.abs(item.beats-n)<Math.abs(best.beats-n)?item:best,candidates[0]);
}
function measureTimeline(initial,maps,endBeat){
  const changes=(Array.isArray(maps)?maps:[])
    .filter(m=>m&&Number.isFinite(Number(m.beat))&&Array.isArray(m.meter)&&m.meter[0]>0&&m.meter[1]>0)
    .map(m=>({beat:roundBeat(Number(m.beat)),meter:m.meter.map(Number)})).sort((a,b)=>a.beat-b.beat);
  let beat=0,meter=initial.slice(),next=0;const result=[];
  // Anchor all changes at a barline. A score editor may represent compound
  // and asymmetric measures without asking the renderer to guess a beat grid.
  while(beat<endBeat-1e-5||!result.length){
    while(next<changes.length&&changes[next].beat<=beat+1e-5){meter=changes[next++].meter.slice()}
    const dur=meter[0]*4/meter[1];
    if(!Number.isFinite(dur)||dur<=0||result.length>=2048)throw Error("score_meter_map_invalid");
    // Imported scores may contain an incomplete bar immediately before a
    // time-signature change. Preserve it rather than rejecting the file.
    if(next<changes.length&&changes[next].beat>beat+1e-5&&changes[next].beat<beat+dur-1e-5){
      result.push({index:result.length,startBeat:roundBeat(beat),durationBeat:roundBeat(changes[next].beat-beat),meter:meter.slice(),pickup:true});
      beat=changes[next].beat;continue;
    }
    result.push({index:result.length,startBeat:roundBeat(beat),durationBeat:roundBeat(dur),meter:meter.slice()});
    beat=roundBeat(beat+dur);
  }
  return result;
}
function normalizeScore(raw){
  const score=raw&&typeof raw==="object"?raw:{};
  const meter=Array.isArray(score.meter)&&score.meter.length===2?[Number(score.meter[0])||4,Number(score.meter[1])||4]:[4,4];
  const keyFifths=clamp(Math.round(Number(score.keyFifths)||0),-7,7);
  const normalizeEvent=(event,index,kind)=>{
    const midi=clamp(Math.round(Number(event.midi)||60),0,127);
    const startBeat=Math.max(0,Number(event.startBeat)||0);
    const durationBeat=Math.max(.03125,Number(event.durationBeat)||1);
    const velocity=clamp(Math.round(Number(event.velocity)||72),1,127);
    return{
      id:String(event.id||kind+"-"+index),
      sourceEventId:String(event.sourceEventId||event.id||kind+"-"+index),
      midi,
      note:String(event.note||midiToSpelledName(midi,keyFifths)),
      noteName:String(event.noteName||event.note||midiToSpelledName(midi,keyFifths)),
      startBeat:roundBeat(startBeat),
      durationBeat:roundBeat(durationBeat),
      performanceStartBeat:Number.isFinite(Number(event.performanceStartBeat))?roundBeat(Number(event.performanceStartBeat)):undefined,
      performanceDurationBeat:Number.isFinite(Number(event.performanceDurationBeat))?roundBeat(Number(event.performanceDurationBeat)):undefined,
      velocity,
      dynamic:event.dynamic||dynamicFromVelocity(velocity),
      clef:event.clef||(midi<60?"bass":"treble"),
      track:Number(event.track)||0,
      channel:Number(event.channel)||0,
      articulations:Array.isArray(event.articulations)?event.articulations.slice(0,8):[],
      ornament:event.ornament&&["mordent","appoggiatura","trill"].includes(event.ornament.type)
       ?{type:event.ornament.type,neighbor:Number(event.ornament.neighbor)||1}:null,
      accidental:Object.prototype.hasOwnProperty.call(event,"accidental")?event.accidental:undefined,
      voiceDirection:["up","down"].includes(event.voiceDirection)?event.voiceDirection:null,
      tieStart:Boolean(event.tieStart),
      tieStop:Boolean(event.tieStop),
      pedal:Boolean(event.pedal),
      pedalAction:['start','change'].includes(event.pedalAction)?event.pedalAction:null
    };
  };
  const events=(Array.isArray(score.events)?score.events:[]).map((e,i)=>normalizeEvent(e,i,"ev")).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
  const rests=(Array.isArray(score.rests)?score.rests:[]).map((r,i)=>({
      id:String(r.id||"rest-"+i), sourceEventId:String(r.sourceEventId||r.id||"rest-"+i),
      startBeat:roundBeat(Math.max(0,Number(r.startBeat)||0)),
      durationBeat:roundBeat(Math.max(.03125,Number(r.durationBeat)||1)),
      voice:Number(r.voice)||1, track:Number(r.track)||0,
      clef:r.clef==='bass'?'bass':'treble',
      dotted:Boolean(r.dotted), type:String(r.type||durationKind(r.durationBeat).name)
    })).sort((a,b)=>a.startBeat-b.startBeat);
  const perf=(Array.isArray(score.performanceEvents)?score.performanceEvents:[]).map((e,i)=>normalizeEvent(e,i,"perf")).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
  const percussion=(Array.isArray(score.percussionEvents)?score.percussionEvents:[]).map((e,i)=>normalizeEvent(e,i,"drum")).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
  const tempoBpm=clamp(Number(score.tempoBpm)||120,20,300);
  const beatsPerMeasure=meter[0]*(4/meter[1]);
  const endBeat=Math.max(events.reduce((max,e)=>Math.max(max,e.startBeat+e.durationBeat),0),rests.reduce((max,r)=>Math.max(max,r.startBeat+r.durationBeat),0));
  return{
    title:String(score.title||"Partitura").slice(0,160),
    source:String(score.source||"structured"),
    tempoBpm,
    pulseUnit:score.pulseUnit==="dotted-quarter"?"dotted-quarter":"quarter",
    tempoMap:Array.isArray(score.tempoMap)?score.tempoMap.map(x=>({beat:roundBeat(Number(x.beat)||0),bpm:clamp(Number(x.bpm)||tempoBpm,20,300)})):[],
    meter,
    meterMap:Array.isArray(score.meterMap)?score.meterMap.map(x=>({beat:roundBeat(Number(x.beat)||0),meter:Array.isArray(x.meter)?x.meter.slice(0,2):meter})):[],
    keyFifths,
    keyMinor:Boolean(score.keyMinor),
    keyName:score.keyName||keyName(keyFifths,score.keyMinor),
    keyMap:Array.isArray(score.keyMap)?score.keyMap.map(x=>({beat:roundBeat(Number(x.beat)||0),fifths:clamp(Math.round(Number(x.fifths)||0),-7,7),minor:Boolean(x.minor)})):[],
    staffLayout:Array.isArray(score.staffLayout)?score.staffLayout.slice(0,5).filter(x=>x&&/^(RH2?|LH2?)$/.test(x.id)&&["treble","bass","alto","tenor"].includes(x.clef)).map(x=>({id:x.id,clef:x.clef,label:String(x.label||"").slice(0,24),fifths:Number.isInteger(x.fifths)&&Math.abs(x.fifths)<=7?x.fifths:null})):[],
    clefMap:Array.isArray(score.clefMap)?score.clefMap.filter(x=>Number.isFinite(Number(x.beat))&&/^(RH2?|LH2?)$/.test(x.staff)&&["treble","bass","alto","tenor"].includes(x.clef)).map(x=>({beat:roundBeat(Number(x.beat)),staff:x.staff,clef:x.clef})):[],
    octaveMarks:Array.isArray(score.octaveMarks)?score.octaveMarks.filter(x=>Number.isInteger(x.bar)&&Number.isInteger(x.count)&&x.count>=1&&[12,24,-12,-24].includes(x.shift)&&/^(RH2?|LH2?)$/.test(x.staff)).map(x=>({bar:x.bar,count:x.count,shift:x.shift,staff:x.staff})):[],
    notationLegend:Array.isArray(score.notationLegend)?score.notationLegend.slice(0,3).map(x=>String(x).slice(0,140)):[],
    ppq:Number(score.ppq)||480,
    events,
    rests,
    performanceEvents:perf.length?perf:events,
    percussionEvents:percussion,
    transcription:score.transcription&&typeof score.transcription==="object"?Object.assign({},score.transcription):null,
    beatsPerMeasure,
    durationBeats:endBeat,
    measures:measureTimeline(meter,score.meterMap,endBeat).length
  };
}
function groupEvents(score){
  const normalized=score&&score.events?score:normalizeScore(score);
  const groups=[];
  normalized.events.forEach(event=>{
    let group=groups[groups.length-1];
    if(!group||Math.abs(group.startBeat-event.startBeat)>.02){
      group={index:groups.length,startBeat:event.startBeat,events:[],pitches:[]};
      groups.push(group);
    }
    group.events.push(event);
    if(!group.pitches.includes(event.midi))group.pitches.push(event.midi);
  });
  groups.forEach(group=>{
    group.pitches.sort((a,b)=>a-b);
    group.durationBeat=Math.max.apply(null,group.events.map(e=>e.durationBeat));
    group.dynamic=group.events[0]?group.events[0].dynamic:"mf";
  });
  return groups;
}

function readU32(view,pos){return view.getUint32(pos,false)}
function readU16(view,pos){return view.getUint16(pos,false)}
function readVar(bytes,state,end){
  let value=0,count=0;
  while(state.pos<end&&count<4){
    const b=bytes[state.pos++];
    value=(value<<7)|(b&127);
    count++;
    if(!(b&128))return value;
  }
  throw new Error("midi_varlen_invalid");
}
function bytesText(bytes,start,len){
  try{return new TextDecoder("utf-8",{fatal:false}).decode(bytes.slice(start,start+len)).replace(/\0/g,"").trim()}catch{return""}
}
function parseMIDI(arrayBuffer){
  const view=new DataView(arrayBuffer),bytes=new Uint8Array(arrayBuffer);
  if(bytes.length<14||bytesText(bytes,0,4)!=="MThd")throw new Error("midi_header_invalid");
  const headerLength=readU32(view,4);
  const format=readU16(view,8),tracksCount=readU16(view,10),division=readU16(view,12);
  if(format>1)throw new Error("midi_format_unsupported");
  if(division&0x8000)throw new Error("midi_smpte_unsupported");
  let pos=8+headerLength;
  const rawEvents=[],percussionEvents=[],tempos=[],meters=[],keys=[],trackNames=[],programs=[];
  for(let track=0;track<tracksCount;track++){
    if(pos+8>bytes.length||bytesText(bytes,pos,4)!=="MTrk")throw new Error("midi_track_invalid");
    const len=readU32(view,pos+4),end=Math.min(bytes.length,pos+8+len);
    const state={pos:pos+8};
    let tick=0,running=0;
    const active=new Map(),sustained=new Map(),pedalDown=new Map();
    function closeNote(channel,note,releaseTick,pedaled){
      const key=channel+":"+note,stack=active.get(key);
      if(!stack||!stack.length)return;
      const on=stack.shift();
      const target=channel===9?percussionEvents:rawEvents;
      target.push({
        id:"midi-"+track+"-"+(channel===9?"drum-":"")+target.length,
        midi:note,
        startBeat:on.tick/division,
        durationBeat:Math.max(.03125,(releaseTick-on.tick)/division),
        velocity:on.velocity,
        track,
        channel,
        pedal:Boolean(pedaled)
      });
      if(!stack.length)active.delete(key);
    }
    function releaseSustain(channel,releaseTick){
      const pending=sustained.get(channel)||[];
      pending.forEach(item=>closeNote(channel,item.note,releaseTick,true));
      sustained.set(channel,[]);
    }
    while(state.pos<end){
      tick+=readVar(bytes,state,end);
      let status=bytes[state.pos];
      if(status<0x80){
        if(!running)throw new Error("midi_running_status_invalid");
        status=running;
      }else{
        state.pos++;
        if(status<0xF0)running=status;
      }
      if(status===0xFF){
        if(state.pos>=end)break;
        const type=bytes[state.pos++],metaLen=readVar(bytes,state,end),metaStart=state.pos;
        if(metaStart+metaLen>end)break;
        if(type===0x51&&metaLen===3){
          const us=(bytes[metaStart]<<16)|(bytes[metaStart+1]<<8)|bytes[metaStart+2];
          if(us>0)tempos.push({tick,us});
        }else if(type===0x58&&metaLen>=2){
          meters.push({tick,num:bytes[metaStart]||4,den:Math.pow(2,bytes[metaStart+1]||2)});
        }else if(type===0x59&&metaLen>=2){
          const signed=bytes[metaStart]>127?bytes[metaStart]-256:bytes[metaStart];
          keys.push({tick,fifths:clamp(signed,-7,7),minor:bytes[metaStart+1]===1});
        }else if(type===0x03){
          const title=bytesText(bytes,metaStart,metaLen);
          if(title)trackNames.push({track,title});
        }
        state.pos+=metaLen;continue;
      }
      if(status===0xF0||status===0xF7){
        const syxLen=readVar(bytes,state,end);state.pos=Math.min(end,state.pos+syxLen);running=0;continue;
      }
      const hi=status&0xF0,channel=status&15,one=hi===0xC0||hi===0xD0;
      if(state.pos>=end)break;
      const a=bytes[state.pos++],b=one?0:(state.pos<end?bytes[state.pos++]:0);
      if(hi===0xC0){
        programs.push({tick,track,channel,program:a});continue;
      }
      if(hi===0xB0&&a===64){
        const was=Boolean(pedalDown.get(channel)),now=b>=64;
        pedalDown.set(channel,now);
        if(was&&!now)releaseSustain(channel,tick);
        continue;
      }
      if(hi===0x90&&b>0){
        const key=channel+":"+a,stack=active.get(key)||[];
        stack.push({tick,velocity:b});active.set(key,stack);
      }else if(hi===0x80||(hi===0x90&&b===0)){
        if(pedalDown.get(channel)){
          const pending=sustained.get(channel)||[];
          pending.push({note:a});sustained.set(channel,pending);
        }else closeNote(channel,a,tick,false);
      }
    }
    for(const [channel,pending] of sustained.entries()){
      pending.forEach(item=>closeNote(channel,item.note,tick,true));
    }
    for(const [key,stack] of active.entries()){
      const [channel,note]=key.split(":").map(Number);
      while(stack.length)closeNote(channel,note,tick,false);
    }
    pos=end;
  }
  if(!rawEvents.length)throw new Error("midi_no_notes");
  tempos.sort((a,b)=>a.tick-b.tick);meters.sort((a,b)=>a.tick-b.tick);keys.sort((a,b)=>a.tick-b.tick);
  const firstTempo=tempos[0]||{tick:0,us:500000},firstMeter=meters[0]||{tick:0,num:4,den:4},firstKey=keys[0]||{tick:0,fifths:0,minor:false};
  const tempoMap=tempos.map(t=>({beat:t.tick/division,bpm:60000000/t.us}));
  const meterMap=meters.map(m=>({beat:m.tick/division,meter:[m.num,m.den]}));
  const keyMap=keys.map(k=>({beat:k.tick/division,fifths:k.fifths,minor:k.minor}));
  const transcription=transcribePerformance(rawEvents,{meter:[firstMeter.num,firstMeter.den],keyFifths:firstKey.fifths});
  return normalizeScore({
    title:(trackNames.find(x=>x.title)||{}).title||"Partitura MIDI",
    source:"midi",
    tempoBpm:60000000/firstTempo.us,
    tempoMap,
    meter:[firstMeter.num,firstMeter.den],
    meterMap,
    keyFifths:firstKey.fifths,
    keyMinor:firstKey.minor,
    keyMap,
    ppq:division,
    events:transcription.events,
    performanceEvents:rawEvents,
    percussionEvents,
    transcription:{
      mode:"automatic-midi",
      gridBeat:transcription.gridBeat,
      confidence:transcription.confidence,
      meanQuantizationError:transcription.meanQuantizationError,
      notesPreserved:rawEvents.length,
      programs,trackNames
    }
  });
}

function childElements(node){return Array.from(node&&node.children?node.children:[])}
function textNum(node,selector,fallback){
  const el=node&&node.querySelector?node.querySelector(selector):null;
  const n=el?Number(el.textContent):NaN;
  return Number.isFinite(n)?n:fallback;
}
function readZipU16(view,pos){return view.getUint16(pos,true)}
function readZipU32(view,pos){return view.getUint32(pos,true)}
function zipBytesToText(bytes){
  try{return new TextDecoder("utf-8",{fatal:false}).decode(bytes)}catch{return new TextDecoder().decode(bytes)}
}
async function inflateZipEntry(bytes,method){
  if(method===0)return bytes;
  if(method===8){
    if(typeof DecompressionStream==="undefined")throw new Error("mxl_deflate_unsupported");
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  throw new Error("mxl_compression_unsupported");
}
function findZipEnd(view){
  const start=Math.max(0,view.byteLength-65557);
  for(let p=view.byteLength-22;p>=start;p--){
    if(readZipU32(view,p)===0x06054b50)return p;
  }
  return -1;
}
async function readZipEntries(arrayBuffer){
  const view=new DataView(arrayBuffer),bytes=new Uint8Array(arrayBuffer),eocd=findZipEnd(view);
  if(eocd<0)throw new Error("mxl_zip_invalid");
  const count=readZipU16(view,eocd+10),centralSize=readZipU32(view,eocd+12),centralOffset=readZipU32(view,eocd+16);
  if(centralOffset+centralSize>bytes.length)throw new Error("mxl_zip_invalid");
  const entries=new Map(),decoder=new TextDecoder("utf-8");
  let pos=centralOffset;
  for(let i=0;i<count;i++){
    if(pos+46>bytes.length||readZipU32(view,pos)!==0x02014b50)throw new Error("mxl_zip_directory_invalid");
    const flags=readZipU16(view,pos+8),method=readZipU16(view,pos+10),compressedSize=readZipU32(view,pos+20),nameLen=readZipU16(view,pos+28),extraLen=readZipU16(view,pos+30),commentLen=readZipU16(view,pos+32),localOffset=readZipU32(view,pos+42);
    if(flags&0x1)throw new Error("mxl_encrypted_unsupported");
    const name=decoder.decode(bytes.slice(pos+46,pos+46+nameLen));
    if(localOffset+30>bytes.length||readZipU32(view,localOffset)!==0x04034b50)throw new Error("mxl_zip_local_invalid");
    const localNameLen=readZipU16(view,localOffset+26),localExtraLen=readZipU16(view,localOffset+28);
    const dataStart=localOffset+30+localNameLen+localExtraLen,dataEnd=dataStart+compressedSize;
    if(dataEnd>bytes.length)throw new Error("mxl_zip_invalid");
    entries.set(name,await inflateZipEntry(bytes.slice(dataStart,dataEnd),method));
    pos+=46+nameLen+extraLen+commentLen;
  }
  return entries;
}
async function parseMXL(arrayBuffer){
  const entries=await readZipEntries(arrayBuffer);
  const containerBytes=entries.get("META-INF/container.xml")||entries.get("meta-inf/container.xml");
  if(!containerBytes)throw new Error("mxl_container_missing");
  const container=new DOMParser().parseFromString(zipBytesToText(containerBytes),"application/xml");
  if(container.querySelector("parsererror"))throw new Error("mxl_container_invalid");
  const rootfile=container.querySelector("rootfile[full-path]")||container.querySelector("rootfile");
  const fullPath=rootfile?.getAttribute("full-path");
  if(!fullPath)throw new Error("mxl_rootfile_missing");
  const xmlBytes=entries.get(fullPath);
  if(!xmlBytes)throw new Error("mxl_rootfile_missing");
  const parsed=parseMusicXML(zipBytesToText(xmlBytes));
  parsed.source="mxl";
  parsed.title=parsed.title==="Partitura MusicXML"?"Partitura MXL":parsed.title;
  parsed.containerRootFile=fullPath;
  return parsed;
}

function parseMusicXML(xmlText){
  const doc=new DOMParser().parseFromString(String(xmlText||""),"application/xml");
  if(doc.querySelector("parsererror"))throw new Error("musicxml_invalid");
  const root=doc.documentElement;
  if(!root||!/score-partwise|score-timewise/.test(root.localName||root.nodeName))throw new Error("musicxml_root_unsupported");
  if((root.localName||root.nodeName)==="score-timewise")throw new Error("musicxml_timewise_unsupported");
  const title=(doc.querySelector("work-title")||doc.querySelector("movement-title"));
  const parts=Array.from(doc.querySelectorAll(":scope > part, score-partwise > part"));
  const events=[];
  const rests=[];
  let globalMeter=[4,4],globalFifths=0,globalMinor=false,tempoBpm=120;
  parts.forEach((part,partIndex)=>{
    let divisions=1,cursor=0,lastStart=0,currentDynamic="mf";
    childElements(part).filter(el=>(el.localName||el.nodeName)==="measure").forEach(measure=>{
      childElements(measure).forEach(node=>{
        const tag=node.localName||node.nodeName;
        if(tag==="attributes"){
          divisions=textNum(node,"divisions",divisions)||divisions;
          const beats=textNum(node,"time > beats",globalMeter[0]);
          const beatType=textNum(node,"time > beat-type",globalMeter[1]);
          if(beats&&beatType)globalMeter=[beats,beatType];
          const fifths=textNum(node,"key > fifths",globalFifths);
          globalFifths=clamp(Math.round(fifths||0),-7,7);
          const mode=(node.querySelector("key > mode")||{}).textContent;
          if(mode)globalMinor=String(mode).trim().toLowerCase()==="minor";
        }else if(tag==="direction"){
          const sound=node.querySelector("sound[tempo]");
          if(sound){
            const t=Number(sound.getAttribute("tempo"));if(Number.isFinite(t)&&t>0)tempoBpm=t;
          }
          const dyn=node.querySelector("direction-type dynamics");
          if(dyn&&dyn.firstElementChild)currentDynamic=(dyn.firstElementChild.localName||dyn.firstElementChild.nodeName||"mf").toLowerCase();
        }else if(tag==="backup"){
          cursor=Math.max(0,cursor-textNum(node,"duration",0)/divisions);
        }else if(tag==="forward"){
          cursor+=textNum(node,"duration",0)/divisions;
        }else if(tag==="note"){
          const dur=Math.max(.0625,textNum(node,"duration",divisions)/divisions);
          const chord=Boolean(node.querySelector("chord"));
          const restNode=node.querySelector("rest");
          const rest=Boolean(restNode);
          const start=chord?lastStart:cursor;
          if(rest){
            const restType=String(restNode?.getAttribute("type")||"").toLowerCase();
            const dotted=Boolean(node.querySelector("dot"));
            rests.push({id:"rest-"+partIndex+"-"+rests.length,startBeat:start,durationBeat:dur,track:partIndex,voice:Number(node.querySelector("voice")?.textContent)||1,dotted,type:restType||durationKind(dur).name});
          }else{
            const stepEl=node.querySelector("pitch > step"),octEl=node.querySelector("pitch > octave");
            if(stepEl&&octEl){
              const stepName=String(stepEl.textContent||"C").trim().toUpperCase();
              const alter=textNum(node,"pitch > alter",0);
              const octave=Number(octEl.textContent);
              const midi=(octave+1)*12+(BASE[stepName]||0)+alter;
              const articulations=Array.from(node.querySelectorAll("notations > articulations > *")).map(el=>(el.localName||el.nodeName)).filter(Boolean);
              const tieStart=Boolean(node.querySelector('tie[type="start"], tied[type="start"]'));
              const tieStop=Boolean(node.querySelector('tie[type="stop"], tied[type="stop"]'));
              events.push({
                id:"xml-"+partIndex+"-"+events.length,
                midi,
                noteName:(stepName+(alter>0?"♯".repeat(alter):alter<0?"♭".repeat(Math.abs(alter)):""))+octave,
                startBeat:start,
                durationBeat:dur,
                velocity:velocityFromDynamic(currentDynamic),
                dynamic:currentDynamic,
                track:partIndex,
                channel:partIndex,
                articulations,
                tieStart,
                tieStop
              });
            }
          }
          if(!chord){lastStart=cursor;cursor+=dur}
        }
      });
    });
  });
  if(!events.length)throw new Error("musicxml_no_notes");
  return normalizeScore({
    title:title?String(title.textContent||"Partitura").trim():"Partitura MusicXML",
    source:"musicxml",
    tempoBpm,
    meter:globalMeter,
    keyFifths:globalFifths,
    keyMinor:globalMinor,
    events,
    rests
  });
}


function tempoMapFor(rawScore){
  const score=rawScore&&rawScore.events?normalizeScore(rawScore):normalizeScore(rawScore);
  const map=(Array.isArray(score.tempoMap)?score.tempoMap:[])
    .filter(x=>Number.isFinite(Number(x.beat))&&Number.isFinite(Number(x.bpm))&&Number(x.bpm)>0)
    .map(x=>({beat:Math.max(0,Number(x.beat)),bpm:clamp(Number(x.bpm),20,300)}))
    .sort((a,b)=>a.beat-b.beat);
  if(!map.length||map[0].beat>0)map.unshift({beat:0,bpm:score.tempoBpm});
  else if(map[0].beat===0)map[0].bpm=map[0].bpm||score.tempoBpm;
  return{score,map};
}
function beatToMs(rawScore,beat,tempoOverride){
  const {score,map}=tempoMapFor(rawScore);
  const target=Math.max(0,Number(beat)||0);
  const ratio=Number.isFinite(Number(tempoOverride))&&Number(tempoOverride)>0
    ? Number(tempoOverride)/Math.max(1,score.tempoBpm)
    : 1;
  let cursor=0,ms=0,activeBpm=(map[0]?.bpm||score.tempoBpm)*ratio;
  for(let i=0;i<map.length;i++){
    const change=map[i];
    if(change.beat<=cursor){activeBpm=change.bpm*ratio;continue}
    if(change.beat>=target)break;
    ms+=(change.beat-cursor)*(60000/activeBpm);
    cursor=change.beat;
    activeBpm=change.bpm*ratio;
  }
  if(target>cursor)ms+=(target-cursor)*(60000/activeBpm);
  return ms;
}
function durationToMs(score,startBeat,durationBeat,tempoOverride){
  const start=Math.max(0,Number(startBeat)||0);
  const end=start+Math.max(0,Number(durationBeat)||0);
  return Math.max(0,beatToMs(score,end,tempoOverride)-beatToMs(score,start,tempoOverride));
}
function auditScore(rawScore){
  const score=normalizeScore(rawScore);
  const notation=score.events||[];
  const perf=performanceEvents(score)||[];
  const warnings=[],issues=[];
  let points=100;
  if(!notation.length){issues.push("A partitura não contém eventos notados.");points=0}
  if(!perf.length){issues.push("A camada de performance está vazia.");points=0}
  const invalidNotation=notation.filter(e=>!Number.isFinite(e.midi)||e.midi<0||e.midi>127||!Number.isFinite(e.startBeat)||e.startBeat<0||!Number.isFinite(e.durationBeat)||e.durationBeat<=0);
  if(invalidNotation.length){issues.push(invalidNotation.length+" evento(s) notado(s) inválido(s).");points-=40}
  const perfIds=new Set(perf.map(e=>String(e.sourceEventId||e.id||"")));
  const represented=new Map();
  notation.forEach(e=>{
    const id=String(e.sourceEventId||e.id||"");
    if(!represented.has(id))represented.set(id,new Set());
    represented.get(id).add(Number(e.midi));
  });
  let lost=0,pitchMismatch=0;
  perf.forEach(e=>{
    const id=String(e.sourceEventId||e.id||"");
    if(!represented.has(id)){lost++;return}
    if(!represented.get(id).has(Number(e.midi)))pitchMismatch++;
  });
  const notePreservation=perf.length?Math.max(0,1-lost/perf.length):0;
  if(lost){issues.push(lost+" evento(s) MIDI não chegaram à camada de notação.");points-=Math.min(50,lost/perf.length*100)}
  if(pitchMismatch){issues.push(pitchMismatch+" evento(s) mudaram de altura entre performance e notação.");points-=Math.min(40,pitchMismatch/perf.length*100)}
  const transcription=score.transcription||{};
  const quantConfidence=Number.isFinite(Number(transcription.confidence))?clamp(Number(transcription.confidence),0,1):score.source==="midi"?0:1;
  if(score.source==="midi"&&!score.transcription){warnings.push("Este MIDI não contém relatório de transcrição automática.");points-=12}
  if(score.source==="midi"&&quantConfidence<.72){warnings.push("A execução tem timing muito livre; revê visualmente os valores rítmicos.");points-=18}
  else if(score.source==="midi"&&quantConfidence<.88){warnings.push("Há pequenas ambiguidades rítmicas; o preview deve ser revisto.");points-=8}
  if(Number(transcription.gridBeat)>0&&Number(transcription.gridBeat)<.125){warnings.push("Foi necessária uma subdivisão rítmica muito fina.");points-=5}
  const tempoChanges=(score.tempoMap||[]).filter((x,i,a)=>i===0||Math.abs(Number(x.bpm)-Number(a[i-1]?.bpm))>.01).length;
  if(tempoChanges>1)warnings.push("O MIDI contém mudanças de andamento; o playback preserva-as, mas confirma as marcações visuais.");
  const meterChanges=(score.meterMap||[]).length>1;
  if(meterChanges){warnings.push("Há mudanças de compasso. O motor preserva os dados, mas a paginação atual deve ser confirmada no preview.");points-=10}
  const keyChanges=(score.keyMap||[]).length>1;
  if(keyChanges){warnings.push("Há mudanças de tonalidade. Confirma acidentes e assinaturas no preview.");points-=8}
  const groups=groupEvents(score);
  const maxChord=groups.reduce((m,g)=>Math.max(m,g.pitches.length),0);
  if(maxChord>8)warnings.push("Foram encontrados acordes muito densos ("+maxChord+" notas simultâneas).");
  const outOfPiano=perf.filter(e=>e.midi<21||e.midi>108).length;
  if(outOfPiano){warnings.push(outOfPiano+" nota(s) estão fora da extensão de um piano de 88 teclas.");points-=Math.min(8,outOfPiano)}
  const maxBeat=notation.reduce((m,e)=>Math.max(m,e.startBeat+e.durationBeat),0);
  if(maxBeat>4000){warnings.push("Partitura muito longa; a renderização pode ficar pesada em dispositivos modestos.");points-=4}
  points=Math.max(0,Math.min(100,Math.round(points)));
  const blocked=issues.length>0||notePreservation<.999||pitchMismatch>0;
  const rating=blocked?"blocked":points>=90?"high":points>=75?"review":"low";
  return{
    rating,
    score:points,
    blocked,
    canPublishGlobal:!blocked&&points>=80,
    notePreservation:Number(notePreservation.toFixed(4)),
    quantizationConfidence:Number(quantConfidence.toFixed(4)),
    meanQuantizationError:Number(Number(transcription.meanQuantizationError||0).toFixed(4)),
    notationEvents:notation.length,
    performanceEvents:perf.length,
    groups:groups.length,
    maxChord,
    tempoChanges,
    meterChanges,
    keyChanges,
    warnings,
    issues,
    checkedAt:new Date().toISOString()
  };
}

function playNote(midi,durationBeat,beatMs,velocity){
  try{
    const bridge=window.LuwipiAudioBridge;
    if(bridge&&typeof bridge.play==="function")return bridge.play(typeof midi==="number"?midiToName(midi):midi,durationBeat,beatMs,velocity);
    return false;
  }catch(e){return false}
}
function svgEl(name,attrs){
  const el=document.createElementNS("http://www.w3.org/2000/svg",name);
  Object.entries(attrs||{}).forEach(([key,value])=>{
    if(value!==null&&value!==undefined)el.setAttribute(key,String(value));
  });
  return el;
}
function addLine(svg,x1,y1,x2,y2,attrs){
  const line=svgEl("line",Object.assign({x1,y1,x2,y2},attrs||{}));svg.appendChild(line);return line;
}
function addText(svg,x,y,text,attrs){
  const el=svgEl("text",Object.assign({x,y},attrs||{}));el.textContent=text;svg.appendChild(el);return el;
}
function drawStaff(svg,left,right,top){
  for(let i=0;i<5;i++)addLine(svg,left,top+i*12,right,top+i*12,{stroke:"#777c85","stroke-width":1.4});
}
function drawLedger(svg,x,bottom,step){
  if(step<=-2)for(let s=-2;s>=step;s-=2){const y=bottom-s*6;addLine(svg,x-15,y,x+15,y,{stroke:"#555a63","stroke-width":1.6})}
  if(step>=10)for(let s=10;s<=step;s+=2){const y=bottom-s*6;addLine(svg,x-15,y,x+15,y,{stroke:"#555a63","stroke-width":1.6})}
}
function accidentalForEvent(event){
  if(event.accidental!==undefined){
    const symbols={sharp:"♯",flat:"♭",natural:"♮","double-sharp":"𝄪","double-flat":"𝄫"};
    return symbols[event.accidental]||"";
  }
  const name=String(event.note||midiToName(event.midi));
  return name.includes("#")?"♯":name.includes("b")?"♭":"";
}
function drawKeySignature(svg,fifths,clef,x,top){
  fifths=clamp(Number(fifths)||0,-7,7);
  if(!fifths)return 0;
  const sharpsTreble=[0,3,-1,2,5,1,4],flatsTreble=[4,1,5,2,6,3,7];
  const sharpsBass=[2,5,1,4,0,3,-1],flatsBass=[6,3,7,4,8,5,9];
  const offsets=fifths>0?(clef==="bass"?sharpsBass:sharpsTreble):(clef==="bass"?flatsBass:flatsTreble);
  const symbol=fifths>0?"♯":"♭",count=Math.abs(fifths);
  for(let i=0;i<count;i++){
    addText(svg,x+i*14,top+48-offsets[i]*6,symbol,{"font-size":22,fill:"#34373d","font-family":"serif"});
  }
  return count*14;
}
function ptSolfege(midi){
  const names=["Dó","Dó♯","Ré","Ré♯","Mi","Fá","Fá♯","Sol","Sol♯","Lá","Lá♯","Si"];
  const n=clamp(Math.round(Number(midi)||60),0,127);
  return names[n%12]+(Math.floor(n/12)-1);
}
function restSymbol(type){
  const t=String(type||"").toLowerCase();
  if(t.includes("whole")||t.includes("semibreve"))return "whole";
  if(t.includes("half")||t.includes("mínima"))return "half";
  if(t.includes("eighth")||t.includes("colcheia"))return "eighth";
  if(t.includes("sixteenth")||t.includes("semicolcheia"))return "sixteenth";
  if(t.includes("thirty-second")||t.includes("fusa"))return "thirty-second";
  return "quarter";
}
function restGlyph(type){
 const t=restSymbol(type);
 return t==="whole"?"𝄻":t==="half"?"𝄼":t==="eighth"?"𝄾":t==="sixteenth"?"𝄿":t==="thirty-second"?"𝅀":"𝄽";
}
function drawRest(svg,rest,x,bottom,current){
 const type=restSymbol(rest.type),ink=current?"#4568ff":"#292d34",y=bottom-18;
 if(current)svg.appendChild(svgEl("ellipse",{cx:x,cy:y-8,rx:25,ry:25,fill:"rgba(69,104,255,.07)",stroke:"rgba(69,104,255,.62)","stroke-width":2.5,class:"live-score-halo"}));
 addText(svg,x,y,restGlyph(type),{"font-size":34,fill:ink,"text-anchor":"middle","font-family":"'Noto Music','Apple Symbols','Segoe UI Symbol',serif"});
 if(rest.dotted)svg.appendChild(svgEl("circle",{cx:x+20,cy:y-7,r:2.4,fill:ink}));
}
function drawNote(svg,event,x,bottom,groupIndex,current){
  const y=staffY(event.midi,event.clef,bottom,event.note),stepValue=staffStep(event.midi,event.clef,event.note),kind=durationKind(event.durationBeat);
  drawLedger(svg,x,bottom,stepValue);
  if(event.ornament){
    if(event.ornament.type==="mordent")
     svg.appendChild(svgEl("path",{d:"M "+(x-14)+" "+(y-24)+" l 7 -8 l 7 8 l 7 -8 l 7 8",
      fill:"none",stroke:"#292d34","stroke-width":2.4,"stroke-linejoin":"miter","stroke-linecap":"square"}));
    if(event.ornament.type==="trill")addText(svg,x-9,y-23,"tr",{"font-size":16,fill:"#292d34","font-family":"serif","font-style":"italic"});
    if(event.ornament.type==="appoggiatura"){
      svg.appendChild(svgEl("ellipse",{cx:x-17,cy:y-22,rx:5,ry:3.4,fill:"#292d34",stroke:"#292d34",
        transform:"rotate(-20 "+(x-17)+" "+(y-22)+")"}));
      addLine(svg,x-13,y-23,x-12,y-43,{stroke:"#292d34","stroke-width":1.6});
    }
  }
  const accidental=accidentalForEvent(event);
  if(accidental)addText(svg,x-23,y+7,accidental,{"font-size":20,fill:"#292d34","font-family":"serif"});
  if(current){
    const halo=svgEl("ellipse",{cx:x,cy:y,rx:24,ry:19,fill:"rgba(69,104,255,.07)",stroke:"rgba(69,104,255,.62)","stroke-width":3,class:"live-score-halo"});
    svg.appendChild(halo);
  }
  const head=svgEl("ellipse",{cx:x,cy:y,rx:10.8,ry:7.1,fill:kind.open?"#fff":"#292d34",stroke:"#292d34","stroke-width":kind.open?2.2:1.1,transform:"rotate(-20 "+x+" "+y+")","data-live-group":groupIndex});
  svg.appendChild(head);
  if(kind.stem){
    const stemUp=event.voiceDirection==="up"?true:event.voiceDirection==="down"?false:stepValue<5;
    const sx=stemUp?x+9.1:x-9.1,stemStart=stemUp?y-1:y+1,sy2=stemUp?y-45:y+45;
    addLine(svg,sx,stemStart,sx,sy2,{stroke:"#292d34","stroke-width":2.45,"stroke-linecap":"round"});
    for(let flag=0;flag<kind.flags;flag++){
      const offset=flag*8;
      if(stemUp){
        const fy=sy2+offset;
        svg.appendChild(svgEl("path",{d:"M "+sx+" "+fy+" C "+(sx+12)+" "+(fy+2)+", "+(sx+20)+" "+(fy+10)+", "+(sx+13)+" "+(fy+21)+" C "+(sx+18)+" "+(fy+13)+", "+(sx+10)+" "+(fy+8)+", "+sx+" "+(fy+7)+" Z",fill:"#292d34"}));
      }else{
        const fy=sy2-offset;
        svg.appendChild(svgEl("path",{d:"M "+sx+" "+fy+" C "+(sx-12)+" "+(fy-2)+", "+(sx-20)+" "+(fy-10)+", "+(sx-13)+" "+(fy-21)+" C "+(sx-18)+" "+(fy-13)+", "+(sx-10)+" "+(fy-8)+", "+sx+" "+(fy-7)+" Z",fill:"#292d34"}));
      }
    }
  }
  if(kind.dots)svg.appendChild(svgEl("circle",{cx:x+18,cy:y-1,r:2.35,fill:"#292d34"}));
  
  if(kind.tuplet)addText(svg,x,y-52,String(kind.tuplet),{"font-size":10,fill:"#555a63","font-weight":800,"text-anchor":"middle"});
  if(event.pedal&&event.clef==="bass")addText(svg,x,y+62,event.pedalAction==='change'?'Ped. ↻':'Ped.',{"font-size":13,fill:"#34373d","text-anchor":"middle","font-family":"serif","font-style":"italic"});
  if(event.articulations.includes("staccato"))svg.appendChild(svgEl("circle",{cx:x,cy:y+(stepValue<5?13:-13),r:2.4,fill:"#292d34"}));
  if(event.articulations.includes("tenuto"))addLine(svg,x-7,y+(stepValue<5?14:-14),x+7,y+(stepValue<5?14:-14),{stroke:"#292d34","stroke-width":2});
  if(event.articulations.includes("accent"))addText(svg,x,y+(stepValue<5?19:-15),">",{"font-size":17,fill:"#292d34","text-anchor":"middle","font-weight":700});
  if(event.tieStart){
    const below=stepValue<5,dy=below?14:-14,curve=below?8:-8;
    svg.appendChild(svgEl("path",{d:"M "+(x-9)+" "+(y+dy)+" C "+(x-2)+" "+(y+dy+curve)+", "+(x+12)+" "+(y+dy+curve)+", "+(x+20)+" "+(y+dy),fill:"none",stroke:"#292d34","stroke-width":1.8,"stroke-linecap":"round"}));
  }
}
function render(svg,rawScore,options){
  if(!svg)throw new Error("score_svg_missing");
  const score=normalizeScore(rawScore),opts=options||{},groups=groupEvents(score),
    currentGroup=Number.isInteger(opts.currentGroupIndex)?opts.currentGroupIndex:-1,
    showNoteNames=opts.showNoteNames===true;
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const measures=measureTimeline(score.meter,score.meterMap,score.durationBeats);
  const defaultStaves=[{id:"RH",clef:"treble"},{id:"LH",clef:"bass"}];
  const staves=score.staffLayout?.length?score.staffLayout:defaultStaves;
  const staffCount=staves.length,
    width=1120,measuresPerSystem=4,systems=Math.max(1,Math.ceil(measures.length/measuresPerSystem));
  const left=105,right=1080,measureWidth=(right-left)/measuresPerSystem;
  const keyAt=(beat,staff)=>{
    if(staff&&staff.fifths!==null&&staff.fifths!==undefined)return staff.fifths;
    let current=score.keyFifths;
    for(const change of score.keyMap||[]){if(change.beat<=beat+1e-5)current=change.fifths;else break}
    return current;
  };
  const clefAt=(staff,beat)=>{
    let current=staff.clef;
    for(const change of score.clefMap||[]){if(change.staff===staff.id&&change.beat<=beat+1e-5)current=change.clef}
    return current;
  };
  function locate(beat){
    let lo=0,hi=measures.length-1;
    while(lo<hi){const mid=Math.floor((lo+hi+1)/2);if(measures[mid].startBeat<=beat+1e-5)lo=mid;else hi=mid-1}
    return measures[lo];
  }
  const clefGlyph={treble:"𝄞",bass:"𝄢",alto:"𝄡",tenor:"𝄡"};
  function staffOf(event){
    const voice=String(event.id||"").split("-")[0];
    if(score.staffLayout?.length){
      const byVoice=staves.findIndex(s=>s.id===voice);
      if(byVoice>=0)return byVoice;
    }
    return event.clef==="bass"?Math.max(0,staves.findIndex(s=>s.clef==="bass")):0;
  }
  // The old fixed 87-unit staff gap/220-unit system hid low and high ledger
  // lines, especially on mobile. Reserve real space from each staff's pitch
  // extremes, stems, ornaments and pedal/dynamic markings, before rendering.
  // The SVG keeps its natural height and the existing Leitura viewport scrolls.
  const bounds=Array.from({length:systems},()=>Array.from({length:staffCount},()=>({min:-28,max:66})));
  const measureAt=beat=>{
    let lo=0,hi=measures.length-1;
    while(lo<hi){const mid=Math.floor((lo+hi+1)/2);
      if(measures[mid].startBeat<=beat+1e-5)lo=mid;else hi=mid-1}
    return measures[lo];
  };
  for(const event of score.events){
    const measure=measureAt(event.startBeat),sys=Math.floor(measure.index/measuresPerSystem),
      index=staffOf(event),staff=staves[index]||staves[0],
      clef=clefAt(staff,event.startBeat),step=staffStep(event.midi,clef,event.note),
      y=48-step*6,kind=durationKind(event.durationBeat),
      stemUp=event.voiceDirection==="up"?true:event.voiceDirection==="down"?false:step<5,
      b=bounds[sys][index];
    // Extra clearance for flags, ties, accidentals and annotations is deliberate:
    // those markings are part of the notation, not decorative overflow.
    const headAbove=y-14,headBelow=y+14;
    b.min=Math.min(b.min,headAbove,kind.stem&&stemUp?y-59:headAbove,
      event.ornament?y-53:headAbove,kind.tuplet?y-65:headAbove,
      event.tieStart&&step>=5?y-30:headAbove);
    b.max=Math.max(b.max,headBelow,kind.stem&&!stemUp?y+67:headBelow,
      event.pedal&&clef==="bass"?y+82:headBelow,
      event.tieStart&&step<5?y+30:headBelow);
    if(event.dynamic&&event.dynamic!==" ")b.max=Math.max(b.max,86);
  }
  const tops=[],bases=[],heights=[];let cursor=50;
  for(let system=0;system<systems;system++){
    bases[system]=cursor;
    const bb=bounds[system],tt=[];
    tt[0]=cursor+25+Math.max(0,-28-bb[0].min);
    for(let i=1;i<staffCount;i++)
      tt[i]=tt[i-1]+Math.max(87,bb[i-1].max-bb[i].min+16);
    tops[system]=tt;
    heights[system]=Math.max(staffCount*87+46,tt[staffCount-1]-cursor+bb[staffCount-1].max+33);
    cursor+=heights[system];
  }
  const height=cursor,topFor=(system,index)=>tops[system][index];
  svg.setAttribute("viewBox","0 0 "+width+" "+height);
  svg.setAttribute("role","img");
  svg.setAttribute("aria-label",score.title+" — partitura");
  svg.appendChild(svgEl("rect",{x:0,y:0,width,height,rx:18,fill:"#fff"}));
  addText(svg,36,29,score.title,{"font-size":17,"font-weight":700,fill:"#17181d"});
  addText(svg,width-36,29,(score.pulseUnit==="dotted-quarter"?"♩. = "+Math.round(score.tempoBpm*2/3):"♩ = "+Math.round(score.tempoBpm))+" · "+score.keyName,{"font-size":11,"font-weight":700,fill:"#777c85","text-anchor":"end"});
  for(let system=0;system<systems;system++){
    const first=measures[system*measuresPerSystem],baseY=bases[system];
    for(let i=0;i<staffCount;i++){
      const staff=staves[i],top=topFor(system,i),clef=clefAt(staff,first.startBeat);
      drawStaff(svg,left,right,top);
      addText(svg,42,top+(clef==="treble"?52:45),clefGlyph[clef]||"C",{"font-size":clef==="treble"?68:56,fill:"#34373d","font-family":"serif"});
      if(staff.label)addText(svg,23,top+75,staff.label,{"font-size":10,fill:"#525867","font-weight":700});
      const ks=drawKeySignature(svg,keyAt(first.startBeat,staff),clef,79,top);
      if(system===0||system>0&&measures[system*4-1]?.meter.join("/")!==first.meter.join("/")){
        const tsx=79+ks+9;
        addText(svg,tsx,top+20,String(first.meter[0]),{"font-size":18,"font-weight":800,fill:"#292d34"});
        addText(svg,tsx,top+43,String(first.meter[1]),{"font-size":18,"font-weight":800,fill:"#292d34"});
      }
    }
    for(let slot=0;slot<=measuresPerSystem;slot++){
      const global=system*measuresPerSystem+slot,x=left+slot*measureWidth;
      if(slot===measuresPerSystem||global<=measures.length)
        addLine(svg,x,topFor(system,0),x,topFor(system,staffCount-1)+48,{stroke:"#5b5f67","stroke-width":slot===0?1.4:1.2});
    }
    for(let slot=0;slot<measuresPerSystem;slot++){
      const measure=measures[system*measuresPerSystem+slot];if(!measure)continue;
      const x=left+slot*measureWidth;
      addText(svg,x+6,baseY+13,String(measure.index+1),{"font-size":9,fill:"#a0a3aa"});
      const tempoChange=(score.tempoMap||[]).find(t=>Math.abs(t.beat-measure.startBeat)<1e-4&&measure.index>0);
      if(tempoChange)addText(svg,x+16,baseY+4,"♩ = "+Math.round(tempoChange.bpm),{"font-size":10,"font-weight":800,fill:"#315d9f"});
      const prev=measures[measure.index-1];
      if(prev&&prev.meter.join("/")!==measure.meter.join("/")){
        staves.forEach((staff,i)=>{
          const top=topFor(system,i);
          addText(svg,x+10,top+20,String(measure.meter[0]),{"font-size":17,"font-weight":800,fill:"#292d34"});
          addText(svg,x+10,top+42,String(measure.meter[1]),{"font-size":17,"font-weight":800,fill:"#292d34"});
        });
      }
      staves.forEach((staff,i)=>{
        const prevKey=prev?keyAt(prev.startBeat,staff):keyAt(0,staff),nowKey=keyAt(measure.startBeat,staff);
        if(!prev||prevKey===nowKey)return;
        const top=topFor(system,i),clef=clefAt(staff,measure.startBeat);
        if(prevKey)addText(svg,x+20,top+44,"♮",{"font-size":21,fill:"#34373d"});
        drawKeySignature(svg,nowKey,clef,x+(prevKey?40:20),top);
      });
      staves.forEach((staff,i)=>{
        const last=prev?clefAt(staff,prev.startBeat):clefAt(staff,0),
          now=clefAt(staff,measure.startBeat);
        if(prev&&last!==now)addText(svg,x+17,topFor(system,i)+44,clefGlyph[now]||"C",{"font-size":37,fill:"#34373d","font-family":"serif"});
      });
      for(const oct of score.octaveMarks||[]){
        if(oct.bar!==measure.index)continue;
        const index=staves.findIndex(s=>s.id===oct.staff);if(index<0)continue;
        const top=topFor(system,index),endSlot=Math.min(measuresPerSystem,slot+oct.count);
        const y=oct.shift>0?top-10:top+62,label=Math.abs(oct.shift)===24?"15":"8";
        addText(svg,x+33,y, label+(oct.shift>0?"ma":"vb"),{"font-size":14,"font-weight":800,fill:"#315d9f"});
        addLine(svg,x+65,y-4,left+endSlot*measureWidth-7,y-4,{stroke:"#315d9f","stroke-width":1.2,"stroke-dasharray":"5 4"});
      }
    }
  }
  const dynamics=new Map();
  for(const rest of score.rests||[]){
    const measure=locate(rest.startBeat),system=Math.floor(measure.index/4),slot=measure.index%4,index=staffOf(rest),
      bottom=topFor(system,index)+48,beatIn=rest.startBeat-measure.startBeat,
      x=left+slot*measureWidth+42+(beatIn/measure.durationBeat)*(measureWidth-50);
    drawRest(svg,rest,x,bottom,false);
  }
  groups.forEach((group,g)=>{
    group.events.forEach((event,eventIndex)=>{
      const measure=locate(event.startBeat),system=Math.floor(measure.index/4),slot=measure.index%4,
        index=staffOf(event),staff=staves[index]||staves[0],
        bottom=topFor(system,index)+48,beatIn=event.startBeat-measure.startBeat,
        x=left+slot*measureWidth+42+(beatIn/measure.durationBeat)*(measureWidth-50),
        clef=clefAt(staff,event.startBeat);
      const visual={...event,clef,showName:showNoteNames,noteName:null};
      drawNote(svg,visual,x,bottom,g,g===currentGroup);
      const voice=score.staffLayout?.length?staff.id:clef;
      const first=!group.events.slice(0,eventIndex).some(other=>
        (score.staffLayout?.length?staves[staffOf(other)]?.id:other.clef)===voice);
      if(first&&event.dynamic&&event.dynamic!==" "&&dynamics.get(voice)!==event.dynamic){
        addText(svg,x,bottom+38,event.dynamic,{"font-size":15,fill:"#353940","font-family":"serif","font-style":"italic","font-weight":700,"text-anchor":"middle"});
        dynamics.set(voice,event.dynamic);
      }
    });
  });
  if(score.notationLegend?.length){
    // The legend is textual and noninteractive: unfamiliar contemporary symbols
    // are never guessed by the learner.
    score.notationLegend.forEach((legend,index)=>addText(svg,36,height-9-index*12,legend,{"font-size":9,fill:"#51627d"}));
  }
  return{score,groups,width,height,measureTimeline:measures,staves};
}
function parseABC(text){
  const raw=String(text||"").replace(/\r/g,"");
  if(!raw.trim())throw new Error("abc_empty");
  const lines=raw.split("\n"),headers={},body=[];
  let inBody=false;
  lines.forEach(line=>{
    const clean=line.replace(/%.*/,"").trim();if(!clean)return;
    const m=/^([A-Za-z]):\s*(.*)$/.exec(clean);
    if(m&&!inBody){headers[m[1].toUpperCase()]=m[2].trim();if(m[1].toUpperCase()==="K")inBody=true;return}
    if(inBody)body.push(clean);
  });
  const meterMatch=/^(\d+)\s*\/\s*(\d+)$/.exec(headers.M||"4/4"),meter=meterMatch?[Number(meterMatch[1]),Number(meterMatch[2])]:[4,4];
  const lengthMatch=/^(\d+)\s*\/\s*(\d+)$/.exec(headers.L||"1/8");
  const unitBeats=lengthMatch?(Number(lengthMatch[1])/Number(lengthMatch[2]))*4:.5;
  const tempoText=String(headers.Q||"120"),tempoEq=/=\s*(\d+(?:\.\d+)?)/.exec(tempoText),tempoTail=/(\d+(?:\.\d+)?)\s*$/.exec(tempoText),tempoBpm=clamp(Number((tempoEq&&tempoEq[1])||(tempoTail&&tempoTail[1])||120),20,300);
  const keyText=String(headers.K||"C").replace(/\s.*$/,"").replace(/maj(?:or)?$/i,"").trim();
  const keyMap={C:0,G:1,D:2,A:3,E:4,B:5,"F#":6,"C#":7,F:-1,Bb:-2,Eb:-3,Ab:-4,Db:-5,Gb:-6,Cb:-7,
    Am:0,Em:1,Bm:2,"F#m":3,"C#m":4,"G#m":5,"D#m":6,"A#m":7,Dm:-1,Gm:-2,Cm:-3,Fm:-4,Bbm:-5,Ebm:-6,Abm:-7};
  let keyFifths=Object.prototype.hasOwnProperty.call(keyMap,keyText)?keyMap[keyText]:0;
  const sharpOrder=["F","C","G","D","A","E","B"],flatOrder=["B","E","A","D","G","C","F"],keyAcc={};
  if(keyFifths>0)sharpOrder.slice(0,keyFifths).forEach(n=>keyAcc[n]=1);
  if(keyFifths<0)flatOrder.slice(0,-keyFifths).forEach(n=>keyAcc[n]=-1);
  const pcs={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  function duration(mult,div){
    let factor=mult?Number(mult):1;
    if(div!==undefined){factor/=div===""?2:Number(div||2)}
    return Math.max(.03125,unitBeats*factor);
  }
  // A written accidental persists for this pitch and octave until the next bar.
  const measureAcc=new Map();
  function pitch(token){
    const m=/^([\^_=]*)([A-Ga-g])([,']*)$/.exec(token);if(!m)return null;
    const letter=m[2].toUpperCase();let octave=m[2]===m[2].toLowerCase()?5:4;
    for(const c of m[3])octave+=c==="'"?1:-1;
    const key=letter+octave,marks=m[1];
    let shift=measureAcc.has(key)?measureAcc.get(key):(keyAcc[letter]||0),accidental=null;
    if(marks){
      if(marks.includes("=")){shift=0;accidental="natural";}
      else if(marks.includes("^")){shift=(marks.match(/\^/g)||[]).length;accidental=shift>1?"double-sharp":"sharp";}
      else if(marks.includes("_")){shift=-(marks.match(/_/g)||[]).length;accidental=shift<(-1)?"double-flat":"flat";}
      measureAcc.set(key,shift);
    }
    return{midi:clamp((octave+1)*12+pcs[letter]+shift,0,127),
      note:letter+(shift>0?"#".repeat(shift):shift<0?"b".repeat(-shift):"")+octave,accidental};
  }
  const content=body.join(" ").replace(/"[^"]*"/g," ");
  const re=/(\|+|:\||\|:|\[\||\[[^\]]+\]|[\^_=]*[A-Ga-gzZ][,']*)(\d+)?(?:\/(\d*)?)?/g;
  const events=[],rests=[];let beat=0,match;
  while((match=re.exec(content))){
    const token=match[1],dur=duration(match[2],match[3]);
    if(token[0]==="|"||token===":|"||token==="|:"||token==="[|"){measureAcc.clear();continue}
    if(/^[zZ]/.test(token)){rests.push({id:"abc-rest-"+rests.length,startBeat:roundBeat(beat),durationBeat:roundBeat(dur),type:durationKind(dur).name});beat+=dur;continue}
    if(token[0]==="["){
      const inside=token.slice(1,-1),noteRe=/[\^_=]*[A-Ga-g][,']*/g;let nm,found=0;
      while((nm=noteRe.exec(inside))){
        const p=pitch(nm[0]);if(!p)continue;
        events.push({id:"abc-"+events.length,...p,startBeat:roundBeat(beat),durationBeat:roundBeat(dur),velocity:78,clef:p.midi<60?"bass":"treble"});
        found++;
      }
      if(found)beat+=dur;
      continue;
    }
    const p=pitch(token);if(!p)continue;
    events.push({id:"abc-"+events.length,...p,startBeat:roundBeat(beat),durationBeat:roundBeat(dur),velocity:78,clef:p.midi<60?"bass":"treble"});
    beat+=dur;
  }
  if(!events.length&&!rests.length)throw new Error("abc_no_notes");
  return normalizeScore({title:headers.T||"Partitura ABC",source:"abc",tempoBpm,meter,keyFifths,keyMinor:/m$/i.test(keyText),events,rests});
}
window.LuwipiScoreEngine=Object.freeze({
  normalizeScore,
  parseMIDI,
  parseMusicXML,
  parseMXL,
  parseABC,
  render,
  groupEvents,
  midiToName,
  nameToMidi,
  staffStep,
  staffY,
  measureTimeline,
  durationKind,
  dynamicFromVelocity,
  keyName,
  midiToSpelledName,
  inferNotationGrid,
  transcribePerformance,
  performanceEvents,
  beatToMs,
  durationToMs,
  auditScore,
  ptSolfege,
  restSymbol,
  playNote
});
})();