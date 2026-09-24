"use client";

import { useState } from "react";
import { contourForRepertoire, noteCharacters } from "@/lib/visual-learning";
import styles from "./melodic-contour.module.css";

export function MelodicContour({ repertoire, compact=false }: { repertoire: string; compact?: boolean }) {
  const song=contourForRepertoire(repertoire);
  const [active,setActive]=useState(0);

  if(!song) return null;

  return <section className={styles.wrap} data-compact={compact||undefined}>
    <div className={styles.head}>
      <div><span>ANTES DA PAUTA</span><strong>{song.title}</strong></div>
      <button onClick={()=>setActive((current)=>(current+1)%song.events.length)}>Próxima sílaba →</button>
    </div>
    <div className={styles.track} aria-label={`Contorno melódico de ${song.title}`}>
      {song.events.map((event,index)=>{
        const visual=noteCharacters[event.note];
        return <button
          key={`${event.syllable}-${index}`}
          className={styles.syllable}
          data-active={active===index||undefined}
          style={{"--noteColor":visual.color,"--pitch":String(event.pitch)} as React.CSSProperties}
          onClick={()=>setActive(index)}
          aria-label={`${event.syllable}, nota ${visual.label}`}
        >
          <b>{event.syllable}</b><small>{event.note}</small>
        </button>;
      })}
    </div>
    <p>A altura do bloco acompanha a direção da melodia. Cor + letra + posição aparecem juntas; nunca depende só da cor.</p>
  </section>;
}
