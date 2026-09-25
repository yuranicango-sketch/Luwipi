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
async function authenticated(request){
  const c=cfg();
  const auth=request.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token||!c.url||!c.pub)return null;
  const userResponse=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
  if(!userResponse.ok)return null;
  const user=await userResponse.json();
  const profileResponse=await fetch(
    c.url+"/rest/v1/profiles?id=eq."+encodeURIComponent(user.id)+"&select=role,access_status,trial_ends_at,access_until&limit=1",
    {headers:{apikey:c.pub,authorization:"Bearer "+token}}
  );
  if(!profileResponse.ok)return null;
  const profile=(await profileResponse.json())[0];
  if(!profile)return null;
  const now=Date.now();
  const allowed=
    profile.role==="admin"||
    (profile.access_status==="active"&&(!profile.access_until||new Date(profile.access_until).getTime()>now))||
    (profile.access_status==="trial"&&profile.trial_ends_at&&new Date(profile.trial_ends_at).getTime()>now);
  return allowed?{user,profile}:null;
}
function adminHeaders(){
  const c=cfg();
  if(!c.url||!c.secret)throw new Error("server_not_configured");
  return {apikey:c.secret,authorization:"Bearer "+c.secret};
}
function embedUrl(row){
  if(row.provider==="youtube"){
    return "https://www.youtube-nocookie.com/embed/"+encodeURIComponent(row.video_id)+"?rel=0";
  }
  const params=new URLSearchParams({dnt:"1",title:"0",byline:"0",portrait:"0"});
  if(row.video_hash)params.set("h",row.video_hash);
  return "https://player.vimeo.com/video/"+encodeURIComponent(row.video_id)+"?"+params.toString();
}
export async function GET(request){
  if(!(await authenticated(request)))return json({error:"unauthorized"},401);
  const audience=new URL(request.url).searchParams.get("audience");
  const mode=audience==="aprenda"?"aprenda":"ensine";
  try{
    const c=cfg();
    const response=await fetch(
      c.url+"/rest/v1/video_lessons?published=eq.true&select=id,title,description,provider,video_id,video_hash,audience,age_track,sort_order&order=sort_order.asc,created_at.asc",
      {headers:adminHeaders()}
    );
    if(!response.ok)throw new Error("video_catalog_unavailable");
    const rows=await response.json();
    const lessons=rows
      .filter(row=>row.audience==="both"||row.audience===mode)
      .map(row=>({
        id:row.id,
        title:row.title,
        description:row.description||"",
        provider:row.provider,
        audience:row.audience,
        ageTrack:row.age_track,
        embedUrl:embedUrl(row)
      }));
    return json({lessons});
  }catch(error){
    console.error("Video catalog failed",error);
    return json({error:"video_catalog_unavailable"},503);
  }
}
