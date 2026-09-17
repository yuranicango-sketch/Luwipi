"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type GameId = "elefante-passarinho" | "leao-coelhinho";
type Choice = "left" | "right";

const baseSample = "https://tonejs.github.io/audio/salamander/C4.mp3";

function playPiano(playbackRate: number, volume: number) {
  const audio = new Audio(baseSample);
  audio.preload = "auto";
  audio.playbackRate = playbackRate;
  audio.volume = volume;
  void audio.play();
}

const configs = {
  "elefante-passarinho": {
    title: "Elefante ou Passarinho?",
    question: "O som é grave ou agudo?",
    left: { emoji: "🐘", label: "Elefante" },
    right: { emoji: "🐦", label: "Passarinho" },
    play(answer: Choice) {
      playPiano(answer === "left" ? 0.5 : 2, answer === "left" ? 0.65 : 0.48);
    },
  },
  "leao-coelhinho": {
    title: "Leão ou Coelhinho?",
    question: "O som é forte ou suave?",
    left: { emoji: "🦁", label: "Leão" },
    right: { emoji: "🐰", label: "Coelhinho" },
    play(answer: Choice) {
      playPiano(1, answer === "left" ? 0.78 : 0.22);
    },
  },
} satisfies Record<GameId, {
  title: string;
  question: string;
  left: { emoji: string; label: string };
  right: { emoji: string; label: string };
  play: (answer: Choice) => void;
}>;

const answers: Choice[] = ["left", "right", "right", "left", "right", "left"];

export function ListenChoiceGame({ gameId, story }: { gameId: GameId; story: string }) {
  const config = configs[gameId];
  const rounds = useMemo(() => answers, []);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState(false);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);

  const complete = round >= rounds.length;
  const expected = rounds[round];

  function hear() {
    if (!expected) return;
    config.play(expected);
    setHeard(true);
  }

  function choose(choice: Choice) {
    if (!heard || !expected) return;
    if (choice === expected) setResult("right");
    else {
      setResult("wrong");
      config.play(expected);
    }
  }

  function next() {
    setRound((value) => value + 1);
    setHeard(false);
    setResult(null);
  }

  function restart() {
    setStarted(true);
    setRound(0);
    setHeard(false);
    setResult(null);
  }

  if (!started) {
    return (
      <section className="shell intro">
        <div className="characters">{config.left.emoji} {config.right.emoji}</div>
        <small>Historinha</small>
        <h1>{config.title}</h1>
        <p>{story}</p>
        <div className="startWrap"><button className="duo" type="button" onClick={() => setStarted(true)}>COMEÇAR</button></div>
        <style jsx>{css}</style>
      </section>
    );
  }

  if (complete) {
    return (
      <section className="shell intro">
        <div className="characters">🌟</div>
        <h1>Muito bem!</h1>
        <p>Missão concluída.</p>
        <div className="finishActions">
          <button className="duo" type="button" onClick={restart}>JOGAR DE NOVO</button>
          <Link className="back" href="/jogos">Outro jogo</Link>
        </div>
        <style jsx>{css}</style>
      </section>
    );
  }

  return (
    <section className="shell">
      <div className="head">
        <div><small>Rodada {round + 1} de {rounds.length}</small><h1>{config.question}</h1></div>
        <div className="progress"><i style={{width:`${(round / rounds.length) * 100}%`}} /></div>
      </div>

      <button className="listen" type="button" onClick={hear}>🔊 {heard ? "OUVIR DE NOVO" : "OUVIR"}</button>

      <div className="choices">
        <button
          type="button"
          disabled={!heard || result === "right"}
          onClick={() => choose("left")}
        >
          <span>{config.left.emoji}</span>
          <strong>{config.left.label}</strong>
        </button>

        <button
          type="button"
          disabled={!heard || result === "right"}
          onClick={() => choose("right")}
        >
          <span>{config.right.emoji}</span>
          <strong>{config.right.label}</strong>
        </button>
      </div>

      {!heard && <p className="hint">Ouça primeiro.</p>}
      {result === "wrong" && <div className="feedback wrong">Quase! Ouça e tente de novo.</div>}
      {result === "right" && (
        <div className="feedback right">
          <strong>✓ Muito bem!</strong>
          <button className="duo small" type="button" onClick={next}>CONTINUAR</button>
        </div>
      )}

      <style jsx>{css}</style>
    </section>
  );
}

const css = `
.shell{max-width:760px;margin:32px auto;padding:26px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}
.intro{text-align:center;padding-top:40px;padding-bottom:40px}
.characters{font-size:78px;margin-bottom:12px}
small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}
h1{font-size:clamp(30px,5vw,46px);margin:5px 0 10px}
p{color:#68768b;line-height:1.55}
.startWrap{max-width:360px;margin:26px auto 0}
.duo{width:100%;min-height:52px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;letter-spacing:.06em;box-shadow:0 5px 0 #46a302;cursor:pointer}
.duo:active{transform:translateY(4px);box-shadow:0 1px 0 #46a302}
.duo.small{width:auto;min-width:150px;padding:0 18px}
.head{display:flex;align-items:center;gap:22px;justify-content:space-between}
.progress{width:190px;height:10px;background:#edf1f5;border-radius:99px;overflow:hidden}
.progress i{height:100%;display:block;background:#58cc02}
.listen{display:block;width:min(360px,100%);margin:30px auto 24px;border:0;border-radius:16px;padding:17px;background:#1cb0f6;color:white;font-size:16px;font-weight:950;box-shadow:0 5px 0 #1689bf}
.listen:active{transform:translateY(4px);box-shadow:0 1px 0 #1689bf}
.choices{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.choices button{min-height:205px;background:#fff;border:2px solid #e0e7ef;border-radius:22px}
.choices button:not(:disabled){cursor:pointer}
.choices span{display:block;font-size:74px}
.choices strong{display:block;margin-top:8px;font-size:19px;color:#35465f}
.hint{text-align:center}
.feedback{margin-top:18px;padding:15px 18px;border-radius:17px}
.feedback.wrong{background:#fff3e1;color:#7a5d25;text-align:center}
.feedback.right{background:#efffe9;display:flex;justify-content:space-between;align-items:center;gap:12px;color:#3a7341}
.finishActions{max-width:360px;margin:24px auto 0;display:grid;gap:14px}
.back{font-weight:900;color:#5b7193;text-decoration:none}
@media(max-width:620px){.shell{margin:15px 12px;padding:20px}.head{align-items:flex-start;flex-direction:column}.progress{width:100%}.choices{grid-template-columns:1fr}.choices button{min-height:135px;display:flex;align-items:center;justify-content:center;gap:16px}.choices span{font-size:52px}.feedback.right{flex-direction:column}}
`;
