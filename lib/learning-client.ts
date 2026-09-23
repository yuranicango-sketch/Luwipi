"use client";

import type { AgeGroup } from "@/lib/curriculum";
import type { CompetencyId, LearningSessionType, StudentMetric } from "@/lib/learning-intelligence";

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isRemoteStudentId(value:string){return UUID_RE.test(value)}

export type LearningSessionPayload={
  studentId:string;
  ageGroup:AgeGroup;
  sessionType:LearningSessionType;
  lessonNumber?:number|null;
  contentId?:string|null;
  source?:"screen"|"midi"|"microphone"|"mixed"|null;
  handMode?:"right"|"left"|"both"|null;
  attempts?:number;
  correct?:number;
  mistakes?:number;
  accuracy?:number|null;
  stars?:number|null;
  durationSeconds?:number;
  startedAt?:string;
  metadata?:Record<string,unknown>;
};

export async function recordLearningSession(payload:LearningSessionPayload){
  if(!isRemoteStudentId(payload.studentId))return null;
  try{
    const response=await fetch("/api/learning/session",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify(payload),
      keepalive:true,
    });
    if(!response.ok)return null;
    return await response.json();
  }catch{return null}
}

export type StudentInsight={
  student:{id:string;displayCode:string;ageGroup:AgeGroup};
  progress:{lessonNumber:number;step:number;action:number;completed:boolean;mastery:"mastered"|"reinforce"|null;updatedAt:string}[];
  metrics:StudentMetric[];
  recentSessions:{
    id:string;sessionType:LearningSessionType;contentId:string|null;lessonNumber:number|null;accuracy:number|null;stars:number|null;durationSeconds:number;createdAt:string;
  }[];
  homework:{id:string;code:string;songId:string;targetRepeats:number;completed:boolean;repeats:number;lastPracticedAt:string|null;createdAt:string}[];
  summary:{completedLessons:number;currentLesson:number;totalSessions:number;practiceMinutes:number;homeworkAssigned:number;homeworkCompleted:number;lastHomeworkPractice:string|null};
  recommended:CompetencyId[];
};

export async function fetchStudentInsight(studentId:string,ageGroup:AgeGroup):Promise<StudentInsight|null>{
  if(!isRemoteStudentId(studentId))return null;
  try{
    const response=await fetch(`/api/learning/insight?studentId=${encodeURIComponent(studentId)}&age=${ageGroup}`,{cache:"no-store"});
    if(!response.ok)return null;
    return await response.json();
  }catch{return null}
}
