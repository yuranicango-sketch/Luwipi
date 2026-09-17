"use client";

import Link from "next/link";
import { type CSSProperties, useMemo, useRef, useState } from "react";
import type { KidsSong } from "@/lib/music-library";

type PianoKey = { note: string; color: string; playbackRate: number };
type PracticeMode = "virtual" | "physical";

const baseSample = "https://tonejs.github.io/audio/salamander/C4.mp3";

const defaultKeys: PianoKey[] = [
  { note: "Dó", color: "#ff5f86", playbackRate: 1 },
  { note: "Ré", color: "#ffbf3f", playbackRate: Math.pow(2, 2 / 12) },
  { note: "Mi", color: "#64c96b", playbackRate: Math.pow(2, 4 / 12) },
  { note: "Fá", color: "#4fc8c1", playbackRate: Math.pow(2, 5 / 12) },
  { note: "Sol", color: "#4b9df8", playbackRate: Math.pow(2, 7 / 12) },
  { note: "Lá", color: "#8f74eb", playbackRate: Math.pow(2, 9 / 12) },
  { note: "Si", color: "#d264d7", playbackRate: Math.pow(2, 11 / 12) },
];

function playPiano(key: PianoKey, volume = 0.72) {
  const audio = new Audio(baseSample);
  audio.preload = "auto";
  audio.playbackRate = key.playbackRate;
  audio.volume = volume;
  void audio.play();
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function SongPractice({ song }: { song: KidsSong }) {
  const sequence = song.sequence ?? [];
  const keys = useMemo(() => {
    const colorByNote = new Map(song.colors?.map((item) => [item.note, item.color]) ?? []);
    return defaultKeys.map((key) => ({ ...key, color: colorByNote.get(key.note) ?? key.color }));
  }, [song.colors]);

  const [mode, setMode] = useState<PracticeMode>("virtual");
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("Comece pela primeira nota ✨");
  const [wrong, setWrong] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const playToken = useRef(0);

  const expected = sequence[step];
  const progress = sequence.length ? Math.round((step / sequence.length) * 100) : 0;

  function resetPractice() {
    playToken.current += 1;
    setListening(false);
    setStep(0);
    setCompleted(false);
    setWrong(null);
    setMessage("Vamos de novo desde o começo 🎵");
  }

  function advance() {
    if (!sequence.length || completed) return;
    const next = step + 1;
    if (next >= sequence.length) {
      setStep(sequence.length);
      setCompleted(true);
      setMessage("Conseguimos! Toque outra vez ou escolha outra música 🌟");
      return;
    }
    setStep(next);
    setMessage("Muito bem. Continue 🎶");
  }

  function press(key: PianoKey) {
    playPiano(key);
    if (mode !== "virtual" || completed || !expected) return;
    if (key.note !== expected) {
      setWrong(key.note);
      setMessage(`Quase. Agora procure ${expected} 👀`);
      window.setTimeout(() => setWrong(null), 420);
      return;
    }
    advance();
  }

  function confirmPhysicalNote() {
    if (!expected || completed) return;
    const key = keys.find((item) => item.note === expected);
    if (key) playPiano(key, 0.45);
    advance();
  }

  async function listenToSong() {
    if (!sequence.length || listening) return;
    const token = playToken.current + 1;
    playToken.current = token;
    setListening(true);
    setMessage("Ouça primeiro. Depois você toca 👂");

    for (const note of sequence) {
      if (playToken.current !== token) return;
      const key = keys.find((item) => item.note === note);
      if (key) playPiano(key, 0.65);
      await wait(430);
    }

    if (playToken.current === token) {
      setListening(false);
      setMessage("Agora é a sua vez 🎹");
    }
  }

  if (!sequence.length) {
    return <div className="state"><h2>Esta experiência ainda não tem sequência pronta.</h2><Link className="btn btn-soft" href="/musicas">Voltar à biblioteca</Link></div>;
  }

  return (
    <div className="songPractice">
      <section className="practiceHero">
        <div className="storyCopy">
          <small>Experiência musical no Luwipi</small>
          <h1>{song.emoji} {song.title}</h1>
          <p>{song.story}</p>
          <div className="meta"><span>{song.age === "both" ? "2–8 anos" : `${song.age} anos`}</span><span>{song.difficulty}</span><span>{song.theme}</span></div>
        </div>
        <div className="scene" aria-hidden="true">
          <div className="sceneEmoji">{song.emoji}</div>
          <div className="road">
            {sequence.map((note, index) => {
              const key = keys.find((item) => item.note === note);
              return <i key={`${note}-${index}`} className={index < step ? "done" : index === step && !completed ? "active" : ""} style={{ background: key?.color }} />;
            })}
          </div>
          <div className="finish">🏁</div>
        </div>
      </section>

      <section className="practicePanel">
        <div className="topline">
          <div><small>Modo de prática</small><strong>{message}</strong></div>
          <div className="modeSwitch">
            <button className={mode === "virtual" ? "selected" : ""} type="button" onClick={() => setMode("virtual")}>No site</button>
            <button className={mode === "physical" ? "selected" : ""} type="button" onClick={() => setMode("physical")}>Piano físico</button>
          </div>
        </div>

        <div className="controls">
          <button type="button" className="btn btn-soft btn-small" onClick={listenToSong} disabled={listening}>{listening ? "Tocando…" : "▶ Ouvir primeiro"}</button>
          <button type="button" className="btn btn-soft btn-small" onClick={resetPractice}>↺ Recomeçar</button>
          <Link className="btn btn-primary btn-small" href={`/professor/tarefas?song=${song.id}`}>Enviar como tarefa →</Link>
        </div>

        <div className="sequence" aria-label="Sequência musical">
          {sequence.map((note, index) => {
            const key = keys.find((item) => item.note === note)!;
            return <span key={`${note}-${index}`} className={index < step ? "passed" : index === step && !completed ? "current" : ""} style={{ "--note-color": key.color } as CSSProperties}>{note}</span>;
          })}
        </div>
        <div className="progress"><i style={{ width: `${completed ? 100 : progress}%` }} /></div>

        {mode === "physical" && !completed && (
          <div className="physicalPrompt">
            <span>Agora no piano real</span>
            <strong>Toque {expected}</strong>
            <p>O professor observa a execução e confirma para avançar. Assim o Luwipi acompanha a aula sem substituir o piano.</p>
            <button className="btn btn-primary" type="button" onClick={confirmPhysicalNote}>✓ Tocou corretamente · avançar</button>
          </div>
        )}

        <div className={`pianoWrap ${mode === "physical" ? "reference" : ""}`}>
          <div className="piano">
            {keys.map((key) => (
              <button
                key={key.note}
                type="button"
                onClick={() => press(key)}
                className={`${wrong === key.note ? "wrong" : ""} ${expected === key.note && !completed ? "expected" : ""}`}
                style={{ "--key-color": key.color } as CSSProperties}
                aria-label={`Tocar ${key.note}`}
              >
                <span>{key.note}</span><b>{key.note}</b>
              </button>
            ))}
          </div>
        </div>

        {completed && (
          <div className="complete">
            <span>🌟</span>
            <div><strong>Música concluída!</strong><p>Você tocou a sequência inteira dentro do Luwipi.</p></div>
            <button className="btn btn-soft btn-small" type="button" onClick={resetPractice}>Tocar novamente</button>
          </div>
        )}
      </section>

      <div className="bottomActions"><Link href="/musicas">← Biblioteca musical</Link><Link href="/professor/tarefas">Criar tarefa para um aluno →</Link></div>
      <footer>Piano: amostras Salamander Grand Piano · CC BY 3.0 · Alexander Holm</footer>

      <style jsx>{`
        .songPractice{max-width:1080px;margin:0 auto;padding:20px}.practiceHero{display:grid;grid-template-columns:1.05fr .95fr;gap:20px;background:#fff;border:1px solid #e5ecf4;border-radius:30px;padding:26px;box-shadow:0 18px 50px rgba(41,70,106,.09)}.storyCopy small,.topline small{display:block;color:#6774d9;text-transform:uppercase;letter-spacing:.08em;font-size:11px;font-weight:900}.storyCopy h1{font-size:clamp(34px,5vw,58px);letter-spacing:-2px;margin:8px 0}.storyCopy p{color:#65748d;line-height:1.6;font-size:16px}.meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.meta span{padding:8px 10px;background:#f2f6fb;border-radius:99px;color:#52617a;font-size:12px;font-weight:800}.scene{position:relative;min-height:280px;border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#d8f1ff 0 58%,#bce794 58%)}.sceneEmoji{position:absolute;left:10%;bottom:74px;font-size:64px}.road{position:absolute;left:10%;right:12%;bottom:48px;height:14px;background:#f7e6bb;border-radius:99px;display:flex;justify-content:space-between;align-items:center}.road i{display:block;width:20px;height:20px;border:4px solid #fff;border-radius:50%;opacity:.38;transition:.2s}.road i.done,.road i.active{opacity:1}.road i.active{transform:scale(1.45);box-shadow:0 0 0 5px rgba(255,255,255,.6)}.finish{position:absolute;right:5%;bottom:60px;font-size:42px}.practicePanel{margin-top:18px;background:#fff;border:1px solid #e5ecf4;border-radius:30px;padding:26px;box-shadow:0 16px 42px rgba(41,70,106,.08)}.topline{display:flex;justify-content:space-between;gap:20px;align-items:center}.topline strong{display:block;font-size:22px;margin-top:5px}.modeSwitch{display:flex;background:#eef3f9;padding:4px;border-radius:14px}.modeSwitch button{border:0;background:transparent;padding:10px 13px;border-radius:11px;font-weight:900;color:#6e7c92;cursor:pointer}.modeSwitch .selected{background:#fff;color:#243651;box-shadow:0 3px 12px rgba(43,65,91,.12)}.controls{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0}.sequence{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin:22px 0 14px}.sequence span{--note-color:#6a8ac7;min-width:47px;height:47px;border:3px solid var(--note-color);border-radius:15px;display:grid;place-items:center;font-weight:900;color:var(--note-color);opacity:.35;transition:.2s}.sequence span.current{opacity:1;transform:translateY(-6px);box-shadow:0 8px 18px color-mix(in srgb,var(--note-color) 24%,transparent)}.sequence span.passed{opacity:.8;background:color-mix(in srgb,var(--note-color) 10%,white)}.progress{height:10px;background:#edf1f6;border-radius:99px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#63c174,#9ade7b);transition:.25s}.physicalPrompt{margin:24px 0;padding:22px;border-radius:22px;background:#fff8df;border:1px solid #efd889;text-align:center}.physicalPrompt span{display:block;color:#8a7226;font-size:11px;text-transform:uppercase;font-weight:900;letter-spacing:.08em}.physicalPrompt strong{display:block;font-size:30px;margin:6px 0}.physicalPrompt p{color:#756537;max-width:640px;margin:0 auto 16px;line-height:1.5}.pianoWrap{overflow-x:auto;padding:24px 2px 12px}.pianoWrap.reference{opacity:.72}.piano{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;max-width:900px;min-width:670px;margin:auto}.piano button{--key-color:#ddd;min-height:190px;border:3px solid #dfe5ee;border-radius:18px 18px 25px 25px;background:#fff;cursor:pointer;position:relative;box-shadow:inset 0 -11px 0 #e8edf3,0 8px 20px rgba(42,64,90,.08);transition:.12s}.piano button:hover{transform:translateY(-2px)}.piano button span{position:absolute;top:15px;left:50%;transform:translateX(-50%);width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--key-color);color:#fff;font-weight:900}.piano button b{position:absolute;bottom:27px;left:0;right:0;color:#53617b}.piano button.expected{border-color:var(--key-color);box-shadow:0 0 0 5px color-mix(in srgb,var(--key-color) 17%,transparent),inset 0 -11px 0 #e8edf3}.piano button.wrong{border-color:#ef6565;animation:shake .22s linear}.complete{margin-top:20px;border-radius:22px;background:#efffec;border:2px solid #bde8b9;padding:18px;display:flex;align-items:center;gap:14px}.complete>span{font-size:44px}.complete strong{font-size:18px}.complete p{margin:3px 0;color:#63728a}.complete button{margin-left:auto}.bottomActions{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:18px 8px}.bottomActions a{font-weight:800;color:#516f9b;text-decoration:none}footer{text-align:center;color:#8994a7;font-size:10px;padding:10px}.state{max-width:720px;margin:60px auto;background:#fff;padding:36px;text-align:center;border-radius:28px;border:1px solid #e5ecf4}@keyframes shake{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}@media(max-width:780px){.practiceHero{grid-template-columns:1fr}.scene{min-height:230px}.topline{align-items:flex-start;flex-direction:column}.complete{align-items:flex-start;flex-wrap:wrap}.complete button{margin-left:0}.songPractice{padding:12px}.practicePanel,.practiceHero{padding:18px}}@media(max-width:480px){.piano{min-width:600px}.piano button{min-height:145px}.sequence span{min-width:40px;height:40px;font-size:12px}}
      `}</style>
    </div>
  );
}
