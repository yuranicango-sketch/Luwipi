"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { playPercussionClick } from "@/lib/piano-sampler";

type Phase = "story" | "listen" | "tap" | "success";

const intervalMs = 700;
const roundsTotal = 4;

function clickSound() {
  void playPercussionClick({ frequency:145, gain:.22, duration:.09 });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function RhythmTapGame({ story }: { story: string }) {
  const [phase, setPhase] = useState<Phase>("story");
  const [round, setRound] = useState(0);
  const [beat, setBeat] = useState(-1);
  const [message, setMessage] = useState("Ouça os 4 passos do tambor.");
  const taps = useRef<number[]>([]);

  async function playPattern() {
    setPhase("listen");
    setMessage("Ouça…");
    setBeat(-1);

    for (let index = 0; index < 4; index += 1) {
      setBeat(index);
      clickSound();
      await wait(intervalMs);
    }

    setBeat(-1);
    taps.current = [];
    setPhase("tap");
    setMessage("Agora faça 4 batidas iguais.");
  }

  function tap() {
    if (phase !== "tap") return;
    clickSound();
    taps.current = [...taps.current, performance.now()];

    if (taps.current.length < 4) {
      setMessage(`${taps.current.length} de 4 batidas`);
      return;
    }

    const times = taps.current;
    const gaps = [times[1] - times[0], times[2] - times[1], times[3] - times[2]];
    const averageError = gaps.reduce((sum, gap) => sum + Math.abs(gap - intervalMs), 0) / gaps.length;

    if (averageError <= 270) {
      setPhase("success");
      setMessage("Muito bem! O tambor continuou a marcha.");
    } else {
      taps.current = [];
      setMessage("Quase. Tente deixar os passos mais iguais.");
    }
  }

  function nextRound() {
    if (round + 1 >= roundsTotal) {
      setRound(roundsTotal);
      return;
    }
    setRound((value) => value + 1);
    void playPattern();
  }

  function restart() {
    setRound(0);
    taps.current = [];
    setPhase("story");
    setMessage("Ouça os 4 passos do tambor.");
  }

  if (round >= roundsTotal) {
    return (
      <section className="shell center">
        <div className="big">🌟</div>
        <h1>Missão concluída!</h1>
        <p>A banda conseguiu chegar ao fim.</p>
        <button className="duo" type="button" onClick={restart}>JOGAR DE NOVO</button>
        <Link className="back" href="/jogos">Outro jogo</Link>
        <style jsx>{css}</style>
      </section>
    );
  }

  if (phase === "story") {
    return (
      <section className="shell center">
        <div className="big">🥁</div>
        <small>Historinha</small>
        <h1>Siga o Tambor</h1>
        <p>{story}</p>
        <button className="duo" type="button" onClick={() => void playPattern()}>COMEÇAR</button>
        <style jsx>{css}</style>
      </section>
    );
  }

  return (
    <section className="shell center">
      <small>Rodada {round + 1} de {roundsTotal}</small>
      <h1>{phase === "listen" ? "Ouça o tambor" : "Sua vez"}</h1>

      <div className="beats">
        {[0,1,2,3].map((index) => (
          <i key={index} className={index === beat ? "active" : ""} />
        ))}
      </div>

      <p>{message}</p>

      {phase === "tap" && (
        <button className="drum" type="button" onClick={tap}>
          <span>🥁</span>
          BATER
        </button>
      )}

      {phase === "success" && (
        <div className="success">
          <strong>✓ Muito bem!</strong>
          <button className="duo small" type="button" onClick={nextRound}>CONTINUAR</button>
        </div>
      )}

      <style jsx>{css}</style>
    </section>
  );
}

const css = `
.shell{max-width:700px;margin:32px auto;padding:30px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.center{text-align:center}
.big{font-size:78px}
small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}
h1{font-size:clamp(30px,5vw,46px);margin:6px 0 10px}
p{color:#68768b;line-height:1.6}
.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 14px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302;cursor:pointer}
.duo:active,.drum:active{transform:translateY(4px)}
.duo.small{width:auto;min-width:150px;padding:0 18px;margin:0}
.back{display:block;font-weight:900;color:#5b7193;text-decoration:none}
.beats{display:flex;justify-content:center;gap:18px;margin:32px 0}
.beats i{width:26px;height:26px;border-radius:50%;background:#e5eaf0;transition:.12s}
.beats i.active{background:#1cb0f6;transform:scale(1.35)}
.drum{width:210px;height:150px;border:0;border-radius:28px;background:#ffcf3d;color:#694f00;font-size:18px;font-weight:950;box-shadow:0 7px 0 #d8a900;cursor:pointer}
.drum span{display:block;font-size:62px;margin-bottom:4px}
.success{margin-top:24px;padding:16px 18px;border-radius:18px;background:#efffe9;color:#3a7341;display:flex;align-items:center;justify-content:space-between;gap:12px}
@media(max-width:620px){.shell{margin:15px 12px;padding:22px}.success{flex-direction:column}}
`;
