function json(body,status=200){return Response.json(body,{status,headers:{"cache-control":"private, no-store"}})}
function cfg(){return{url:process.env.SUPABASE_URL||"",pub:process.env.SUPABASE_PUBLISHABLE_KEY||"",secret:process.env.SUPABASE_SECRET_KEY||""}}
function adminHeaders(){const c=cfg();if(!c.url||!c.secret)throw new Error("server_not_configured");return{apikey:c.secret,authorization:"Bearer "+c.secret}}
async function adminUser(request){
 const c=cfg(),auth=request.headers.get("authorization")||"",token=auth.startsWith("Bearer ")?auth.slice(7):"";
 if(!token||!c.url||!c.pub)return null;
 const u=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});if(!u.ok)return null;
 const user=await u.json();
 const p=await fetch(c.url+"/rest/v1/profiles?id=eq."+encodeURIComponent(user.id)+"&select=role&limit=1",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
 const profile=p.ok?(await p.json())[0]:null;return profile?.role==="admin"?user:null;
}
export async function GET(request){
 if(!(await adminUser(request)))return json({error:"unauthorized"},401);
 try{
  const c=cfg(),since=new Date(Date.now()-30*86400000).toISOString();
  const r=await fetch(c.url+"/rest/v1/security_honeypot_events?created_at=gte."+encodeURIComponent(since)+"&select=id,user_id,trap,weight,user_agent,request_method,request_path,created_at&order=created_at.desc&limit=100",{headers:adminHeaders()});
  if(!r.ok)throw new Error("events_unavailable");
  const events=await r.json(),scores={};
  for(const e of events){const k=e.user_id||"anonymous";scores[k]=(scores[k]||0)+(Number(e.weight)||1)}
  return json({events,scores,windowDays:30});
 }catch(error){console.error("Security events failed",error);return json({error:"security_events_unavailable"},503)}
}
