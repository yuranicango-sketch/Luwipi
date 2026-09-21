import type { CSSProperties } from "react";
import styles from "./lesson-visual.module.css";
import type { AgeGroup } from "@/lib/curriculum";

type Props={stepId:string;icon:string;title:string;age:AgeGroup;accent:string;instruction?:string};

export function LessonVisual({stepId,icon,title,age,accent,instruction=""}:Props){
  const words=`${title} ${instruction}`.toLowerCase();
  const young=age==="2-4";
  const kind=/dedo|mão|mao/.test(words)?"hands":/ritmo|batid|palma|pulso/.test(words)?"rhythm":/grave|agudo|grandão|pequenino/.test(words)?"highlow":stepId==="warmup"?"listen":stepId==="activity"?"game":stepId==="create"||stepId==="checkpoint"?"create":stepId==="close"?"celebrate":"story";
  return <div className={styles.visual} style={{"--accent":accent} as CSSProperties} aria-label={`Cena da etapa: ${title}`}>
    <div className={styles.sun}/><div className={styles.cloud}/><div className={styles.hill}/>
    <div className={styles.badge}>{icon}</div>
    {kind==="highlow"&&<div className={styles.highlow}><div><span>🐘</span><small>{young?"SOM GRANDÃO":"GRAVE"}</small></div><div className={styles.floatingNotes}>♪　♫</div><div><span>🐦</span><small>{young?"SOM PEQUENINO":"AGUDO"}</small></div></div>}
    {kind==="hands"&&<div className={styles.hands}><img className={styles.handAsset} src="/assets/lessons/hand-finger-numbers.svg" alt="Mão aberta com os dedos numerados de 1 a 5"/><b>MÃO SOLTA · DEDOS PRONTOS</b></div>}
    {kind==="rhythm"&&<div className={styles.rhythm}><span>🥁</span><div><i/><i/><i/><i/></div><b>OUVE · SENTE · REPETE</b></div>}
    {kind==="listen"&&<div className={styles.listen}><span>👂</span><div className={styles.waves}><i/><i/><i/><i/></div><b>{young?"Escuta a surpresa":"Escuta antes de tocar"}</b></div>}
    {kind==="game"&&<div className={styles.game}><span>⭐</span><span>🎯</span><span>✨</span><b>OUVE · ESCOLHE · DESCOBRE</b></div>}
    {kind==="create"&&<div className={styles.create}><span>✨</span><div>🎨</div><div>🎵</div><div>🪄</div><b>A TUA IDEIA VIRA MÚSICA</b></div>}
    {kind==="celebrate"&&<div className={styles.celebrate}><span>🌟</span><b>CONSEGUISTE!</b><div>♪　✨　♫</div></div>}
    {kind==="story"&&<div className={styles.story}><span>{icon}</span><div className={styles.floatingNotes}>♪　♫　♪</div><b>{title}</b></div>}
  </div>;
}