"use client";

import { useState } from "react";
import type { AgeBand, LessonBlock } from "@/lib/suzuki-lessons";
import { playPercussionClick, playPianoSemitone } from "@/lib/piano-sampler";
import styles from "./lesson-experience.module.css";

function experienceKind(block: LessonBlock) {
  if (block.competencies.includes("pitch")) return "pitch";
  if (block.competencies.includes("dynamics")) return "dynamics";
  if (block.competencies.includes("keyboard")) return "keyboard";
  if (block.competencies.includes("rhythm") || block.competencies.includes("pulse")) return "rhythm";
  if (block.competencies.some((item) => ["posture", "hand", "fingers"].includes(item))) return "technique";
  if (block.competencies.includes("reading")) return "reading";
  if (block.kind === "ear") return "listening";
  return "repertoire";
}

export function LessonExperience({ block, ageBand, silent = false }: { block: LessonBlock; ageBand: AgeBand; silent?: boolean }) {
  const kind = experienceKind(block);
  const [message, setMessage] = useState("");

  async function pitch(semitone: number, label: string) {
    if (!silent) await playPianoSemitone(semitone, { duration: 1.1 });
    setMessage(label);
  }
  async function dynamic(gain: number, label: string) {
    if (!silent) await playPianoSemitone(0, { gain, duration: 1 });
    setMessage(label);
  }
  async function rhythm() {
    if (!silent) {
      for (let i = 0; i < 4; i += 1) {
        await playPercussionClick({ gain: 0.18, duration: 0.08 });
        await new Promise((resolve) => window.setTimeout(resolve, 380));
      }
    }
    setMessage("1 · 2 · 3 · 4");
  }

  return <section className={styles.frame} data-age={ageBand} data-kind={kind} aria-label="Pista visual da atividade">
    {kind === "pitch" && <div className={styles.pitchGrid}>
      <button onClick={() => void pitch(-12, "GRAVE")} aria-label="Ouvir ou mostrar grave">
        <svg viewBox="0 0 180 120" aria-hidden="true"><path d="M22 91c0-30 24-55 55-55 19 0 35 8 46 22 17 1 31 15 31 33H22Z"/><circle cx="70" cy="61" r="5"/><path d="M48 43 34 28l2 28M109 42l14-15-1 27"/></svg><strong>grave</strong><small>baixo · pesado</small>
      </button>
      <button onClick={() => void pitch(12, "AGUDO")} aria-label="Ouvir ou mostrar agudo">
        <svg viewBox="0 0 180 120" aria-hidden="true"><path d="M36 75c26-4 46-18 55-42 10 22 29 36 55 42-19 4-35 13-48 27H82C69 88 54 79 36 75Z"/><circle cx="105" cy="55" r="4"/><path d="m117 61 18 5-17 5"/></svg><strong>agudo</strong><small>alto · leve</small>
      </button>
    </div>}

    {kind === "dynamics" && <div className={styles.dynamicGrid}>
      <button onClick={() => void dynamic(0.62, "FORTE")}><span className={styles.bigSound}/><strong>forte</strong><small>cheio, sem bater</small></button>
      <button onClick={() => void dynamic(0.16, "SUAVE")}><span className={styles.softSound}/><strong>suave</strong><small>pequeno e controlado</small></button>
    </div>}

    {kind === "keyboard" && <div className={styles.keyboardMap} aria-label="Grupos de duas e três teclas pretas">
      <div className={styles.whiteKeys}>{Array.from({ length: 9 }).map((_, index) => <span key={index}/>)}</div>
      <div className={styles.blackKeys}><i/><i/><i className={styles.gap}/><i/><i/><i/></div>
      <p>Encontra <b>2</b>. Depois encontra <b>3</b>.</p>
    </div>}

    {kind === "rhythm" && <button className={styles.rhythm} onClick={() => void rhythm()}>
      <span/><span/><span/><span/><b>sentir o pulso</b><small>toca para ouvir · ou marca com o corpo</small>
    </button>}

    {kind === "technique" && <div className={styles.technique}>
      <svg viewBox="0 0 360 170" aria-hidden="true">
        <rect x="36" y="111" width="288" height="38" rx="8"/>
        <path className={styles.hand} d="M98 94c20-28 42-40 67-38 21 2 35 16 48 34 14-17 31-24 50-19 14 4 23 14 28 29-38-9-68-4-89 14-37-12-72-19-104-20Z"/>
        <path className={styles.arm} d="M28 61c34 1 55 10 76 31M332 61c-34 1-55 10-76 31"/>
      </svg>
      <div><b>ombros soltos</b><b>mão confortável</b><b>som bonito</b></div>
    </div>}

    {kind === "reading" && <div className={styles.reading}>
      <div className={styles.staff}>{[0,1,2,3,4].map((index) => <span key={index}/>)}</div>
      <div className={styles.notes}><i style={{bottom:"22%"}}/><i style={{bottom:"36%"}}/><i style={{bottom:"50%"}}/><i style={{bottom:"50%"}}/><i style={{bottom:"64%"}}/></div>
      <p>olha a direção antes de dizer nomes</p>
    </div>}

    {kind === "listening" && <div className={styles.listening}>
      <span className={styles.earMark}>◖</span><div><i/><i/><i/><i/></div><p>ouve → guarda → responde</p>
    </div>}

    {kind === "repertoire" && <div className={styles.repertoire}>
      <span>♪</span><i/><span>♪</span><i/><span>♫</span><p>uma música inteira nasce de pequenos pedaços</p>
    </div>}

    {message && <p className={styles.feedback} role="status">{message}</p>}
  </section>;
}
