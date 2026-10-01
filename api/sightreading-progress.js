const TRACKS="ABCDEFGHIJ".split("");
const noStore={"cache-control":"private, no-store"};
function reply(body,status=200){return Response.json(body,{status,headers:noStore})}
function config(){return{url:process.env.SUPABASE_URL||"",key:process.env.SUPABASE_PUBLISHABLE_KEY||""}}
function sameOrigin(request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin}
function bearer(request){const h=request.headers.get("authorization")||"";return h.startsWith("Bearer ")?h.slice(7):""}
async function principal(request){
 const {url,key}=config(),token=bearer(request);
 if(!url||!key||!token)return null;
 try{
  const r=await fetch(url+"/auth/v1/user",{headers:{apikey:key,authorization:"Bearer "+token},signal:AbortSignal.timeout(8000)});
  if(!r.ok)return null;
  const user=await r.json();return user?.id?{id:user.id,token}:null;
 }catch{return null}
}
async function storage(path,auth,init={}){
 const {url,key}=config();
 return fetch(url+"/rest/v1/"+path,{...init,headers:{apikey:key,authorization:"Bearer "+auth.token,...(init.headers||{})},cache:"no-store",signal:AbortSignal.timeout(9000)});
}
const bounded=(v,n=100)=>String(v??"").trim().slice(0,n);
const isoDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v))?v:"";
const decimal=(v,min=0,max=1)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):min;
const integer=(v,min,max)=>Number.isInteger(Number(v))?Math.max(min,Math.min(max,Number(v))):min;
function sanitize(raw){
 // This endpoint only stores unverified drafts. Claims of MIDI/teacher
 // verification and client-supplied level certification are never trusted.
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("invalid_draft");
 const levels={};
 for(const track of TRACKS){
  const r=raw.levels?.[track]||{};
  const seenSessions=new Set(),sessions=[];
  for(const s of (Array.isArray(r.sessions)?r.sessions:[]).slice(-60)){
   const id=bounded(s.sessionId,90),exerciseId=bounded(s.exerciseId,90);
   if(!id||!exerciseId||seenSessions.has(id)||!isoDate(s.date))continue;
   seenSessions.add(id);
   sessions.push({sessionId:id,exerciseId,date:s.date,notes:decimal(s.notes),rhythm:decimal(s.rhythm),
    stops:integer(s.stops,0,99),bpm:integer(s.bpm,0,300),verified:false,success:false});
  }
  levels[track]={level:integer(r.level,0,7),certified:false,streak:[],sessions,
   recommendation:bounded(r.recommendation,110)};
 }
 const seen=[...new Set((Array.isArray(raw.seen)?raw.seen:[]).slice(-2500).map(v=>bounded(v,90)).filter(Boolean))];
 const mistakes=(Array.isArray(raw.mistakes)?raw.mistakes:[]).slice(-150).flatMap(m=>{
  if(!TRACKS.includes(m?.track)||!bounded(m.pattern,140))return[];
  const date=isoDate(m.lastSeen);
  return [{track:m.track,level:integer(m.level,0,7),pattern:bounded(m.pattern,140),lastSeen:date,
   due:(Array.isArray(m.due)?m.due:[]).slice(0,4).map(isoDate).filter(Boolean)}];
 });
 const exploration=(Array.isArray(raw.exploration)?raw.exploration:[]).slice(-120).flatMap(x=>{
  if(!TRACKS.includes(x?.track)||!bounded(x.sessionId,90)||!isoDate(x.date))return [];
  return [{track:x.track,level:integer(x.level,0,7),sessionId:bounded(x.sessionId,90),
   exerciseId:bounded(x.exerciseId,90),date:x.date,bpm:integer(x.bpm,0,300),
   notes:decimal(x.notes),rhythm:decimal(x.rhythm),stops:integer(x.stops,0,99),
   error:bounded(x.error,120),verified:false,certified:false,kind:"exploration"}];
 });
 const placement={};
 for(const track of TRACKS){
  const s=bounded(raw.placement?.[track]?.status,85);
  placement[track]={level:0,candidate:0,status:["reconhecimento elementar observado","necessita reforço inicial"].includes(s)?s:"não avaliado"};
 }
 return {version:1,levels,seen,mistakes,exploration,placement,lastGeneralReview:isoDate(raw.lastGeneralReview),serverVerified:false};
}
async function load(auth){
 const filter="sightreading_progress_v1?user_id=eq."+encodeURIComponent(auth.id)+"&select=draft,updated_at&limit=1";
 const r=await storage(filter,auth);
 if(!r.ok)return{failed:true,status:r.status};
 const values=await r.json();return{row:values[0]||null};
}
export async function GET(request){
 const auth=await principal(request);if(!auth)return reply({error:"unauthorized"},401);
 const existing=await load(auth);if(existing.failed)return reply({error:"progress_unavailable"},502);
 return reply({userId:auth.id,draft:existing.row?.draft||null,updatedAt:existing.row?.updated_at||null});
}
export async function PUT(request){
 if(!sameOrigin(request))return reply({error:"forbidden_origin"},403);
 const auth=await principal(request);if(!auth)return reply({error:"unauthorized"},401);
 let body;
 try{const text=await request.text();if(text.length>190000)return reply({error:"payload_too_large"},413);body=JSON.parse(text||"{}")}
 catch{return reply({error:"invalid_request"},400)}
 let draft;
 try{draft=sanitize(body.draft)}catch{return reply({error:"invalid_draft"},400)}
 if(JSON.stringify(draft).length>135000)return reply({error:"draft_too_large"},413);
 const original=await load(auth);if(original.failed)return reply({error:"progress_unavailable"},502);
 const expected=body.updatedAt===null?null:typeof body.updatedAt==="string"?body.updatedAt:"missing";
 if(expected==="missing")return reply({error:"revision_required"},400);
 if((original.row?.updated_at||null)!==expected)return reply({error:"revision_conflict",draft:original.row?.draft||null,updatedAt:original.row?.updated_at||null},409);
 const now=new Date().toISOString(),row={user_id:auth.id,draft,schema_version:1,updated_at:now};
 const initial=!original.row;
 const path="sightreading_progress_v1"+(initial?"":"?user_id=eq."+encodeURIComponent(auth.id)+"&updated_at=eq."+encodeURIComponent(expected));
 const result=await storage(path,auth,{
  method:initial?"POST":"PATCH",
  headers:{"content-type":"application/json",Prefer:"return=representation"},
  body:JSON.stringify(row)
 });
 if(!result.ok){
  const details=await result.json().catch(()=>({}));
  if(result.status===409||details.code==="23505")return reply({error:"revision_conflict"},409);
  return reply({error:"progress_write_failed"},result.status===403?403:502);
 }
 const saved=await result.json().catch(()=>[]);
 if(!saved.length)return reply({error:"revision_conflict"},409);
 return reply({ok:true,userId:auth.id,draft,updatedAt:saved[0].updated_at});
}
