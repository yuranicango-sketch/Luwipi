"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PianoScoreEvent, ScoreHandMode } from "@/lib/music-types";
import styles from "./grand-staff-score.module.css";

const DIATONIC:Record<string,number>={"Dó":0,"Ré":1,"Mi":2,"Fá":3,"Sol":4,"Lá":5,"Si":6};
function parse(note:string){const match=note.match(/^(Dó|Ré|Mi|Fá|Sol|Lá|Si)([3-6])$/);const name=match?.[1]??"Dó",octave=Number(match?.[2]??4);return{name,octave,index:(octave-4)*7+(DIATONIC[name]??0)}}
function trebleY(note:string){const p=parse(note);return 76-(p.index-2)*6}
function bassY(note:string){const p=parse(note);return 176-(p.index+5)*6}
function eventNotes(event:PianoScoreEvent,hand:ScoreHandMode){return hand==="right"?(event.right??[]):hand==="left"?(event.left??[]):[...(event.left??[]),...(event.right??[])]}
function beatWidth(beats:number){return 48+Math.min(4,Math.max(.5,beats))*23}

function noteGroup(notes:string[],x:number,staff:"treble"|"bass",active:boolean,done:boolean,wrong:boolean,event:PianoScoreEvent,fingering?:number[]){
 const beats=event.beats??1,open=beats>=2,whole=beats>=4,eighth=beats<=.5;
 return notes.map((note,index)=>{
  const y=staff==="treble"?trebleY(note):bassY(note),color=wrong?"#ef4444":active?"#58cc02":done?"#5aa643":"#24364d",stemX=x+8;
  return <g key={`${staff}-${note}-${index}`}>
   <ellipse cx={x} cy={y} rx="9" ry="6.4" transform={`rotate(-18 ${x} ${y})`} fill={open?"#fff":color} stroke={color} strokeWidth={open?2.2:0}/>
   {!whole&&<line x1={stemX} y1={y-1} x2={stemX} y2={y-32} stroke={color} strokeWidth="2"/>}
   {eighth&&!whole&&<path d={`M ${stemX} ${y-32} q 16 5 12 19`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>}
   {fingering?.[index]&&<text x={x-1} y={y-14} textAnchor="middle" fontSize="10" fontWeight="900" fill="#68768c">{fingering[index]}</text>}
   {event.articulation==="staccato"&&<circle cx={x} cy={y+13} r="2.4" fill={color}/>}
   {event.articulation==="accent"&&<path d={`M ${x-8} ${y+15} L ${x+8} ${y+11} L ${x-8} ${y+7}`} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>}
  </g>
 })
}

export function GrandStaffScore({events,currentIndex,hand="both",wrong=false,timeSignature="4/4"}:{events:PianoScoreEvent[];currentIndex:number;hand?:ScoreHandMode;wrong?:boolean;timeSignature?:"4/4"|"3/4"}){
 const ref=useRef<HTMLDivElement|null>(null),beatsPerMeasure=timeSignature==="3/4"?3:4;
 const visible=useMemo(()=>{
  let x=160,cumulative=0;
  return events.map((event,index)=>{
   const notes=eventNotes(event,hand),beats=Math.max(.5,event.beats??1),item={event,index,notes,x,beats,cumulative};
   x+=beatWidth(beats);cumulative+=beats;return item;
  }).filter(item=>item.notes.length>0);
 },[events,hand]);
 const width=Math.max(860,(visible.at(-1)?.x??160)+150);
 const visibleCurrent=Math.max(0,visible.findIndex(item=>item.index===currentIndex));
 useEffect(()=>{const el=ref.current;if(!el)return;const x=visible[Math.max(0,visibleCurrent)]?.x??160;el.scrollTo({left:Math.max(0,x-el.clientWidth*.42),behavior:"smooth"})},[visibleCurrent,visible]);
 return <div className={styles.wrap}><div className={styles.head}><div><span>GRANDE PAUTA · RITMO REAL</span><strong>{hand==="both"?"Duas mãos":hand==="right"?"Mão direita · clave de Sol":"Mão esquerda · clave de Fá"}</strong></div><b>{timeSignature}</b></div><div className={styles.scroll} ref={ref}><svg viewBox={`0 0 ${width} 224`} style={{width}} className={styles.score} role="img" aria-label="Partitura para duas mãos com duração, dinâmica e articulação">
  <rect width={width} height="224" rx="20" fill="#fff"/>
  {[32,44,56,68,80].map(y=><line key={`t${y}`} x1="20" x2={width-20} y1={y} y2={y} stroke="#334155" strokeWidth="1.55"/>)}
  {[132,144,156,168,180].map(y=><line key={`b${y}`} x1="20" x2={width-20} y1={y} y2={y} stroke="#334155" strokeWidth="1.55"/>)}
  <line x1="112" x2="112" y1="32" y2="180" stroke="#334155" strokeWidth="2.2"/><path d="M112 32c-16 0-18 16-18 26s2 24 18 24M112 132c-16 0-18 16-18 26s2 22 18 22" fill="none" stroke="#334155" strokeWidth="2"/>
  <text x="28" y="84" fontSize="62" fontFamily="Noto Music, Bravura Text, Segoe UI Symbol, serif" fill="#24364d">𝄞</text><text x="31" y="177" fontSize="53" fontFamily="Noto Music, Bravura Text, Segoe UI Symbol, serif" fill="#24364d">𝄢</text>
  <g fill="#334155" fontWeight="900"><text x="91" y="53" fontSize="15">{timeSignature.split("/")[0]}</text><text x="91" y="72" fontSize="15">{timeSignature.split("/")[1]}</text><text x="91" y="153" fontSize="15">{timeSignature.split("/")[0]}</text><text x="91" y="172" fontSize="15">{timeSignature.split("/")[1]}</text></g>
  {visible.map((item,visibleIndex)=>{
   const active=item.index===currentIndex,done=item.index<currentIndex;
   const endsMeasure=Math.abs(((item.cumulative+item.beats)/beatsPerMeasure)-Math.round((item.cumulative+item.beats)/beatsPerMeasure))<.001;
   const nextX=visible[visibleIndex+1]?.x??item.x+beatWidth(item.beats),barX=(item.x+nextX)/2;
   return <g key={item.index}>
    {active&&<rect x={item.x-26} y="18" width="52" height="178" rx="14" fill="rgba(88,204,2,.07)" stroke="#58cc02" strokeWidth="2"/>}
    {hand!=="left"&&noteGroup(item.event.right??[],item.x,"treble",active,done,active&&wrong,item.event,item.event.rightFingering)}
    {hand!=="right"&&noteGroup(item.event.left??[],item.x,"bass",active,done,active&&wrong,item.event,item.event.leftFingering)}
    {item.event.dynamic&&<text x={item.x} y="210" textAnchor="middle" fontSize="13" fontFamily="Georgia,serif" fontStyle="italic" fontWeight="700" fill={active?"#58a438":"#516174"}>{item.event.dynamic}</text>}
    {item.event.phraseEnd&&<text x={item.x+18} y="102" fontSize="19" fill="#6b7789">′</text>}
    {endsMeasure&&visibleIndex<visible.length-1&&<><line x1={barX} x2={barX} y1="32" y2="80" stroke="#526175" strokeWidth="1.6"/><line x1={barX} x2={barX} y1="132" y2="180" stroke="#526175" strokeWidth="1.6"/></>}
   </g>
  })}
 </svg></div></div>
}
