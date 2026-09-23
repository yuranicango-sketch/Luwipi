"use client";

import type { CSSProperties, ReactNode } from "react";
import { worldForLesson, worldLabel, type LessonWorldId } from "@/lib/lesson-worlds";
import type { LessonExperience } from "@/lib/lesson-experience";
import styles from "./living-lesson-world.module.css";

type Reaction="idle"|"success"|"wrong";
type Props={age:"2-4"|"5-8"|"adult";lessonNumber:number;experience:LessonExperience;reaction?:Reaction};

function Clouds(){
 return <><i className={styles.cloud} data-cloud="1"/><i className={styles.cloud} data-cloud="2"/><i className={styles.cloud} data-cloud="3"/></>;
}
function Fireflies(){return <div className={styles.fireflies}>{Array.from({length:12},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div>}
function MusicDust(){return <div className={styles.musicDust}>{Array.from({length:10},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div>}

function GiantSky(){
 return <div className={styles.giantSky}><div className={styles.sun}/><Clouds/><div className={styles.farHill}/><div className={styles.nearHill}/><div className={styles.giant}><i className={styles.giantHair}/><i className={styles.giantHead}/><i className={styles.giantBody}/><i className={styles.giantArm} data-side="left"/><i className={styles.giantArm} data-side="right"/><i className={styles.giantLeg} data-side="left"/><i className={styles.giantLeg} data-side="right"/></div><div className={styles.starFriend}><i/><i/><i/></div><div className={styles.grassLine}/></div>
}
function WhisperForest(){
 return <div className={styles.whisperForest}><div className={styles.forestGlow}/><Clouds/><div className={styles.tree} data-tree="1"/><div className={styles.tree} data-tree="2"/><div className={styles.tree} data-tree="3"/><div className={styles.tree} data-tree="4"/><div className={styles.stream}/><div className={styles.reeds}>{Array.from({length:8},(_,i)=><i key={i}/>)}</div><Fireflies/></div>
}
function RhythmRailway(){
 return <div className={styles.rhythmRailway}><Clouds/><div className={styles.station}><i/><b/><span/></div><div className={styles.railHill}/><div className={styles.tracks}><i/><i/></div><div className={styles.train}><i className={styles.engine}/><i className={styles.chimney}/><span/><b/><em data-car="1"/><em data-car="2"/></div><div className={styles.signal}><i/><b/></div><MusicDust/></div>
}
function KeyboardKingdom(){
 return <div className={styles.keyboardKingdom}><Clouds/><div className={styles.castle}><i data-tower="1"/><i data-tower="2"/><b/><span/><em/></div><div className={styles.keyRoad}>{Array.from({length:12},(_,i)=><i key={i} data-black={[1,2,4,5,6,8,9,11].includes(i)}/>)}</div><div className={styles.flags}><i/><i/><i/></div><MusicDust/></div>
}
function MoonGarden(){
 return <div className={styles.moonGarden}><div className={styles.moon}/><div className={styles.nightGlow}/><div className={styles.nightHill}/><div className={styles.gardenTree}/><div className={styles.flowers}>{Array.from({length:9},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div><div className={styles.pond}><i/><i/></div><Fireflies/></div>
}
function HandWorkshop(){
 return <div className={styles.handWorkshop}><div className={styles.window}><i/><b/></div><div className={styles.shelf}><i/><i/><i/><i/></div><div className={styles.lamp}><i/><b/></div><div className={styles.workDesk}/><div className={styles.metronome}><i/><b/></div><div className={styles.paperStack}><i/><i/><i/></div><MusicDust/></div>
}
function StoryValley(){
 return <div className={styles.storyValley}><div className={styles.sunset}/><Clouds/><div className={styles.valleyBack}/><div className={styles.valleyFront}/><div className={styles.path}/><div className={styles.littleHouse}><i/><b/><span/></div><div className={styles.windmill}><i/><b/><em/><em/></div><MusicDust/></div>
}
function NotationCity(){
 return <div className={styles.notationCity}><div className={styles.citySky}/><Clouds/><div className={styles.buildings}>{Array.from({length:7},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}><b/><b/><b/></i>)}</div><div className={styles.staffBridge}>{Array.from({length:5},(_,i)=><i key={i}/>)}</div><div className={styles.noteCar}><i/><b/></div><MusicDust/></div>
}
function HandBridge(){
 return <div className={styles.handBridge}><div className={styles.bridgeSky}/><Clouds/><div className={styles.river}><i/><i/></div><div className={styles.bridge}><i/><b/><span/><em/></div><div className={styles.leftBank}/><div className={styles.rightBank}/><div className={styles.bridgeLights}>{Array.from({length:7},(_,i)=><i key={i}/>)}</div><MusicDust/></div>
}
function HarmonyTower(){
 return <div className={styles.harmonyTower}><div className={styles.harmonySky}/><Clouds/><div className={styles.tower}><i/><b/><span/><em/></div><div className={styles.rings}><i/><i/><i/></div><div className={styles.harmonyGround}/><MusicDust/></div>
}
function CreationStudio(){
 return <div className={styles.creationStudio}><div className={styles.studioWindow}><i/><i/><b/></div><div className={styles.canvas}><i/><b/><span/></div><div className={styles.recordPlayer}><i/><b/></div><div className={styles.studioDesk}/><div className={styles.hangingLights}><i/><i/><i/></div><MusicDust/></div>
}
function ConcertHall(){
 return <div className={styles.concertHall}><div className={styles.curtain} data-side="left"/><div className={styles.curtain} data-side="right"/><div className={styles.stageGlow}/><div className={styles.stageFloor}/><div className={styles.spotlight} data-side="left"/><div className={styles.spotlight} data-side="right"/><div className={styles.audience}>{Array.from({length:22},(_,i)=><i key={i}/>)}</div><div className={styles.stageLights}>{Array.from({length:7},(_,i)=><i key={i}/>)}</div><MusicDust/></div>
}

function WorldEffect({visualKey}:{visualKey:string}){
 if(visualKey==="rain-sun")return <div className={styles.rainSun}><div className={styles.rain}>{Array.from({length:18},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div><div className={styles.sunBreak}/></div>;
 if(["star-song","final-party","recital"].includes(visualKey))return <div className={styles.shootingStars}>{Array.from({length:6},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div>;
 if(["treasure-hunt","hidden-sound","find-c"].includes(visualKey))return <div className={styles.discoveryBeacon}><i/><i/><i/></div>;
 if(["two-hands-entry","two-hands-song","duet","call-response"].includes(visualKey))return <div className={styles.bridgePulse}><i/><i/></div>;
 if(["triad","cfg","intervals","c-scale"].includes(visualKey))return <div className={styles.harmonyPulse}><i/><i/><i/></div>;
 if(["toy-concert","first-performance","play-through","record-review"].includes(visualKey))return <div className={styles.stageSparkles}>{Array.from({length:12},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div>;
 return null;
}

const renders:Record<LessonWorldId,()=>ReactNode>={
 "giant-sky":GiantSky,
 "whisper-forest":WhisperForest,
 "rhythm-railway":RhythmRailway,
 "keyboard-kingdom":KeyboardKingdom,
 "moon-garden":MoonGarden,
 "hand-workshop":HandWorkshop,
 "story-valley":StoryValley,
 "notation-city":NotationCity,
 "hand-bridge":HandBridge,
 "harmony-tower":HarmonyTower,
 "creation-studio":CreationStudio,
 "concert-hall":ConcertHall,
};

export function LivingLessonWorld({age,lessonNumber,experience,reaction="idle"}:Props){
 const world=worldForLesson(age,experience),World=renders[world];
 return <div className={styles.world} data-world={world} data-reaction={reaction} data-age={age} data-key={experience.visualKey} aria-hidden="true">
   <World/>
   <WorldEffect visualKey={experience.visualKey}/>
   <div className={styles.vignette}/>
   <div className={styles.worldName}><span>{worldLabel(world)}</span><b>AULA {String(lessonNumber).padStart(2,"0")}</b></div>
 </div>;
}
