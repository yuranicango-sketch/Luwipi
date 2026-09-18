"use client";

import Link from "next/link";
import { type CSSProperties, useMemo, useRef, useState } from "react";
import type { KidsSong } from "@/lib/music-library";
import { playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import { MusicScore } from "@/components/music-score";

type Key = { note: string; color: string; rate: number };
type Mode = "site" | "piano";
type Theme = "candy" | "star" | "paw" | "bell" | "water" | "music";

const KEYS: Key[] = [
  { note: "Dó", color: "#ff5f86", rate: 1 },
  { note: "Ré", color: "#ffbf3f", rate: Math.pow(2, 2 / 12) },
  { note: "Mi", color: "#64c96b", rate: Math.pow(2, 4 / 12) },
  { note: "Fá", color: "#4fc8c1", rate: Math.pow(2, 5 / 12) },
  { note: "Sol", color: "#4b9df8", rate: Math.pow(2, 7 / 12) },
  { note: "Lá", color: "#8f74eb", rate: Math.pow(2, 9 / 12) },
  { note: "Si", color: "#d264d7", rate: Math.pow(2, 11 / 12) },
];

const SPECIAL: Record<string,{ theme: Theme; scene: string; finish: string; goal: string }> = {
  "passeio-das-cores": { theme: "candy", scene: "garden", finish: "As cores chegaram à festa!", goal: "🎉" },
  estrelinha: { theme: "star", scene: "night", finish: "A estrelinha encontrou o céu!", goal: "🌌" },
  "maria-cordeirinho": { theme: "paw", scene: "field", finish: "Nino encontrou Maria!", goal: "🏫" },
  "irmao-joao": { theme: "bell", scene: "village", finish: "Os sinos acordaram a vila!", goal: "🔔" },
  "rema-rema-barco": { theme: "water", scene: "river", finish: "O barquinho chegou à margem!", goal: "🏝️" },
};

function sound(key: Key) { void playPianoRate(key.rate); }
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function NoteToken({theme,color,note,active,done}:{theme:Theme;color:string;note:string;active:boolean;done:boolean}) {
  return (
    <div className={`token ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        {theme === "candy" && <><path d="M15 23 3 16l3 16-3 16 12-7M49 23l12-7-3 16 3 16-12-7" fill={color} opacity=".55"/><circle cx="32" cy="32" r="19" fill={color}/><path d="M20 28c8-7 16-8 24-3M20 39c8-7 16-8 24-3" fill="none" stroke="#fff" strokeWidth="4" opacity=".55"/></>}
        {theme === "star" && <path d="m32 5 8 16 17 2-12 12 3 17-16-8-16 8 3-17L7 23l17-2Z" fill={color}/>}
        {theme === "paw" && <><ellipse cx="32" cy="40" rx="14" ry="11" fill={color}/><circle cx="16" cy="28" r="6" fill={color}/><circle cx="28" cy="20" r="6" fill={color}/><circle cx="42" cy="22" r="6" fill={color}/><circle cx="50" cy="33" r="5" fill={color}/></>}
        {theme === "bell" && <><path d="M16 43h32c-5-7-7-12-7-20 0-7-4-12-9-12s-9 5-9 12c0 8-2 13-7 20Z" fill={color}/><circle cx="32" cy="48" r="5" fill={color}/></>}
        {theme === "water" && <path d="M32 5C24 19 14 30 14 41a18 18 0 0 0 36 0C50 30 40 19 32 5Z" fill={color}/>}
        {theme === "music" && <><circle cx="24" cy="45" r="9" fill={color}/><circle cx="45" cy="39" r="9" fill={color}/><path d="M32 44V15l21-5v29" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"/></>}
      </svg>
      <b>{note}</b>
    </div>
  );
}

function Scene({ song, progress }: { song: KidsSong; progress: number }) {
  const meta = SPECIAL[song.id] ?? ({ theme: "music" as Theme, scene: "garden", finish: "História concluída!", goal: "🏁" } as const);
  return (
    <div className={`scene ${meta.scene}`}>
      <div className="sun">☀️</div><div className="cloud c1">☁️</div><div className="cloud c2">☁️</div>
      {meta.scene === "night" && <><div className="moon">🌙</div><div className="stars">✦　✧　✦　✧　✦</div></>}
      {meta.scene === "field" && <><div className="school">🏫</div><div className="flowers">🌼　🌷　🌼　🌷</div></>}
      {meta.scene === "village" && <div className="houses">🏠　🏡　🏠　⛪</div>}
      {meta.scene === "river" && <><div className="mountains">⛰️　⛰️　⛰️</div><div className="waterline">〰️〰️〰️〰️〰️</div></>}
      {meta.scene === "garden" && <><div className="rainbow">🌈</div><div className="flowers">🌸　🌼　🌷　🌸</div></>}
      <div className="path" />
      <span className="traveler" style={{ left: `${5 + progress * 0.82}%` }}>{song.emoji}</span>
      <span className="goal">{meta.goal}</span>
    </div>
  );
}

function buildSections(song: KidsSong) {
  if (song.sections?.length) return song.sections;
  return [{ label: "Música", notes: song.sequence ?? [] }];
}

function sectionForStep(sections: { label: string; notes: string[] }[], step: number) {
  let cursor = 0;
  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    const end = cursor + section.notes.length;
    if (step < end) return { index, start: cursor, end, section };
    cursor = end;
  }
  const lastIndex = Math.max(0, sections.length - 1);
  const last = sections[lastIndex] ?? { label: "Música", notes: [] };
  return { index: lastIndex, start: Math.max(0, cursor - last.notes.length), end: cursor, section: last };
}

export function SongPractice({ song }: { song: KidsSong }) {
  const sections = useMemo(() => buildSections(song), [song]);
  const seq = useMemo(() => sections.flatMap((section) => section.notes), [sections]);
  const piano = useMemo(() => {
    const colors = new Map(song.colors?.map((item) => [item.note, item.color]) ?? []);
    return KEYS.map((key) => ({ ...key, color: colors.get(key.note) ?? key.color }));
  }, [song.colors]);

  const meta = SPECIAL[song.id] ?? ({ theme: "music" as Theme, scene: "garden", finish: "História concluída!", goal: "🏁" } as const);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("site");
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const token = useRef(0);

  const done = step >= seq.length;
  const expected = done ? undefined : seq[step];
  const progress = seq.length ? Math.min(100, Math.round((step / seq.length) * 100)) : 0;
  const currentSection = sectionForStep(sections, step);
  const visibleNotes = currentSection.section.notes;
  const localStep = Math.max(0, step - currentSection.start);

  function reset() { token.current += 1; setStep(0); setWrong(null); setListening(false); setStarted(true); }
  function start() { void preloadPianoSamples(); setStarted(true); }

  function press(key: Key) {
    sound(key);
    if (mode !== "site" || !expected) return;
    if (key.note !== expected) { setWrong(key.note); window.setTimeout(() => setWrong(null), 350); return; }
    setStep((value) => value + 1);
  }

  async function listen() {
    if (listening) return;
    const id = ++token.current;
    setListening(true);
    for (const note of visibleNotes) {
      if (token.current !== id) return;
      const key = piano.find((item) => item.note === note);
      if (key) sound(key);
      await wait(470);
    }
    if (token.current === id) setListening(false);
  }

  if (!started) {
    return <section className="card intro"><div className="heroEmoji">{song.emoji}</div><small>Historinha</small><h1>{song.title}</h1><p>{song.story}</p><button className="duo" type="button" onClick={start}>COMEÇAR</button><style jsx>{css}</style></section>;
  }

  if (done) {
    return <section className="card intro"><div className="heroEmoji">🌟</div><h1>Muito bem!</h1><p>{meta.finish}</p><button className="duo" type="button" onClick={reset}>TOCAR DE NOVO</button><Link className="homework" href={`/professor/tarefas?song=${song.id}`}>Enviar como tarefa</Link><style jsx>{css}</style></section>;
  }

  return (
    <section className="card">
      <div className="head">
        <div><small>Parte {currentSection.index + 1} de {sections.length} · {currentSection.section.label}</small><h1>Agora: {expected}</h1></div>
        <div className="mode">
          <button type="button" className={mode === "site" ? "active" : ""} onClick={() => setMode("site")}>No site</button>
          <button type="button" className={mode === "piano" ? "active" : ""} onClick={() => setMode("piano")}>Piano físico</button>
        </div>
      </div>

      <Scene song={song} progress={progress} />
      <button className="listen" type="button" onClick={() => void listen()}>{listening ? "Tocando…" : "🔊 OUVIR ESTA PARTE"}</button>

      {song.sheetMusic ? (
        <MusicScore notes={visibleNotes} currentIndex={localStep} timeSignature={song.timeSignature ?? "4/4"} />
      ) : (
        <div className="notes">
          {visibleNotes.map((note, index) => {
            const key = piano.find((item) => item.note === note)!;
            return <NoteToken key={`${note}-${currentSection.index}-${index}`} theme={meta.theme} color={key.color} note={note} active={index === localStep} done={index < localStep}/>;
          })}
        </div>
      )}

      <div className="songProgress" aria-label="progresso da música completa"><i style={{ width: `${progress}%` }} /></div>

      {mode === "piano" ? (
        <div className="physical"><span>Toque no piano real</span><strong>{expected}</strong><button className="duo" type="button" onClick={() => expected && setStep((value) => value + 1)}>TOCOU · CONTINUAR</button></div>
      ) : (
        <div className="pianoShell">
          <div className="brand">LUWIPI PIANO</div>
          <div className="pianoReal">
            {piano.map((key) => <button key={key.note} type="button" onClick={() => press(key)} className={`white ${expected === key.note ? "expected" : ""} ${wrong === key.note ? "wrong" : ""}`} style={{ "--key": key.color } as CSSProperties}><span>{key.note}</span></button>)}
            <i className="black b1" /><i className="black b2" /><i className="black b3" /><i className="black b4" /><i className="black b5" />
          </div>
        </div>
      )}

      <style jsx>{css}</style>
    </section>
  );
}

const css = `.card{max-width:960px;margin:30px auto;padding:28px;background:#fff;border:1px solid #e4eaf1;border-radius:28px;box-shadow:0 16px 44px rgba(42,69,101,.08)}.intro{text-align:center;max-width:680px;padding:42px 30px}.heroEmoji{font-size:78px}small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6c75cd}h1{font-size:clamp(30px,5vw,48px);margin:6px 0 10px}p{color:#68768b;line-height:1.6}.duo{display:block;width:min(360px,100%);min-height:52px;margin:25px auto 13px;border:0;border-radius:16px;background:#58cc02;color:#fff;font-weight:950;box-shadow:0 5px 0 #46a302}.homework{display:block;font-weight:900;color:#5d7191;text-decoration:none}.head{display:flex;justify-content:space-between;align-items:center;gap:15px}.mode{display:flex;background:#eef3f8;padding:4px;border-radius:13px}.mode button{border:0;background:transparent;padding:9px 12px;border-radius:10px;font-weight:900;color:#708096}.mode .active{background:#fff;color:#2f4059}.scene{height:245px;margin:20px 0 5px;border-radius:26px;overflow:hidden;position:relative;background:linear-gradient(#c9efff 0 55%,#9ddd80 56%);box-shadow:inset 0 0 0 1px #dbe7ed}.scene.night{background:linear-gradient(#565cc8,#24296f)}.scene.river{background:linear-gradient(#c9efff 0 52%,#68c8e8 53%)}.scene.village{background:linear-gradient(#f7c9d8,#fff0c9)}.sun,.moon,.rainbow,.school,.goal,.cloud,.stars,.houses,.mountains,.flowers,.waterline{position:absolute}.sun{left:7%;top:8%;font-size:34px}.night .sun{display:none}.moon{right:10%;top:8%;font-size:36px}.c1{left:22%;top:12%;font-size:35px}.c2{right:26%;top:18%;font-size:30px}.night .cloud{opacity:.16}.stars{left:18%;top:17%;color:#fff7bf;font-size:24px}.rainbow{left:7%;bottom:43%;font-size:58px}.school{right:9%;bottom:31%;font-size:65px}.houses{left:7%;right:7%;bottom:28%;font-size:48px;white-space:nowrap}.mountains{left:8%;top:31%;font-size:55px}.flowers{left:48%;bottom:9%;font-size:28px}.waterline{left:5%;right:5%;bottom:7%;font-size:40px;color:#d8f7ff}.path{position:absolute;left:4%;right:5%;bottom:18%;height:24px;border-radius:50%;background:#f1d9a5;transform:rotate(-2deg)}.river .path{background:#bcecf7;height:9px}.night .path{background:#3b408d}.traveler{position:absolute;bottom:18%;font-size:42px;z-index:2;transition:left .25s ease;filter:drop-shadow(0 4px 3px #0002)}.goal{right:4%;bottom:19%;font-size:43px}.listen{display:block;width:min(320px,100%);margin:20px auto;border:0;border-radius:16px;padding:16px;background:#1cb0f6;color:#fff;font-weight:950;box-shadow:0 5px 0 #1689bf}.notes{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:flex-end;margin:18px 0 24px}.token{width:56px;text-align:center;opacity:.3;transition:.18s}.token svg{width:50px;height:50px;display:block;margin:auto;filter:drop-shadow(0 3px 3px #38465a22)}.token b{font-size:11px;color:#6f7f91}.token.done{opacity:.7}.token.active{opacity:1;transform:translateY(-7px) scale(1.08)}.physical{text-align:center;padding:25px;background:#fff8df;border-radius:20px}.physical span{display:block;font-size:12px;font-weight:900;color:#7c6a31}.physical strong{display:block;font-size:44px}.pianoShell{max-width:840px;margin:22px auto 0;background:#2a2d33;border-radius:20px;padding:10px 12px 14px;box-shadow:0 12px 24px #1e25302e}.brand{text-align:center;height:32px;color:#c7ccd4;font-size:10px;font-weight:900;letter-spacing:.18em}.pianoReal{position:relative;display:grid;grid-template-columns:repeat(7,1fr);height:220px;overflow:hidden;border-radius:6px 6px 12px 12px}.white{--key:#8291a5;position:relative;border:0;border-right:1px solid #c8cdd4;background:linear-gradient(#fff 0 78%,#edf0f4);box-shadow:inset 0 -8px 0 #e8ebef}.white span{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);padding:8px 10px;min-width:42px;border-radius:999px;background:var(--key);color:#fff;font-weight:950}.white.expected{box-shadow:inset 0 -8px 0 color-mix(in srgb,var(--key) 45%,#e8ebef),inset 0 0 0 3px var(--key)}.white.wrong{box-shadow:inset 0 0 0 3px #ef6767}.black{position:absolute;top:0;width:8.8%;height:61%;background:linear-gradient(90deg,#101217,#343942 42%,#111319);border-radius:0 0 7px 7px;z-index:3;pointer-events:none;box-shadow:0 5px 7px #0005,inset 0 -5px 0 #08090c}.b1{left:9.9%}.b2{left:24.15%}.b3{left:52.75%}.b4{left:67.05%}.b5{left:81.35%}@media(max-width:650px){.card{margin:15px 12px;padding:18px}.head{align-items:flex-start;flex-direction:column}.mode{width:100%}.mode button{flex:1}.scene{height:190px}.notes{gap:4px}.token{width:44px}.token svg{width:40px;height:40px}.pianoShell{overflow-x:auto}.pianoReal,.brand{min-width:610px}.pianoReal{height:180px}}`;
