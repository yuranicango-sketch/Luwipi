"use client";

import { useState } from "react";
import type { AgeBand, LessonBlock } from "@/lib/suzuki-lessons";
import { playPianoSemitone } from "@/lib/piano-sampler";
import { sceneForBlock, noteCharacters } from "@/lib/visual-learning";
import { NoteCharacter } from "@/components/note-character";
import { MelodicContour } from "@/components/melodic-contour";
import { FingerRhyme } from "@/components/finger-rhyme";
import styles from "./lesson-world.module.css";

function Elephant() {
  return <svg viewBox="0 0 360 300" className={styles.elephant} role="img" aria-label="Elefante, personagem dos sons graves">
    <ellipse cx="175" cy="157" rx="112" ry="92" className={styles.eleBody}/>
    <circle cx="276" cy="137" r="68" className={styles.eleHead}/>
    <ellipse cx="278" cy="139" rx="50" ry="61" className={styles.eleFace}/>
    <path d="M315 148Q348 175 330 229Q322 248 310 232Q319 194 301 171Z" className={styles.eleHead}/>
    <path d="M240 94Q210 47 183 72Q184 121 226 142Z" className={styles.eleEar}/>
    <path d="M111 211 98 278h43l15-67M186 218l-4 60h42l9-70" className={styles.eleLegs}/>
    <ellipse cx="286" cy="124" rx="7" ry="9" className={styles.animalEye}/><circle cx="283" cy="121" r="2.3" fill="#fff"/>
    <path d="M274 149Q281 155 289 149" className={styles.animalSmile}/>
  </svg>;
}

function Bird() {
  return <svg viewBox="0 0 180 180" className={styles.bird} role="img" aria-label="Passarinho, personagem dos sons agudos">
    <ellipse cx="91" cy="100" rx="53" ry="47" className={styles.birdBody}/>
    <circle cx="111" cy="70" r="37" className={styles.birdHead}/>
    <path d="M74 104Q42 88 35 116Q59 132 81 119Z" className={styles.birdWing}/>
    <path d="M145 73 171 84 145 93Z" className={styles.beak}/>
    <path d="M87 145v18M113 144v19" className={styles.birdLegs}/>
    <ellipse cx="119" cy="65" rx="5.5" ry="7" className={styles.animalEye}/><circle cx="117" cy="62" r="2" fill="#fff"/>
  </svg>;
}

function PitchAnimals({silent=false}:{silent?:boolean}) {
  const [active,setActive]=useState<"low"|"high"|null>(null);

  async function play(kind:"low"|"high") {
    setActive(kind);
    if(!silent) await playPianoSemitone(kind==="low"?-12:12,{duration:kind==="low"?1.05:.62,gain:kind==="low"?.2:.1});
    setTimeout(()=>setActive(null),850);
  }

  return <div className={styles.pitchWorld}>
    <div className={styles.sky}><i/><i/><i/></div>
    <div className={styles.tree}><span/><span/><span/><span/></div>
    <button className={styles.animalButton} data-kind="low" data-active={active==="low"||undefined} onClick={()=>void play("low")}><Elephant/><b>GRAVE</b><small>pesado · em baixo</small></button>
    <button className={styles.animalButton} data-kind="high" data-active={active==="high"||undefined} onClick={()=>void play("high")}><Bird/><b>AGUDO</b><small>leve · em cima</small></button>
    <p>O elefante anda em baixo. O passarinho canta em cima.</p>
  </div>;
}

function DynamicsWorld({silent=false}:{silent?:boolean}) {
  const [active,setActive]=useState<"strong"|"soft"|null>(null);
  async function play(kind:"strong"|"soft"){
    setActive(kind);
    if(!silent) await playPianoSemitone(0,{duration:.65,gain:kind==="strong"?.52:.16});
    setTimeout(()=>setActive(null),650);
  }
  return <div className={styles.dynamicsWorld}>
    <button data-active={active==="strong"||undefined} onClick={()=>void play("strong")}><div className={styles.lion}>🦁</div><strong>FORTE</strong><span>grande sem bater</span></button>
    <div className={styles.wave}><i/><i/><i/><i/></div>
    <button data-active={active==="soft"||undefined} onClick={()=>void play("soft")}><div className={styles.mouse}>🐭</div><strong>SUAVE</strong><span>pequeno sem desaparecer</span></button>
  </div>;
}

function MarchWorld() {
  return <div className={styles.marchWorld}>
    <div className={styles.road}>{[1,2,3,4,1,2,3,4].map((n,index)=><span key={index} style={{"--delay":`${index*.07}s`} as React.CSSProperties}><i>{n}</i></span>)}</div>
    <strong>Um passo · um pulso</strong><p>O corpo encontra o tempo antes de chegar ao piano.</p>
  </div>;
}

function EchoWorld({silent=false}:{silent?:boolean}) {
  const [pulse,setPulse]=useState(0);
  async function echo(){
    setPulse((current)=>current+1);
    if(!silent){
      await playPianoSemitone(0,{duration:.34});
      setTimeout(()=>void playPianoSemitone(4,{duration:.34}),340);
      setTimeout(()=>void playPianoSemitone(2,{duration:.34}),680);
    }
  }
  return <div className={styles.echoWorld}>
    <button onClick={()=>void echo()} aria-label="Ouvir eco"><span>👂</span><b>Ouvir eco</b></button>
    <div className={styles.echoRings} key={pulse}><i/><i/><i/></div>
    <div className={styles.echoDots}><span>C</span><span>E</span><span>D</span></div>
    <p>Ouve · guarda · devolve. Se precisar, fazemos só dois sons.</p>
  </div>;
}

function KeyboardVillage() {
  return <div className={styles.keyboardVillage}>
    <div className={styles.houses}>
      <div data-group="2"><b>2</b><span/><span/><small>par</small></div>
      <div data-group="3"><b>3</b><span/><span/><span/><small>trio</small></div>
    </div>
    <div className={styles.noteStreet}>{(["C","D","E","F","G","A","B"] as const).map((note)=><NoteCharacter key={note} note={note} compact/>)}</div>
    <p>Dó mora antes do par. Fá mora antes do trio. Os grupos viram mapa.</p>
  </div>;
}

function DirectionWorld() {
  const notes=["C","D","E","F","G"] as const;
  return <div className={styles.directionWorld}>
    <div className={styles.steps}>{notes.map((note,index)=><div key={note} style={{"--level":String(index)} as React.CSSProperties}><NoteCharacter note={note} compact/><span>{index===0?"começa":index===notes.length-1?"chega":"sobe"}</span></div>)}</div>
    <div className={styles.directionArrows}><b>↗ sobe</b><b>↘ desce</b></div>
  </div>;
}

function WelcomeWorld() {
  return <div className={styles.welcomeWorld}>
    <div className={styles.luwi}><span>♪</span><i/><i/><b>Olá!</b></div>
    <div className={styles.welcomeNotes}>{(["C","D","E","F","G"] as const).map((note)=><NoteCharacter key={note} note={note} compact/>)}</div>
    <p>A mesma saudação curta cria segurança. Depois a aula começa.</p>
  </div>;
}

function ReadingWorld() {
  const sequence=[0,1,2,2,3];
  return <div className={styles.readingWorld}>
    <div className={styles.contour}>{sequence.map((pitch,index)=><span key={index} style={{"--pitch":String(pitch)} as React.CSSProperties}>{["C","D","E","E","F"][index]}</span>)}</div>
    <div className={styles.staff}>
      {[0,1,2,3,4].map((line)=><i key={line}/>)}
      {sequence.map((pitch,index)=><b key={index} style={{"--x":String(index),"--pitch":String(pitch)} as React.CSSProperties}/>)}
    </div>
    <p>Primeiro reconhece a direção. Depois vê como a mesma frase vive na pauta.</p>
  </div>;
}

function PerformanceWorld() {
  return <div className={styles.performanceWorld}>
    <div className={styles.curtain} data-side="left"/><div className={styles.curtain} data-side="right"/>
    <div className={styles.spotlight}/>
    <div className={styles.stagePiano}>♪</div>
    <strong>Do início ao fim.</strong><p>Durante a pequena performance, não interromper por cada deslize.</p>
  </div>;
}

function ListeningWorld() {
  return <div className={styles.listeningWorld}><div className={styles.ear}>◖</div><i/><i/><i/><strong>Escuta primeiro.</strong><p>O ecrã dá a pista. O ouvido faz o trabalho.</p></div>;
}

export function LessonWorld({block,ageBand,repertoire,reduced=false,silent=false}:{block:LessonBlock;ageBand:AgeBand;repertoire:string;reduced?:boolean;silent?:boolean}) {
  const scene=sceneForBlock(block);

  let content:React.ReactNode;
  if(scene==="pitch-animals") content=<PitchAnimals silent={silent}/>;
  else if(scene==="dynamics") content=<DynamicsWorld silent={silent}/>;
  else if(scene==="march") content=<MarchWorld/>;
  else if(scene==="echo") content=<EchoWorld silent={silent}/>;
  else if(scene==="keyboard-village") content=<KeyboardVillage/>;
  else if(scene==="direction") content=<DirectionWorld/>;
  else if(scene==="technique") content=<FingerRhyme ageBand={ageBand}/>;
  else if(scene==="melody") content=<MelodicContour repertoire={repertoire} compact/>;
  else if(scene==="reading") content=<ReadingWorld/>;
  else if(scene==="performance") content=<PerformanceWorld/>;
  else if(scene==="welcome") content=<WelcomeWorld/>;
  else content=<ListeningWorld/>;

  return <div className={styles.world} data-scene={scene} data-age={ageBand} data-reduced={reduced||undefined}>
    <div className={styles.story}><span>{scene==="pitch-animals"?"HISTÓRIA + SOM":block.kind==="movement"?"CORPO PRIMEIRO":"MUNDO DA AULA"}</span><strong>{block.title}</strong><p>{block.childCue}</p></div>
    {content}
  </div>;
}
