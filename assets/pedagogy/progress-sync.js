(()=>{
"use strict";
const BASE="/api/sightreading-progress";
let revision=null,active=false,activeUser=null,loadTicket=0,queue=Promise.resolve(),syncText="Neste dispositivo";
function subject(jwt){
 try{const part=String(jwt).split(".")[1]||"";const data=part.replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(data+"=".repeat((4-data.length%4)%4))).sub||null}catch{return null}
}
const setStatus=t=>{syncText=t;window.dispatchEvent(new CustomEvent("luwipi:progress-sync",{detail:{status:t}}))};
function tokenSource(){try{return typeof LuwipiProductionAccess!=="undefined"?LuwipiProductionAccess:null}catch{return null}}
async function token(){
 if(typeof window.LuwipiGetAccessToken==="function")return await window.LuwipiGetAccessToken();
 const gate=tokenSource();return gate?.getAccessToken?await gate.getAccessToken():null;
}
async function api(method,body){
 const t=await token();
 if(!t)return null;
 if(method==="PUT"&&(!activeUser||subject(t)!==activeUser))throw Error("session_changed");
 const response=await fetch(BASE,{method,headers:{"authorization":"Bearer "+t,...(body?{"content-type":"application/json"}:{})},body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const data=await response.json().catch(()=>({}));
 if(!response.ok){const e=new Error(data.error||"sync_unavailable");e.status=response.status;e.conflict=data;throw e}
 return data;
}
const clone=p=>JSON.parse(JSON.stringify(p));
function merge(remote,local){
 if(!remote)return clone(local);
 const result=clone(remote);
 for(const t of "ABCDEFGHIJ"){
  const a=result.levels?.[t],b=local?.levels?.[t];
  if(!a||!b)continue;
  const indexed=new Map((a.sessions||[]).map(s=>[s.sessionId,s]));
  for(const s of b.sessions||[])if(!indexed.has(s.sessionId))indexed.set(s.sessionId,s);
  a.sessions=[...indexed.values()].slice(-60);
  a.level=Math.max(Number(a.level)||0,Number(b.level)||0);
  a.certified=false;a.streak=[];
 }
 result.seen=[...new Set([...(remote.seen||[]),...(local.seen||[])])].slice(-2500);
 const unique=new Map();
 for(const m of [...(remote.mistakes||[]),...(local.mistakes||[])]){
  const k=[m.track,m.level,m.pattern].join("|");
  const older=unique.get(k);
  if(!older||String(m.lastSeen)>=String(older.lastSeen))unique.set(k,m);
 }
 result.mistakes=[...unique.values()].slice(-150);
 result.placement=remote.placement||local.placement;
 result.serverVerified=false;
 return result;
}
function hasProgress(p){
 return p?.seen?.length>0||p?.mistakes?.length>0||
  Object.values(p?.levels||{}).some(v=>(v.sessions||[]).length>0||v.level>0);
}
async function load(localProfile){
 const ticket=++loadTicket;active=false;activeUser=null;
 let r;
 try{r=await api("GET");}catch{active=false;setStatus("Offline · guardado neste dispositivo");return null}
 if(ticket!==loadTicket)return null;
 if(!r){active=false;setStatus("Sem conta · guardado nesta sessão");return null}
 activeUser=String(r.userId||"");
 if(!activeUser){setStatus("Identidade da conta indisponível");return null}
 active=true;revision=r.updatedAt||null;
 const merged=merge(r.draft,localProfile);
 if(!r.draft&&hasProgress(localProfile)){
  // First connection migrates the local draft without trusting client certification.
  try{const saved=await api("PUT",{draft:merged,updatedAt:null});if(ticket!==loadTicket)return null;revision=saved.updatedAt;setStatus("Progresso sincronizado");return saved.draft}
  catch{setStatus("Ligação disponível · importação pendente");return merged}
 }
 if(r.draft&&JSON.stringify(merged)!==JSON.stringify(r.draft)){
  try{const saved=await api("PUT",{draft:merged,updatedAt:revision});if(ticket!==loadTicket)return null;revision=saved.updatedAt;setStatus("Progresso sincronizado");return saved.draft}
  catch{setStatus("A sincronização está pendente");return merged}
 }
 setStatus("Progresso sincronizado");return r.draft||merged;
}
function save(draft){
 const snapshot=clone(draft),ownerAtSave=activeUser;
 queue=queue.catch(()=>{}).then(async()=>{
  if(!active||!ownerAtSave||ownerAtSave!==activeUser)return;
  try{
   let saved;
   try{saved=await api("PUT",{draft:snapshot,updatedAt:revision});}
   catch(error){
    if(error.status!==409)throw error;
    if(ownerAtSave!==activeUser)throw Error("account_changed");
    const latest=await api("GET");
    if(!latest||latest.userId!==ownerAtSave||ownerAtSave!==activeUser)throw Error("account_changed");
    const combined=merge(latest.draft,snapshot);
    saved=await api("PUT",{draft:combined,updatedAt:latest.updatedAt||null});
    // Notify the UI to adopt the merged remote history rather than overwriting it next time.
    window.dispatchEvent(new CustomEvent("luwipi:progress-merged",{detail:{draft:saved.draft}}));
   }
   if(!saved||ownerAtSave!==activeUser)return;
   revision=saved.updatedAt;
   setStatus("Progresso sincronizado");
  }catch{setStatus("Sem ligação · alterações guardadas localmente")}
 });
 return queue;
}
function reset(){
 ++loadTicket;active=false;activeUser=null;revision=null;
 setStatus("Sem conta · progresso nesta sessão");
}
window.LuwipiProgressSync=Object.freeze({load,save,reset,mergeDrafts:merge,status:()=>syncText});
})();
