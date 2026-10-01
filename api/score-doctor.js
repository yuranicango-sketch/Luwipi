const MODEL="gpt-6-luna";
const busy=new Set();
const cache=new Map();

function json(body,status=200){return Response.json(body,{status,headers:{"cache-control":"private, no-store"}})}
function sameOrigin(request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin}
function cfg(){return{url:process.env.SUPABASE_URL||"",pub:process.env.SUPABASE_PUBLISHABLE_KEY||"",openai:process.env.OPENAI_API_KEY||""}}
function bearer(request){const auth=request.headers.get("authorization")||"";return auth.startsWith("Bearer ")?auth.slice(7):""}
async function userFor(request){
  const c=cfg(),token=bearer(request);
  if(!c.url||!c.pub||!token)return null;
  try{
    const r=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token},signal:AbortSignal.timeout(8000)});
    return r.ok?{user:await r.json(),token}:null;
  }catch{return null}
}
async function parseBody(request,max=3800000){
  const raw=await request.text();
  if(raw.length>max)throw Object.assign(new Error("payload_too_large"),{status:413});
  try{return JSON.parse(raw||"{}")}catch{throw Object.assign(new Error("invalid_request"),{status:400})}
}
function num(value,min,max,fallback=0){
  const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
}
function cleanText(value,max=180){return String(value??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,max)}
function cleanScore(body){
  if(!body||body.version!==1||!Array.isArray(body.events)||body.events.length<1||body.events.length>30000)throw Object.assign(new Error("invalid_score"),{status:400});
  const events=body.events.map((row,index)=>{
    if(!Array.isArray(row)||row.length<8)throw Object.assign(new Error("invalid_event"),{status:400});
    const id=cleanText(row[0]||("event-"+index),96);
    const track=Math.round(num(row[1],0,999,0)),channel=Math.round(num(row[2],0,15,0)),midi=Math.round(num(row[3],0,127,60));
    const start=num(row[4],0,100000,0),duration=num(row[5],0.015625,256,1),velocity=Math.round(num(row[6],1,127,72)),pedal=row[7]?1:0;
    if(!id)throw Object.assign(new Error("invalid_event_id"),{status:400});
    return[id,track,channel,midi,start,duration,velocity,pedal];
  });
  const tracks=Array.isArray(body.tracks)?body.tracks.slice(0,256).map((t,i)=>({
    key:cleanText(t?.key||"",32),track:Math.round(num(t?.track,0,999,i)),channel:Math.round(num(t?.channel,0,15,0)),
    title:cleanText(t?.title||("Pista "+(i+1)),120),instrument:cleanText(t?.instrument||"Instrumento",80),
    program:Number.isFinite(Number(t?.program))?Math.round(num(t.program,0,127,0)):null,notes:Math.round(num(t?.notes,0,30000,0))
  })):[];
  const meter=Array.isArray(body.meter)&&body.meter.length===2?[Math.round(num(body.meter[0],1,32,4)),Math.round(num(body.meter[1],1,32,4))]:[4,4];
  const map=(value,kind)=>Array.isArray(value)?value.slice(0,256).map(x=>kind==="tempo"
    ?{beat:num(x?.beat,0,100000,0),bpm:num(x?.bpm,20,300,120)}
    :kind==="meter"?{beat:num(x?.beat,0,100000,0),meter:Array.isArray(x?.meter)?[Math.round(num(x.meter[0],1,32,4)),Math.round(num(x.meter[1],1,32,4))]:meter}
    :{beat:num(x?.beat,0,100000,0),fifths:Math.round(num(x?.fifths,-7,7,0)),minor:Boolean(x?.minor)}):[];
  return{
    version:1,title:cleanText(body.title||"MIDI",180),tempoBpm:num(body.tempoBpm,20,300,120),meter,
    keyFifths:Math.round(num(body.keyFifths,-7,7,0)),keyMinor:Boolean(body.keyMinor),
    durationBeats:num(body.durationBeats,0,100000,0),tracks,events,
    tempoMap:map(body.tempoMap,"tempo"),meterMap:map(body.meterMap,"meter"),keyMap:map(body.keyMap,"key")
  };
}
async function digest(value){
  const bytes=new TextEncoder().encode(value),hash=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
const schema={
  type:"object",additionalProperties:false,
  properties:{
    summary:{type:"string"},
    confidence:{type:"number",minimum:0,maximum:1},
    lead:{type:"object",additionalProperties:false,properties:{
      track:{type:"integer",minimum:0},channel:{type:"integer",minimum:0,maximum:15},title:{type:"string"},reason:{type:"string"}
    },required:["track","channel","title","reason"]},
    notation:{type:"object",additionalProperties:false,properties:{
      mode:{type:"string",enum:["organized","literal"]},
      grid:{type:"number",minimum:0.0625,maximum:4},
      keyFifths:{type:"integer",minimum:-7,maximum:7},
      meterNumerator:{type:"integer",minimum:1,maximum:32},
      meterDenominator:{type:"integer",enum:[1,2,4,8,16]}
    },required:["mode","grid","keyFifths","meterNumerator","meterDenominator"]},
    issues:{type:"array",maxItems:24,items:{type:"object",additionalProperties:false,properties:{
      kind:{type:"string",enum:["short_gates","timing_jitter","overlap","voice_density","lead_ambiguity","meter","key","other"]},
      severity:{type:"string",enum:["info","warning","important"]},
      startBeat:{type:"number",minimum:0},endBeat:{type:"number",minimum:0},detail:{type:"string"}
    },required:["kind","severity","startBeat","endBeat","detail"]}},
    operations:{type:"array",maxItems:800,items:{type:"object",additionalProperties:false,properties:{
      eventId:{type:"string"},
      startBeat:{anyOf:[{type:"number",minimum:0},{type:"null"}]},
      durationBeat:{anyOf:[{type:"number",minimum:0.03125,maximum:32},{type:"null"}]},
      spelling:{anyOf:[{type:"string",pattern:"^[A-G](?:#|b)?-?[0-9]+$"},{type:"null"}]},
      staccato:{anyOf:[{type:"boolean"},{type:"null"}]},
      reason:{type:"string"}
    },required:["eventId","startBeat","durationBeat","spelling","staccato","reason"]}}
  },
  required:["summary","confidence","lead","notation","issues","operations"]
};
function outputText(body){
  for(const item of body?.output||[])for(const content of item?.content||[])if(content?.type==="output_text"&&typeof content.text==="string")return content.text;
  return typeof body?.output_text==="string"?body.output_text:"";
}
function trimCache(){
  if(cache.size<=40)return;
  const entries=[...cache.entries()].sort((a,b)=>a[1].at-b[1].at);
  for(const [key] of entries.slice(0,cache.size-40))cache.delete(key);
}

export async function GET(){
  return json({ready:Boolean(process.env.OPENAI_API_KEY),model:MODEL});
}

export async function POST(request){
  if(!sameOrigin(request))return json({error:"forbidden_origin"},403);
  const auth=await userFor(request);
  if(!auth?.user?.id)return json({error:"unauthorized"},401);
  const c=cfg();
  if(!c.openai)return json({error:"openai_not_configured"},503);
  if(busy.has(auth.user.id)||busy.size>=5)return json({error:"analysis_busy"},429);
  let body,score;
  try{body=await parseBody(request);score=cleanScore(body)}catch(error){return json({error:error.message},error.status||400)}
  const serialized=JSON.stringify(score),key=await digest(serialized);
  const cached=cache.get(key);
  if(cached&&Date.now()-cached.at<6*60*60*1000)return json({review:cached.review,usage:cached.usage||null,model:MODEL,cached:true});
  busy.add(auth.user.id);
  try{
    const instructions=[
      "You are Luwipi Score Doctor, a music-notation specialist.",
      "Analyze the ENTIRE compact MIDI score supplied by the user. Event rows use [id,track,channel,midi,startBeat,durationBeat,velocity,pedal].",
      "The playback audio must remain the original MIDI. Your job is notation interpretation only.",
      "Channel 9 rows are percussion context. Use them to understand pulse and structure, but never choose channel 9 as the melody/lead.",
      "Never change pitch identity, never add or delete source notes, never change track/channel assignment.",
      "Choose the most plausible melody/solo track using the whole arrangement, track names, register, density and overlap.",
      "Distinguish a short performed gate (staccato/articulation) from a genuinely short written note by comparing attack spacing, pulse, meter and neighboring phrases.",
      "Prefer conventional readable notation and the simplest grid supported by the evidence. Do not invent complexity.",
      "Operations are SPARSE notation edits only. Omit notes that need no change. startBeat/durationBeat refer only to displayed notation.",
      "If evidence is ambiguous, preserve the original timing. Do not force changes merely to use the operation list.",
      "Spelling may change enharmonic notation only, never MIDI pitch. Use no more than 800 operations.",
      "Return concise Portuguese explanations for the UI."
    ].join("\n");
    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{authorization:"Bearer "+c.openai,"content-type":"application/json"},
      body:JSON.stringify({
        model:MODEL,store:false,reasoning:{effort:"low"},max_output_tokens:12000,
        instructions,input:serialized,
        text:{format:{type:"json_schema",name:"luwipi_score_doctor",strict:true,schema}}
      }),
      signal:AbortSignal.timeout(70000)
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok){
      console.error("Score Doctor OpenAI:",response.status,result?.error?.type||result?.error?.code||"request_failed");
      return json({error:response.status===429?"openai_busy":"analysis_unavailable"},response.status===429?429:502);
    }
    if(result.status!=="completed")return json({error:"analysis_incomplete"},502);
    const text=outputText(result);
    let review;try{review=JSON.parse(text)}catch{return json({error:"analysis_invalid"},502)}
    if(!review||!review.lead||!review.notation||!Array.isArray(review.operations))return json({error:"analysis_invalid"},502);
    review.summary=cleanText(review.summary,900);review.lead.title=cleanText(review.lead.title,120);review.lead.reason=cleanText(review.lead.reason,500);
    review.issues=Array.isArray(review.issues)?review.issues.slice(0,24).map(issue=>({...issue,detail:cleanText(issue.detail,420)})):[];
    review.operations=review.operations.slice(0,800).map(op=>({...op,eventId:cleanText(op.eventId,96),reason:cleanText(op.reason,360)}));
    const ids=new Set(score.events.map(row=>row[0]));
    review.operations=review.operations.filter(op=>ids.has(String(op.eventId))).slice(0,800);
    const usage=result.usage?{inputTokens:Number(result.usage.input_tokens)||0,outputTokens:Number(result.usage.output_tokens)||0,totalTokens:Number(result.usage.total_tokens)||0}:null;
    cache.set(key,{review,usage,at:Date.now()});trimCache();
    return json({review,usage,model:MODEL,cached:false});
  }catch(error){
    if(error?.name==="TimeoutError"||error?.name==="AbortError")return json({error:"analysis_timeout"},504);
    console.error("Score Doctor:",error?.message||error);
    return json({error:"analysis_unavailable"},503);
  }finally{busy.delete(auth.user.id)}
}
