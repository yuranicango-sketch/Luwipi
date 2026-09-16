"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Logo } from "@/components/logo";

const fingerNames = ["Polegar", "Indicador", "Médio", "Anelar", "Mínimo"];
const sequence = [1,2,3,4,5,3,2,1];
const frequencies = [261.63,293.66,329.63,349.23,392.0];

function playPianoLikeTone(index: number) {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(.11, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .8);
  master.connect(ctx.destination);
  [1,2,3,4].forEach((partial, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = frequencies[index] * partial;
    gain.gain.value = i === 0 ? 1 : .11 / partial;
    osc.connect(gain); gain.connect(master); osc.start(); osc.stop(ctx.currentTime + .82);
  });
}

export default function FingerLessonPage() {
  const [seen, setSeen] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("Toque nos dedos para conhecê-los.");
  const progress = useMemo(() => Math.round(((seen.length + step) / 13) * 100), [seen, step]);
  const complete = step >= sequence.length;

  function learnFinger(n: number) {
    setSeen((old) => old.includes(n) ? old : [...old,n]);
    setMessage(`${n} = ${fingerNames[n-1]}`);
  }

  function playKey(n: number) {
    playPianoLikeTone(n-1);
    if (complete || seen.length < 5) return;
    if (n === sequence[step]) {
      const next = step + 1;
      setStep(next);
      setMessage(next === sequence.length ? "🎉 Perfeito! Sequência completa." : `Muito bem! Agora use o dedo ${sequence[next]}.`);
    } else {
      setMessage(`Quase! Agora precisamos do dedo ${sequence[step]}.`);
    }
  }

  return (
    <main className="lessonPage">
      <header className="top"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>
      <section className="wrap">
        <div className="progress"><i style={{width:`${Math.min(progress,100)}%`}}/><span>{Math.min(progress,100)}%</span></div>
        <div className="heading"><small>5 a 8 anos · Aula 1</small><h1>Os dedos no piano ✋🎹</h1><p>Aprenda os números 1 a 5 e use cada dedo no teclado.</p></div>
        <section className="stage">
          <div className="handPanel">
            <h2>1. Conheça os dedos</h2><p>Clique em cada dedo.</p>
            <div className="hand">
              {[1,2,3,4,5].map((n) => <button key={n} onClick={() => learnFinger(n)} className={`finger f${n} ${seen.includes(n) ? "seen" : ""}`}><b>{n}</b><small>{fingerNames[n-1]}</small></button>)}
            </div>
          </div>
          <div className="pianoPanel">
            <h2>2. Agora no piano</h2><p>{seen.length < 5 ? "Primeiro descubra os cinco dedos." : complete ? "Você conseguiu!" : <>Toque: <strong>{sequence.join(" · ")}</strong></>}</p>
            <div className="sequence">{sequence.map((n,i)=><span key={i} className={i < step ? "done" : i === step ? "now" : ""}>{n}</span>)}</div>
            <div className="piano">{[1,2,3,4,5].map((n)=><button key={n} onClick={() => playKey(n)} className={seen.length < 5 ? "locked" : ""}><span>{n}</span><small>{["Dó","Ré","Mi","Fá","Sol"][n-1]}</small></button>)}</div>
            <div className="message">{message}</div>
          </div>
        </section>
        {complete && <div className="success"><span>🏆</span><div><strong>Primeira missão concluída!</strong><p>Você já reconhece os dedos 1–5.</p></div><Link href="/dashboard?age=5-8">Concluir aula →</Link></div>}
      </section>
      <style jsx>{`
        .lessonPage{min-height:100vh;background:radial-gradient(circle at 13% 8%,#ffe4ed,transparent 27%),radial-gradient(circle at 87% 9%,#dff3ff,transparent 30%),#fffdf9;color:#20324d;padding:22px}.top{width:min(1080px,100%);margin:auto;display:flex;align-items:center;justify-content:space-between}.top a{font-weight:800;color:#617086}.wrap{width:min(1050px,100%);margin:34px auto}.progress{height:16px;background:#e9eef3;border-radius:99px;position:relative;overflow:hidden;margin-bottom:26px}.progress i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#6f7df3,#65c9e9);border-radius:99px;transition:.3s}.progress span{position:absolute;right:8px;top:18px;font-size:12px;color:#7c8898;font-weight:900}.heading{text-align:center;margin-bottom:22px}.heading small{font-weight:900;color:#6f7df3;text-transform:uppercase;letter-spacing:.08em}.heading h1{font-size:clamp(34px,5vw,54px);margin:6px 0}.heading p{color:#68788c;font-size:18px}.stage{display:grid;grid-template-columns:.9fr 1.1fr;gap:18px}.handPanel,.pianoPanel{background:white;border:1px solid #e9eef3;border-radius:28px;padding:24px;box-shadow:0 16px 44px rgba(43,69,98,.1)}h2{margin:0 0 6px;font-size:24px}.handPanel>p,.pianoPanel>p{color:#758195;margin-top:0}.hand{display:flex;align-items:flex-end;justify-content:center;gap:7px;height:310px;padding-top:20px}.finger{border:0;background:#ffd65f;color:#5d4600;border-radius:36px 36px 18px 18px;width:64px;box-shadow:inset 0 -7px rgba(0,0,0,.07),0 7px #deb13c;cursor:pointer;transition:.16s;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:18px}.finger:hover{transform:translateY(-6px)}.finger.seen{background:#91e59b;box-shadow:inset 0 -7px rgba(0,0,0,.05),0 7px #57b864}.finger b{font-size:25px}.finger small{font-size:10px;margin-top:5px}.f1{height:135px;transform:rotate(-9deg)}.f2{height:205px}.f3{height:240px}.f4{height:215px}.f5{height:160px}.sequence{display:flex;gap:7px;flex-wrap:wrap;margin:18px 0}.sequence span{width:38px;height:38px;border-radius:11px;background:#edf1f5;display:grid;place-items:center;font-weight:900;color:#6b7889}.sequence span.now{background:#6f7df3;color:white;transform:scale(1.08)}.sequence span.done{background:#9ae3a2;color:#176127}.piano{display:flex;justify-content:center;gap:5px;margin:24px 0 16px}.piano button{width:82px;height:190px;border:3px solid #d5dce4;border-radius:0 0 16px 16px;background:#fff;box-shadow:0 8px #c0c9d2;cursor:pointer;font-weight:900;color:#34465d;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:16px;transition:.1s}.piano button:active{transform:translateY(5px);box-shadow:0 3px #c0c9d2;background:#e9ebff}.piano button.locked{opacity:.45}.piano button span{font-size:24px}.piano button small{color:#7b8796}.message{min-height:42px;padding:12px;border-radius:14px;background:#f5f7ff;text-align:center;font-weight:900;color:#5968ce}.success{margin-top:20px;background:#efffec;border:2px solid #bfeab9;border-radius:24px;padding:20px;display:flex;align-items:center;gap:15px}.success>span{font-size:45px}.success strong{font-size:18px}.success p{margin:3px 0;color:#68778a}.success a{margin-left:auto;background:#5fc86b;color:white;font-weight:900;padding:13px 17px;border-radius:14px}.top :global(a),.success :global(a){text-decoration:none}@media(max-width:820px){.stage{grid-template-columns:1fr}.hand{height:260px}.f1{height:110px}.f2{height:175px}.f3{height:205px}.f4{height:185px}.f5{height:135px}}@media(max-width:560px){.lessonPage{padding:12px}.handPanel,.pianoPanel{padding:18px}.finger{width:48px}.piano button{width:58px;height:145px}.success{flex-wrap:wrap}.success a{margin-left:0;width:100%;text-align:center}}
      `}</style>
    </main>
  );
}
