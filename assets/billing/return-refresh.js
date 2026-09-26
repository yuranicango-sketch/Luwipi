(function(){
"use strict";
const params=new URLSearchParams(location.search);
if(params.get("billing")!=="return")return;
let attempts=0,stopped=false;
function gate(){try{return typeof LuwipiProductionAccess!=="undefined"?LuwipiProductionAccess:null}catch{return null}}
async function tick(){
  if(stopped)return;
  attempts++;
  const access=gate();
  try{if(access&&typeof access.refresh==="function")await access.refresh(false)}catch(error){console.warn("Billing access refresh failed",error)}
  if(attempts>=6){
    stopped=true;
    params.delete("billing");
    const query=params.toString(),url=location.pathname+(query?"?"+query:"")+location.hash;
    history.replaceState(null,"",url);
    return;
  }
  setTimeout(tick,2500);
}
setTimeout(tick,700);
window.addEventListener("pagehide",()=>{stopped=true},{once:true});
})();