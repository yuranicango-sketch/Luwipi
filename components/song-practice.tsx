"use client";

import Link from "next/link";
import { type CSSProperties, useMemo, useRef, useState } from "react";
import type { KidsSong } from "@/lib/music-library";

type PianoKey = { note: string; color: string; playbackRate: number };
type Mode = "site" | "piano";

const storyScenes: Record<string, { start: string; end: string; finish: string }> = {
  "passeio-das-cores": { start: "🌈", end: "🎉", finish: "As cores chegaram à festa!" },
  "estrelinha": { start: "⭐", end: "🌌", finish: "A estrelinha encontrou o céu!" },
  "maria-cordeirinho": { start: "🐑", end: "👧", finish: "Nino encontrou Maria!" },
  "irmao-joao": { start: "😴", end: "🔔", finish: "Os sinos acordaram a vila!" },
  "rema-rema-barco": { start: "🚣", end: "🏝️", finish: "O barquinho chegou à margem!" },
};

const sample = "https://tonejs.github.io/audio/salamander/C4.mp3";
const keys: PianoKey[] = [
  { note:"Dó", color:"#ff5f86", playbackRate:1 },
  { note:"Ré", color:"#ffbf3f", playbackRate:Math.pow(2,2/12) },
  { note:"Mi", color:"#64c96b", playbackRate:Math.pow(2,4/12) },
  { note:"Fá", color:"#4fc8c1", playbackRate:Math.pow(2,5/12) },
  { note:"Sol", color:"#4b9df8", playbackRate:Math.pow(2,7/12) },
  { note:"Lá", color:"#8f74eb", playbackRate:Math.pow(2,9/12) },
  { note:"Si", color:"#d264d7", playbackRate:Math.pow(2,11/12) },
];

function play(key:PianoKey){
  const audio=new Audio(sample);
  audio.playbackRate=key.playbackRate;
  audio.volume=.68;
  void audio.play();
}
const wait=(ms:number)=>new Promise<void>((resolve)=>window.setTimeout(resolve,ms));

export function SongPractice({song}:{song:KidsSong}){
  const sequence=song.sequence??[];
  const piano=useMemo(()=>{
    const colors=new Map(song.colors?.map((item)=>[item.note,item.color])??[]);
    return keys.map((key)=>({...key,color:colors.get(key.note)??key.color}));
  },[song.colors]);

  const [started,setStarted]=useState(false);
  const [mode,setMode]=useState<Mode>("site");
  const [step,setStep]=useState(0);
  const [wrong,setWrong]=useState<string|null>(null);
  const [listening,setListening]=useState(false);
  const token=useRef(0);

  const complete=step>=sequence.length;
  const expected=complete?undefined:sequence[step];
  const scene=storyScenes[song.id] ?? {start:song.emoji,end:"🏁",finish:"História concluída!"};
  const progress=sequence.length ? Math.min(100, Math.round((step/sequence.length)*100)) : 0;

  function reset(){token.current+=1;setStep(0);setWrong(null);setListening(false);setStarted(true)}
  function press(key:PianoKey){
    play(key);
    if(mode!=="site"||!expected)return;
    if(key.note!==expected){setWrong(key.note);window.setTimeout(()=>setWrong(null),350);return}
    setStep((value)=>value+1);
  }
  function physical(){if(expected)setStep((value)=>value+1)}
  async function listen(){
    if(listening)return;
    const id=token.current+1;token.current=id;setListening(true);
    for(const note of sequence){
      if(token.current!==id)return;
      const key=piano.find((item)=>item.note===note);
      if(key)play(key);
      await wait(470);
    }
    if(token.current===id)setListening(false);
  }

  if(!started){
    return <section className="story">
      <div className="emoji">{song.emoji}</div>
      <small>Historinha</small>
      <h1>{song.title}</h1>
      <p>{song.story}</p>
      <button className="duo" type="button" onClick={()=>setStarted(true)}>COMEÇAR</button>
      <style jsx>{css}</style>
    </section>;
  }

  if(complete){
    return <section className="story">
      <div className="emoji">🌟</div>
      <h1>Muito bem!</h1>
      <p>{scene.finish}</p>
      <button className="duo" type="button" onClick={reset}>TOCAR DE NOVO</button>
      <Link className="homework" href={`/professor/tarefas?song=${song.id}`}>Enviar como tarefa</Link>
      <style jsx>{css}</style>
    </section>;
  }

  return <section className="player">
    <div className="head">
      <div><small>{step+1} de {sequence.length}</small><h1>Agora: {expected}</h1></div>
      <div className="mode">
        <button className={mode==="site"?"active":""} onClick={()=>setMode("site")}>No site</button>
        <button className={mode==="piano"?"active":""} onClick={()=>setMode("piano")}>Piano físico</button>
      </div>
    </div>

    <div className="journey">
      <span>{scene.start}</span>
      <div><i style={{width:`${progress}%`}} /><b style={{left:`${Math.max(2,Math.min(94,progress))}%`}}>{song.emoji}</b></div>
      <span>{scene.end}</span>
    </div>

    <button className="listen" type="button" onClick={listen}>{listening?"Tocando…":"🔊 OUVIR"}</button>

    <div className="notes">
      {sequence.map((note,index)=>{
        const key=piano.find((item)=>item.note===note)!;
        return <span key={`${note}-${index}`} className={`${index<step?"done":""} ${index===step?"current":""}`} style={{"--note":key.color} as CSSProperties}>{note}</span>
      })}
    </div>

    {mode==="piano"?(
      <div className="physical"><span>Toque no piano real</span><strong>{expected}</strong><button className="duo" type="button" onClick={physical}>TOCOU · CONTINUAR</button></div>
    ):(
      <div className="piano">
        {piano.map((key)=><button key={key.note} onClick={()=>press(key)} className={`${expected===key.note?"expected":""} ${wrong===key.note?"wrong":""}`} style={{"--key":key.color} as CSSProperties}><span>{key.note}</span></button>)}
      </div>
    )}

    <style jsx>{css}</style>
  </section>;
}

const css=`
.story,.player{max-width:900px;margin:30px auto;padding:28px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.story{text-align:center;max-width:680px;padding:42px 30px}
.emoji{font-size:78px}
small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}
h1{font-size:clamp(30px,5vw,48px);margin:6px 0 10px}
p{color:#68768b;line-height:1.6}
.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 13px;border:0;border-radius:16px;background:#58cc02;color:white;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302}
.duo:active{transform:translateY(4px);box-shadow:0 1px 0 #46a302}
.homework{display:block;font-weight:900;color:#5d7191;text-decoration:none}
.head{display:flex;justify-content:space-between;align-items:center;gap:15px}
.mode{display:flex;background:#eef3f8;padding:4px;border-radius:13px}
.mode button{border:0;background:transparent;padding:9px 12px;border-radius:10px;font-weight:900;color:#708096}
.mode .active{background:white;color:#2f4059}
.journey{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;margin:22px auto 4px;max-width:650px}.journey>span{font-size:32px}.journey>div{height:10px;background:#edf1f5;border-radius:99px;position:relative}.journey i{display:block;height:100%;background:#58cc02;border-radius:99px;transition:.2s}.journey b{position:absolute;top:50%;transform:translate(-50%,-50%);font-size:25px;font-weight:400;transition:.2s}
.listen{display:block;width:min(320px,100%);margin:25px auto;border:0;border-radius:16px;padding:16px;background:#1cb0f6;color:white;font-weight:950;box-shadow:0 5px 0 #1689bf}
.listen:active{transform:translateY(4px);box-shadow:0 1px 0 #1689bf}
.notes{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:20px 0}
.notes span{--note:#8090a5;min-width:45px;height:45px;border:3px solid var(--note);border-radius:14px;display:grid;place-items:center;color:var(--note);font-weight:900;opacity:.3}
.notes .done{opacity:.65}.notes .current{opacity:1;transform:translateY(-4px)}
.physical{text-align:center;padding:25px;background:#fff8df;border-radius:20px}.physical span{display:block;font-size:12px;font-weight:900;color:#7c6a31}.physical strong{display:block;font-size:44px}
.piano{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;min-width:620px;overflow-x:auto;margin-top:24px}
.piano button{--key:#8291a5;height:170px;border:3px solid #dfe5ed;border-radius:16px 16px 22px 22px;background:white;box-shadow:inset 0 -9px 0 #e9edf2}
.piano button span{display:inline-block;margin-top:15px;background:var(--key);color:white;padding:8px 10px;border-radius:99px;font-weight:900}.piano button.expected{border-color:var(--key)}.piano button.wrong{border-color:#ef6767}
@media(max-width:650px){.story,.player{margin:15px 12px;padding:20px}.head{align-items:flex-start;flex-direction:column}.piano{min-width:560px}.piano button{height:140px}}
`;
