"use client";

import Link from "next/link";
import { type CSSProperties, useRef, useState } from "react";
import { playPianoRate } from "@/lib/piano-sampler";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";

type Note = "Dó" | "Ré" | "Mi" | "Sol";
type Phase = "story" | "ready" | "play" | "success";

const notes: Array<{ note: Note; color: string; rate: number }> = [
  { note:"Dó", color:"#ff5f86", rate:1 },
  { note:"Ré", color:"#ffbf3f", rate:Math.pow(2,2/12) },
  { note:"Mi", color:"#64c96b", rate:Math.pow(2,4/12) },
  { note:"Sol", color:"#4b9df8", rate:Math.pow(2,7/12) },
];

const patterns: Note[][] = [
  ["Dó","Ré"],
  ["Mi","Dó"],
  ["Dó","Mi","Ré"],
  ["Sol","Mi","Dó"],
];

function wait(ms:number){return new Promise<void>((resolve)=>window.setTimeout(resolve,ms))}
function playNote(note:Note){
  const item=notes.find((value)=>value.note===note);
  if(!item)return;
  void playPianoRate(item.rate);
}

export function EchoMusicalGame({ story }: { story: string }) {
  const [phase,setPhase]=useState<Phase>("story");
  const [round,setRound]=useState(0);
  const [input,setInput]=useState<Note[]>([]);
  const [message,setMessage]=useState("Ouça e repita.");
  const playId=useRef(0);
  const pattern=patterns[round];
  const complete=round>=patterns.length;

  async function hear(){
    if(!pattern)return;
    setPhase("ready");
    setInput([]);
    setMessage("Ouça…");
    const id=playId.current+1;
    playId.current=id;
    for(const note of pattern){
      if(playId.current!==id)return;
      playNote(note);
      await wait(520);
    }
    setPhase("play");
    setMessage("Agora faça o eco.");
  }

  function pressKey(key:LuwipiPianoKey){
    const note=key.note as Note;
    if(phase!=="play"||!pattern)return;
    const next=[...input,note];
    setInput(next);

    const index=next.length-1;
    if(next[index]!==pattern[index]){
      setInput([]);
      setMessage("Quase. Ouça outra vez.");
      window.setTimeout(()=>void hear(),450);
      return;
    }

    if(next.length===pattern.length){
      setPhase("success");
      setMessage("Eco perfeito!");
    }
  }

  function next(){
    if(round+1>=patterns.length){setRound(patterns.length);return}
    setRound((value)=>value+1);
    setPhase("ready");
    setInput([]);
    window.setTimeout(()=>void hear(),100);
  }

  function restart(){setRound(0);setPhase("story");setInput([]);setMessage("Ouça e repita.")}

  if(complete){
    return <section className="shell center">
      <div className="big">🌟</div><h1>Eco concluído!</h1><p>A montanha repetiu todos os sons.</p>
      <button className="duo" type="button" onClick={restart}>JOGAR DE NOVO</button>
      <Link className="back" href="/jogos">Outro jogo</Link><style jsx>{css}</style>
    </section>
  }

  if(phase==="story"){
    return <section className="shell center">
      <div className="big">🏔️🎵</div><small>Historinha</small><h1>Eco Musical</h1><p>{story}</p>
      <button className="duo" type="button" onClick={()=>void hear()}>COMEÇAR</button><style jsx>{css}</style>
    </section>
  }

  return <section className="shell center">
    <small>Rodada {round+1} de {patterns.length}</small>
    <h1>{message}</h1>
    <button className="hear" type="button" onClick={()=>void hear()}>🔊 OUVIR</button>

    <LuwipiPiano compact disabled={phase!=="play"} onPress={pressKey}/>

    {phase==="success"&&<div className="success"><strong>✓ Muito bem!</strong><button className="duo small" type="button" onClick={next}>CONTINUAR</button></div>}
    <style jsx>{css}</style>
  </section>
}

const css=`
.shell{max-width:740px;margin:32px auto;padding:28px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.center{text-align:center}.big{font-size:72px}small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}
h1{font-size:clamp(29px,5vw,44px);margin:6px 0 10px}p{color:#68768b;line-height:1.6}
.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 14px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302}
.duo.small{width:auto;min-width:150px;padding:0 18px;margin:0}.back{display:block;font-weight:900;color:#5b7193;text-decoration:none}
.hear{width:min(320px,100%);padding:16px;border:0;border-radius:16px;background:#1cb0f6;color:#fff;font-weight:950;box-shadow:0 5px 0 #1689bf;margin:16px auto 26px}
.pads{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.pads button{--pad:#8090a5;min-height:130px;border:0;border-radius:22px;background:var(--pad);box-shadow:0 6px 0 color-mix(in srgb,var(--pad) 75%,#000);color:#fff;font-weight:950;font-size:18px}.pads button:disabled{opacity:.52}.pads button:not(:disabled):active{transform:translateY(4px);box-shadow:0 2px 0 color-mix(in srgb,var(--pad) 75%,#000)}
.success{margin-top:24px;padding:16px 18px;border-radius:18px;background:#efffe9;color:#3a7341;display:flex;align-items:center;justify-content:space-between;gap:12px}
@media(max-width:620px){.shell{margin:15px 12px;padding:20px}.pads{grid-template-columns:1fr 1fr}.pads button{min-height:105px}.success{flex-direction:column}}
`;
