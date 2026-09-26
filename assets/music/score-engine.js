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
  const base=clef==="bass"?"G2":"E4";
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
      tieStart:Boolean(event.tieStart),
      tieStop:Boolean(event.tieStop),
      pedal:Boolean(event.pedal)
    };
  };
  const events=(Array.isArray(score.events)?score.events:[]).map((e,i)=>normalizeEvent(e,i,"ev")).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
  const perf=(Array.isArray(score.performanceEvents)?score.performanceEvents:[]).map((e,i)=>normalizeEvent(e,i,"perf")).sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi);
  const tempoBpm=clamp(Number(score.tempoBpm)||120,20,300);
  const beatsPerMeasure=meter[0]*(4/meter[1]);
  const endBeat=events.reduce((max,e)=>Math.max(max,e.startBeat+e.durationBeat),0);
  return{
    title:String(score.title||"Partitura").slice(0,160),
    source:String(score.source||"structured"),
    tempoBpm,
    tempoMap:Array.isArray(score.tempoMap)?score.tempoMap.map(x=>({beat:roundBeat(Number(x.beat)||0),bpm:clamp(Number(x.bpm)||tempoBpm,20,300)})):[],
    meter,
    meterMap:Array.isArray(score.meterMap)?score.meterMap.map(x=>({beat:roundBeat(Number(x.beat)||0),meter:Array.isArray(x.meter)?x.meter.slice(0,2):meter})):[],
    keyFifths,
    keyMinor:Boolean(score.keyMinor),
    keyName:score.keyName||keyName(keyFifths,score.keyMinor),
    keyMap:Array.isArray(score.keyMap)?score.keyMap.map(x=>({beat:roundBeat(Number(x.beat)||0),fifths:clamp(Math.round(Number(x.fifths)||0),-7,7),minor:Boolean(x.minor)})):[],
    ppq:Number(score.ppq)||480,
    events,
    performanceEvents:perf.length?perf:events,
    transcription:score.transcription&&typeof score.transcription==="object"?Object.assign({},score.transcription):null,
    beatsPerMeasure,
    durationBeats:endBeat,
    measures:Math.max(1,Math.ceil(endBeat/beatsPerMeasure))
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
  const rawEvents=[],tempos=[],meters=[],keys=[],trackNames=[],programs=[];
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
      rawEvents.push({
        id:"midi-"+track+"-"+rawEvents.length,
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
      if(hi===0x90&&b>0&&channel!==9){
        const key=channel+":"+a,stack=active.get(key)||[];
        stack.push({tick,velocity:b});active.set(key,stack);
      }else if((hi===0x80||(hi===0x90&&b===0))&&channel!==9){
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
    transcription:{
      mode:"automatic-midi",
      gridBeat:transcription.gridBeat,
      confidence:transcription.confidence,
      meanQuantizationError:transcription.meanQuantizationError,
      notesPreserved:rawEvents.length,
      programs
    }
  });
}

function childElements(node){return Array.from(node&&node.children?node.children:[])}
function textNum(node,selector,fallback){
  const el=node&&node.querySelector?node.querySelector(selector):null;
  const n=el?Number(el.textContent):NaN;
  return Number.isFinite(n)?n:fallback;
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
          const rest=Boolean(node.querySelector("rest"));
          const start=chord?lastStart:cursor;
          if(!rest){
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
    events
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
function drawNote(svg,event,x,bottom,groupIndex,current){
  const y=staffY(event.midi,event.clef,bottom,event.note),stepValue=staffStep(event.midi,event.clef,event.note),kind=durationKind(event.durationBeat);
  drawLedger(svg,x,bottom,stepValue);
  const accidental=accidentalForEvent(event);
  if(accidental)addText(svg,x-23,y+7,accidental,{"font-size":20,fill:"#292d34","font-family":"serif"});
  if(current){
    const halo=svgEl("ellipse",{cx:x,cy:y,rx:24,ry:19,fill:"rgba(69,104,255,.07)",stroke:"rgba(69,104,255,.62)","stroke-width":3,class:"live-score-halo"});
    svg.appendChild(halo);
  }
  const head=svgEl("ellipse",{cx:x,cy:y,rx:10.5,ry:7,fill:kind.open?"#fff":"#292d34",stroke:"#292d34","stroke-width":kind.open?2.5:0,transform:"rotate(-18 "+x+" "+y+")","data-live-group":groupIndex});
  svg.appendChild(head);
  if(kind.stem){
    const stemUp=stepValue<5;
    const sx=stemUp?x+9:x-9,sy2=stemUp?y-43:y+43;
    addLine(svg,sx,y,sx,sy2,{stroke:"#292d34","stroke-width":3,"stroke-linecap":"round"});
    for(let flag=0;flag<kind.flags;flag++){
      if(stemUp){
        const path=svgEl("path",{d:"M "+sx+" "+(sy2+flag*7)+" Q "+(sx+18)+" "+(sy2+5+flag*7)+" "+(sx+13)+" "+(sy2+20+flag*7),fill:"none",stroke:"#292d34","stroke-width":3});
        svg.appendChild(path);
      }else{
        const path=svgEl("path",{d:"M "+sx+" "+(sy2-flag*7)+" Q "+(sx-18)+" "+(sy2-5-flag*7)+" "+(sx-13)+" "+(sy2-20-flag*7),fill:"none",stroke:"#292d34","stroke-width":3});
        svg.appendChild(path);
      }
    }
  }
  if(kind.dots)addText(svg,x+17,y+4,"·",{"font-size":24,fill:"#292d34","font-weight":800});
  if(kind.tuplet)addText(svg,x,y-52,String(kind.tuplet),{"font-size":10,fill:"#555a63","font-weight":800,"text-anchor":"middle"});
  if(event.articulations.includes("staccato"))svg.appendChild(svgEl("circle",{cx:x,cy:y+(stepValue<5?13:-13),r:2.4,fill:"#292d34"}));
  if(event.articulations.includes("tenuto"))addLine(svg,x-7,y+(stepValue<5?14:-14),x+7,y+(stepValue<5?14:-14),{stroke:"#292d34","stroke-width":2});
  if(event.articulations.includes("accent"))addText(svg,x,y+(stepValue<5?19:-15),">",{"font-size":17,fill:"#292d34","text-anchor":"middle","font-weight":700});
  if(event.tieStart){
    const dy=stepValue<5?14:-14;
    svg.appendChild(svgEl("path",{d:"M "+(x-8)+" "+(y+dy)+" Q "+x+" "+(y+dy+(stepValue<5?7:-7))+" "+(x+18)+" "+(y+dy),fill:"none",stroke:"#292d34","stroke-width":1.7}));
  }
}
function render(svg,rawScore,options){
  if(!svg)throw new Error("score_svg_missing");
  const score=rawScore&&rawScore.events?normalizeScore(rawScore):normalizeScore(rawScore);
  const opts=options||{},groups=groupEvents(score),currentGroup=Number.isInteger(opts.currentGroupIndex)?opts.currentGroupIndex:-1;
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const width=1120,measuresPerSystem=4,systemHeight=220,systems=Math.max(1,Math.ceil(score.measures/measuresPerSystem));
  const height=50+systems*systemHeight;
  svg.setAttribute("viewBox","0 0 "+width+" "+height);
  svg.setAttribute("role","img");
  svg.setAttribute("aria-label",score.title+" — partitura");
  const bg=svgEl("rect",{x:0,y:0,width,height,rx:18,fill:"#fff"});svg.appendChild(bg);
  addText(svg,36,29,score.title,{"font-size":17,"font-weight":700,fill:"#17181d"});
  addText(svg,width-36,29,"♩ = "+Math.round(score.tempoBpm)+" · "+score.meter[0]+"/"+score.meter[1]+" · "+score.keyName,{"font-size":11,"font-weight":700,fill:"#777c85","text-anchor":"end"});
  const left=105,right=1080,usable=right-left,measureWidth=usable/measuresPerSystem;
  const measureBeats=score.beatsPerMeasure;
  for(let system=0;system<systems;system++){
    const baseY=50+system*systemHeight,trebleTop=baseY+25,bassTop=baseY+112;
    drawStaff(svg,left,right,trebleTop);drawStaff(svg,left,right,bassTop);
    addText(svg,42,trebleTop+52,"𝄞",{"font-size":68,fill:"#34373d","font-family":"serif"});
    addText(svg,48,bassTop+45,"𝄢",{"font-size":57,fill:"#34373d","font-family":"serif"});
    const ksT=drawKeySignature(svg,score.keyFifths,"treble",79,trebleTop);
    drawKeySignature(svg,score.keyFifths,"bass",79,bassTop);
    if(system===0){
      const tsx=79+Math.max(ksT,0)+9;
      addText(svg,tsx,trebleTop+20,String(score.meter[0]),{"font-size":18,"font-weight":800,fill:"#292d34"});
      addText(svg,tsx,trebleTop+43,String(score.meter[1]),{"font-size":18,"font-weight":800,fill:"#292d34"});
      addText(svg,tsx,bassTop+20,String(score.meter[0]),{"font-size":18,"font-weight":800,fill:"#292d34"});
      addText(svg,tsx,bassTop+43,String(score.meter[1]),{"font-size":18,"font-weight":800,fill:"#292d34"});
    }
    for(let slot=0;slot<=measuresPerSystem;slot++){
      const measureIndex=system*measuresPerSystem+slot;
      if(slot===measuresPerSystem||measureIndex<=score.measures){
        const x=left+slot*measureWidth;
        addLine(svg,x,trebleTop,x,bassTop+48,{stroke:"#5b5f67","stroke-width":slot===0?1.4:1.2});
      }
    }
    for(let slot=0;slot<measuresPerSystem;slot++){
      const measureIndex=system*measuresPerSystem+slot;
      if(measureIndex<score.measures)addText(svg,left+slot*measureWidth+6,baseY+13,String(measureIndex+1),{"font-size":9,fill:"#a0a3aa"});
    }
  }
  let lastDynamic="";
  groups.forEach((group,groupIndex)=>{
    group.events.forEach((event,eventIndex)=>{
      const measureIndex=Math.floor(event.startBeat/measureBeats);
      const system=Math.floor(measureIndex/measuresPerSystem),slot=measureIndex%measuresPerSystem;
      const beatInMeasure=event.startBeat-measureIndex*measureBeats;
      const baseY=50+system*systemHeight,trebleBottom=baseY+73,bassBottom=baseY+160;
      const x=left+slot*measureWidth+42+(beatInMeasure/measureBeats)*(measureWidth-50);
      drawNote(svg,event,x,event.clef==="bass"?bassBottom:trebleBottom,groupIndex,groupIndex===currentGroup);
      if(eventIndex===0&&event.dynamic&&event.dynamic!==lastDynamic){
        addText(svg,x,(event.clef==="bass"?bassBottom:trebleBottom)+38,event.dynamic,{"font-size":15,fill:"#353940","font-family":"serif","font-style":"italic","font-weight":700,"text-anchor":"middle"});
        lastDynamic=event.dynamic;
      }
    });
  });
  return{score,groups,width,height};
}

window.LuwipiScoreEngine=Object.freeze({
  normalizeScore,
  parseMIDI,
  parseMusicXML,
  render,
  groupEvents,
  midiToName,
  nameToMidi,
  staffStep,
  staffY,
  durationKind,
  dynamicFromVelocity,
  keyName,
  midiToSpelledName,
  inferNotationGrid,
  transcribePerformance,
  performanceEvents,
  beatToMs,
  durationToMs,
  auditScore
});
})();