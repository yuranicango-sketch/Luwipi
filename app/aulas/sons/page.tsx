"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Logo } from "@/components/logo";

type SoundKind = "grave" | "agudo" | "suave" | "forte";

const cards: { id: SoundKind; label: string; icon: string; text: string; freq: number; gain: number }[] = [
  { id: "grave", label: "Grave", icon: "🐘", text: "Som grande e baixinho", freq: 130.81, gain: .12 },
  { id: "agudo", label: "Agudo", icon: "🐦", text: "Som fininho e alto", freq: 659.25, gain: .1 },
  { id: "suave", label: "Suave", icon: "🪶", text: "Toque bem devagar", freq: 329.63, gain: .035 },
  { id: "forte", label: "Forte", icon: "🦁", text: "Agora com energia", freq: 261.63, gain: .17 },
];

function playTone(freq: number, gainValue: number) {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = gainValue;
  master.connect(ctx.destination);
  [1, 2, 3].forEach((partial, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.value = freq * partial;
    gain.gain.setValueAtTime(index === 0 ? 1 : .18 / partial, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .7);
    osc.connect(gain); gain.connect(master); osc.start(); osc.stop(ctx.currentTime + .72);
  });
}

export default function SoundLessonPage() {
  const [visited, setVisited] = useState<SoundKind[]>([]);
  const [active, setActive] = useState<SoundKind | null>(null);
  const complete = visited.length === cards.length;
  const progress = useMemo(() => Math.round((visited.length / cards.length) * 100), [visited]);

  function explore(card: (typeof cards)[number]) {
    setActive(card.id);
    playTone(card.freq, card.gain);
    setVisited((old) => old.includes(card.id) ? old : [...old, card.id]);
    window.setTimeout(() => setActive(null), 720);
  }

  return (
    <main className="lessonPage">
      <header className="top"><Logo/><Link href="/dashboard?age=2-4">← Voltar</Link></header>
      <section className="wrap">
        <div className="progress"><i style={{width:`${progress}%`}}/><span>{progress}%</span></div>
        <div className="hero">
          <div><small>2 a 4 anos · Aula 1</small><h1>Vamos descobrir os sons! 🎵</h1><p>Toque nos amigos e ouça como cada som é diferente.</p></div>
          <div className={`mascot ${active ? "bounce" : ""}`}>🐑</div>
        </div>
        <div className="grid">
          {cards.map((card) => <button key={card.id} onClick={() => explore(card)} className={`soundCard ${visited.includes(card.id) ? "done" : ""} ${active === card.id ? "active" : ""}`}>
            <span className="icon">{card.icon}</span><strong>{card.label}</strong><small>{card.text}</small><em>{visited.includes(card.id) ? "✓ Ouvido" : "▶ Ouvir"}</em>
          </button>)}
        </div>
        {complete && <div className="success"><span>🌟</span><div><strong>Você descobriu 4 tipos de som!</strong><p>Grave, agudo, suave e forte.</p></div><Link href="/dashboard?age=2-4">Concluir aula →</Link></div>}
      </section>
      <style jsx>{`
        .lessonPage{min-height:100vh;background:radial-gradient(circle at 12% 12%,#fff1b7,transparent 28%),radial-gradient(circle at 88% 15%,#d9f2ff,transparent 30%),#fffdf8;color:#20324d;padding:22px}.top{width:min(1080px,100%);margin:auto;display:flex;align-items:center;justify-content:space-between}.top a{font-weight:800;color:#617086}.wrap{width:min(980px,100%);margin:34px auto}.progress{height:16px;background:#e9eef3;border-radius:99px;position:relative;overflow:hidden;margin-bottom:26px}.progress i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#5fc86b,#87dd79);border-radius:99px;transition:.3s}.progress span{position:absolute;right:8px;top:18px;font-size:12px;color:#7c8898;font-weight:900}.hero{display:flex;align-items:center;justify-content:space-between;gap:24px;background:white;border:1px solid #e8edf2;border-radius:30px;padding:28px 32px;box-shadow:0 18px 50px rgba(50,73,100,.1);margin-bottom:22px}.hero small{font-weight:900;color:#5f71e8;text-transform:uppercase;letter-spacing:.08em}.hero h1{font-size:clamp(32px,5vw,52px);margin:6px 0 8px}.hero p{margin:0;color:#66768a;font-size:18px}.mascot{font-size:84px;filter:drop-shadow(0 10px 12px rgba(0,0,0,.12))}.bounce{animation:bounce .65s ease}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.soundCard{border:2px solid #edf1f5;background:white;border-radius:26px;padding:26px;min-height:230px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 26px rgba(45,70,95,.08);transition:.18s}.soundCard:hover{transform:translateY(-5px);box-shadow:0 16px 34px rgba(45,70,95,.13)}.soundCard.active{transform:scale(1.025);border-color:#7c88ff}.soundCard.done{background:linear-gradient(180deg,#fff,#f3fff1)}.icon{font-size:64px}.soundCard strong{font-size:26px;margin-top:8px}.soundCard small{color:#738095;margin:4px 0 18px}.soundCard em{font-style:normal;font-weight:900;color:#5c68db;background:#eef0ff;border-radius:99px;padding:8px 13px}.success{margin-top:20px;background:#efffec;border:2px solid #bfeab9;border-radius:24px;padding:20px;display:flex;align-items:center;gap:15px}.success>span{font-size:45px}.success strong{font-size:18px}.success p{margin:3px 0;color:#68778a}.success a{margin-left:auto;background:#5fc86b;color:white;font-weight:900;padding:13px 17px;border-radius:14px}.top :global(a),.success :global(a){text-decoration:none}@keyframes bounce{35%{transform:translateY(-16px) rotate(-4deg)}65%{transform:translateY(2px) rotate(3deg)}}@media(max-width:650px){.lessonPage{padding:14px}.grid{grid-template-columns:1fr}.hero{padding:22px}.mascot{font-size:58px}.success{align-items:flex-start;flex-wrap:wrap}.success a{margin-left:0;width:100%;text-align:center}}
      `}</style>
    </main>
  );
}
