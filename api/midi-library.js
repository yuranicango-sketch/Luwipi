function json(body,status=200){return Response.json(body,{status,headers:{"cache-control":"private, no-store"}})}
function cfg(){return{url:process.env.SUPABASE_URL||"",pub:process.env.SUPABASE_PUBLISHABLE_KEY||""}}
function bearer(request){const auth=request.headers.get("authorization")||"";return auth.startsWith("Bearer ")?auth.slice(7):""}
async function userFor(request){
  const c=cfg(),token=bearer(request);if(!c.url||!c.pub||!token)return null;
  try{const r=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token},signal:AbortSignal.timeout(8000)});return r.ok?{user:await r.json(),token}:null}catch{return null}
}
function sameOrigin(request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin}
function authHeaders(token,body=false){const c=cfg(),h={apikey:c.pub,authorization:"Bearer "+token};if(body)h["content-type"]="application/json";return h}
function cleanText(v,max){return String(v??"").trim().slice(0,max)}
function validUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||""))}
async function sha256(bytes){const d=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,"0")).join("")}
function validMidi(bytes){return bytes.length>=14&&String.fromCharCode(...bytes.slice(0,4))==="MThd"}
async function rest(path,token,init={}){const c=cfg();return fetch(c.url+"/rest/v1/"+path,{...init,headers:{...authHeaders(token,Boolean(init.body)),...(init.headers||{})}})}
async function store(path,token,init={}){const c=cfg();return fetch(c.url+"/storage/v1/"+path,{...init,headers:{...authHeaders(token,false),...(init.headers||{})}})}

export async function GET(request){
  const auth=await userFor(request);if(!auth?.user?.id)return json({error:"unauthorized"},401);
  const url=new URL(request.url),id=url.searchParams.get("id"),download=url.searchParams.get("download")==="1";
  if(id){
    if(!validUuid(id))return json({error:"invalid_id"},400);
    const select="id,title,original_name,fingerprint,storage_path,score,ai_review,lead_key,notation_mode,score_mode,ai_model,ai_analyzed_at,created_at,updated_at";
    const r=await rest("midi_library_items?id=eq."+encodeURIComponent(id)+"&select="+encodeURIComponent(select)+"&limit=1",auth.token);
    if(!r.ok)return json({error:"library_unavailable"},502);
    const row=(await r.json())[0];if(!row)return json({error:"not_found"},404);
    if(download){
      const file=await store("object/authenticated/midi-library/"+row.storage_path,auth.token,{cache:"no-store"});
      if(!file.ok)return json({error:"midi_unavailable"},502);
      return new Response(file.body,{status:200,headers:{"content-type":"audio/midi","cache-control":"private, no-store"}});
    }
    return json({item:row});
  }
  const select="id,title,original_name,fingerprint,lead_key,notation_mode,score_mode,ai_model,ai_analyzed_at,created_at,updated_at";
  const r=await rest("midi_library_items?select="+encodeURIComponent(select)+"&order=updated_at.desc&limit=100",auth.token);
  if(!r.ok)return json({error:"library_unavailable"},502);
  return json({items:await r.json()});
}

export async function POST(request){
  if(!sameOrigin(request))return json({error:"forbidden_origin"},403);
  const auth=await userFor(request);if(!auth?.user?.id)return json({error:"unauthorized"},401);
  let form;try{form=await request.formData()}catch{return json({error:"invalid_request"},400)}
  const file=form.get("file"),metaRaw=String(form.get("meta")||"{}");
  if(!(file instanceof File))return json({error:"missing_midi"},400);
  if(file.size<14||file.size>2000000)return json({error:"midi_size"},413);
  let meta;try{meta=JSON.parse(metaRaw)}catch{return json({error:"invalid_meta"},400)}
  const bytes=new Uint8Array(await file.arrayBuffer());if(!validMidi(bytes))return json({error:"invalid_midi"},400);
  const fingerprint=await sha256(bytes),storagePath=auth.user.id+"/"+fingerprint+".mid";
  const upload=await store("object/midi-library/"+storagePath,auth.token,{method:"POST",headers:{"content-type":"audio/midi","x-upsert":"true"},body:bytes});
  if(!upload.ok)return json({error:"storage_write_failed"},502);
  const row={owner_id:auth.user.id,title:cleanText(meta.title||file.name.replace(/\.midi?$/i,"")||"MIDI",160),original_name:cleanText(file.name,220),fingerprint,storage_path:storagePath,score:meta.score&&typeof meta.score==="object"?meta.score:{},ai_review:meta.aiReview&&typeof meta.aiReview==="object"?meta.aiReview:{},lead_key:cleanText(meta.leadKey,40),notation_mode:meta.notationMode==="literal"?"literal":"organized",score_mode:meta.scoreMode==="original"?"original":"ai",ai_model:cleanText(meta.aiModel,80),ai_analyzed_at:meta.aiReview&&Object.keys(meta.aiReview).length?new Date().toISOString():null,updated_at:new Date().toISOString()};
  const saved=await rest("midi_library_items?on_conflict=owner_id,fingerprint",auth.token,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(row)});
  if(!saved.ok)return json({error:"library_write_failed"},502);
  const rows=await saved.json().catch(()=>[]);return json({ok:true,item:rows[0]||{fingerprint}});
}

export async function PATCH(request){
  if(!sameOrigin(request))return json({error:"forbidden_origin"},403);
  const auth=await userFor(request);if(!auth?.user?.id)return json({error:"unauthorized"},401);
  let body;try{body=await request.json()}catch{return json({error:"invalid_request"},400)}
  if(!validUuid(body.id))return json({error:"invalid_id"},400);
  const patch={updated_at:new Date().toISOString()};
  if(body.title!==undefined)patch.title=cleanText(body.title,160);
  if(body.leadKey!==undefined)patch.lead_key=cleanText(body.leadKey,40);
  if(body.notationMode!==undefined)patch.notation_mode=body.notationMode==="literal"?"literal":"organized";
  if(body.scoreMode!==undefined)patch.score_mode=body.scoreMode==="original"?"original":"ai";
  if(body.aiReview&&typeof body.aiReview==="object"){patch.ai_review=body.aiReview;patch.ai_model=cleanText(body.aiModel||"gpt-6-luna",80);patch.ai_analyzed_at=new Date().toISOString()}
  const r=await rest("midi_library_items?id=eq."+encodeURIComponent(body.id),auth.token,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(patch)});
  if(!r.ok)return json({error:"library_update_failed"},502);
  const rows=await r.json().catch(()=>[]);return json({ok:true,item:rows[0]||null});
}
