"use client";

import type { AgeGroup } from "@/lib/curriculum";
import { isRemoteStudentId } from "@/lib/learning-client";

export type MasteryState = "mastered" | "reinforce" | null;
export type LessonProgress = { step:number; action?:number; completed:boolean; mastery:MasteryState; updatedAt:string };
export type CurriculumProgress = Record<string,LessonProgress>;

function storageKey(studentId:string,age:AgeGroup){return `luwipi:curriculum:v3:${studentId}:${age}`}

export function readCurriculumProgress(studentId:string,age:AgeGroup):CurriculumProgress{
  if(typeof window==="undefined")return{};
  try{const raw=window.localStorage.getItem(storageKey(studentId,age));return raw?JSON.parse(raw) as CurriculumProgress:{};}catch{return{}}
}
function writeCurriculumProgress(studentId:string,age:AgeGroup,value:CurriculumProgress){
  if(typeof window==="undefined")return;
  window.localStorage.setItem(storageKey(studentId,age),JSON.stringify(value));
}
function newer(a?:LessonProgress,b?:LessonProgress){
  if(!a)return b;if(!b)return a;
  return Date.parse(a.updatedAt||"0")>=Date.parse(b.updatedAt||"0")?a:b;
}
async function pushRemote(studentId:string,age:AgeGroup,lessonNumber:number,value:LessonProgress){
  if(!isRemoteStudentId(studentId))return;
  try{await fetch("/api/learning/progress",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    studentId,ageGroup:age,lessonNumber,step:value.step,action:value.action??0,completed:value.completed,mastery:value.mastery,
  }),keepalive:true})}catch{}
}

export async function hydrateCurriculumProgress(studentId:string,age:AgeGroup):Promise<CurriculumProgress>{
  const local=readCurriculumProgress(studentId,age);
  if(!isRemoteStudentId(studentId))return local;
  try{
    const response=await fetch(`/api/learning/progress?studentId=${encodeURIComponent(studentId)}&age=${age}`,{cache:"no-store"});
    if(!response.ok)return local;
    const body=await response.json();
    const remote:CurriculumProgress={};
    for(const row of body.progress??[])remote[String(row.lessonNumber)]={step:row.step,action:row.action,completed:row.completed,mastery:row.mastery,updatedAt:row.updatedAt};
    const keys=new Set([...Object.keys(local),...Object.keys(remote)]);
    const merged:CurriculumProgress={};
    for(const key of keys){
      const chosen=newer(local[key],remote[key]);
      if(chosen)merged[key]=chosen;
      if(local[key]&&chosen===local[key]&&(!remote[key]||Date.parse(local[key].updatedAt)>Date.parse(remote[key].updatedAt)))void pushRemote(studentId,age,Number(key),local[key]);
    }
    writeCurriculumProgress(studentId,age,merged);
    return merged;
  }catch{return local}
}

export function saveLessonStep(studentId:string,age:AgeGroup,lessonNumber:number,step:number,action=0){
  const current=readCurriculumProgress(studentId,age),key=String(lessonNumber);
  const value:LessonProgress={step,action,completed:current[key]?.completed??false,mastery:current[key]?.mastery??null,updatedAt:new Date().toISOString()};
  current[key]=value;writeCurriculumProgress(studentId,age,current);void pushRemote(studentId,age,lessonNumber,value);
}

export function completeLesson(studentId:string,age:AgeGroup,lessonNumber:number,mastery:Exclude<MasteryState,null>){
  const current=readCurriculumProgress(studentId,age);
  const value:LessonProgress={step:999,action:0,completed:true,mastery,updatedAt:new Date().toISOString()};
  current[String(lessonNumber)]=value;writeCurriculumProgress(studentId,age,current);void pushRemote(studentId,age,lessonNumber,value);
}

export function currentLessonNumber(progress:CurriculumProgress){
  for(let lesson=1;lesson<=48;lesson+=1)if(!progress[String(lesson)]?.completed)return lesson;
  return 48;
}
