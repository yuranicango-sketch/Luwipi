/* Native conversion stays behind Luwipi's authenticated API. */
(()=>{
'use strict';
async function prepare(binary,key,signal){
 const gate=typeof LuwipiProductionAccess!=='undefined'?LuwipiProductionAccess:null;
 const token=await gate?.getAccessToken?.();
 if(!token)return null;
 const timeout=AbortSignal.timeout(75000),combined=AbortSignal.any([signal,timeout]);
 const response=await fetch('/api/midi-score',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'audio/midi'},body:window.LuwipiMidiNotation.isolate(binary,key),signal:combined,cache:'no-store'});
 const result=await response.json();
 if(!response.ok)throw Error('A conversão avançada não ficou disponível. A partitura local continua pronta.');
 if(result.engine!=='MuseScore'||typeof result.xml!=='string'||!result.xml.includes('<score-partwise'))throw Error('A conversão devolveu uma partitura inválida.');
 return result;
}
window.LuwipiMuseScore=Object.freeze({prepare});
})();
