function json(body,status=200){
  return Response.json(body,{status,headers:{"cache-control":"private, no-store"}});
}
function cfg(){
  return{
    url:process.env.SUPABASE_URL||"",
    pub:process.env.SUPABASE_PUBLISHABLE_KEY||""
  };
}
function bearer(request){
  const auth=request.headers.get("authorization")||"";
  return auth.startsWith("Bearer ")?auth.slice(7):"";
}
async function userFor(request){
  const c=cfg(),token=bearer(request);
  if(!c.url||!c.pub||!token)return null;
  const r=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
  return r.ok?{user:await r.json(),token}:null;
}
async function rest(path,token,init={}){
  const c=cfg();
  const headers=new Headers(init.headers||{});
  headers.set("apikey",c.pub);
  headers.set("authorization","Bearer "+token);
  if(init.body)headers.set("content-type","application/json");
  return fetch(c.url+"/rest/v1/"+path,{...init,headers});
}
async function roleFor(token,userId){
  const r=await rest("profiles?id=eq."+encodeURIComponent(userId)+"&select=role&limit=1",token);
  if(!r.ok)return"teacher";
  const rows=await r.json().catch(()=>[]);
  return rows[0]?.role==="admin"?"admin":"teacher";
}
function sameOrigin(request){
  const origin=request.headers.get("origin");
  return !origin||origin===new URL(request.url).origin;
}
function validUuid(value){
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||""));
}
function text(value,max){return String(value??"").trim().slice(0,max)}
function cleanFidelity(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return{};
  const out={};
  for(const key of ["rating","score","notePreservation","quantizationConfidence","meanQuantizationError","warnings","issues","checkedAt"]){
    const v=value[key];
    if(["rating"].includes(key))out[key]=text(v,24);
    else if(["score","notePreservation","quantizationConfidence","meanQuantizationError"].includes(key)&&Number.isFinite(Number(v)))out[key]=Number(v);
    else if(["warnings","issues"].includes(key)&&Array.isArray(v))out[key]=v.slice(0,20).map(x=>text(x,220));
    else if(key==="checkedAt")out[key]=text(v,60);
  }
  return out;
}
function validateScore(score){
  if(!score||typeof score!=="object"||Array.isArray(score))return"invalid_score";
  const events=Array.isArray(score.events)?score.events:null;
  if(!events||events.length<1||events.length>30000)return"invalid_score_events";
  if(Array.isArray(score.performanceEvents)&&score.performanceEvents.length>30000)return"invalid_performance_events";
  for(const event of events.slice(0,30000)){
    const midi=Number(event?.midi),start=Number(event?.startBeat),duration=Number(event?.durationBeat);
    if(!Number.isFinite(midi)||midi<0||midi>127||!Number.isFinite(start)||start<0||!Number.isFinite(duration)||duration<=0)return"invalid_score_event";
  }
  return"";
}
async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function fingerprint(score,kind){
  const material=JSON.stringify({
    kind,
    source:score.source||"",
    title:score.title||"",
    tempoBpm:score.tempoBpm||120,
    meter:score.meter||[4,4],
    keyFifths:score.keyFifths||0,
    events:score.events,
    performanceEvents:score.performanceEvents||[]
  });
  return sha256(material);
}
async function parseBody(request,max=3900000){
  const raw=await request.text();
  if(raw.length>max)throw Object.assign(new Error("payload_too_large"),{status:413});
  try{return JSON.parse(raw||"{}")}catch{throw Object.assign(new Error("invalid_request"),{status:400})}
}
async function visibleList(token,kind){
  const filter=kind==="music"||kind==="exercise"?"&kind=eq."+kind:"";
  const select="id,owner_id,kind,visibility,title,source_name,source_type,fingerprint,fidelity,created_at,updated_at,published_at";
  const r=await rest("reading_library_scores?select="+encodeURIComponent(select)+filter+"&order=updated_at.desc&limit=250",token);
  if(!r.ok)return{error:r,status:r.status};
  return{rows:await r.json()};
}
async function fullRow(token,id){
  const select="id,owner_id,kind,visibility,title,source_name,source_type,fingerprint,score,fidelity,created_at,updated_at,published_at";
  const r=await rest("reading_library_scores?id=eq."+encodeURIComponent(id)+"&select="+encodeURIComponent(select)+"&limit=1",token);
  if(!r.ok)return{error:r,status:r.status};
  const rows=await r.json();
  return{row:rows[0]||null};
}

export async function GET(request){
  const auth=await userFor(request);
  if(!auth?.user?.id)return json({error:"unauthorized"},401);
  const url=new URL(request.url);
  if(url.searchParams.get("meta")==="1"){
    const role=await roleFor(auth.token,auth.user.id);
    return json({role,canPublishGlobal:role==="admin"});
  }
  const id=url.searchParams.get("id");
  if(id){
    if(!validUuid(id))return json({error:"invalid_id"},400);
    const result=await fullRow(auth.token,id);
    if(result.error)return json({error:result.status===403?"forbidden":"library_unavailable"},result.status===403?403:502);
    if(!result.row)return json({error:"not_found"},404);
    return json({item:{...result.row,editable:result.row.owner_id===auth.user.id}});
  }
  const result=await visibleList(auth.token,url.searchParams.get("kind"));
  if(result.error)return json({error:result.status===403?"forbidden":"library_unavailable"},result.status===403?403:502);
  return json({items:result.rows.map(row=>({...row,editable:row.owner_id===auth.user.id}))});
}

export async function POST(request){
  if(!sameOrigin(request))return json({error:"forbidden_origin"},403);
  const auth=await userFor(request);
  if(!auth?.user?.id)return json({error:"unauthorized"},401);
  let body;
  try{body=await parseBody(request)}catch(error){return json({error:error.message},error.status||400)}
  const kind=body.kind==="exercise"?"exercise":body.kind==="music"?"music":"";
  const visibility=body.visibility==="global"?"global":body.visibility==="personal"?"personal":"";
  if(!kind||!visibility)return json({error:"invalid_request"},400);
  const score=body.score;
  const scoreError=validateScore(score);
  if(scoreError)return json({error:scoreError},400);
  const role=await roleFor(auth.token,auth.user.id);
  if(visibility==="global"&&role!=="admin")return json({error:"admin_required"},403);
  const title=text(body.title||score.title||"Partitura",160);
  if(!title)return json({error:"invalid_title"},400);
  const sourceType=["midi","musicxml","structured"].includes(score.source)?score.source:"structured";
  const fp=await fingerprint(score,kind);
  const now=new Date().toISOString();
  const row={
    owner_id:auth.user.id,
    kind,
    visibility,
    title,
    source_name:text(body.sourceName||"",220),
    source_type:sourceType,
    fingerprint:fp,
    score,
    fidelity:cleanFidelity(body.fidelity),
    updated_at:now,
    published_at:visibility==="global"?now:null
  };
  const path="reading_library_scores?on_conflict=owner_id,kind,fingerprint";
  const r=await rest(path,auth.token,{
    method:"POST",
    headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify(row)
  });
  if(!r.ok){
    const detail=await r.json().catch(()=>({}));
    const code=detail?.code==="42501"?"forbidden":"library_write_failed";
    return json({error:code},detail?.code==="42501"?403:502);
  }
  return json({ok:true,fingerprint:fp,visibility,kind});
}

export async function DELETE(request){
  if(!sameOrigin(request))return json({error:"forbidden_origin"},403);
  const auth=await userFor(request);
  if(!auth?.user?.id)return json({error:"unauthorized"},401);
  const url=new URL(request.url);
  const id=url.searchParams.get("id");
  if(!validUuid(id))return json({error:"invalid_id"},400);
  const r=await rest("reading_library_scores?id=eq."+encodeURIComponent(id)+"&owner_id=eq."+encodeURIComponent(auth.user.id),auth.token,{
    method:"DELETE",
    headers:{Prefer:"return=minimal"}
  });
  if(!r.ok)return json({error:r.status===403?"forbidden":"library_delete_failed"},r.status===403?403:502);
  return json({ok:true});
}
