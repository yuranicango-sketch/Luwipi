(function(){
"use strict";

const listeners=new Set();
let midiAccess=null,midiBound=new Set(),micStream=null,micCtx=null,micSource=null,micAnalyser=null,micFrame=0;
let micLastNote=null,micStable=0,micActive=false,micLastEmit=0,micLastRms=0,micSilenceAt=0;
let mode="none";

function emit(detail){
  const payload=Object.assign({at:performance.now()},detail||{});
  listeners.forEach(fn=>{try{fn(payload)}catch(error){console.warn("Live input listener failed",error)}});
  window.dispatchEvent(new CustomEvent("luwipi:noteinput",{detail:payload}));
}
function midiName(midi){
  if(window.LuwipiScoreEngine)return window.LuwipiScoreEngine.midiToName(midi);
  const n=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],m=Math.max(0,Math.min(127,Math.round(midi)));
  return n[m%12]+(Math.floor(m/12)-1);
}
function handleMidiMessage(event){
  const data=event.data||[],status=data[0]||0,hi=status&0xF0,channel=status&15,note=data[1],velocity=data[2]||0;
  if(hi===0x90&&velocity>0){
    emit({type:"noteon",source:"midi",midi:note,note:midiName(note),velocity,channel});
  }else if(hi===0x80||(hi===0x90&&velocity===0)){
    emit({type:"noteoff",source:"midi",midi:note,note:midiName(note),velocity:0,channel});
  }
}
function unbindMidi(){
  midiBound.forEach(input=>{try{input.onmidimessage=null}catch{}});
  midiBound.clear();
}
function bindMidiInputs(){
  unbindMidi();
  if(!midiAccess)return 0;
  let count=0;
  midiAccess.inputs.forEach(input=>{
    input.onmidimessage=handleMidiMessage;
    midiBound.add(input);count++;
  });
  return count;
}
async function connectMIDI(){
  if(!navigator.requestMIDIAccess)throw new Error("midi_not_supported");
  stopMicrophone();
  midiAccess=await navigator.requestMIDIAccess({sysex:false});
  const count=bindMidiInputs();
  midiAccess.onstatechange=()=>bindMidiInputs();
  mode="midi";
  return{mode,count,names:Array.from(midiAccess.inputs.values()).map(i=>i.name||"MIDI")};
}
function autocorrelate(buffer,sampleRate){
  let rms=0;
  for(let i=0;i<buffer.length;i++)rms+=buffer[i]*buffer[i];
  rms=Math.sqrt(rms/buffer.length);
  if(rms<.008)return{freq:0,confidence:0,rms};
  const minLag=Math.max(2,Math.floor(sampleRate/1400));
  const maxLag=Math.min(buffer.length-2,Math.floor(sampleRate/45));
  let bestLag=0,best=-1;
  for(let lag=minLag;lag<=maxLag;lag++){
    let num=0,a=0,b=0;
    const limit=buffer.length-lag;
    for(let i=0;i<limit;i+=2){
      const x=buffer[i],y=buffer[i+lag];
      num+=x*y;a+=x*x;b+=y*y;
    }
    const corr=num/Math.sqrt((a*b)||1);
    if(corr>best){best=corr;bestLag=lag}
  }
  if(best<.72||!bestLag)return{freq:0,confidence:best,rms};
  let lag=bestLag;
  const scoreAt=testLag=>{
    let num=0,a=0,b=0,limit=buffer.length-testLag;
    for(let i=0;i<limit;i+=2){const x=buffer[i],y=buffer[i+testLag];num+=x*y;a+=x*x;b+=y*y}
    return num/Math.sqrt((a*b)||1);
  };
  if(bestLag>minLag&&bestLag<maxLag){
    const left=scoreAt(bestLag-1),right=scoreAt(bestLag+1),den=2*(2*best-left-right);
    if(Math.abs(den)>.0001)lag=bestLag+(right-left)/den;
  }
  return{freq:sampleRate/lag,confidence:best,rms};
}
function micLoop(){
  if(!micAnalyser)return;
  const data=new Float32Array(micAnalyser.fftSize);
  micAnalyser.getFloatTimeDomainData(data);
  const result=autocorrelate(data,micCtx.sampleRate);
  const now=performance.now();
  if(!result.freq){
    if(micActive&&!micSilenceAt)micSilenceAt=now;
    if(micActive&&micSilenceAt&&now-micSilenceAt>85){
      if(micLastNote!==null)emit({type:"noteoff",source:"microphone",midi:micLastNote,note:midiName(micLastNote),velocity:0,confidence:0});
      micActive=false;micLastNote=null;micStable=0;
    }
    micLastRms=result.rms;
    micFrame=requestAnimationFrame(micLoop);return;
  }
  micSilenceAt=0;
  const midi=Math.round(69+12*Math.log2(result.freq/440));
  const cents=1200*Math.log2(result.freq/(440*Math.pow(2,(midi-69)/12)));
  if(midi===micLastNote)micStable++;else{micLastNote=midi;micStable=1}
  const attack=result.rms>Math.max(.012,micLastRms*1.55);
  if(micStable>=2&&result.confidence>=.75&&(!micActive||attack||now-micLastEmit>1400)){
    emit({
      type:"noteon",
      source:"microphone",
      midi,
      note:midiName(midi),
      velocity:Math.round(Math.max(1,Math.min(127,result.rms*900))),
      confidence:result.confidence,
      cents
    });
    micActive=true;micLastEmit=now;
  }
  micLastRms=result.rms;
  micFrame=requestAnimationFrame(micLoop);
}
async function connectMicrophone(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("microphone_not_supported");
  unbindMidi();
  if(midiAccess)midiAccess.onstatechange=null;
  const stream=await navigator.mediaDevices.getUserMedia({
    audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1},
    video:false
  });
  stopMicrophone();
  micStream=stream;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw new Error("audio_context_not_supported");
  micCtx=new AC({latencyHint:"interactive"});
  micSource=micCtx.createMediaStreamSource(stream);
  micAnalyser=micCtx.createAnalyser();
  micAnalyser.fftSize=4096;micAnalyser.smoothingTimeConstant=.05;
  micSource.connect(micAnalyser);
  micLastNote=null;micStable=0;micActive=false;micLastRms=0;micSilenceAt=0;
  mode="microphone";
  micLoop();
  return{mode};
}
function stopMicrophone(){
  if(micFrame)cancelAnimationFrame(micFrame);micFrame=0;
  if(micStream)micStream.getTracks().forEach(track=>track.stop());
  micStream=null;
  try{micSource&&micSource.disconnect()}catch{}
  micSource=null;micAnalyser=null;
  if(micCtx){try{micCtx.close()}catch{}}
  micCtx=null;micActive=false;micLastNote=null;micStable=0;
}
function disconnect(){
  unbindMidi();
  if(midiAccess)midiAccess.onstatechange=null;
  midiAccess=null;
  stopMicrophone();
  mode="none";
}
function subscribe(fn){
  if(typeof fn!=="function")return()=>{};
  listeners.add(fn);
  return()=>listeners.delete(fn);
}
function state(){
  return{mode,midiInputs:midiAccess?Array.from(midiAccess.inputs.values()).map(i=>i.name||"MIDI"):[]};
}

window.LuwipiLiveInput=Object.freeze({connectMIDI,connectMicrophone,disconnect,subscribe,state});
})();