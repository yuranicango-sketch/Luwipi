import { convertMidi, validateMidi, configurationForMuseScore } from '../server/musescore.mjs';

const busy=new Set();
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'private, no-store'}});
export async function GET(request){
  try{const config=await configurationForMuseScore();return json({ready:Boolean(config.snapshotId&&config.verified),engine:'MuseScore',version:config.version,verified:config.verified||false,...(new URL(request.url).searchParams.get('example')==='1'?{exampleMusicXML:config.exampleMusicXML}: {})})}
  catch{return json({ready:false,engine:'MuseScore'},503)}
}
export async function POST(request){
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'forbidden_origin'},403);
  const authorization=request.headers.get('authorization')||'';
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!authorization.startsWith('Bearer ')||!url||!key)return json({error:'unauthorized'},401);
  let user;
  try{const r=await fetch(url+'/auth/v1/user',{headers:{apikey:key,authorization},signal:AbortSignal.timeout(8000)});if(!r.ok)return json({error:'unauthorized'},401);user=await r.json()}catch{return json({error:'auth_unavailable'},503)}
  if(!user?.id)return json({error:'unauthorized'},401);
  if(busy.has(user.id)||busy.size>=4)return json({error:'conversion_busy'},429);
  const type=request.headers.get('content-type')||'';if(!type.startsWith('audio/midi')&&!type.startsWith('application/octet-stream'))return json({error:'invalid_content_type'},415);
  const chunks=[];let length=0;
  try{for await(const chunk of request.body){length+=chunk.length;if(length>2000000)return json({error:'midi_too_large'},413);chunks.push(Buffer.from(chunk))}}catch{return json({error:'invalid_midi'},400)}
  const bytes=Buffer.concat(chunks);
  let sourceNotes;try{sourceNotes=validateMidi(bytes)}catch(error){return json({error:error.message},400)}
  busy.add(user.id);
  try{return json({...await convertMidi(bytes),sourceNotes})}
  catch(error){console.error('MuseScore conversion:',error.message);return json({error:'conversion_unavailable'},503)}
  finally{busy.delete(user.id)}
}
