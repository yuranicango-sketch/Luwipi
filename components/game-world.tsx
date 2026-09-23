"use client";

import type { CSSProperties } from "react";
import type { GameWorld } from "@/lib/games";
import styles from "./game-world.module.css";

type Props={world:GameWorld;progress:number;reaction:"idle"|"success"|"wrong";level:number};

function Clouds(){return <div className={styles.clouds}><i/><i/><i/></div>}
function Particles(){return <div className={styles.particles}>{Array.from({length:12},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div>}

export function GameWorldScene({world,progress,reaction,level}:Props){
 const p=Math.max(0,Math.min(100,progress));
 return <div className={styles.world} data-world={world} data-reaction={reaction} data-level={level} aria-hidden="true">
  {world==="giant-sky"&&<div className={styles.giantSky}><Clouds/><div className={styles.sun}/><div className={styles.hills}/><div className={styles.giant}><i/><b/><span/><em/></div><div className={styles.star} style={{left:`${58+p*.22}%`}}/><Particles/></div>}
  {world==="echo-canyon"&&<div className={styles.canyon}><div className={styles.canyonSky}/><div className={styles.wall} data-side="left"/><div className={styles.wall} data-side="right"/><div className={styles.echoRings}><i/><i/><i/></div><div className={styles.canyonRiver}/><Particles/></div>}
  {world==="rhythm-railway"&&<div className={styles.railway}><Clouds/><div className={styles.railHill}/><div className={styles.station}/><div className={styles.tracks}/><div className={styles.train} style={{left:`${5+p*.7}%`}}><i/><b/><span/></div><div className={styles.signal}/><Particles/></div>}
  {world==="keyboard-kingdom"&&<div className={styles.kingdom}><Clouds/><div className={styles.castle}><i/><i/><b/><span/></div><div className={styles.keyRoad}>{Array.from({length:14},(_,i)=><i key={i} data-black={[1,2,4,5,6,8,9,11,12,13].includes(i)}/>)}</div><div className={styles.beacon} style={{left:`${8+p*.78}%`}}/><Particles/></div>}
  {world==="color-river"&&<div className={styles.colorRiver}><div className={styles.riverSky}/><div className={styles.riverBank} data-side="left"/><div className={styles.riverBank} data-side="right"/><div className={styles.water}/><div className={styles.stones}>{Array.from({length:7},(_,i)=><i key={i} data-on={i<=Math.round(p/16.7)} style={{"--i":i} as CSSProperties}/>)}</div><Particles/></div>}
  {world==="notation-city"&&<div className={styles.city}><Clouds/><div className={styles.buildings}>{Array.from({length:8},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}><b/><b/></i>)}</div><div className={styles.staffRoad}>{Array.from({length:5},(_,i)=><i key={i}/>)}</div><div className={styles.noteRunner} style={{left:`${7+p*.82}%`}}/><Particles/></div>}
  {world==="hand-workshop"&&<div className={styles.workshop}><div className={styles.window}/><div className={styles.shelf}><i/><i/><i/></div><div className={styles.desk}/><div className={styles.metronome}><i/></div><div className={styles.taskLights}>{Array.from({length:5},(_,i)=><i key={i} data-on={i<=Math.round(p/25)}/>)}</div><Particles/></div>}
  {world==="harmony-tower"&&<div className={styles.harmony}><Clouds/><div className={styles.tower}><i/><b/><span/></div><div className={styles.harmonyRings}><i/><i/><i/></div><div className={styles.ground}/><Particles/></div>}
  {world==="creation-studio"&&<div className={styles.studio}><div className={styles.studioWindow}/><div className={styles.canvas}><i/><b/><span/><em/></div><div className={styles.record}><i/><b/></div><div className={styles.studioDesk}/><Particles/></div>}
  <div className={styles.levelAtmosphere}/>
 </div>;
}
