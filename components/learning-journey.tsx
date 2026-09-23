"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CurriculumMapDrawer } from "@/components/curriculum-map-drawer";
import { LessonRunner } from "@/components/lesson-runner";
import type { EnhancedProgram, CurriculumVariant } from "@/lib/curriculum-v3";
import { currentLessonNumber, hydrateCurriculumProgress, readCurriculumProgress } from "@/lib/curriculum-progress";

type Props={program:EnhancedProgram;variant:CurriculumVariant;studentId:string;initialLesson?:number;initialMap?:boolean;maxLesson?:number};

export function LearningJourney({program,variant,studentId,initialLesson,initialMap=false,maxLesson=48}:Props){
 const router=useRouter();
 const[current,setCurrent]=useState(()=>Math.max(1,Math.min(48,initialLesson??1)));
 const[mapOpen,setMapOpen]=useState(initialMap),[revision,setRevision]=useState(0),[ready,setReady]=useState(false);

 useEffect(()=>{
   let alive=true;
   const local=readCurriculumProgress(studentId,program.age);
   if(!initialLesson)setCurrent(currentLessonNumber(local));
   void hydrateCurriculumProgress(studentId,program.age).then(progress=>{
     if(!alive)return;
     if(!initialLesson)setCurrent(currentLessonNumber(progress));
     setRevision(v=>v+1);setReady(true);
   });
   return()=>{alive=false};
 },[initialLesson,studentId,program.age]);

 const found=useMemo(()=>{
   for(const module of program.modules){const lesson=module.lessons.find(item=>item.number===current);if(lesson)return{module,lesson}}
   return{module:program.modules[0],lesson:program.modules[0].lessons[0]};
 },[program,current]);

 function syncUrl(lesson:number,map=false){if(typeof window==="undefined")return;const query=new URLSearchParams({lesson:String(lesson)});if(map)query.set("map","1");window.history.replaceState(null,"",`/aprender?${query.toString()}`)}
 function selectLesson(lesson:number){if(lesson>maxLesson){router.push("/assinar?reason=trial_limit");return}setCurrent(lesson);syncUrl(lesson,false)}
 function completed(){setRevision(v=>v+1)}
 function exit(){router.push("/dashboard")}

 if(!ready)return <div style={{height:"100svh",display:"grid",placeItems:"center",fontWeight:900,color:"#52657b"}}>A sincronizar o percurso…</div>;
 return <><LessonRunner key={`${program.age}-${variant.id}-${found.lesson.number}`} age={program.age} program={program} module={found.module} lesson={found.lesson} variant={variant} studentId={studentId} maxLesson={maxLesson} onLocked={()=>router.push("/assinar?reason=trial_limit")} onOpenMap={()=>setMapOpen(true)} onNavigateLesson={selectLesson} onCompleted={completed} onExit={exit}/><CurriculumMapDrawer open={mapOpen} onClose={()=>{setMapOpen(false);syncUrl(current,false)}} onSelect={selectLesson} program={program} variant={variant} studentId={studentId} currentLesson={current} revision={revision} maxLesson={maxLesson}/></>;
}
