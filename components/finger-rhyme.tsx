"use client";

import { useState } from "react";
import type { AgeBand } from "@/lib/suzuki-lessons";
import { fingerExercises } from "@/lib/visual-learning";
import styles from "./finger-rhyme.module.css";

export function FingerRhyme({ ageBand }: { ageBand: AgeBand }) {
  const exercise=fingerExercises[ageBand];
  const [index,setIndex]=useState(0);
  const current=exercise.sequence[index];

  return <section className={styles.wrap}>
    <div className={styles.handCard}>
      <svg viewBox="0 0 380 320" role="img" aria-label={`Mão ${current.hand==="R"?"direita":"esquerda"}, dedo ${current.finger} ativo`}>
        <path className={styles.palm} d="M109 238c-29-15-49-38-45-65 4-23 23-31 43-23l18 7V65c0-15 9-26 22-26s22 11 22 26v66h7V49c0-16 10-28 24-28s24 12 24 28v83h7V62c0-15 9-26 22-26s22 11 22 26v84h6V84c0-14 9-24 22-24 12 0 21 10 21 24v101c0 47-31 89-77 103-48 14-101-7-122-50Z"/>
        <rect className={styles.finger} data-active={current.finger===1||undefined} x="126" y="37" width="44" height="118" rx="22"/>
        <rect className={styles.finger} data-active={current.finger===2||undefined} x="177" y="16" width="48" height="140" rx="24"/>
        <rect className={styles.finger} data-active={current.finger===3||undefined} x="233" y="31" width="46" height="127" rx="23"/>
        <rect className={styles.finger} data-active={current.finger===4||undefined} x="286" y="55" width="41" height="109" rx="20"/>
        <path className={styles.finger} data-active={current.finger===5||undefined} d="M111 153 72 137c-18-8-34 3-38 20-4 17 6 31 23 40l54 26Z"/>
      </svg>
      <span>{current.hand==="R"?"Mão direita":"Mão esquerda"} · dedo {current.finger}</span>
    </div>
    <div className={styles.rhyme}>
      <span>RIMA LUWIPI · {ageBand} ANOS</span>
      <h3>{exercise.title}</h3>
      <p>{exercise.rhyme[Math.min(Math.floor(index/Math.max(1,Math.ceil(exercise.sequence.length/exercise.rhyme.length))),exercise.rhyme.length-1)]}</p>
      <small>O professor conduz devagar. Força não é objetivo; independência e gesto confortável são.</small>
      <div><button onClick={()=>setIndex((currentIndex)=>(currentIndex+1)%exercise.sequence.length)}>Próximo dedo →</button><button onClick={()=>setIndex(0)}>Recomeçar</button></div>
    </div>
  </section>;
}
