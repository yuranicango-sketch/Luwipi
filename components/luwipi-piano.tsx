"use client";

import { type CSSProperties, useEffect, useMemo } from "react";
import { playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./luwipi-piano.module.css";

export type LuwipiPianoKey={note:string;octave:number;rate:number;color:string};
const NATURALS=[
 ["Dó",0,"#ff5f86"],["Ré",2,"#ffbf3f"],["Mi",4,"#64c96b"],["Fá",5,"#4fc8c1"],["Sol",7,"#4b9df8"],["Lá",9,"#8f74eb"],["Si",11,"#d264d7"],
] as const;
const BLACKS=[["Dó♯",1,0],["Ré♯",3,1],["Fá♯",6,3],["Sol♯",8,4],["Lá♯",10,5]] as const;

type Props={octaves?:1|2;expected?:string;wrong?:string|null;colors?:Map<string,string>;onPress?:(key:LuwipiPianoKey)=>void;onBlackPress?:(pitch:string)=>void;showLabels?:boolean;compact?:boolean;disabled?:boolean};

export function LuwipiPiano({octaves=1,expected,wrong,onPress,onBlackPress,colors,showLabels=true,compact=false,disabled=false}:Props){
 useEffect(()=>{void preloadPianoSamples()},[]);
 const keys=useMemo(()=>Array.from({length:octaves},(_,o)=>NATURALS.map(([note,semitone,color])=>({note,octave:o+4,rate:Math.pow(2,(semitone+o*12)/12),color:colors?.get(note)??color}))).flat(),[octaves,colors]);
 function press(key:LuwipiPianoKey){void playPianoRate(key.rate);onPress?.(key)}
 return <div className={styles.shell} data-compact={compact?"true":"false"}><div className={styles.brand}>LUWIPI PIANO</div><div className={styles.scroll}><div className={styles.piano} style={{"--white-count":7*octaves} as CSSProperties}>
   {keys.map(key=>{const pitch=`${key.note}${key.octave}`;const active=expected===pitch||expected===key.note;return <button aria-label={pitch} key={pitch} type="button" disabled={disabled} onClick={()=>press(key)} className={`${styles.white} ${active?styles.expected:""} ${wrong===pitch?styles.wrong:""}`} style={{"--key":key.color} as CSSProperties}>{showLabels&&<span>{key.note}{octaves===2&&<small>{key.octave}</small>}</span>}</button>})}
   {Array.from({length:octaves},(_,o)=>BLACKS.map(([note,semitone,after])=>{const octave=o+4,pitch=`${note}${octave}`;const left=((o*7+after+1)/(7*octaves))*100;return <button aria-label={pitch} key={pitch} type="button" disabled={disabled} className={styles.black} style={{left:`calc(${left}% - ${octaves===2?"2.15%":"4.3%"} )`}} onClick={()=>{void playPianoRate(Math.pow(2,(semitone+o*12)/12));onBlackPress?.(pitch)}}/>})).flat()}
 </div></div></div>
}