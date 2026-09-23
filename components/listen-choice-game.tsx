"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { playPianoRate } from "@/lib/piano-sampler";

type GameId = "elefante-passarinho" | "leao-coelhinho";
type Choice = "left" | "right";

type InstrumentSound = { name: string; url: string; volume: number };
const BASE = "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples";
const low: InstrumentSound[] = [
  { name: "Tuba", url: `${BASE}/tuba/Ds2.mp3`, volume: .66 },
  { name: "Contrabaixo", url: `${BASE}/contrabass/C2.mp3`, volume: .64 },
  { name: "Fagote", url: `${BASE}/bassoon/G2.mp3`, volume: .62 },
  { name: "Violoncelo", url: `${BASE}/cello/C2.mp3`, volume: .62 },
  { name: "Trombone", url: `${BASE}/trombone/Cs2.mp3`, volume: .62 },
  { name: "Trompa", url: `${BASE}/french-horn/A1.mp3`, volume: .60 },
];
const high: InstrumentSound[] = [
  { name: "Flauta", url: `${BASE}/flute/C7.mp3`, volume: .42 },
  { name: "Violino", url: `${BASE}/violin/A6.mp3`, volume: .42 },
  { name: "Xilofone", url: `${BASE}/xylophone/C8.mp3`, volume: .38 },
  { name: "Clarinete", url: `${BASE}/clarinet/Fs6.mp3`, volume: .42 },
  { name: "Trompete", url: `${BASE}/trumpet/C6.mp3`, volume: .40 },
  { name: "Saxofone", url: `${BASE}/saxophone/Ds5.mp3`, volume: .42 },
];
const answers: Choice[] = ["left","right","right","left","right","left"];

function shuffled<T>(items:T[]) { return [...items].sort(() => Math.random() - .5); }
function buildSession() {
  const lows = shuffled(low).slice(0,3); const highs = shuffled(high).slice(0,3);
  let li=0, hi=0;
  return answers.map(choice => choice === "left" ? lows[li++] : highs[hi++]);
}
function playInstrument(sound: InstrumentSound, fallbackRate:number) {
  const a = new Audio(sound.url);
  a.preload = "auto";
  a.volume = sound.volume;
  void a.play().catch(() => {
    void playPianoRate(fallbackRate,{gain:sound.volume,duration:.7});
  });
}
function playPiano(volume:number){ void playPianoRate(1,{gain:volume,duration:.7}); }

const configs = {
  "elefante-passarinho": { title:"Elefante ou Passarinho?", question:"O som é grave ou agudo?", left:{emoji:"🐘",label:"Elefante"}, right:{emoji:"🐦",label:"Passarinho"} },
  "leao-coelhinho": { title:"Leão ou Coelhinho?", question:"O som é forte ou suave?", left:{emoji:"🦁",label:"Leão"}, right:{emoji:"🐰",label:"Coelhinho"} },
} as const;

export function ListenChoiceGame({gameId,story}:{gameId:GameId;story:string}) {
  const config=configs[gameId];
  const [version,setVersion]=useState(0);
  const session=useMemo(()=>buildSession(),[version]);
  const [started,setStarted]=useState(false); const [round,setRound]=useState(0); const [heard,setHeard]=useState(false); const [result,setResult]=useState<"right"|"wrong"|null>(null);
  const complete=round>=answers.length; const expected=answers[round]; const instrument=session[round];
  useEffect(()=>{ if(gameId!=="elefante-passarinho") return; session.forEach(s=>{const a=new Audio(s.url);a.preload="auto";a.load();}); },[gameId,session]);
  function hear(){ if(!expected)return; if(gameId==="elefante-passarinho"&&instrument) playInstrument(instrument,expected==="left"?.5:2); else playPiano(expected==="left"?.78:.22); setHeard(true); }
  function choose(c:Choice){ if(!heard||!expected)return; if(c===expected)setResult("right"); else {setResult("wrong"); hear();} }
  function next(){setRound(v=>v+1);setHeard(false);setResult(null)}
  function restart(){setVersion(v=>v+1);setRound(0);setHeard(false);setResult(null);setStarted(true)}
  if(!started)return <section className="shell intro"><div className="characters">{config.left.emoji} {config.right.emoji}</div><small>Historinha</small><h1>{config.title}</h1><p>{story}</p><button className="duo" onClick={()=>setStarted(true)}>COMEÇAR</button><style jsx>{css}</style></section>;
  if(complete)return <section className="shell intro"><div className="characters">🌟</div><h1>Muito bem!</h1><p>Missão concluída.</p><button className="duo" onClick={restart}>JOGAR DE NOVO</button><Link className="back" href="/jogos">Outro jogo</Link><style jsx>{css}</style></section>;
  return <section className="shell"><div className="head"><div><small>Rodada {round+1} de {answers.length}</small><h1>{config.question}</h1></div><div className="progress"><i style={{width:`${round/answers.length*100}%`}}/></div></div><button className="listen" onClick={hear}>🔊 {heard?"OUVIR DE NOVO":"OUVIR"}</button><div className="choices"><button disabled={!heard||result==="right"} onClick={()=>choose("left")}><span>{config.left.emoji}</span><strong>{config.left.label}</strong></button><button disabled={!heard||result==="right"} onClick={()=>choose("right")}><span>{config.right.emoji}</span><strong>{config.right.label}</strong></button></div>{!heard&&<p className="hint">Ouça primeiro.</p>}{result==="wrong"&&<div className="feedback wrong">Quase! Ouça e tente de novo.</div>}{result==="right"&&<div className="feedback right"><div><strong>✓ Muito bem!</strong>{gameId==="elefante-passarinho"&&instrument&&<small className="reveal">Era {instrument.name} · som {expected==="left"?"grave":"agudo"}</small>}</div><button className="duo small" onClick={next}>CONTINUAR</button></div>}<style jsx>{css}</style></section>;
}
const css=`.shell{max-width:760px;margin:32px auto;padding:26px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}.intro{text-align:center;padding:40px 26px}.characters{font-size:78px;margin-bottom:12px}small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}h1{font-size:clamp(30px,5vw,46px);margin:5px 0 10px}p{color:#68768b}.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 14px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;box-shadow:0 5px 0 #46a302}.duo.small{width:auto;min-width:150px;padding:0 18px;margin:0}.back{font-weight:900;color:#5b7193;text-decoration:none}.head{display:flex;justify-content:space-between;gap:20px}.progress{width:190px;height:10px;background:#edf1f5;border-radius:99px;overflow:hidden}.progress i{display:block;height:100%;background:#58cc02}.listen{display:block;width:min(360px,100%);margin:30px auto 24px;border:0;border-radius:16px;padding:17px;background:#1cb0f6;color:#fff;font-weight:950;box-shadow:0 5px 0 #1689bf}.choices{display:grid;grid-template-columns:1fr 1fr;gap:16px}.choices button{min-height:205px;background:#fff;border:2px solid #e0e7ef;border-radius:22px}.choices span{display:block;font-size:74px}.choices strong{display:block;font-size:19px}.hint{text-align:center}.feedback{margin-top:18px;padding:15px 18px;border-radius:17px}.wrong{background:#fff3e1;color:#7a5d25;text-align:center}.right{background:#efffe9;display:flex;justify-content:space-between;align-items:center;gap:12px;color:#3a7341}.reveal{display:block;text-transform:none;letter-spacing:0;color:#4f7b55;margin-top:5px}@media(max-width:620px){.shell{margin:15px 12px;padding:20px}.head{flex-direction:column}.progress{width:100%}.choices{grid-template-columns:1fr}.choices button{min-height:135px}.right{flex-direction:column}}`;
