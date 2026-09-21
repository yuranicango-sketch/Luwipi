import type { CSSProperties } from "react";
import styles from "./lesson-visual.module.css";
import type { AgeGroup } from "@/lib/curriculum";

type Props={stepId:string;icon:string;title:string;age:AgeGroup;accent:string;instruction?:string};
const A={ hand:"/assets/lessons/hand-finger-numbers.svg" };

export function LessonVisual({stepId,icon,title,age,accent,instruction=""}:Props){
 const w=`${title} ${instruction}`.toLowerCase(), young=age==="2-4";
 const kind=/dedo|mão|mao|polegar|indicador/.test(w)?"hands":/ritmo|batid|palma|pulso|tambor/.test(w)?"rhythm":/grave|agudo|grandão|pequenino|elefante|passarinho/.test(w)?"highlow":/ouvi|escut|som escondido/.test(w)?"listen":/rápid|rapido|devagar|trem/.test(w)?"tempo":/forte|suave|leão|leao|coelh/.test(w)?"dynamics":/subir|descer|escada/.test(w)?"direction":/cor|caminho/.test(w)?"colors":stepId==="activity"?"game":stepId==="create"||stepId==="checkpoint"?"create":stepId==="close"?"celebrate":"story";
 return <div className={styles.visual} style={{"--accent":accent} as CSSProperties} aria-label={`Cena da etapa: ${title}`}>
  <div className={styles.sceneLabel}>CENA DA AULA</div>
  {kind==="hands"&&<div className={styles.assetScene}><div className={styles.handWrap}><img src={A.hand} alt="Mão aberta"/><i className={styles.f1}>1</i><i className={styles.f2}>2</i><i className={styles.f3}>3</i><i className={styles.f4}>4</i><i className={styles.f5}>5</i></div><b>1 POLEGAR · 2 INDICADOR · 3 MÉDIO · 4 ANELAR · 5 MÍNIMO</b></div>}
  {kind==="highlow"&&<div className={styles.highlow}><div><span className={styles.assetEmoji}>🐘</span><small>{young?"SOM GRANDÃO":"GRAVE"}</small></div><strong>♪</strong><div><span className={styles.assetEmoji}>🐦</span><small>{young?"SOM PEQUENINO":"AGUDO"}</small></div></div>}
  {kind==="rhythm"&&<div className={styles.assetScene}><div className={styles.assetEmoji}>🥁</div><div className={styles.beats}><i/><i/><i/><i/></div><b>OUVE · SENTE · REPETE</b></div>}
  {kind==="listen"&&<div className={styles.assetScene}><div className={styles.symbol}>👂</div><div className={styles.waves}><i/><i/><i/><i/></div><b>{young?"ESCUTA A SURPRESA":"ESCUTA PRIMEIRO"}</b></div>}
  {kind==="tempo"&&<div className={styles.concept}><div>🐢<small>DEVAGAR</small></div><span>→ → →</span><div>🚂<small>RÁPIDO</small></div></div>}
  {kind==="dynamics"&&<div className={styles.concept}><div>🦁<small>FORTE</small></div><span>♪</span><div>🐇<small>SUAVE</small></div></div>}
  {kind==="direction"&&<div className={styles.direction}><span>♪</span><i/><i/><i/><i/><b>↑ SOBE　↓ DESCE</b></div>}
  {kind==="colors"&&<div className={styles.colors}><i/><i/><i/><div>1 → 2 → 3</div><b>SEGUE O CAMINHO</b></div>}
  {kind==="game"&&<div className={styles.cards}><div>★</div><div>?</div><div>✓</div><b>OUVE · ESCOLHE · DESCOBRE</b></div>}
  {kind==="create"&&<div className={styles.cards}><div>♪</div><div>★</div><div>✦</div><b>A TUA IDEIA VIRA MÚSICA</b></div>}
  {kind==="celebrate"&&<div className={styles.celebrate}><span>★</span><b>CONSEGUISTE!</b><div>♪　✦　♫</div></div>}
  {kind==="story"&&<div className={styles.assetScene}><div className={styles.storyIcon}>{icon}</div><b>{title.toUpperCase()}</b></div>}
 </div>;
}