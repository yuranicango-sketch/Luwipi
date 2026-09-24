"use client";
import { useMemo, useRef, useState } from "react";
import { playPianoSemitone } from "@/lib/piano-sampler";
import type { RepertoireScore, ScoreEvent, ScoreTone } from "@/lib/repertoire-scores";
import { ledgerLineSteps, staffStepForPitch, staffY, type StaffClef } from "@/lib/staff-position";
import styles from "./sheet-music-player.module.css";

const rightKeyboard=[
  {name:"Dó",midi:60,shape:"●"},{name:"Ré",midi:62,shape:"▲"},{name:"Mi",midi:64,shape:"■"},{name:"Fá",midi:65,shape:"◆"},
  {name:"Sol",midi:67,shape:"★"},{name:"Lá",midi:69,shape:"⬟"},{name:"Si",midi:71,shape:"♥"},{name:"Dó",midi:72,shape:"●"},
];
const leftKeyboard=[
  {name:"Dó",midi:48,shape:"●"},{name:"Ré",midi:50,shape:"▲"},{name:"Mi",midi:52,shape:"■"},{name:"Fá",midi:53,shape:"◆"},
  {name:"Sol",midi:55,shape:"★"},{name:"Lá",midi:57,shape:"⬟"},{name:"Si",midi:59,shape:"♥"},{name:"Dó",midi:60,shape:"●"},
];

const dynamicGain: Record<NonNullable<ScoreEvent["dynamic"]>, number> = {pp:.2,p:.28,mp:.36,mf:.44,f:.56};

function eventsFor(score: RepertoireScore): ScoreEvent[] {
  if (score.events?.length) return score.events;
  return score.notes.map((note)=>({
    beats: note.beats,
    ...(score.hand==="left"
      ? { left: [{name:note.name,midi:note.midi,staffStep:note.staffStep,finger:note.finger}] }
      : { right: [{name:note.name,midi:note.midi,staffStep:note.staffStep,finger:note.finger}] }),
    ...(note.measureStart ? { measureStart:true } : {}),
    ...(note.phraseEnd ? { phraseEnd:true } : {}),
  }));
}

function allTones(event: ScoreEvent) {
  return [...(event.right ?? []), ...(event.left ?? [])];
}

function phraseBounds(events: ScoreEvent[], active: number) {
  let start=0;
  for(let i=active-1;i>=0;i-=1){if(events[i].phraseEnd){start=i+1;break}}
  let end=events.length-1;
  for(let i=active;i<events.length;i+=1){if(events[i].phraseEnd){end=i;break}}
  return {start,end};
}

function eventDuration(event: ScoreEvent) {
  const base=event.beats===2?1.05:.68;
  return event.articulation==="staccato"?Math.max(.3,base*.55):base;
}

function eventWait(event: ScoreEvent) {
  const base=event.beats===2?720:470;
  return event.articulation==="staccato"?Math.max(300,base*.72):base;
}

export function SheetMusicPlayer({score,compact=false}:{score:RepertoireScore;compact?:boolean}){
 const events=useMemo(()=>eventsFor(score),[score]);
 const [active,setActive]=useState(0);
 const [practice,setPractice]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [message,setMessage]=useState("Ouve primeiro ou pratica nota por nota.");
 const [hits,setHits]=useState<number[]>([]);
 const run=useRef(0);

 const grand=score.clef==="grand"||score.hand==="both";
 const width=Math.max(760,events.length*70+130);
 const height=grand?330:230;
 const xFor=(index:number)=>112+index*70;
 const handLabel=score.hand==="left"?"Mão esquerda":score.hand==="right"?"Mão direita":score.hand==="both"?"Duas mãos":"Qualquer mão";
 const bounds=useMemo(()=>phraseBounds(events,active),[events,active]);
 const target=events[Math.min(active,events.length-1)];
 const targetMidis=allTones(target).map((tone)=>tone.midi);

 async function playEvent(event: ScoreEvent){
   const tones=allTones(event);
   const gain=event.dynamic?dynamicGain[event.dynamic]:.42;
   await Promise.all(tones.map((tone)=>playPianoSemitone(tone.midi-60,{duration:eventDuration(event),gain:Math.max(.12,gain/Math.max(1,Math.sqrt(tones.length)))})));
 }

 async function playRange(start:number,end:number,label:string){
   const id=++run.current;
   setPlaying(true);setPractice(false);setHits([]);setMessage(label);
   for(let i=start;i<=end;i+=1){
     if(id!==run.current)break;
     setActive(i);
     await playEvent(events[i]);
     await new Promise((resolve)=>setTimeout(resolve,eventWait(events[i])));
   }
   if(id===run.current){setPlaying(false);setActive(start);setMessage("Agora podes praticar no teu tempo.")}
 }

 function beginPractice(){
   run.current+=1;setPlaying(false);setPractice(true);setActive(0);setHits([]);
   setMessage(score.hand==="both"?"O primeiro encontro das duas mãos está à espera. Podes tocar as notas em qualquer ordem.":"A primeira nota está à espera. Sem cronómetro.");
 }

 async function press(midi:number){
   await playPianoSemitone(midi-60,{duration:.58});
   if(!practice)return;
   if(!targetMidis.includes(midi)){setMessage("Experimenta outra vez. O evento atual continua à espera.");return}
   const nextHits=Array.from(new Set([...hits,midi]));
   setHits(nextHits);
   if(!targetMidis.every((value)=>nextHits.includes(value))){
     setMessage("Boa. Falta a outra nota/mão deste mesmo momento.");
     return;
   }
   if(active===events.length-1){setMessage("Chegaste ao fim 🌱");setPractice(false);setHits([]);return}
   const phraseEnded=target.phraseEnd;
   setActive((value)=>value+1);setHits([]);
   setMessage(phraseEnded?"Frase fechada. A próxima começa quando quiseres.":"Boa. O próximo momento espera por ti.");
 }

 function toneNode(tone:ScoreTone,index:number,eventIndex:number,hand:"right"|"left"){
   const x=xFor(eventIndex)+(index-(hand==="right"?(events[eventIndex].right?.length??1)-1:(events[eventIndex].left?.length??1)-1)/2)*14;
   const clef:StaffClef=hand==="left"?"bass":"treble";
   const bottomLineY=grand?(hand==="left"?260:140):140;
   const step=staffStepForPitch(tone.name,tone.midi,clef);
   const y=staffY(tone.name,tone.midi,clef,bottomLineY);
   const current=eventIndex===active;
   const stemDown=hand==="left"&&grand;
   return <g key={hand+"-"+eventIndex+"-"+index+"-"+tone.midi}>
     {ledgerLineSteps(step).map((ledgerStep)=><line key={ledgerStep} x1={x-17} x2={x+17} y1={bottomLineY-ledgerStep*10} y2={bottomLineY-ledgerStep*10} className={styles.ledger}/>)}
     {tone.finger&&<text x={x} y={stemDown?Math.min(304,y+46):Math.max(38,y-48)} textAnchor="middle" className={current?styles.activeFinger:styles.finger}>{tone.finger}</text>}
     <ellipse cx={x} cy={y} rx="11" ry="7.5" className={current?styles.activeNote:styles.note}/>
     <line x1={x+(stemDown?-9:9)} x2={x+(stemDown?-9:9)} y1={y} y2={stemDown?y+38:y-39} className={current?styles.activeStem:styles.stem}/>
   </g>;
 }

 const keyboardRows=score.hand==="both"
   ? [{label:"ME",keys:leftKeyboard},{label:"MD",keys:rightKeyboard}]
   : [{label:score.hand==="left"?"ME":"MD",keys:score.hand==="left"?leftKeyboard:rightKeyboard}];

 return <section className={styles.player+(compact?" "+styles.compact:"")}>
   <div className={styles.head}><div><span>PARTITURA GUIADA · {handLabel.toUpperCase()}</span><strong>{score.title}</strong><small>{score.subtitle}</small></div><div><button disabled={playing} onClick={()=>void playRange(0,events.length-1,"A tocar o estudo…")}>▶ Ouvir</button><button disabled={playing} onClick={()=>void playRange(bounds.start,bounds.end,"A tocar esta frase…")}>♫ Frase</button><button data-active={practice} onClick={beginPractice}>◎ Praticar</button></div></div>

   <div className={styles.scoreScroll}><svg viewBox={"0 0 "+width+" "+height} style={{width,height}} role="img" aria-label={"Partitura pedagógica de "+score.title}>
     {grand
       ? <>
          <text x="20" y="132" className={styles.clef}>𝄞</text>
          <text x="24" y="242" className={styles.bassClef}>𝄢</text>
          {[60,80,100,120,140].map((y)=><line key={"t"+y} x1="78" x2={width-24} y1={y} y2={y} className={styles.staffLine}/>)}
          {[180,200,220,240,260].map((y)=><line key={"b"+y} x1="78" x2={width-24} y1={y} y2={y} className={styles.staffLine}/>)}
        </>
       : <>
          <text x="20" y="132" className={styles.clef}>{score.clef==="bass"?"𝄢":"𝄞"}</text>
          {[60,80,100,120,140].map((y)=><line key={y} x1="78" x2={width-24} y1={y} y2={y} className={styles.staffLine}/>)}
        </>
     }

     {events.map((event,eventIndex)=>{
       const x=xFor(eventIndex),current=eventIndex===active;
       const top=grand?52:48,bottom=grand?265:169;
       return <g key={eventIndex} data-current={current||undefined}>
         {event.measureStart&&eventIndex>0&&<line x1={x-34} x2={x-34} y1={top} y2={bottom} className={styles.barLine}/>}
         {(event.right??[]).map((tone,index)=>toneNode(tone,index,eventIndex,"right"))}
         {(event.left??[]).map((tone,index)=>toneNode(tone,index,eventIndex,"left"))}
         {event.dynamic&&<text x={x} y={grand?168:178} textAnchor="middle" className={styles.dynamic}>{event.dynamic}</text>}
         {event.articulation&&<text x={x} y={grand?176:191} textAnchor="middle" className={styles.articulation}>{event.articulation==="staccato"?"•":event.articulation==="accent"?">":"⌒"}</text>}
         {event.pedal&&<text x={x} y={grand?296:211} textAnchor="middle" className={styles.pedal}>{event.pedal==="down"?"Ped.":"✱"}</text>}
         {event.phraseEnd&&<line x1={x+28} x2={x+28} y1={top-5} y2={bottom+2} className={styles.phraseMark}/>}
       </g>;
     })}
     <line x1={xFor(active)-30} x2={xFor(active)-30} y1="42" y2={grand?274:169} className={styles.cursor}/>
     <text x="82" y={grand?320:218} className={styles.legend}>{grand?"Pauta dupla · ME + MD":score.clef==="bass"?"Clave de fá":"Clave de sol"} · números = dedilhação sugerida pelo Luwipi</text>
   </svg></div>

   <div className={styles.eventInfo}>
     <span>{target.dynamic??"—"} dinâmica</span>
     <span>{target.articulation??"toque livre"}</span>
     {target.pedal&&<span>{target.pedal==="down"?"pedal ↓":"pedal ↑"}</span>}
     {score.volumeReference&&<span>referência Vol. {score.volumeReference}</span>}
   </div>
   <p className={styles.message} role="status">{message}</p>

   {practice&&<div className={styles.keyboardStack}>{keyboardRows.map((row)=><div className={styles.keyboardRow} key={row.label}><b>{row.label}</b><div className={styles.keyboard}>{row.keys.map((key)=><button key={row.label+"-"+key.midi} data-target={targetMidis.includes(key.midi)||undefined} data-hit={hits.includes(key.midi)||undefined} onClick={()=>void press(key.midi)}><strong>{key.name}</strong><small>{key.shape}</small></button>)}</div></div>)}</div>}

   {!compact&&<div className={styles.meta}><span>{score.level}</span><span>{score.kind==="study"?"Estudo preparatório":"Repertório"}</span><span>{handLabel}</span>{score.volumeReference&&<span>Vol. {score.volumeReference}</span>}{score.skills?.map((skill)=><span key={skill}>{skill}</span>)}<p>{score.source}</p>{score.methodReferences.map((reference)=><small key={reference}>{reference}</small>)}</div>}
 </section>;
}
