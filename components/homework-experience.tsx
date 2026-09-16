"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { getDemoAssignment, type HomeworkAssignment } from "@/lib/demo-assignments";
import { getSong } from "@/lib/music-library";

type PianoKey = { note: string; label: string; color: string; sample: string; playbackRate: number };

const baseSample = "https://tonejs.github.io/audio/salamander/C4.mp3";
const pianoKeys: PianoKey[] = [
  { note: "Dó", label: "Dó", color: "#ff5f86", sample: baseSample, playbackRate: 1 },
  { note: "Ré", label: "Ré", color: "#ffbf3f", sample: baseSample, playbackRate: Math.pow(2, 2/12) },
  { note: "Mi", label: "Mi", color: "#64c96b", sample: baseSample, playbackRate: Math.pow(2, 4/12) },
  { note: "Fá", label: "Fá", color: "#4fc8c1", sample: baseSample, playbackRate: Math.pow(2, 5/12) },
  { note: "Sol", label: "Sol", color: "#4b9df8", sample: baseSample, playbackRate: Math.pow(2, 7/12) },
  { note: "Lá", label: "Lá", color: "#8f74eb", sample: baseSample, playbackRate: Math.pow(2, 9/12) },
  { note: "Si", label: "Si", color: "#d264d7", sample: baseSample, playbackRate: Math.pow(2, 11/12) },
];

function readLocalAssignment(code: string): HomeworkAssignment | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(`luwipi-homework:${code}`);
    return raw ? JSON.parse(raw) as HomeworkAssignment : undefined;
  } catch {
    return undefined;
  }
}

function playPiano(key: PianoKey) {
  const audio = new Audio(key.sample);
  audio.preload = "auto";
  audio.playbackRate = key.playbackRate;
  audio.volume = .72;
  void audio.play();
}

export function HomeworkExperience({ code }: { code: string }) {
  const [assignment, setAssignment] = useState<HomeworkAssignment | null | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [message, setMessage] = useState("Toque a primeira cor ✨");
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    setAssignment(getDemoAssignment(code) ?? readLocalAssignment(code) ?? null);
  }, [code]);

  const song = useMemo(() => assignment ? getSong(assignment.songId) : undefined, [assignment]);
  const sequence = song?.sequence ?? [];
  const complete = assignment ? repeats >= assignment.targetRepeats : false;
  const expected = sequence[step];
  const progress = sequence.length ? Math.round((step / sequence.length) * 100) : 0;

  function press(key: PianoKey) {
    playPiano(key);
    if (!sequence.length || complete) return;
    if (key.note !== expected) {
      setWrong(key.note);
      setMessage("Quase! Procure a cor que está brilhando 👀");
      window.setTimeout(() => setWrong(null), 450);
      return;
    }

    const nextStep = step + 1;
    if (nextStep >= sequence.length) {
      const nextRepeats = repeats + 1;
      setRepeats(nextRepeats);
      setStep(0);
      setMessage(nextRepeats >= (assignment?.targetRepeats ?? 1) ? "Conseguimos! 🌟" : "Muito bem! Vamos outra vez? 🎉");
    } else {
      setStep(nextStep);
      setMessage("Isso! Continue 🎵");
    }
  }

  if (assignment === undefined) return <div className="homework-state">Abrindo tarefa…</div>;
  if (!assignment || !song) {
    return <div className="homework-state"><span>🔎</span><h2>Não encontramos este código.</h2><p>Confira o código enviado pelo professor.</p><Link className="btn btn-soft" href="/tarefa">Tentar outro código</Link></div>;
  }

  return (
    <div className="homework-experience">
      <section className="homework-story">
        <div className="story-copy">
          <small>Tarefa de {assignment.childName}</small>
          <h1>{song.emoji} {song.title}</h1>
          <p>{song.story}</p>
          <blockquote>💬 {assignment.teacherNote}</blockquote>
        </div>
        <div className="story-world" aria-hidden="true">
          <div className="sun">☀️</div>
          <div className="cloud c1">☁️</div><div className="cloud c2">☁️</div>
          <div className="path">{sequence.map((note, index) => <i key={`${note}-${index}`} className={index < step ? "done" : index === step ? "active" : ""} style={{background:pianoKeys.find((key)=>key.note===note)?.color}} />)}</div>
          <div className="character" style={{left:`${Math.min(82, 8 + (step / Math.max(1,sequence.length)) * 74)}%`}}>{song.emoji}</div>
          <div className="finish">🏁</div>
        </div>
      </section>

      <section className="homework-play">
        <div className="play-top">
          <div><small>Missão</small><strong>{message}</strong></div>
          <div className="repeat-stars">{Array.from({length:assignment.targetRepeats}).map((_,index)=><span key={index} className={index < repeats ? "earned" : ""}>★</span>)}</div>
        </div>

        <div className="sequence-strip">
          {sequence.map((note,index)=>{
            const key = pianoKeys.find((item)=>item.note===note)!;
            return <span key={`${note}-${index}`} className={index===step && !complete ? "current" : index < step ? "passed" : ""} style={{borderColor:key.color,color:key.color}}>{note}</span>;
          })}
        </div>

        <div className="mini-progress"><i style={{width:`${complete ? 100 : progress}%`}} /></div>

        <div className="piano-scroll">
          <div className="color-piano">
            {pianoKeys.map((key)=><button key={key.note} type="button" onClick={()=>press(key)} className={`${wrong===key.note ? "wrong" : ""} ${expected===key.note && !complete ? "expected" : ""}`} style={{"--key-color":key.color} as CSSProperties}><span>{key.label}</span><b>{key.label}</b></button>)}
          </div>
        </div>

        {complete && <div className="homework-complete"><span>🌟</span><div><strong>Tarefa concluída!</strong><p>{assignment.childName} completou {assignment.targetRepeats} volta{assignment.targetRepeats>1?"s":""}.</p></div></div>}
      </section>

      <footer className="homework-footer">Piano: amostras Salamander Grand Piano · CC BY 3.0 · Alexander Holm</footer>

      <style jsx>{`
        .homework-experience{max-width:1000px;margin:0 auto;padding:24px}.homework-story{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:#fff;border:1px solid #e5ecf4;border-radius:30px;padding:24px;box-shadow:0 18px 50px rgba(41,70,106,.1)}.story-copy small,.play-top small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6375dc}.story-copy h1{font-size:clamp(34px,5vw,54px);letter-spacing:-2px;margin:8px 0}.story-copy p{color:#65748d;line-height:1.55}.story-copy blockquote{margin:18px 0 0;padding:13px 15px;background:#fff8df;border-radius:14px;color:#6b592a;font-size:13px}.story-world{position:relative;min-height:300px;border-radius:24px;overflow:hidden;background:linear-gradient(#c7edff 0 60%,#86d46d 60%)}.sun{position:absolute;right:20px;top:15px;font-size:42px}.cloud{position:absolute;font-size:44px;opacity:.85}.c1{left:12%;top:12%}.c2{right:28%;top:25%;transform:scale(.8)}.path{position:absolute;left:8%;right:8%;bottom:68px;display:flex;justify-content:space-between;align-items:center}.path:before{content:"";position:absolute;left:0;right:0;height:7px;border-radius:99px;background:#f5e6bb;z-index:0}.path i{width:22px;height:22px;border-radius:50%;border:4px solid rgba(255,255,255,.9);box-shadow:0 4px 10px rgba(0,0,0,.1);z-index:1;opacity:.45}.path i.done,.path i.active{opacity:1}.path i.active{transform:scale(1.35);animation:pulse 1s ease-in-out infinite}.character{position:absolute;bottom:80px;font-size:48px;transition:left .35s ease;transform:translateX(-50%)}.finish{position:absolute;right:5%;bottom:76px;font-size:42px}.homework-play{margin-top:18px;background:#fff;border:1px solid #e5ecf4;border-radius:30px;padding:24px;box-shadow:0 16px 42px rgba(41,70,106,.08)}.play-top{display:flex;justify-content:space-between;align-items:center;gap:20px}.play-top div:first-child{display:flex;flex-direction:column;gap:4px}.play-top strong{font-size:22px}.repeat-stars{display:flex;gap:5px}.repeat-stars span{font-size:28px;color:#dce2eb}.repeat-stars .earned{color:#ffc52f;filter:drop-shadow(0 3px 5px rgba(255,190,30,.3))}.sequence-strip{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:24px 0 15px}.sequence-strip span{min-width:46px;height:46px;border:3px solid;border-radius:14px;display:grid;place-items:center;font-weight:900;opacity:.42;transition:.2s}.sequence-strip .current{opacity:1;transform:translateY(-5px);box-shadow:0 9px 16px rgba(38,65,96,.11)}.sequence-strip .passed{opacity:.8;background:#f7fbff}.mini-progress{height:10px;background:#edf1f6;border-radius:99px;overflow:hidden;margin-bottom:20px}.mini-progress i{display:block;height:100%;background:linear-gradient(90deg,#69cb72,#92de76);border-radius:inherit;transition:.25s}.piano-scroll{overflow-x:auto;padding:5px 2px 14px}.color-piano{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;max-width:860px;min-width:650px;margin:0 auto}.color-piano button{--key-color:#ddd;min-height:190px;border:3px solid #dfe5ee;border-radius:18px 18px 24px 24px;background:#fff;cursor:pointer;position:relative;box-shadow:inset 0 -10px 0 #e9edf3,0 8px 20px rgba(42,64,90,.09);transition:.12s}.color-piano button:active{transform:translateY(7px);box-shadow:inset 0 -4px 0 #e9edf3}.color-piano button span{position:absolute;top:16px;left:50%;transform:translateX(-50%);width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--key-color);color:#fff;font-weight:900}.color-piano button b{position:absolute;bottom:25px;left:0;right:0;color:#53617b}.color-piano button.expected{border-color:var(--key-color);box-shadow:0 0 0 5px color-mix(in srgb,var(--key-color) 18%,transparent),inset 0 -10px 0 #e9edf3;animation:keyGlow 1.2s ease-in-out infinite}.color-piano button.wrong{animation:shake .4s ease;border-color:#f06161}.homework-complete{margin-top:20px;border-radius:20px;background:#efffec;border:2px solid #bce7b9;padding:18px;display:flex;align-items:center;gap:14px}.homework-complete>span{font-size:42px}.homework-complete strong{font-size:20px}.homework-complete p{margin:3px 0;color:#63728a}.homework-footer{text-align:center;color:#8994a7;font-size:10px;margin-top:14px}.homework-state{max-width:680px;margin:70px auto;text-align:center;background:#fff;border:1px solid #e6edf4;border-radius:28px;padding:40px;box-shadow:0 18px 44px rgba(44,70,102,.08)}.homework-state>span{font-size:54px}.homework-state h2{font-size:30px}.homework-state p{color:#6d7a91}@keyframes pulse{50%{transform:scale(1.55)}}@keyframes keyGlow{50%{transform:translateY(-4px)}}@keyframes shake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}@media(max-width:760px){.homework-experience{padding:14px}.homework-story{grid-template-columns:1fr}.story-world{min-height:240px}.play-top{align-items:flex-start;flex-direction:column}.color-piano button{min-height:150px}.sequence-strip span{min-width:40px;height:40px;font-size:13px}}@media(max-width:440px){.color-piano{min-width:590px}.color-piano button{min-height:130px}.color-piano button span{width:32px;height:32px;font-size:12px}.color-piano button b{font-size:12px}}
      `}</style>
    </div>
  );
}
