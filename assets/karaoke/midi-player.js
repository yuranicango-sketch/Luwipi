/* Full MIDI playback uses the original bytes, including percussion and controllers. */
(()=>{
'use strict';
const VERSION='4.3.14';
let context,synth,seq,ready,loadId=0;
async function initialize(){
 if(!ready)ready=(async()=>{
  context=new AudioContext();
  // Resume in the user's click before network requests complete.
  await context.resume();
  const base='https://cdn.jsdelivr.net/npm/spessasynth_lib@'+VERSION;
  const [lib,response]=await Promise.all([
   import(base+'/+esm'),
   fetch('https://spessasus.github.io/SpessaSynth/soundfonts/GeneralUserGS.sf3')
  ]);
  if(!response.ok)throw Error('Não foi possível carregar os instrumentos MIDI.');
  const bank=await response.arrayBuffer();
  await context.audioWorklet.addModule(base+'/dist/spessasynth_processor.min.js');
  synth=new lib.WorkletSynthesizer(context);
  synth.connect(context.destination);
  await synth.soundBankManager.addSoundBank(bank,'main');
  await synth.isReady;
  seq=new lib.Sequencer(synth,{skipToFirstNoteOn:false});
  seq.loopCount=0;
 })().catch(async error=>{await context?.close();context=synth=seq=null;ready=null;throw error});
 else if(context)await context.resume();
 return ready;
}
async function play(binary,fileName){
 const id=++loadId;
 await Promise.race([initialize(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Os instrumentos demoraram demasiado a carregar. Tenta novamente.')),30000))]);
 if(id!==loadId)return false;
 seq.pause();synth.stopAll(true);
 await new Promise((resolve,reject)=>{
  const listener='luwipi-load-'+id;
  const cleanup=()=>{clearTimeout(timeout);seq.eventHandler.removeEvent('songChange',listener);seq.eventHandler.removeEvent('midiError',listener)};
  const timeout=setTimeout(()=>{cleanup();reject(Error('O MIDI demorou demasiado a carregar.'))},20000);
  seq.eventHandler.addEvent('songChange',listener,()=>{cleanup();resolve()});
  seq.eventHandler.addEvent('midiError',listener,()=>{cleanup();reject(Error('Não foi possível reproduzir este MIDI.'))});
  seq.loadNewSongList([{binary:binary.slice(0),fileName}]);
 });
 if(id!==loadId)return false;
 seq.currentTime=0;seq.play();return true;
}
function stop(){loadId++;if(seq)seq.pause();if(synth)synth.stopAll(true)}
window.LuwipiMidiPlayer=Object.freeze({play,stop,get time(){return seq?.currentHighResolutionTime||0},get finished(){return Boolean(seq?.isFinished)}});
})();
