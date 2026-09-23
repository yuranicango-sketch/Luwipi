"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { noteName, noteOctave, noteRate, type KidsSong } from "@/lib/music-library";
import { playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";
import { MusicScore } from "@/components/music-score";

type Key={note:string;color:string;rate:number;octave?:number};
type Mode="site"|"piano";
type Theme="candy"|"star"|"paw"|"bell"|"water"|"music";

const KEYS:Key[]=[
  {note:"Dó",color:"#ff5f86",rate:1},
  {note:"Ré",color:"#ffbf3f",rate:Math.pow(2,2/12)},
  {note:"Mi",color:"#64c96b",rate:Math.pow(2,4/12)},
  {note:"Fá",color:"#4fc8c1",rate:Math.pow(2,5/12)},
  {note:"Sol",color:"#4b9df8",rate:Math.pow(2,7/12)},
  {note:"Lá",color:"#8f74eb",rate:Math.pow(2,9/12)},
  {note:"Si",color:"#d264d7",rate:Math.pow(2,11/12)},
];

const SPECIAL:Record<string,{theme:Theme;scene:string;finish:string;goal:string}>={
  "passeio-das-cores":{theme:"candy",scene:"garden",finish:"As cores chegaram à festa!",goal:"🎉"},
  estrelinha:{theme:"star",scene:"night",finish:"A estrelinha encontrou o céu!",goal:"🌌"},
  "maria-cordeirinho":{theme:"paw",scene:"field",finish:"Nino encontrou Maria!",goal:"🏫"},
  "irmao-joao":{theme:"bell",scene:"village",finish:"Os sinos acordaram a vila!",goal:"🔔"},
  "rema-rema-barco":{theme:"water",scene:"river",finish:"O barquinho chegou à margem!",goal:"🏝️"},
};

const POSITION:Record<string,string>={
  "Dó":"Procure um grupo de 2 teclas pretas. Dó é a tecla branca imediatamente à esquerda.",
  "Ré":"Procure um grupo de 2 teclas pretas. Ré é a tecla branca entre as duas.",
  "Mi":"Procure um grupo de 2 teclas pretas. Mi é a tecla branca imediatamente à direita.",
  "Fá":"Procure um grupo de 3 teclas pretas. Fá é a tecla branca imediatamente à esquerda.",
  "Sol":"No grupo de 3 pretas, Sol fica entre a 1ª e a 2ª tecla preta.",
  "Lá":"No grupo de 3 pretas, Lá fica entre a 2ª e a 3ª tecla preta.",
  "Si":"Procure um grupo de 3 teclas pretas. Si é a tecla branca imediatamente à direita.",
};

function sound(key:Key){void playPianoRate(key.rate,{gain:.62,duration:.72});}
function samePitch(key:Key,note:string){return key.note===noteName(note)&&(key.octave??4)===noteOctave(note);}
const wait=(ms:number)=>new Promise<void>(resolve=>window.setTimeout(resolve,ms));

function NoteToken({theme,color,note,active,done}:{theme:Theme;color:string;note:string;active:boolean;done:boolean}){
  return <div className={`token ${active?"active":""} ${done?"done":""}`}>
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {theme==="candy"&&<><path d="M15 23 3 16l3 16-3 16 12-7M49 23l12-7-3 16 3 16-12-7" fill={color} opacity=".55"/><circle cx="32" cy="32" r="19" fill={color}/></>}
      {theme==="star"&&<path d="m32 5 8 16 17 2-12 12 3 17-16-8-16 8 3-17L7 23l17-2Z" fill={color}/>}
      {theme==="paw"&&<><ellipse cx="32" cy="40" rx="14" ry="11" fill={color}/><circle cx="16" cy="28" r="6" fill={color}/><circle cx="28" cy="20" r="6" fill={color}/><circle cx="42" cy="22" r="6" fill={color}/></>}
      {theme==="bell"&&<><path d="M16 43h32c-5-7-7-12-7-20 0-7-4-12-9-12s-9 5-9 12c0 8-2 13-7 20Z" fill={color}/><circle cx="32" cy="48" r="5" fill={color}/></>}
      {theme==="water"&&<path d="M32 5C24 19 14 30 14 41a18 18 0 0 0 36 0C50 30 40 19 32 5Z" fill={color}/>}
      {theme==="music"&&<><circle cx="24" cy="45" r="9" fill={color}/><circle cx="45" cy="39" r="9" fill={color}/><path d="M32 44V15l21-5v29" fill="none" stroke={color} strokeWidth="6"/></>}
    </svg><b>{note}</b>
  </div>;
}

function Scene({song,progress}:{song:KidsSong;progress:number}){
  const meta=SPECIAL[song.id]??({theme:"music" as Theme,scene:"garden",finish:"História concluída!",goal:"🏁"} as const);
  return <div className={`scene ${meta.scene}`}><div className="path"/><span className="traveler" style={{left:`${5+progress*.82}%`}}>{song.emoji}</span><span className="goal">{meta.goal}</span></div>;
}

function buildSections(song:KidsSong){return song.sections?.length?song.sections:[{label:"Música",notes:song.sequence??[]}];}
function sectionForStep(sections:{label:string;notes:string[]}[],step:number){
  let cursor=0;
  for(let index=0;index<sections.length;index+=1){
    const section=sections[index],end=cursor+section.notes.length;
    if(step<end)return{index,start:cursor,end,section};
    cursor=end;
  }
  const lastIndex=Math.max(0,sections.length-1),last=sections[lastIndex]??{label:"Música",notes:[]};
  return{index:lastIndex,start:Math.max(0,cursor-last.notes.length),end:cursor,section:last};
}

function PhysicalGuide({notes,firstNote,age,onDone}:{notes:string[];firstNote:string;age:KidsSong["age"];onDone:()=>void}){
  return <section className="physicalGuide">
    <div className="physicalHead"><span>🎹 PIANO FÍSICO</span><strong>Toque esta parte no seu piano</strong></div>
    <div className="physicalSteps">
      <div><b>1</b><p><strong>Encontre a primeira nota: {firstNote}</strong><br/>{POSITION[firstNote]??"Localize a primeira nota indicada."}</p></div>
      <div><b>2</b><p><strong>Prepare a mão</strong><br/>{age==="2-4"?"Use a mão ou dedo que estiver mais confortável. Não force dedilhado.":"Comece com a mão direita, a menos que o professor tenha indicado outra mão."}</p></div>
      <div><b>3</b><p><strong>Toque a frase nesta ordem</strong><br/><span className="sequence">{notes.join("  →  ")}</span></p></div>
      <div><b>4</b><p><strong>Repita uma vez</strong><br/>Primeiro devagar. Depois repita tentando não parar no meio da frase.</p></div>
    </div>
    <button className="duo physicalDone" type="button" onClick={onDone}>TOQUEI ESTA PARTE · PRÓXIMA</button>
    <small className="physicalNote">O Luwipi não precisa ouvir o piano. O professor ou aluno confirma quando a frase foi tocada.</small>
  </section>;
}

export function SongPractice({song}:{song:KidsSong}){
  const sections=useMemo(()=>buildSections(song),[song]);
  const seq=useMemo(()=>sections.flatMap(s=>s.notes),[sections]);
  const piano=useMemo(()=>{
    const colors=new Map(song.colors?.map(item=>[item.note,item.color])??[]);
    const octaves=song.pianoOctaves??1;
    return Array.from({length:octaves},(_,index)=>KEYS.map(key=>({...key,octave:index+4,rate:key.rate*Math.pow(2,index),color:colors.get(key.note)??key.color}))).flat();
  },[song.colors,song.pianoOctaves]);
  const pianoColors=useMemo(()=>new Map(song.colors?.map(item=>[item.note,item.color])??[]),[song.colors]);
  const meta=SPECIAL[song.id]??({theme:"music" as Theme,scene:"garden",finish:"História concluída!",goal:"🏁"} as const);

  const[started,setStarted]=useState(false);
  const[mode,setMode]=useState<Mode>("site");
  const[step,setStep]=useState(0);
  const[wrong,setWrong]=useState<string|null>(null);
  const[listening,setListening]=useState(false);
  const token=useRef(0);

  const done=step>=seq.length;
  const expected=done?undefined:seq[step];
  const progress=seq.length?Math.min(100,Math.round((step/seq.length)*100)):0;
  const currentSection=sectionForStep(sections,step);
  const visibleNotes=currentSection.section.notes;
  const localStep=Math.max(0,step-currentSection.start);

  function start(selected:Mode){void preloadPianoSamples();setMode(selected);setStarted(true);}
  function reset(){token.current+=1;setStep(0);setWrong(null);setListening(false);setStarted(false);}
  function press(key:LuwipiPianoKey){
    if(mode!=="site"||!expected)return;
    if(!samePitch(key,expected)){setWrong(`${key.note}${key.octave??4}`);window.setTimeout(()=>setWrong(null),350);return;}
    setStep(value=>value+1);
  }
  async function listen(){
    if(listening)return;
    const id=++token.current;setListening(true);
    for(const note of visibleNotes){
      if(token.current!==id)return;
      const key=piano.find(item=>samePitch(item,note));if(key)sound(key);
      await wait(470);
    }
    if(token.current===id)setListening(false);
  }

  if(!started)return <section className="card intro">
    <div className="heroEmoji">{song.emoji}</div><small>Historinha</small><h1>{song.title}</h1><p>{song.story}</p>
    <h2>Como vai praticar?</h2>
    <div className="startModes">
      <button type="button" onClick={()=>start("site")}><b>💻 No Luwipi</b><span>Toque usando o piano que aparece na tela.</span></button>
      <button type="button" onClick={()=>start("piano")}><b>🎹 Piano físico</b><span>Use o Luwipi como guia enquanto toca no piano real.</span></button>
    </div>
    <style jsx>{css}</style>
  </section>;

  if(done)return <section className="card intro"><div className="heroEmoji">🌟</div><h1>Muito bem!</h1><p>{meta.finish}</p><button className="duo" type="button" onClick={reset}>TOCAR DE NOVO</button><Link className="homework" href={`/professor/tarefas?song=${song.id}`}>Enviar como tarefa</Link><style jsx>{css}</style></section>;

  return <section className="card">
    <div className="head">
      <div><small>Parte {currentSection.index+1} de {sections.length} · {currentSection.section.label}</small><h1>{mode==="piano"?"Pratique esta frase":`Agora: ${expected?noteName(expected):""}${expected&&piano.length>7?noteOctave(expected):""}`}</h1></div>
      <div className="mode"><button type="button" className={mode==="site"?"active":""} onClick={()=>setMode("site")}>No Luwipi</button><button type="button" className={mode==="piano"?"active":""} onClick={()=>setMode("piano")}>Piano físico</button></div>
    </div>

    <Scene song={song} progress={progress}/>
    <button className="listen" type="button" onClick={()=>void listen()}>{listening?"Tocando…":"🔊 OUVIR ESTA PARTE"}</button>

    {song.sheetMusic?<MusicScore notes={visibleNotes} currentIndex={mode==="piano"?-1:localStep} timeSignature={song.timeSignature??"4/4"}/>:<div className="notes">{visibleNotes.map((note,index)=>{const key=piano.find(item=>samePitch(item,note))??piano.find(item=>item.note===noteName(note))!;return <NoteToken key={`${note}-${currentSection.index}-${index}`} theme={meta.theme} color={key.color} note={noteName(note)} active={mode==="site"&&index===localStep} done={mode==="site"&&index<localStep}/>;})}</div>}

    <div className="songProgress"><i style={{width:`${progress}%`}}/></div>

    {mode==="piano"?<PhysicalGuide notes={visibleNotes} firstNote={visibleNotes[0]??"Dó"} age={song.age} onDone={()=>setStep(currentSection.end)}/>
:<LuwipiPiano octaves={song.pianoOctaves??1} expected={expected} wrong={wrong} colors={pianoColors} onPress={press}/>}
    <style jsx>{css}</style>
  </section>;
}

const css=`.card{max-width:960px;margin:30px auto;padding:28px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}.intro{text-align:center;max-width:720px;padding:42px 30px}.heroEmoji{font-size:78px}small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}h1{font-size:clamp(30px,5vw,48px);margin:6px 0 10px}h2{font-size:18px;margin-top:28px}p{color:#68768b;line-height:1.6}.startModes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}.startModes button{border:2px solid #e1e7ee;background:#fff;border-radius:20px;padding:20px;text-align:left;cursor:pointer;min-height:120px}.startModes b,.startModes span{display:block}.startModes b{font-size:18px;color:#2d405b;margin-bottom:8px}.startModes span{font-size:12px;line-height:1.5;color:#6d7b8f}.startModes button:hover{border-color:#58cc02;background:#f7fff2}.duo{display:block;width:min(390px,100%);min-height:52px;margin:25px auto 13px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;box-shadow:0 5px 0 #46a302}.homework{display:block;font-weight:900;color:#5d7191;text-decoration:none}.head{display:flex;justify-content:space-between;align-items:center;gap:15px}.mode{display:flex;background:#eef3f8;padding:4px;border-radius:13px}.mode button{border:0;background:transparent;padding:9px 12px;border-radius:10px;font-weight:900;color:#708096}.mode .active{background:#fff;color:#2f4059}.scene{height:150px;margin:20px 0 5px;border-radius:26px;overflow:hidden;position:relative;background:linear-gradient(#c9efff 0 55%,#9ddd80 56%)}.path{position:absolute;left:4%;right:5%;bottom:18%;height:20px;border-radius:50%;background:#f1d9a5}.traveler{position:absolute;bottom:18%;font-size:40px;z-index:2;transition:left .25s ease}.goal{position:absolute;right:4%;bottom:19%;font-size:40px}.listen{display:block;width:min(320px,100%);margin:20px auto;border:0;border-radius:16px;padding:16px;background:#1cb0f6;color:#fff;font-weight:950;box-shadow:0 5px 0 #1689bf}.notes{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:flex-end;margin:18px 0 24px}.token{width:56px;text-align:center;opacity:.3}.token svg{width:50px;height:50px}.token b{font-size:11px;color:#6f7f91}.token.done{opacity:.7}.token.active{opacity:1;transform:translateY(-7px) scale(1.08)}.songProgress{height:8px;background:#e8edf2;border-radius:99px;overflow:hidden;margin:10px 0 20px}.songProgress i{display:block;height:100%;background:#58cc02}.physicalGuide{padding:22px;background:#fffaf0;border:1px solid #f1e3bd;border-radius:22px}.physicalHead span,.physicalHead strong{display:block}.physicalHead span{font-size:10px;font-weight:950;color:#9b7418;letter-spacing:.08em}.physicalHead strong{font-size:20px;color:#3b4655;margin-top:3px}.physicalSteps{display:grid;gap:9px;margin-top:14px}.physicalSteps>div{display:grid;grid-template-columns:32px 1fr;gap:10px;background:#fff;border-radius:14px;padding:11px}.physicalSteps b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#f5c84d;color:#664d00}.physicalSteps p{margin:0;color:#536176;font-size:12px;line-height:1.5}.physicalSteps p strong{color:#2e405a}.sequence{display:inline-block;margin-top:5px;font-weight:950;color:#2c4f7d;word-spacing:4px}.physicalDone{margin-top:16px}.physicalNote{display:block;text-align:center;color:#8a7a58;text-transform:none;letter-spacing:0}.pianoShell{max-width:840px;margin:22px auto 0;background:#2a2d33;border-radius:20px;padding:10px 12px 14px}.brand{text-align:center;height:32px;color:#c7ccd4;font-size:10px;font-weight:900;letter-spacing:.18em}.pianoReal{position:relative;display:grid;grid-template-columns:repeat(7,1fr);height:220px;overflow:hidden}.white{--key:#8291a5;position:relative;border:0;border-right:1px solid #c8cdd4;background:#fff}.pianoReal:has(.white:nth-of-type(14)){grid-template-columns:repeat(14,1fr)}.white span{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);padding:8px 10px;border-radius:999px;background:var(--key);color:#fff;font-weight:950}.white span small{display:block;font-size:8px;line-height:1;opacity:.8}.white.expected{box-shadow:inset 0 0 0 3px var(--key)}.white.wrong{box-shadow:inset 0 0 0 3px #ef6767}.blackSet{position:absolute;top:0;height:100%;pointer-events:none;z-index:3}.black{position:absolute;top:0;width:8.8%;height:61%;background:#15171b;z-index:3;pointer-events:none}.b1{left:9.9%}.b2{left:24.15%}.b3{left:52.75%}.b4{left:67.05%}.b5{left:81.35%}.pianoReal:has(.white:nth-of-type(14)) .black{width:4.4%}.pianoReal:has(.white:nth-of-type(14)) .b1{left:4.95%}.pianoReal:has(.white:nth-of-type(14)) .b2{left:12.08%}.pianoReal:has(.white:nth-of-type(14)) .b3{left:26.38%}.pianoReal:has(.white:nth-of-type(14)) .b4{left:33.53%}.pianoReal:has(.white:nth-of-type(14)) .b5{left:40.68%}.pianoReal:has(.white:nth-of-type(14)) .b6{left:54.95%}.pianoReal:has(.white:nth-of-type(14)) .b7{left:62.08%}.pianoReal:has(.white:nth-of-type(14)) .b8{left:76.38%}.pianoReal:has(.white:nth-of-type(14)) .b9{left:83.53%}.pianoReal:has(.white:nth-of-type(14)) .b10{left:90.68%}@media(max-width:650px){.card{margin:15px 12px;padding:18px}.head{align-items:flex-start;flex-direction:column}.mode{width:100%}.mode button{flex:1}.startModes{grid-template-columns:1fr}.scene{height:120px}.physicalGuide{padding:16px}.pianoShell{overflow-x:auto}.pianoReal,.brand{min-width:610px}.pianoReal{height:180px}}`;
