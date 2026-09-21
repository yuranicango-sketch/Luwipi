import type { CSSProperties } from "react";
import styles from "./lesson-visual.module.css";
import { LuwipiPiano } from "@/components/luwipi-piano";

type Props={stepId:string;icon:string;title:string;age:"2-4"|"5-8";accent:string};

export function LessonVisual({stepId,icon,title,age,accent}:Props){
 const young=age==="2-4";
 const kind=stepId==="warmup"?"listen":stepId==="discover"?"discover":stepId==="activity"?"game":stepId==="repertoire"?"piano":stepId==="create"||stepId==="checkpoint"?"create":"celebrate";
 return <div className={styles.visual} style={{"--accent":accent} as CSSProperties} aria-label={`Visual da etapa: ${title}`}>
   <div className={styles.sky}><i/><i/><i/></div>
   <div className={styles.badge}>{icon}</div>
   {kind==="listen"&&<div className={styles.listen}><span>👂</span><div className={styles.waves}><i/><i/><i/><i/></div><b>{young?"Escuta primeiro":"Ouvir · sentir · tocar"}</b></div>}
   {kind==="discover"&&<div className={styles.discover}><div className={styles.elephant}>🐘<small>GRAVE</small></div><div className={styles.path}>♪</div><div className={styles.bird}>🐦<small>AGUDO</small></div></div>}
   {kind==="game"&&<div className={styles.game}><span>⭐</span><span>🎯</span><span>✨</span><b>OUVE · ESCOLHE · DESCOBRE</b></div>}
   {kind==="piano"&&<div className={styles.piano}><div className={styles.notes}>♪　♫　♪</div><LuwipiPiano compact showLabels octaves={young?1:2}/><b>{young?"Vamos fazer música":"Agora no piano"}</b></div>}
   {kind==="create"&&<div className={styles.create}><span>✨</span><div>🎨</div><div>🎹</div><div>🪄</div><b>A TUA IDEIA VIRA MÚSICA</b></div>}
   {kind==="celebrate"&&<div className={styles.celebrate}><span>🌟</span><b>CONSEGUISTE!</b><div>♪　✨　♫</div></div>}
 </div>
}