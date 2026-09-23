"use client";

import type { AgeGroup } from "@/lib/curriculum";
import { competenciesForLesson, competencyLabels, type CompetencyId } from "@/lib/learning-intelligence";
import { readCurriculumProgress } from "@/lib/curriculum-progress";

export { competencyLabels };
export type { CompetencyId };

export type CompetencySnapshot=Record<CompetencyId,{mastered:number;reinforce:number;total:number;score:number}>;

export function competencySnapshot(studentId:string,age:AgeGroup):CompetencySnapshot{
  const progress=readCurriculumProgress(studentId,age);
  const ids=Object.keys(competencyLabels) as CompetencyId[];
  const out=Object.fromEntries(ids.map(id=>[id,{mastered:0,reinforce:0,total:0,score:.5}])) as CompetencySnapshot;
  for(let n=1;n<=48;n++){
    const row=progress[String(n)];if(!row?.completed)continue;
    for(const id of competenciesForLesson(age,n)){
      out[id].total+=1;
      if(row.mastery==="mastered")out[id].mastered+=1;
      if(row.mastery==="reinforce")out[id].reinforce+=1;
    }
  }
  for(const id of ids){
    const value=out[id];
    value.score=value.total?Math.max(0,Math.min(1,(value.mastered+.62*value.reinforce)/value.total)):.5;
  }
  return out;
}
