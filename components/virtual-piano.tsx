"use client";

import { useMemo, useState } from "react";
import type { AgeBand } from "@/lib/suzuki-lessons";
import { playPianoSemitone } from "@/lib/piano-sampler";
import { NoteCharacter } from "@/components/note-character";
import { noteCharacters, type NaturalNote } from "@/lib/visual-learning";
import styles from "./virtual-piano.module.css";

type NoteName = "C4"|"D4"|"E4"|"F4"|"G4"|"A4"|"B4"|"C5";

type WhiteNote = {
  name: NoteName;
  note: NaturalNote;
  label: string;
  semitone: number;
  staffStep: number;
};

const notes: WhiteNote[] = [
  {name:"C4",note:"C",label:"Dó",semitone:0,staffStep:-2},
  {name:"D4",note:"D",label:"Ré",semitone:2,staffStep:-1},
  {name:"E4",note:"E",label:"Mi",semitone:4,staffStep:0},
  {name:"F4",note:"F",label:"Fá",semitone:5,staffStep:1},
  {name:"G4",note:"G",label:"Sol",semitone:7,staffStep:2},
  {name:"A4",note:"A",label:"Lá",semitone:9,staffStep:3},
  {name:"B4",note:"B",label:"Si",semitone:11,staffStep:4},
  {name:"C5",note:"C",label:"Dó",semitone:12,staffStep:5},
];

const blackNotes = [
  {name:"C♯",semitone:1,group:2,left:"9.8%"},
  {name:"D♯",semitone:3,group:2,left:"22.4%"},
  {name:"F♯",semitone:6,group:3,left:"47.6%"},
  {name:"G♯",semitone:8,group:3,left:"60.2%"},
  {name:"A♯",semitone:10,group:3,left:"72.8%"},
] as const;

const patterns: Record<AgeBand, NoteName[][]> = {
  "2-3": [["C4","D4"],["D4","E4"],["C4","C4","D4"]],
  "4-5": [["C4","D4","E4"],["E4","D4","C4"],["C4","E4","D4"]],
  "6-8": [["C4","D4","E4","F4"],["G4","E4","F4","D4"],["C4","E4","G4","E4"]],
};

export function VirtualPiano({ageBand,reducedStimulus=false,silent=false}:{ageBand:AgeBand;reducedStimulus?:boolean;silent?:boolean}){
  const [patternIndex,setPatternIndex]=useState(0);
  const [step,setStep]=useState(0);
  const [pressed,setPressed]=useState<string|null>(null);
  const [message,setMessage]=useState(silent?"Segue a pista visual. Um toque de cada vez.":"Ouve primeiro. Depois encontra a nota.");
  const [completed,setCompleted]=useState(false);

  const pattern=patterns[ageBand][patternIndex%patterns[ageBand].length];
  const target=pattern[step] ?? pattern[0];
  const targetNote=notes.find((item)=>item.name===target) ?? notes[0];
  const characterNotes=useMemo(()=>notes.slice(0,7),[]);

  async function hearTarget(){
    if(silent){
      setMessage("Encontra a personagem, a letra e a posição da tecla.");
      return;
    }
    await playPianoSemitone(targetNote.semitone);
    setMessage("Agora encontra esse som. A música espera por ti.");
  }

  async function pressWhite(note:WhiteNote){
    setPressed(note.name);
    window.setTimeout(()=>setPressed((current)=>current===note.name?null:current),260);
    if(!silent) await playPianoSemitone(note.semitone);
    else if("vibrate" in navigator) navigator.vibrate?.(18);

    if(note.name===target){
      if(step>=pattern.length-1){
        setCompleted(true);
        setMessage("Chegaste ao fim 🌱");
      } else {
        setStep((current)=>current+1);
        setMessage("Boa. A próxima nota fica à espera.");
      }
    } else {
      setMessage("Ouve outra vez e experimenta. A nota certa continua à espera.");
    }
  }

  async function pressBlack(note:typeof blackNotes[number]){
    setPressed(note.name);
    window.setTimeout(()=>setPressed((current)=>current===note.name?null:current),260);
    if(!silent) await playPianoSemitone(note.semitone);
    else if("vibrate" in navigator) navigator.vibrate?.(18);
    setMessage(`${note.name} fica no grupo de ${note.group} teclas pretas. Usa o grupo como mapa do teclado.`);
  }

  function nextPattern(){
    setPatternIndex((current)=>current+1);
    setStep(0);
    setCompleted(false);
    setMessage("Novo caminho. Ouve primeiro.");
  }

  return <section className={`${styles.wrap} ${reducedStimulus?styles.reduced:""}`} aria-label="Piano virtual visual com teclas brancas e pretas">
    <div className={styles.head}>
      <div><span>{silent?"MODO SILENCIOSO":"PIANO VISUAL · WAIT MODE"}</span><strong>{ageBand==="2-3"?"Personagem + cor + forma":ageBand==="4-5"?"Personagem + cor + letra":"Letra + posição + pauta"}</strong></div>
      <button onClick={()=>void hearTarget()}>{silent?"◎ Ver pista":"▶ Ouvir alvo"}</button>
    </div>

    <p className={styles.message}>{message}</p>

    {ageBand!=="6-8"&&<div className={styles.characters} aria-label="Personagens das notas naturais">
      {characterNotes.map((item)=><NoteCharacter key={item.name} note={item.note} active={!completed&&target===item.name||pressed===item.name} compact={ageBand==="4-5"}/>)}
    </div>}

    {ageBand==="6-8"&&<div className={styles.staffPreview}>
      <svg viewBox="0 0 460 145" role="img" aria-label="Pauta simples do padrão atual">
        {[40,58,76,94,112].map((y)=><line key={y} x1="48" x2="440" y1={y} y2={y}/>)}
        <text x="5" y="101">𝄞</text>
        {pattern.map((name,index)=>{
          const note=notes.find((item)=>item.name===name)!;
          const x=90+index*78,y=112-note.staffStep*9;
          return <g key={`${name}-staff-${index}`} data-current={index===step&&!completed||undefined}>
            {note.staffStep<=-2&&<line x1={x-14} x2={x+14} y1="130" y2="130"/>}
            <ellipse cx={x} cy={y} rx="10" ry="7"/>
            <line x1={x+8} x2={x+8} y1={y} y2={y-34}/>
          </g>;
        })}
      </svg>
      <small>Som → letra → posição → pauta</small>
    </div>}

    <div className={styles.path}>
      {pattern.map((name,index)=>{
        const note=notes.find((item)=>item.name===name)!;
        const visual=noteCharacters[note.note];
        return <span key={`${name}-${index}`} style={{"--noteColor":visual.color} as React.CSSProperties} data-done={index<step||completed} data-current={index===step&&!completed}>
          <b>{ageBand==="2-3"?visual.shape:note.note}</b>
          {ageBand!=="2-3"&&<small>{note.label}</small>}
        </span>;
      })}
    </div>

    <div className={styles.groupLegend} aria-label="Mapa das teclas pretas">
      <span><b>2</b> par de teclas pretas</span><span><b>3</b> trio de teclas pretas</span>
    </div>

    <div className={styles.piano}>
      <div className={styles.keyboard}>
        {notes.map((note)=>{
          const visual=noteCharacters[note.note];
          return <button key={note.name} className={styles.whiteKey} data-active={pressed===note.name||undefined} style={{"--noteColor":visual.color} as React.CSSProperties} aria-label={`Tocar ${note.label}`} onClick={()=>void pressWhite(note)}>
            <span>{note.note}</span><b>{note.label}</b><small>{ageBand==="2-3"?visual.shape:ageBand==="4-5"?visual.name:note.name}</small>
          </button>;
        })}
      </div>
      <div className={styles.blackLayer}>
        {blackNotes.map((note)=><button key={note.name} className={styles.blackKey} data-group={note.group} data-active={pressed===note.name||undefined} style={{left:note.left}} aria-label={`Tocar ${note.name}, grupo de ${note.group} teclas pretas`} onClick={()=>void pressBlack(note)}>
          <b>{note.group}</b><small>{ageBand==="6-8"?note.name:`grupo ${note.group}`}</small>
        </button>)}
      </div>
    </div>

    <p className={styles.help}>As cores nunca aparecem sozinhas: cada tecla mantém letra, nome, posição ou forma. Os grupos de 2 e 3 das teclas pretas funcionam como mapa visual do teclado.</p>
    {completed&&<button className={styles.nextPattern} onClick={nextPattern}>Outro caminho →</button>}
  </section>;
}
