function json(body,status=200){
  return Response.json(body,{status,headers:{"cache-control":"private, no-store","x-robots-tag":"noindex, nofollow"}});
}
function cfg(){
  return {
    url:process.env.SUPABASE_URL||"",
    pub:process.env.SUPABASE_PUBLISHABLE_KEY||"",
    secret:process.env.SUPABASE_SECRET_KEY||""
  };
}
function adminHeaders(){
  const c=cfg();
  if(!c.url||!c.secret)throw new Error("server_not_configured");
  return {apikey:c.secret,authorization:"Bearer "+c.secret,"content-type":"application/json"};
}
async function userFromRequest(request){
  const c=cfg(),auth=request.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token||!c.url||!c.pub)return null;
  const response=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
  return response.ok?response.json():null;
}
async function record(request,user,trap){
  const c=cfg();
  const ua=(request.headers.get("user-agent")||"").slice(0,500);
  await fetch(c.url+"/rest/v1/security_honeypot_events",{
    method:"POST",headers:adminHeaders(),
    body:JSON.stringify({user_id:user?.id||null,trap,user_agent:ua||null})
  });
}
export async function GET(request){
  const user=await userFromRequest(request);
  if(user){try{await record(request,user,"video_download_probe")}catch(error){console.error("Honeypot log failed",error)}}
  return json({error:"not_found"},404);
}
export async function POST(request){return GET(request)}
