"use client";

import Link from "next/link";
import { useState } from "react";
import { playPianoRate } from "@/lib/piano-sampler";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";

type Note = "Dó" | "Ré" | "Mi" | "Fá" | "Sol";

const noteData: Array<{note:Note;color:string;rate:number}> = [
  {note:"Dó",color:"#ff5f86",rate:1},
  {note:"Ré",color:"#ffbf3f",rate:Math.pow(2,2/12)},
  {note:"Mi",color:"#64c96b",rate:Math.pow(2,4/12)},
  {note:"Fá",color:"#4fc8c1",rate:Math.pow(2,5/12)},
  {note:"Sol",color:"#4b9df8",rate:Math.pow(2,7/12)},
];
const rounds:Note[]=["Dó","Mi","Ré","Sol","Fá"];

function play(note:Note){
  const item=noteData.find((value)=>value.note===note);
  if(!item)return;
  void playPianoRate(item.rate);
}

export function ListenFindGame({story}:{story:string}){
  const [started,setStarted]=useState(false);
  const [round,setRound]=useState(0);
  const [heard,setHeard]=useState(false);
  const [message,setMessage]=useState<string|null>(null);
  const target=rounds[round];
  const complete=round>=rounds.length;

  function hear(){if(!target)return;play(target);setHeard(true);setMessage(null)}
  function chooseKey(key:LuwipiPianoKey){
    const note=key.note as Note;
    if(!heard||!target)return;
    if(note===target){
      setMessage("✓ Muito bem!");
      window.setTimeout(()=>{setRound((value)=>value+1);setHeard(false);setMessage(null)},600);
    }else setMessage("Quase. Ouça novamente.");
  }
  function restart(){setRound(0);setHeard(false);setMessage(null);setStarted(true)}

  if(!started)return <section className="shell center"><div className="big">👂🎹</div><small>Historinha</small><h1>Ouça e Encontre</h1><p>{story}</p><button className="duo" type="button" onClick={()=>setStarted(true)}>COMEÇAR</button><style jsx>{css}</style></section>
  if(complete)return <section className="shell center"><div className="big">🌟</div><h1>Muito bem!</h1><p>Você encontrou todos os sons.</p><button className="duo" type="button" onClick={restart}>JOGAR DE NOVO</button><Link className="back" href="/jogos">Outro jogo</Link><style jsx>{css}</style></section>

  return <section className="shell center">
    <small>Rodada {round+1} de {rounds.length}</small><h1>Qual tecla tocou?</h1>
    <button className="hear" type="button" onClick={hear}>🔊 {heard?"OUVIR DE NOVO":"OUVIR"}</button>
    <LuwipiPiano compact disabled={!heard} onPress={chooseKey}/>
    {!heard&&<p>Ouça primeiro.</p>}
    {message&&<div className={`message ${message.startsWith("✓")?"ok":""}`}>{message}</div>}
    <style jsx>{css}</style>
  </section>
}

const css=`
.shell{max-width:760px;margin:32px auto;padding:28px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.center{text-align:center}.big{font-size:72px}small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}h1{font-size:clamp(30px,5vw,45px);margin:6px 0 12px}p{color:#68768b;line-height:1.6}
.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 14px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302}.back{display:block;font-weight:900;color:#5b7193;text-decoration:none}
.hear{width:min(320px,100%);padding:16px;border:0;border-radius:16px;background:#1cb0f6;color:#fff;font-weight:950;box-shadow:0 5px 0 #1689bf;margin:18px auto 26px}
.message{margin-top:18px;padding:15px;border-radius:16px;background:#fff3e1;color:#765b29;font-weight:900}.message.ok{background:#efffe9;color:#3a7341}
@media(max-width:620px){.shell{margin:15px 12px;padding:20px}}
`;
