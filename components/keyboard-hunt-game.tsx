"use client";

import Link from "next/link";
import { useState } from "react";

type GameId = "caca-teclas" | "encontre-do";
type Key = { id: string; label: string; kind: "white" | "black"; target?: boolean };

const keys: Key[] = [
  { id:"c1", label:"Dó", kind:"white", target:true },
  { id:"cs1", label:"", kind:"black" },
  { id:"d1", label:"Ré", kind:"white" },
  { id:"ds1", label:"", kind:"black" },
  { id:"e1", label:"Mi", kind:"white" },
  { id:"f1", label:"Fá", kind:"white" },
  { id:"fs1", label:"", kind:"black" },
  { id:"g1", label:"Sol", kind:"white" },
  { id:"gs1", label:"", kind:"black" },
  { id:"a1", label:"Lá", kind:"white" },
  { id:"as1", label:"", kind:"black" },
  { id:"b1", label:"Si", kind:"white" },
];

export function KeyboardHuntGame({ gameId, story }: { gameId: GameId; story: string }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const missions = gameId === "encontre-do"
    ? [
        { text:"Encontre o Dó", test:(key:Key) => key.label === "Dó" },
        { text:"Toque uma tecla preta", test:(key:Key) => key.kind === "black" },
        { text:"Encontre o Ré", test:(key:Key) => key.label === "Ré" },
        { text:"Encontre o Dó outra vez", test:(key:Key) => key.label === "Dó" },
      ]
    : [
        { text:"Toque uma tecla preta", test:(key:Key) => key.kind === "black" },
        { text:"Toque uma tecla branca", test:(key:Key) => key.kind === "white" },
        { text:"Encontre o Dó", test:(key:Key) => key.label === "Dó" },
        { text:"Encontre o Sol", test:(key:Key) => key.label === "Sol" },
      ];

  const complete = round >= missions.length;
  const mission = missions[round];

  function press(key: Key) {
    if (!mission) return;
    if (mission.test(key)) {
      setMessage("✓ Muito bem!");
      window.setTimeout(() => {
        setRound((value) => value + 1);
        setMessage(null);
      }, 550);
    } else {
      setMessage("Quase. Tente outra tecla.");
    }
  }

  if (!started) {
    return (
      <section className="shell intro">
        <div className="big">🎹</div>
        <small>Historinha</small>
        <h1>{gameId === "encontre-do" ? "Encontre o Dó" : "Caça às Teclas"}</h1>
        <p>{story}</p>
        <button className="duo" type="button" onClick={() => setStarted(true)}>COMEÇAR</button>
        <style jsx>{css}</style>
      </section>
    );
  }

  if (complete) {
    return (
      <section className="shell intro">
        <div className="big">🌟</div>
        <h1>Missão concluída!</h1>
        <button className="duo" type="button" onClick={() => {setRound(0);setMessage(null)}}>JOGAR DE NOVO</button>
        <Link className="back" href="/jogos">Outro jogo</Link>
        <style jsx>{css}</style>
      </section>
    );
  }

  return (
    <section className="shell">
      <small>Missão {round + 1} de {missions.length}</small>
      <h1>{mission.text}</h1>

      <div className="keyboard">
        {keys.map((key) => (
          <button key={key.id} type="button" className={key.kind} onClick={() => press(key)}>
            {key.kind === "white" && <span>{key.label}</span>}
          </button>
        ))}
      </div>

      {message && <div className={`message ${message.startsWith("✓") ? "ok" : ""}`}>{message}</div>}

      <style jsx>{css}</style>
    </section>
  );
}

const css=`
.shell{max-width:860px;margin:32px auto;padding:26px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.intro{text-align:center;max-width:700px;padding:40px 28px}
.big{font-size:76px}
small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}
h1{font-size:clamp(30px,5vw,45px);margin:6px 0 20px}
p{color:#68768b;line-height:1.55}
.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 14px;border:0;border-radius:16px;background:#58cc02;color:white;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302}
.duo:active{transform:translateY(4px);box-shadow:0 1px 0 #46a302}
.back{font-weight:900;color:#5b7193;text-decoration:none}
.keyboard{height:260px;display:flex;position:relative;margin-top:30px;overflow-x:auto;padding-bottom:10px}
.white{position:relative;min-width:92px;flex:1;background:#fff;border:2px solid #cfd7e0;border-radius:0 0 12px 12px;box-shadow:inset 0 -8px 0 #eef1f4}
.white span{position:absolute;bottom:22px;left:0;right:0;font-weight:900;color:#4a5c75}
.black{width:55px;height:155px;background:#27313f;border:0;border-radius:0 0 8px 8px;margin-left:-27px;margin-right:-27px;z-index:2;box-shadow:inset 0 -7px 0 #111820}
.keyboard button{cursor:pointer}
.keyboard button:active{transform:translateY(3px)}
.message{margin-top:18px;padding:15px;border-radius:16px;background:#fff3e1;text-align:center;font-weight:900;color:#765b29}
.message.ok{background:#efffe9;color:#3a7341}
@media(max-width:620px){.shell{margin:15px 12px;padding:18px}.keyboard{height:210px}.white{min-width:72px}.black{width:44px;height:125px;margin-left:-22px;margin-right:-22px}}
`;
