import { Sandbox, Snapshot } from '@vercel/sandbox';
import { writeFile } from 'node:fs/promises';
import { runConversion } from '../server/musescore.mjs';

// Provision once, smoke-test the actual native engine, then reuse the image.
// Snapshots contain tools and fonts only, never a user's MIDI or credentials.
const name='luwipi-musescore3-v1';
let sandbox,snapshotId;
try{
  const previous=await Snapshot.list({name,limit:1});
  for await(const snapshot of previous){if(snapshot.status==='created'){snapshotId=snapshot.snapshotId;break}}
  sandbox=await Sandbox.create(snapshotId?{source:{type:'snapshot',snapshotId},region:'iad1',timeout:300000}:{name,image:'vercel/sandbox/ubuntu',region:'iad1',resources:{vcpus:2},timeout:300000});
  if(!snapshotId){
    for(const args of [['update'],['install','-y','--no-install-recommends','musescore3','fonts-dejavu-core']]){
      const result=await sandbox.runCommand({cmd:'apt-get',args,sudo:true,env:{DEBIAN_FRONTEND:'noninteractive'},timeoutMs:180000});
      if(result.exitCode!==0)throw Error('MuseScore installation failed: '+(await result.stderr()).slice(-2000));
    }
  }
  await sandbox.runCommand({cmd:'mkdir',args:['-p','/tmp/luwipi-runtime']});
  await sandbox.runCommand({cmd:'chmod',args:['700','/tmp/luwipi-runtime']});
  const v=await sandbox.runCommand({cmd:'musescore3',args:['--version'],env:{QT_QPA_PLATFORM:'offscreen'},timeoutMs:10000});
  if(v.exitCode!==0)throw Error('MuseScore engine unavailable');
  const version=((await v.stdout())+' '+(await v.stderr())).trim().slice(0,200);
  const track=[0,0xc0,24,0,0x90,60,90,0,0x90,64,90,0x83,0x60,0x80,60,0,0,0x80,64,0,0,255,47,0];
  const input=Buffer.from([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,track.length,...track]);
  const xml=await runConversion(sandbox,input);
  if(!xml.includes('<chord/>')||!xml.includes('<step>C</step>')||!xml.includes('<step>E</step>'))throw Error('MuseScore smoke test lost chord notes');
  await sandbox.runCommand({cmd:'rm',args:['-f','/tmp/luwipi.mid','/tmp/luwipi.musicxml']});
  if(!snapshotId)snapshotId=(await sandbox.snapshot({expiration:0})).snapshotId;
  await writeFile(new URL('../server/musescore-snapshot.json',import.meta.url),JSON.stringify({snapshotId,version,region:'iad1'}));
  console.log('MuseScore native MIDI → MusicXML chord test passed. Engine:',version);
}finally{await sandbox?.stop().catch(()=>{})}
