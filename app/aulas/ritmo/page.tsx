"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

const beats = ["👏","👏","✨","👏"];

function clickTone(high = false) {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = high ? 640 : 320;
  gain.gain.setValueAtTime(.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .16);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .18);
}

export default function RhythmLessonPage() {
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const complete = count >= 8;

  async function showPattern() {
    if (playing) return;
    setPlaying(true);
    for (let i = 0; i < beats.length; i++) {
      clickTone(i === 2);
      await new Promise((r) => setTimeout(r, 520));
    }
    setPlaying(false);
  }

  function clap() {
    clickTone(count % 4 === 2);
    setCount((v) => Math.min(8, v + 1));
  }

  return (
    <main className="page">
      <header className="top"><Logo/><Link href="/dashboard?age=2-4">← Voltar</Link></header>
      <section className="wrap">
        <div className="head"><small>2 a 4 anos · Aula 2</small><h1>Ritmo em movimento 🥁</h1><p>Ouça, bata palmas e sinta a pulsação.</p></div>
        <div className="game">
          <div className={`buddy ${playing ? "dance" : ""}`}>🐰</div>
          <div className="pattern">{beats.map((b,i)=><span key={i}>{b}</span>)}</div>
          <button className="listen" onClick={showPattern} disabled={playing}>{playing ? "A ouvir…" : "▶ Ouvir o ritmo"}</button>
          <p>Depois, bata palmas junto com o coelhinho.</p>
          <button className="clap" onClick={clap} disabled={complete}>👏<strong>{complete ? "Muito bem!" : "Bater palma"}</strong></button>
          <div className="dots">{Array.from({length:8},(_,i)=><i key={i} className={i<count?"done":""}/>)}</div>
        </div>
        {complete && <div className="success"><span>🌟</span><div><strong>Ritmo concluído!</strong><p>Você manteve a pulsação por 8 batidas.</p></div><Link href="/dashboard?age=2-4">Concluir aula →</Link></div>}
      </section>
      <style jsx>{`
        .page{min-height:100vh;background:radial-gradient(circle at 15% 10%,#fff0b8,transparent 27%),radial-gradient(circle at 85% 13%,#e4f8da,transparent 30%),#fffdf8;color:#263751;padding:20px}.top{width:min(980px,100%);margin:auto;display:flex;justify-content:space-between;align-items:center}.top a{color:#647287;font-weight:800}.wrap{width:min(820px,100%);margin:40px auto}.head{text-align:center}.head small{font-weight:900;color:#f39a2f;text-transform:uppercase;letter-spacing:.08em}.head h1{font-size:clamp(34px,6vw,56px);margin:8px 0}.head p{color:#718094;font-size:18px}.game{margin-top:25px;background:white;border:1px solid #e8edf2;border-radius:32px;padding:32px;text-align:center;box-shadow:0 18px 48px rgba(45,69,93,.1)}.buddy{font-size:92px;display:inline-block}.dance{animation:dance .5s infinite alternate}.pattern{display:flex;justify-content:center;gap:12px;margin:22px 0}.pattern span{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:#fff4c9;font-size:30px;box-shadow:0 5px #e9cf72}.listen{border:0;border-radius:16px;background:#6f7df3;color:white;font-weight:900;padding:14px 20px;cursor:pointer;box-shadow:0 5px #5361c6}.game p{color:#718094}.clap{width:min(360px,100%);height:120px;border:0;border-radius:28px;background:linear-gradient(145deg,#ff8fb2,#ff6b9a);color:white;font-size:46px;cursor:pointer;box-shadow:0 8px #d84c79;display:flex;align-items:center;justify-content:center;gap:14px}.clap strong{font-size:21px}.clap:active{transform:translateY(5px);box-shadow:0 3px #d84c79}.dots{display:flex;justify-content:center;gap:8px;margin-top:24px}.dots i{width:18px;height:18px;border-radius:50%;background:#e4e9ee}.dots i.done{background:#61c96c}.success{margin-top:18px;background:#efffec;border:2px solid #bfeab9;border-radius:24px;padding:20px;display:flex;align-items:center;gap:14px}.success>span{font-size:44px}.success p{margin:3px 0;color:#718094}.success a{margin-left:auto;background:#61c96c;color:white;font-weight:900;padding:13px 16px;border-radius:14px}.top :global(a),.success :global(a){text-decoration:none}@keyframes dance{from{transform:rotate(-7deg) translateY(0)}to{transform:rotate(7deg) translateY(-10px)}}@media(max-width:560px){.game{padding:22px}.pattern span{width:52px;height:52px}.success{flex-wrap:wrap}.success a{margin-left:0;width:100%;text-align:center}}
      `}</style>
    </main>
  );
}
