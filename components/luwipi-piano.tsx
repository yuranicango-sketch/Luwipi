"use client";

import { type CSSProperties, useEffect, useMemo } from "react";
import { playPianoRate, preloadPianoSamples } from "@/lib/piano-sampler";
import styles from "./luwipi-piano.module.css";

export type LuwipiPianoKey={note:string;octave:number;rate:number;color:string;pitch:string};
const NATURALS=[
 ["Dó",0,"#ff5f86"],["Ré",2,"#ffbf3f"],["Mi",4,"#64c96b"],["Fá",5,"#4fc8c1"],["Sol",7,"#4b9df8"],["Lá",9,"#8f74eb"],["Si",11,"#d264d7"]
] as const;
const BLACKS=[["Dó♯",1,0],["Ré♯",3,1],["Fá♯",6,3],["Sol♯",8,4],["Lá♯",10,5]] as const;

type Props={octaves?:1|2|3;startOctave?:number;expected?:string|string[];wrong?:string|string[]|null;colors?:Map<string,string>;onPress?:(key:LuwipiPianoKey)=>void;onBlackPress?:(pitch:string)=>void;showLabels?:boolean;compact?:boolean;deck?:boolean;disabled?:boolean;blackKeysInteractive?:boolean};
function list(value?:string|string[]|null){return !value?[]:Array.isArray(value)?value:[value]}
function matches(values:string[],pitch:string,note:string){return values.some(value=>value===pitch||value===note)}

export function LuwipiPiano({octaves=1,startOctave=4,expected,wrong,onPress,onBlackPress,colors,showLabels=true,compact=false,deck=false,disabled=false,blackKeysInteractive=false}:Props){
 useEffect(()=>{void preloadPianoSamples()},[]);
 const expectedList=list(expected),wrongList=list(wrong);
 const keys=useMemo(()=>Array.from({length:octaves},(_,o)=>NATURALS.map(([note,semitone,color])=>{const octave=startOctave+o;return{note,octave,rate:Math.pow(2,(semitone+(octave-4)*12)/12),color:colors?.get(note)??color,pitch:`${note}${octave}`}})).flat(),[octaves,startOctave,colors]);
 function press(key:LuwipiPianoKey){void playPianoRate(key.rate);onPress?.(key)}
 return <div className={styles.shell} data-compact={compact?"true":"false"} data-deck={deck?"true":"false"}><div className={styles.brand}>LUWIPI PIANO</div><div className={styles.scroll}><div className={styles.piano} data-octaves={octaves} style={{"--white-count":7*octaves} as CSSProperties}>
   {keys.map(key=>{const active=matches(expectedList,key.pitch,key.note),isWrong=matches(wrongList,key.pitch,key.note);return <button aria-label={key.pitch} key={key.pitch} type="button" disabled={disabled} onClick={()=>press(key)} className={`${styles.white} ${active?styles.expected:""} ${isWrong?styles.wrong:""}`} style={{"--key":key.color} as CSSProperties}>{showLabels&&<span>{key.note}<small>{key.octave}</small></span>}</button>})}
   {Array.from({length:octaves},(_,o)=>BLACKS.map(([note,semitone,after])=>{const octave=startOctave+o,pitch=`${note}${octave}`,left=((o*7+after+1)/(7*octaves))*100,active=matches(expectedList,pitch,note),isWrong=matches(wrongList,pitch,note);return <button aria-label={pitch} key={pitch} type="button" disabled={disabled||!blackKeysInteractive} className={`${styles.black} ${active?styles.blackExpected:""} ${isWrong?styles.blackWrong:""}`} style={{left:`calc(${left}% - ${4.2/octaves}% )`,width:`${60/(7*octaves)}%`}} onClick={()=>{void playPianoRate(Math.pow(2,(semitone+(octave-4)*12)/12));onBlackPress?.(pitch)}}/>})).flat()}
 </div></div></div>
}
