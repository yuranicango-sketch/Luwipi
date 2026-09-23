"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LuwipiPiano, type LuwipiPianoKey } from "@/components/luwipi-piano";
import { PianoInputDock, type DetectedPianoNote, type PianoInputSource } from "@/components/piano-input";
import styles from "./learning-player.module.css";

export type LearningPianoDeck = {
  input: PianoInputSource;
  onInputChange: (source: PianoInputSource) => void;
  onExternalNote: (note: DetectedPianoNote) => void;
  onPress?: (key: LuwipiPianoKey) => void;
  onBlackPress?: (pitch: string) => void;
  expected?: string | string[];
  wrong?: string | string[] | null;
  octaves?: 1 | 2 | 3;
  startOctave?: number;
  showLabels?: boolean;
  blackKeysInteractive?: boolean;
  attentionCue?: boolean;
  hint?: string;
};

type Props = {
  backHref?: string;
  onBack?: () => void;
  eyebrow: string;
  title: string;
  progress?: number;
  status?: string;
  action?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  piano: LearningPianoDeck;
  tone?: "lesson" | "song" | "game";
  audience?: "preschool" | "child" | "adult";
};

export function LearningPlayer({ backHref, onBack, eyebrow, title, progress = 0, status, action, toolbar, children, piano, tone = "lesson", audience = "child" }: Props) {
  const inputActive = piano.input === "screen";
  return <section className={styles.shell} data-tone={tone} data-audience={audience}>
    <header className={styles.topbar}>
      {onBack ? <button className={styles.back} type="button" onClick={onBack} aria-label="Abrir mapa do percurso">←</button> : <Link className={styles.back} href={backHref ?? "/dashboard"} aria-label="Voltar">←</Link>}
      <div className={styles.identity}><small>{eyebrow}</small><strong>{title}</strong></div>
      <div className={styles.progress} aria-label={`${Math.round(progress)}% concluído`}><i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}/></div>
      {status && <span className={styles.status}>{status}</span>}
      {action && <div className={styles.action}>{action}</div>}
    </header>

    <main className={styles.stage}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      <div className={styles.content}>{children}</div>
    </main>

    <section className={styles.deck}>
      <div className={styles.deckTop}>
        <PianoInputDock source={piano.input} onSourceChange={piano.onInputChange} onNote={piano.onExternalNote} compact />
        <div className={styles.deckHint}><span>PIANO LUWIPI</span><strong>{piano.hint ?? (inputActive ? "Toque diretamente no teclado" : piano.input === "midi" ? "Teclado MIDI ligado ao Player" : "Piano real a ser ouvido pelo microfone")}</strong></div>
      </div>
      <LuwipiPiano
        deck
        octaves={piano.octaves ?? 3}
        startOctave={piano.startOctave ?? 3}
        expected={piano.expected}
        wrong={piano.wrong}
        onPress={piano.onPress}
        onBlackPress={piano.onBlackPress}
        showLabels={piano.showLabels ?? true}
        blackKeysInteractive={piano.blackKeysInteractive ?? true}
        attentionCue={piano.attentionCue ?? false}
        disabled={!inputActive}
      />
    </section>
  </section>;
}
