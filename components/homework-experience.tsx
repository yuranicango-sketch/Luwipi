"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDemoAssignment, type HomeworkAssignment } from "@/lib/demo-assignments";
import { getSong, noteName, noteOctave } from "@/lib/music-library";
import { getHomeworkProgress, saveHomeworkProgress } from "@/lib/teacher-local";
import { playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";

type PianoKey = { note: string; color: string; playbackRate: number; octave?: number };

const pianoKeys: PianoKey[] = [
  { note: "Dó", color: "#ff5f86", playbackRate: 1 },
  { note: "Ré", color: "#ffbf3f", playbackRate: Math.pow(2, 2/12) },
  { note: "Mi", color: "#64c96b", playbackRate: Math.pow(2, 4/12) },
  { note: "Fá", color: "#4fc8c1", playbackRate: Math.pow(2, 5/12) },
  { note: "Sol", color: "#4b9df8", playbackRate: Math.pow(2, 7/12) },
  { note: "Lá", color: "#8f74eb", playbackRate: Math.pow(2, 9/12) },
  { note: "Si", color: "#d264d7", playbackRate: Math.pow(2, 11/12) },
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
  void playPianoRate(key.playbackRate);
}

export function HomeworkExperience({ code }: { code: string }) {
  const [assignment, setAssignment] = useState<HomeworkAssignment | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [message, setMessage] = useState("Toque a primeira cor ✨");
  const [wrong, setWrong] = useState<string | null>(null);
  const startedSession = useRef<string | null>(null);

  useEffect(() => { void preloadPianoSamples(); }, []);

  useEffect(() => {
    let cancelled=false;
    const local=getDemoAssignment(code) ?? readLocalAssignment(code);
    if(local){setAssignment(local);return;}
    fetch(`/api/homework/${encodeURIComponent(code)}`,{cache:"no-store"})
      .then(async response=>response.ok?(await response.json()).assignment:null)
      .then(remote=>{if(!cancelled)setAssignment(remote??null);})
      .catch(()=>{if(!cancelled)setAssignment(null);});
    return()=>{cancelled=true;};
  }, [code]);

  useEffect(() => {
    if (!assignment || startedSession.current === assignment.code) return;
    const existing = getHomeworkProgress(assignment.code);
    setRepeats(Math.min(existing?.completedRepeats ?? 0, assignment.targetRepeats));
    startedSession.current = assignment.code;
    const startingRepeats=existing?.completedRepeats ?? 0;
    saveHomeworkProgress({
      code: assignment.code,
      completedRepeats: startingRepeats,
      targetRepeats: assignment.targetRepeats,
      sessionCount: (existing?.sessionCount ?? 0) + 1,
      lastPracticedAt: new Date().toISOString(),
      completedAt: existing?.completedAt,
    });
    void syncProgress(assignment.code,startingRepeats,true,false);
  }, [assignment]);

  const song = useMemo(() => assignment ? getSong(assignment.songId) : undefined, [assignment]);
  const sequence = song?.sequence ?? [];
  const homeworkKeys = useMemo(() => song?.pianoOctaves===2 ? [0,1].flatMap(octave=>pianoKeys.map(key=>({...key,octave:octave+4,playbackRate:key.playbackRate*Math.pow(2,octave)}))) : pianoKeys.map(key=>({...key,octave:4})), [song?.pianoOctaves]);
  const expired = Boolean(assignment && new Date(assignment.validUntil).getTime() < Date.now());
  const complete = assignment ? repeats >= assignment.targetRepeats : false;
  const expected = sequence[step];
  const phraseProgress = sequence.length ? Math.round((step / sequence.length) * 100) : 0;
  const expectedPitch = expected ? `${noteName(expected)}${song?.pianoOctaves===2?noteOctave(expected):""}` : "";


  async function syncProgress(assignmentCode:string,_nextRepeats:number,sessionStarted=false,noteCompleted=false,repetitionCompleted=false){
    try{
      await fetch(`/api/homework/${encodeURIComponent(assignmentCode)}/progress`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionStarted,noteCompleted,repetitionCompleted})});
    }catch{/* local progress remains available offline */}
  }

  function press(key: PianoKey) {
    playPiano(key);
    if (!assignment || !sequence.length || complete || expired) return;

    if (key.note !== noteName(expected) || (song?.pianoOctaves===2 && (key.octave??4)!==noteOctave(expected))) {
      setWrong(`${key.note}${key.octave??4}`);
      setMessage("Quase! Procure a cor que está brilhando 👀");
      window.setTimeout(() => setWrong(null), 450);
      return;
    }

    const nextStep = step + 1;
    if (nextStep < sequence.length) {
      setStep(nextStep);
      setMessage("Isso! Continue 🎵");
      return;
    }

    void syncProgress(assignment.code,repeats,false,true,true);
    const nextRepeats = repeats + 1;
    setRepeats(nextRepeats);
    setStep(0);
    const current = getHomeworkProgress(assignment.code);
    const finished = nextRepeats >= assignment.targetRepeats;
    saveHomeworkProgress({
      code: assignment.code,
      completedRepeats: nextRepeats,
      targetRepeats: assignment.targetRepeats,
      sessionCount: Math.max(1, current?.sessionCount ?? 1),
      lastPracticedAt: new Date().toISOString(),
      completedAt: finished ? current?.completedAt ?? new Date().toISOString() : undefined,
    });

    setMessage(finished ? "Conseguimos! 🌟" : "Muito bem! Vamos outra vez? 🎉");
  }

  if (assignment === undefined) return <div className="state">Abrindo tarefa…</div>;
  if (!assignment) return <div className="state"><span>🔎</span><h2>{loadError==="not_found"?"Código não encontrado.":"Não foi possível abrir a tarefa."}</h2><p>{loadError==="not_found"?"Confira o código enviado pelo professor.":"A tarefa existe, mas houve uma falha ao carregá-la. Tente novamente."}</p><Link className="btn btn-soft" href={`/tarefa/${encodeURIComponent(code)}`}>Tentar novamente</Link></div>;
  if (!song) return <div className="state"><span>🎵</span><h2>Música da tarefa indisponível.</h2><p>Peça ao professor para gerar uma nova tarefa.</p><Link className="btn btn-soft" href="/tarefa">Usar outro código</Link></div>;
  if (expired) return <div className="state"><span>⏳</span><h2>Esta tarefa expirou.</h2><p>Peça ao professor um novo código para continuar.</p><Link className="btn btn-soft" href="/tarefa">Usar outro código</Link></div>;

  return (
    <div className="experience">
      <section className="story">
        <div className="copy">
          <small>Tarefa de {assignment.childName}</small>
          <h1>{song.emoji} {song.title}</h1>
          <p>{song.story}</p>
          <blockquote>💬 {assignment.teacherNote}</blockquote>
        </div>
        <div className="world" aria-hidden="true">
          <div className="sky">☀️ ☁️</div>
          <div className="track">{sequence.map((note,index)=><i key={`${note}-${index}`} className={index < step ? "done" : index === step ? "active" : ""} style={{background:pianoKeys.find((key)=>key.note===noteName(note))?.color}} />)}</div>
          <div className="character" style={{left:`${Math.min(84,8+(step/Math.max(1,sequence.length))*76)}%`}}>{song.emoji}</div>
          <div className="finish">🏁</div>
        </div>
      </section>

      <section className="play">
        <div className="playHead"><div><small>Missão</small><strong>{message}</strong></div><div className="stars">{Array.from({length:assignment.targetRepeats}).map((_,i)=><span key={i} className={i<repeats?"earned":""}>★</span>)}</div></div>
        <div className="next-note" aria-live="polite"><small>Agora toca</small><strong>{complete?"🌟":expectedPitch}</strong></div>
        <div className="progress"><i style={{width:`${complete?100:phraseProgress}%`}} /></div>
        <div className="pianoScroll"><div className="piano">{homeworkKeys.map((key)=><button key={`${key.note}-${key.octave??4}`} type="button" onClick={()=>press(key)} className={`${wrong===`${key.note}${key.octave??4}`?"wrong":""} ${expected&&!complete&&key.note===noteName(expected)&&(song?.pianoOctaves!==2||(key.octave??4)===noteOctave(expected))?"expected":""}`} style={expected&&!complete&&key.note===noteName(expected)&&(song?.pianoOctaves!==2||(key.octave??4)===noteOctave(expected))?{background:key.color,borderColor:key.color}:{}}><span>{key.note}</span><b>{key.note}</b></button>)}</div></div>
        {complete && <div className="complete"><span>🌟</span><div><strong>Tarefa concluída!</strong><p>{assignment.childName} completou {assignment.targetRepeats} repetição{assignment.targetRepeats>1?"ões":""}.</p></div></div>}
      </section>
      <footer>Piano: amostras Salamander Grand Piano · CC BY 3.0 · Alexander Holm</footer>

      <style jsx>{`
        .experience{max-width:1000px;margin:auto;padding:24px}.story{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:#fff;border:1px solid #e5ecf4;border-radius:30px;padding:24px;box-shadow:0 18px 50px rgba(41,70,106,.1)}.copy small,.playHead small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6375dc}.copy h1{font-size:clamp(34px,5vw,54px);margin:8px 0;letter-spacing:-2px}.copy p{color:#65748d;line-height:1.55}.copy blockquote{margin:18px 0 0;padding:13px 15px;background:#fff8df;border-radius:14px;color:#6b592a}.world{position:relative;min-height:300px;border-radius:24px;overflow:hidden;background:linear-gradient(#c7edff 0 60%,#86d46d 60%)}.sky{position:absolute;right:22px;top:18px;font-size:40px}.track{position:absolute;left:8%;right:8%;bottom:70px;display:flex;justify-content:space-between}.track:before{content:"";position:absolute;left:0;right:0;top:8px;height:7px;border-radius:99px;background:#f5e6bb}.track i{width:22px;height:22px;border-radius:50%;border:4px solid white;z-index:1;opacity:.4}.track i.done,.track i.active{opacity:1}.track i.active{transform:scale(1.35)}.character{position:absolute;bottom:82px;font-size:48px;transform:translateX(-50%);transition:left .3s}.finish{position:absolute;right:4%;bottom:80px;font-size:38px}.play{margin-top:18px;background:#fff;border:1px solid #e5ecf4;border-radius:30px;padding:24px;box-shadow:0 16px 42px rgba(41,70,106,.08)}.playHead{display:flex;justify-content:space-between;align-items:center;gap:20px}.playHead div:first-child{display:flex;flex-direction:column;gap:4px}.playHead strong{font-size:22px}.stars span{font-size:29px;color:#dce2eb}.stars .earned{color:#ffc52f}.next-note{margin:24px auto 15px;display:flex;flex-direction:column;align-items:center;gap:4px}.next-note small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#7b8799}.next-note strong{font-size:32px}.progress{height:10px;background:#edf1f6;border-radius:99px;overflow:hidden;margin-bottom:20px}.progress i{display:block;height:100%;background:linear-gradient(90deg,#69cb72,#92de76);transition:.25s}.pianoScroll{overflow-x:auto;padding:5px 2px 14px}.piano{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;max-width:860px;min-width:650px;margin:auto}.piano button{--key-color:#ddd;min-height:180px;border:3px solid #dfe5ee;border-radius:18px 18px 24px 24px;background:#fff;cursor:pointer;position:relative;box-shadow:inset 0 -10px 0 #e9edf3,0 8px 20px rgba(42,64,90,.09)}.piano button span{display:none}.piano button b{position:absolute;bottom:25px;left:0;right:0;color:#53617b}.piano button.expected{color:#fff;box-shadow:0 0 0 5px rgba(255,197,47,.22),inset 0 -10px 0 #e9edf3}.piano button.wrong{border-color:#ef6767;transform:translateX(3px)}.complete{margin-top:20px;border-radius:20px;background:#efffec;border:2px solid #bce7b9;padding:18px;display:flex;align-items:center;gap:14px}.complete>span{font-size:42px}.complete p{margin:3px 0;color:#63728a}footer{text-align:center;color:#8994a7;font-size:10px;margin-top:14px}.state{max-width:680px;margin:70px auto;text-align:center;background:#fff;border:1px solid #e6edf4;border-radius:28px;padding:40px;box-shadow:0 18px 44px rgba(44,70,102,.08)}.state>span{font-size:54px}.state h2{font-size:30px}.state p{color:#6d7a91}@media(max-width:760px){.experience{padding:14px}.story{grid-template-columns:1fr}.world{min-height:240px}.playHead{align-items:flex-start;flex-direction:column}.piano button{min-height:145px}.sequence span{min-width:40px;height:40px;font-size:13px}}@media(max-width:440px){.piano{min-width:590px}.piano button{min-height:125px}}
      `}</style>
    </div>
  );
}
