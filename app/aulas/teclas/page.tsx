"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

const groups = [2,3,2,3];

export default function KeysLessonPage() {
  const [target, setTarget] = useState<2|3>(2);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Encontre um grupo de 2 teclas pretas.");
  const complete = score >= 6;

  function choose(group:number) {
    if (complete) return;
    if (group === target) {
      const nextScore = score + 1;
      setScore(nextScore);
      setMessage("✅ Certo! Muito bem!");
      setTarget((old) => old === 2 ? 3 : 2);
      setTimeout(() => {
        if (nextScore < 6) setMessage(`Agora encontre um grupo de ${target === 2 ? 3 : 2} teclas pretas.`);
      }, 450);
    } else {
      setMessage(`Quase! Procure um grupo de ${target}.`);
    }
  }

  return (
    <main className="page">
      <header className="top"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>
      <section className="wrap">
        <div className="head"><small>5 a 8 anos · Aula 2</small><h1>As teclas do piano 🎹</h1><p>Descubra o padrão secreto das teclas pretas.</p></div>
        <div className="lesson">
          <div className="challenge"><span>Missão</span><strong>Encontre um grupo de {target} teclas pretas</strong><em>{score}/6 acertos</em></div>
          <div className="keyboard">
            {groups.map((group,gi)=><button key={gi} onClick={()=>choose(group)} className="group" aria-label={`Grupo de ${group} teclas pretas`}>
              <div className="white">{Array.from({length:group+1},(_,i)=><i key={i}/>)}</div>
              <div className={`black black-${group}`}>{Array.from({length:group},(_,i)=><b key={i}/>)}</div>
            </button>)}
          </div>
          <div className="message">{complete ? "🎉 Você encontrou todos os grupos!" : message}</div>
          <div className="tip"><span>💡</span><p>As teclas pretas aparecem sempre em grupos de <strong>2</strong> e <strong>3</strong>. Esse padrão ajuda a encontrar qualquer nota no piano.</p></div>
        </div>
        {complete && <div className="success"><span>🏆</span><div><strong>Missão concluída!</strong><p>Agora você reconhece os grupos de 2 e 3 teclas pretas.</p></div><Link href="/dashboard?age=5-8">Concluir aula →</Link></div>}
      </section>
      <style jsx>{`
        .page{min-height:100vh;background:radial-gradient(circle at 12% 8%,#e3f4ff,transparent 28%),radial-gradient(circle at 88% 12%,#f3e4ff,transparent 30%),#fffdf9;color:#253650;padding:20px}.top{width:min(1080px,100%);margin:auto;display:flex;align-items:center;justify-content:space-between}.top a{font-weight:800;color:#647287}.wrap{width:min(1050px,100%);margin:38px auto}.head{text-align:center}.head small{font-weight:900;color:#6677e8;text-transform:uppercase;letter-spacing:.08em}.head h1{font-size:clamp(34px,6vw,56px);margin:8px 0}.head p{color:#718094;font-size:18px}.lesson{margin-top:24px;background:white;border:1px solid #e8edf2;border-radius:30px;padding:28px;box-shadow:0 18px 50px rgba(45,70,96,.1)}.challenge{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#f4f6ff;border-radius:20px;padding:17px 20px;margin-bottom:24px}.challenge span{font-size:12px;text-transform:uppercase;font-weight:900;color:#6573df}.challenge strong{font-size:21px}.challenge em{font-style:normal;color:#65758a;font-weight:900}.keyboard{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.group{position:relative;height:220px;border:0;background:transparent;cursor:pointer;padding:0;border-radius:18px;transition:.16s}.group:hover{transform:translateY(-5px)}.white{height:100%;display:flex;gap:3px}.white i{flex:1;background:linear-gradient(#fff,#f4f5f6);border:2px solid #d6dde4;border-radius:0 0 12px 12px;box-shadow:0 6px #bcc5ce}.black{position:absolute;top:0;left:0;right:0;height:128px;display:flex;justify-content:space-evenly;padding:0 20%}.black b{width:28px;background:linear-gradient(#2b313b,#11151b);border-radius:0 0 8px 8px;box-shadow:0 5px #080a0d}.message{margin:26px auto 16px;min-height:52px;display:grid;place-items:center;background:#eef0ff;color:#5968cf;border-radius:16px;font-weight:900;font-size:18px}.tip{display:flex;gap:12px;align-items:flex-start;background:#fff7cf;border:1px solid #f4e28b;border-radius:18px;padding:15px 17px}.tip span{font-size:28px}.tip p{margin:0;color:#6b6247;line-height:1.5}.success{margin-top:18px;background:#efffec;border:2px solid #bfeab9;border-radius:24px;padding:20px;display:flex;align-items:center;gap:14px}.success>span{font-size:44px}.success p{margin:3px 0;color:#718094}.success a{margin-left:auto;background:#61c96c;color:white;font-weight:900;padding:13px 16px;border-radius:14px}.top :global(a),.success :global(a){text-decoration:none}@media(max-width:780px){.keyboard{grid-template-columns:repeat(2,1fr)}.group{height:180px}.black{height:105px}}@media(max-width:520px){.lesson{padding:18px}.keyboard{grid-template-columns:1fr 1fr;gap:8px}.group{height:150px}.black{height:88px}.success{flex-wrap:wrap}.success a{margin-left:0;width:100%;text-align:center}}
      `}</style>
    </main>
  );
}
