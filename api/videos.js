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
async function authenticated(request,product){
  const c=cfg(),auth=request.headers.get("authorization")||"",token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token||!c.url||!c.pub)return null;
  const ur=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});if(!ur.ok)return null;
  const user=await ur.json();if(String(user.email||"").toLowerCase()==="yurdancdan@gmail.com")return {user,permanent:true};
  const er=await fetch(c.url+"/rest/v1/product_entitlements?user_id=eq."+encodeURIComponent(user.id)+"&product=eq."+encodeURIComponent(product)+"&select=status,trial_ends_at,access_until&limit=1",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
  if(!er.ok)return null;const e=(await er.json())[0];if(!e)return null;const now=Date.now();
  const allowed=(e.status==="active"&&(!e.access_until||new Date(e.access_until).getTime()>now))||(e.status==="trial"&&e.trial_ends_at&&new Date(e.trial_ends_at).getTime()>now);
  return allowed?{user,entitlement:e}:null;
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
  const params=new URLSearchParams({dnt:"1",title:"0",byline:"0",portrait:"0",pip:"0",keyboard:"0"});
  if(row.video_hash)params.set("h",row.video_hash);
  return "https://player.vimeo.com/video/"+encodeURIComponent(row.video_id)+"?"+params.toString();
}
export async function GET(request){
  const params=new URL(request.url).searchParams;
  const audience=params.get("audience");
  const mode=audience==="aprenda"?"aprenda":"ensine";
  if(!(await authenticated(request,mode)))return json({error:"payment_required",product:mode},402);
  const requestedTrack=params.get("track")||"";
  const track=["2-4","5-9","10+"].includes(requestedTrack)?requestedTrack:"";
  try{
    const c=cfg();
    const response=await fetch(
      c.url+"/rest/v1/video_lessons?published=eq.true&select=id,title,description,provider,video_id,video_hash,audience,age_track,sort_order&order=sort_order.asc,created_at.asc",
      {headers:adminHeaders()}
    );
    if(!response.ok)throw new Error("video_catalog_unavailable");
    const rows=await response.json();
    const lessons=rows
      .filter(row=>(row.audience==="both"||row.audience===mode)&&row.provider&&row.video_id)
      .filter(row=>mode!=="aprenda"||!track||row.age_track==="all"||row.age_track===track)
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
