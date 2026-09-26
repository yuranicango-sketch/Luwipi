function json(body,status=200){return Response.json(body,{status,headers:{"cache-control":"private, no-store","x-robots-tag":"noindex, nofollow"}})}
function cfg(){return{url:process.env.SUPABASE_URL||"",pub:process.env.SUPABASE_PUBLISHABLE_KEY||"",secret:process.env.SUPABASE_SECRET_KEY||""}}
function adminHeaders(){const c=cfg();if(!c.url||!c.secret)throw new Error("server_not_configured");return{apikey:c.secret,authorization:"Bearer "+c.secret,"content-type":"application/json"}}
async function userFromRequest(request){const c=cfg(),auth=request.headers.get("authorization")||"",token=auth.startsWith("Bearer ")?auth.slice(7):"";if(!token||!c.url||!c.pub)return null;const r=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});return r.ok?r.json():null}
const traps={"video-download":{name:"video_download_probe",weight:3},"export-videos":{name:"video_export_probe",weight:4},"raw-video":{name:"raw_video_probe",weight:4},"admin-backup":{name:"admin_backup_probe",weight:5}};
function trapFor(request){const url=new URL(request.url),key=url.searchParams.get("trap")||url.pathname.split("/").filter(Boolean).pop()||"";return{url,trap:traps[key]||null}}
async function record(request,user,url,trap){const c=cfg(),ua=(request.headers.get("user-agent")||"").slice(0,500),r=await fetch(c.url+"/rest/v1/security_honeypot_events",{method:"POST",headers:adminHeaders(),body:JSON.stringify({user_id:user?.id||null,trap:trap.name,weight:trap.weight,user_agent:ua||null,request_method:request.method.slice(0,12),request_path:url.pathname.slice(0,200)})});if(!r.ok)throw new Error("honeypot_insert_failed")}
async function handle(request){const {url,trap}=trapFor(request);if(!trap)return json({error:"not_found"},404);const user=await userFromRequest(request);try{await record(request,user,url,trap)}catch(error){console.error("Honeypot log failed",error)}return json({error:"not_found"},404)}
export async function GET(request){return handle(request)}
export async function POST(request){return handle(request)}
export async function HEAD(request){return handle(request)}
