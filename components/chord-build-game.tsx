"use client";

import Link from "next/link";
import { type CSSProperties, useState } from "react";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";

type Note="Dó"|"Ré"|"Mi"|"Fá"|"Sol"|"Lá"|"Si";
const allNotes:Note[]=["Dó","Ré","Mi","Fá","Sol","Lá","Si"];
const colors:Record<Note,string>={"Dó":"#ff5f86","Ré":"#ffbf3f","Mi":"#64c96b","Fá":"#4fc8c1","Sol":"#4b9df8","Lá":"#8f74eb","Si":"#d264d7"};
const challenges=[
  {name:"Dó maior",notes:["Dó","Mi","Sol"] as Note[]},
  {name:"Fá maior",notes:["Fá","Lá","Dó"] as Note[]},
  {name:"Sol maior",notes:["Sol","Si","Ré"] as Note[]},
];

export function ChordBuildGame({story}:{story:string}){
  const [started,setStarted]=useState(false);
  const [round,setRound]=useState(0);
  const [selected,setSelected]=useState<Note[]>([]);
  const [message,setMessage]=useState<string|null>(null);
  const challenge=challenges[round];
  const complete=round>=challenges.length;

  function toggle(note:Note){
    if(selected.includes(note))setSelected(selected.filter((value)=>value!==note));
    else if(selected.length<3)setSelected([...selected,note]);
    setMessage(null);
  }
  function check(){
    if(!challenge||selected.length!==3)return;
    const correct=challenge.notes.every((note)=>selected.includes(note));
    if(correct)setMessage("✓ Acorde completo!");
    else setMessage("Quase. Troque uma nota e tente de novo.");
  }
  function next(){
    setRound((value)=>value+1);setSelected([]);setMessage(null);
  }
  function restart(){setRound(0);setSelected([]);setMessage(null);setStarted(true)}

  if(!started)return <section className="shell center"><div className="big">🏗️🎵</div><small>Historinha</small><h1>Construa o Acorde</h1><p>{story}</p><button className="duo" type="button" onClick={()=>setStarted(true)}>COMEÇAR</button><style jsx>{css}</style></section>
  if(complete)return <section className="shell center"><div className="big">🌟</div><h1>Construção concluída!</h1><p>Você montou os três acordes.</p><button className="duo" type="button" onClick={restart}>JOGAR DE NOVO</button><Link className="back" href="/jogos">Outro jogo</Link><style jsx>{css}</style></section>

  return <section className="shell center">
    <small>Acorde {round+1} de {challenges.length}</small><h1>{challenge.name}</h1><p>Escolha 3 notas.</p>
    <div className="notes">
      {allNotes.map((note)=><button key={note} type="button" className={selected.includes(note)?"selected":""} onClick={()=>toggle(note)} style={{"--note":colors[note]} as CSSProperties}>{note}</button>)}
    </div>
    <div className="slots">{[0,1,2].map((index)=><span key={index}>{selected[index]??"?"}</span>)}</div>
    <LuwipiPiano compact onPress={(key:LuwipiPianoKey)=>toggle(key.note as Note)}/>
    <button className="duo" type="button" onClick={message?.startsWith("✓")?next:check} disabled={selected.length!==3}>{message?.startsWith("✓")?"CONTINUAR":"VERIFICAR"}</button>
    {message&&<div className={`message ${message.startsWith("✓")?"ok":""}`}>{message}</div>}
    <style jsx>{css}</style>
  </section>
}

const css=`
.shell{max-width:760px;margin:32px auto;padding:28px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.center{text-align:center}.big{font-size:72px}small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}h1{font-size:clamp(30px,5vw,45px);margin:6px 0 8px}p{color:#68768b}
.duo{display:block;width:min(360px,100%);min-height:52px;margin:24px auto 14px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302}.duo:disabled{background:#d8dde2;box-shadow:0 5px 0 #c7ccd1}.back{display:block;font-weight:900;color:#5b7193;text-decoration:none}
.notes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:26px 0}.notes button{--note:#8090a5;width:72px;height:72px;border:3px solid var(--note);border-radius:18px;background:#fff;color:var(--note);font-weight:950}.notes button.selected{background:var(--note);color:#fff;transform:translateY(-4px)}
.slots{display:flex;gap:10px;justify-content:center}.slots span{width:95px;height:54px;border-radius:15px;background:#f1f4f8;display:grid;place-items:center;font-weight:950;color:#52627a}
.message{margin:16px auto 0;max-width:420px;padding:14px;border-radius:16px;background:#fff3e1;color:#765b29;font-weight:900}.message.ok{background:#efffe9;color:#3a7341}
@media(max-width:620px){.shell{margin:15px 12px;padding:20px}.notes button{width:62px;height:62px}.slots span{width:82px}}
`;
