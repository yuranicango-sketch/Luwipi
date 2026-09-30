import { readFile } from 'node:fs/promises';

export function validateMidi(bytes) {
  if(bytes.length<22||bytes.length>2000000||bytes.toString('ascii',0,4)!=='MThd'||bytes.readUInt32BE(4)!==6)throw Error('invalid_midi');
  const format=bytes.readUInt16BE(8),tracks=bytes.readUInt16BE(10),division=bytes.readUInt16BE(12);
  if(format>1||!tracks||tracks>128||!division||(division&32768))throw Error('unsupported_midi');
  let pos=14,notes=0;
  for(let track=0;track<tracks;track++){
    if(pos+8>bytes.length||bytes.toString('ascii',pos,pos+4)!=='MTrk')throw Error('invalid_midi');
    const end=pos+8+bytes.readUInt32BE(pos+4);pos+=8;if(end>bytes.length)throw Error('invalid_midi');
    let running=0,ticks=0;
    const variable=()=>{let v=0;for(let i=0;i<4;i++){if(pos>=end)throw Error('invalid_midi');const b=bytes[pos++];v=(v<<7)|(b&127);if(!(b&128))return v}throw Error('invalid_midi')};
    while(pos<end){ticks+=variable();if(ticks/division>4000)throw Error('midi_too_long');let status=bytes[pos];if(status&128){pos++;if(status<240)running=status}else status=running;
      if(!status)throw Error('invalid_midi');
      if(status===255){if(pos>=end)throw Error('invalid_midi');pos++;const size=variable();pos+=size}
      else if(status===240||status===247){const size=variable();pos+=size;running=0}
      else if(status>=128&&status<240){const size=(status&240)===192||(status&240)===208?1:2;if(pos+size>end)throw Error('invalid_midi');for(let i=0;i<size;i++)if(bytes[pos+i]>127)throw Error('invalid_midi');if((status&240)===144&&bytes[pos+1]>0&&++notes>10000)throw Error('too_many_notes');pos+=size}
      else throw Error('invalid_midi');
      if(pos>end)throw Error('invalid_midi');
    }
  }
  if(pos!==bytes.length||!notes)throw Error('invalid_midi');return notes;
}

export async function runConversion(sandbox,bytes) {
  await sandbox.writeFiles([{path:'/tmp/luwipi.mid',content:bytes}]);
  const result=await sandbox.runCommand({cmd:'musescore3',args:['-s','-m','-o','/tmp/luwipi.musicxml','/tmp/luwipi.mid'],env:{QT_QPA_PLATFORM:'offscreen',XDG_RUNTIME_DIR:'/tmp/luwipi-runtime'},timeoutMs:45000});
  if(result.exitCode!==0)throw Error('musescore_conversion_failed');
  const output=await sandbox.readFileToBuffer({path:'/tmp/luwipi.musicxml'});
  if(!output||output.length>6000000)throw Error('invalid_musicxml');
  const xml=output.toString('utf8');
  if(!xml.includes('<score-partwise')||!xml.includes('<pitch>'))throw Error('invalid_musicxml');
  return xml;
}

export async function configurationForMuseScore() {
  return JSON.parse(await readFile(process.cwd()+'/server/musescore-snapshot.json','utf8'));
}

export async function convertMidi(bytes) {
  const configuration=await configurationForMuseScore();
  if(!configuration.snapshotId)throw Error('musescore_not_ready');
  const { Sandbox }=await import('@vercel/sandbox');
  const sandbox=await Sandbox.create({source:{type:'snapshot',snapshotId:configuration.snapshotId},region:configuration.region,resources:{vcpus:2},timeout:65000,networkPolicy:'deny-all'});
  try{return {xml:await runConversion(sandbox,bytes),engine:'MuseScore',version:configuration.version}}
  finally{await sandbox.stop().catch(()=>{})}
}
