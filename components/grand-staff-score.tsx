"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PianoScoreEvent, ScoreHandMode } from "@/lib/music-types";
import styles from "./grand-staff-score.module.css";

const DIATONIC:Record<string,number>={"Dó":0,"Ré":1,"Mi":2,"Fá":3,"Sol":4,"Lá":5,"Si":6};
function parse(note:string){const match=note.match(/^(Dó|Ré|Mi|Fá|Sol|Lá|Si)([3-6])$/);const name=match?.[1]??"Dó",octave=Number(match?.[2]??4);return{name,octave,index:(octave-4)*7+(DIATONIC[name]??0)}}
function trebleY(note:string){const p=parse(note);return 76-(p.index-2)*6}
function bassY(note:string){const p=parse(note);return 176-(p.index+5)*6}
function eventNotes(event:PianoScoreEvent,hand:ScoreHandMode){return hand==="right"?(event.right??[]):hand==="left"?(event.left??[]):[...(event.left??[]),...(event.right??[])]}
function noteGroup(notes:string[],x:number,staff:"treble"|"bass",active:boolean,done:boolean,wrong:boolean,fingering?:number[]){return notes.map((note,index)=>{const y=staff==="treble"?trebleY(note):bassY(note);const color=wrong?"#ef4444":active?"#58cc02":done?"#5aa643":"#24364d";return <g key={`${staff}-${note}-${index}`}><ellipse cx={x} cy={y} rx="9" ry="6.4" transform={`rotate(-18 ${x} ${y})`} fill={color}/><line x1={x+8} y1={y-1} x2={x+8} y2={y-32} stroke={color} strokeWidth="2"/>{fingering?.[index]&&<text x={x-1} y={y-13} textAnchor="middle" fontSize="10" fontWeight="900" fill="#68768c">{fingering[index]}</text>}</g>})}

export function GrandStaffScore({events,currentIndex,hand="both",wrong=false,timeSignature="4/4"}:{events:PianoScoreEvent[];currentIndex:number;hand?:ScoreHandMode;wrong?:boolean;timeSignature?:"4/4"|"3/4"}){
 const ref=useRef<HTMLDivElement|null>(null);const gap=72,width=Math.max(860,185+events.length*gap);
 const visible=useMemo(()=>events.map((event,index)=>({event,index,notes:eventNotes(event,hand)})).filter(item=>item.notes.length>0),[events,hand]);
 const visibleCurrent=Math.max(0,visible.findIndex(item=>item.index===currentIndex));
 useEffect(()=>{const el=ref.current;if(!el)return;const x=160+Math.max(0,visibleCurrent)*gap;el.scrollTo({left:Math.max(0,x-el.clientWidth*.42),behavior:"smooth"})},[visibleCurrent]);
 return <div className={styles.wrap}><div className={styles.head}><div><span>GRANDE PAUTA</span><strong>{hand==="both"?"Duas mãos":hand==="right"?"Mão direita · clave de Sol":"Mão esquerda · clave de Fá"}</strong></div><b>{timeSignature}</b></div><div className={styles.scroll} ref={ref}><svg viewBox={`0 0 ${width} 224`} style={{width}} className={styles.score} role="img" aria-label="Partitura para duas mãos">
  <rect width={width} height="224" rx="20" fill="#fff"/>
  {[32,44,56,68,80].map(y=><line key={`t${y}`} x1="20" x2={width-20} y1={y} y2={y} stroke="#334155" strokeWidth="1.55"/>)}
  {[132,144,156,168,180].map(y=><line key={`b${y}`} x1="20" x2={width-20} y1={y} y2={y} stroke="#334155" strokeWidth="1.55"/>)}
  <line x1="112" x2="112" y1="32" y2="180" stroke="#334155" strokeWidth="2.2"/><path d="M112 32c-16 0-18 16-18 26s2 24 18 24M112 132c-16 0-18 16-18 26s2 22 18 22" fill="none" stroke="#334155" strokeWidth="2"/>
  <text x="28" y="84" fontSize="62" fontFamily="Noto Music, Bravura Text, Segoe UI Symbol, serif" fill="#24364d">𝄞</text><text x="31" y="177" fontSize="53" fontFamily="Noto Music, Bravura Text, Segoe UI Symbol, serif" fill="#24364d">𝄢</text>
  <g fill="#334155" fontWeight="900"><text x="91" y="53" fontSize="15">{timeSignature.split("/")[0]}</text><text x="91" y="72" fontSize="15">{timeSignature.split("/")[1]}</text><text x="91" y="153" fontSize="15">{timeSignature.split("/")[0]}</text><text x="91" y="172" fontSize="15">{timeSignature.split("/")[1]}</text></g>
  {visible.map((item,visibleIndex)=>{const x=160+visibleIndex*gap,active=item.index===currentIndex,done=item.index<currentIndex;return <g key={item.index}>{active&&<rect x={x-25} y="18" width="50" height="178" rx="14" fill="rgba(88,204,2,.07)" stroke="#58cc02" strokeWidth="2"/>}{hand!=="left"&&noteGroup(item.event.right??[],x,"treble",active,done,active&&wrong,item.event.rightFingering)}{hand!=="right"&&noteGroup(item.event.left??[],x,"bass",active,done,active&&wrong,item.event.leftFingering)}{visibleIndex>0&&visibleIndex%4===0&&<><line x1={x-gap/2} x2={x-gap/2} y1="32" y2="80" stroke="#526175"/><line x1={x-gap/2} x2={x-gap/2} y1="132" y2="180" stroke="#526175"/></>}</g>})}
 </svg></div></div>
}
