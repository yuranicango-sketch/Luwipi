function json(body,status=200){
  return Response.json(body,{status,headers:{"cache-control":"private, no-store"}});
}
function cfg(){
  return {
    url:process.env.SUPABASE_URL||"",
    pub:process.env.SUPABASE_PUBLISHABLE_KEY||"",
    secret:process.env.SUPABASE_SECRET_KEY||""
  };
}
async function userFromRequest(request){
  const c=cfg();
  const auth=request.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token||!c.url||!c.pub)return null;
  const response=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
  if(!response.ok)return null;
  return {token,user:await response.json()};
}
async function requireAdmin(request){
  const c=cfg();
  const auth=await userFromRequest(request);
  if(!auth)return null;
  const response=await fetch(
    c.url+"/rest/v1/profiles?id=eq."+encodeURIComponent(auth.user.id)+"&select=role&limit=1",
    {headers:{apikey:c.pub,authorization:"Bearer "+auth.token}}
  );
  if(!response.ok)return null;
  const profile=(await response.json())[0];
  return profile&&profile.role==="admin"?auth:null;
}
function adminHeaders(extra={}){
  const c=cfg();
  if(!c.url||!c.secret)throw new Error("server_not_configured");
  return {...extra,apikey:c.secret,authorization:"Bearer "+c.secret};
}
function cleanText(value,max){
  return String(value||"").trim().slice(0,max);
}
function parseVideoUrl(input){
  let url;
  try{url=new URL(String(input||"").trim())}catch{return null}
  const host=url.hostname.toLowerCase().replace(/^www\./,"");
  if(host==="youtu.be"){
    const id=url.pathname.split("/").filter(Boolean)[0]||"";
    return /^[A-Za-z0-9_-]{6,20}$/.test(id)?{provider:"youtube",video_id:id,video_hash:null}:null;
  }
  if(host==="youtube.com"||host==="m.youtube.com"||host==="youtube-nocookie.com"){
    let id=url.searchParams.get("v")||"";
    const parts=url.pathname.split("/").filter(Boolean);
    const marker=parts[0];
    if(!id&&["embed","shorts","live"].includes(marker))id=parts[1]||"";
    return /^[A-Za-z0-9_-]{6,20}$/.test(id)?{provider:"youtube",video_id:id,video_hash:null}:null;
  }
  if(host==="vimeo.com"||host==="player.vimeo.com"){
    const parts=url.pathname.split("/").filter(Boolean);
    let id="",hash=url.searchParams.get("h")||null;
    if(host==="player.vimeo.com"&&parts[0]==="video")id=parts[1]||"";
    else{
      id=parts.find(part=>/^\d{5,14}$/.test(part))||"";
      const idIndex=parts.indexOf(id);
      if(!hash&&idIndex>=0&&parts[idIndex+1]&&/^[A-Za-z0-9]+$/.test(parts[idIndex+1]))hash=parts[idIndex+1];
    }
    if(!/^\d{5,14}$/.test(id))return null;
    return {provider:"vimeo",video_id:id,video_hash:hash?cleanText(hash,128):null};
  }
  return null;
}
function normalizeBody(body,parsed){
  const audience=["both","ensine","aprenda"].includes(body.audience)?body.audience:"both";
  const ageTrack=["all","criancas","adolescentes"].includes(body.ageTrack)?body.ageTrack:"all";
  const sortOrder=Number.isFinite(Number(body.sortOrder))?Math.max(-9999,Math.min(9999,Math.trunc(Number(body.sortOrder)))):0;
  return {
    title:cleanText(body.title,120),
    description:cleanText(body.description,300),
    provider:parsed.provider,
    video_id:parsed.video_id,
    video_hash:parsed.video_hash,
    audience,
    age_track:ageTrack,
    sort_order:sortOrder,
    published:Boolean(body.published)
  };
}
export async function GET(request){
  if(!(await requireAdmin(request)))return json({error:"not_found"},404);
  try{
    const c=cfg();
    const response=await fetch(
      c.url+"/rest/v1/video_lessons?select=id,title,description,provider,video_id,video_hash,audience,age_track,sort_order,published,created_at,updated_at&order=sort_order.asc,created_at.asc",
      {headers:adminHeaders()}
    );
    if(!response.ok)throw new Error("read_failed");
    return json({lessons:await response.json()});
  }catch(error){
    console.error(error);
    return json({error:"video_admin_unavailable"},503);
  }
}
export async function POST(request){
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return json({error:"not_found"},404);
  if(!(await requireAdmin(request)))return json({error:"not_found"},404);
  let body;
  try{body=await request.json()}catch{return json({error:"invalid_request"},400)}
  const parsed=parseVideoUrl(body.url);
  const title=cleanText(body.title,120);
  if(!parsed||!title)return json({error:"invalid_video"},400);
  const row=normalizeBody(body,parsed);
  try{
    const c=cfg();
    const response=await fetch(c.url+"/rest/v1/video_lessons",{
      method:"POST",
      headers:adminHeaders({"content-type":"application/json",Prefer:"return=representation"}),
      body:JSON.stringify(row)
    });
    if(!response.ok)throw new Error("create_failed");
    return json({lesson:(await response.json())[0]},201);
  }catch(error){
    console.error(error);
    return json({error:"video_create_failed"},503);
  }
}
export async function PATCH(request){
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return json({error:"not_found"},404);
  if(!(await requireAdmin(request)))return json({error:"not_found"},404);
  let body;
  try{body=await request.json()}catch{return json({error:"invalid_request"},400)}
  const id=String(body.id||"");
  if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:"invalid_request"},400);
  const patch={};
  if("title" in body)patch.title=cleanText(body.title,120);
  if("description" in body)patch.description=cleanText(body.description,300);
  if("audience" in body&&["both","ensine","aprenda"].includes(body.audience))patch.audience=body.audience;
  if("ageTrack" in body&&["all","criancas","adolescentes"].includes(body.ageTrack))patch.age_track=body.ageTrack;
  if("sortOrder" in body&&Number.isFinite(Number(body.sortOrder)))patch.sort_order=Math.max(-9999,Math.min(9999,Math.trunc(Number(body.sortOrder))));
  if("published" in body)patch.published=Boolean(body.published);
  if("url" in body){
    const parsed=parseVideoUrl(body.url);
    if(!parsed)return json({error:"invalid_video"},400);
    patch.provider=parsed.provider;patch.video_id=parsed.video_id;patch.video_hash=parsed.video_hash;
  }
  if(!Object.keys(patch).length)return json({error:"nothing_to_update"},400);
  try{
    const c=cfg();
    const response=await fetch(c.url+"/rest/v1/video_lessons?id=eq."+encodeURIComponent(id),{
      method:"PATCH",
      headers:adminHeaders({"content-type":"application/json",Prefer:"return=representation"}),
      body:JSON.stringify(patch)
    });
    if(!response.ok)throw new Error("update_failed");
    const rows=await response.json();
    return json({lesson:rows[0]||null});
  }catch(error){
    console.error(error);
    return json({error:"video_update_failed"},503);
  }
}
