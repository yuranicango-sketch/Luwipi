import type { AgeGroup } from "@/lib/curriculum";
import { getLessonExperience } from "@/lib/lesson-experience";

export const competencyLabels={
  ouvido:"Ouvido",
  ritmo:"Ritmo",
  teclado:"Teclado",
  tecnica:"Técnica",
  leitura:"Leitura",
  criatividade:"Criatividade",
  repertorio:"Repertório",
  harmonia:"Harmonia",
  coordenacao:"Coordenação",
  expressao:"Expressão",
} as const;

export type CompetencyId=keyof typeof competencyLabels;
export type LearningSessionType="lesson"|"song"|"game"|"workout";

const gameCompetencies:Record<string,CompetencyId[]>={
  "elefante-passarinho":["ouvido"],
  "leao-coelhinho":["ouvido","expressao"],
  "siga-tambor":["ritmo"],
  "eco-musical":["ritmo","ouvido"],
  "caca-teclas":["teclado"],
  "caminho-cores":["teclado","coordenacao"],
  "trem-ritmo":["ritmo","coordenacao"],
  "ajude-cordeirinho":["repertorio","teclado"],
  "encontre-do":["teclado"],
  "pauta-tecla":["leitura","teclado"],
  "construa-compasso":["ritmo","leitura"],
  "ouca-encontre":["ouvido","teclado"],
  "mestre-dedos":["tecnica","coordenacao"],
  "legato-staccato":["tecnica","expressao","ouvido"],
  "construa-acorde":["harmonia","teclado"],
  "complete-melodia":["criatividade","ouvido"],
};

function uniq<T>(values:T[]){return [...new Set(values)]}

export function competenciesForLesson(age:AgeGroup,lessonNumber:number):CompetencyId[]{
  const exp=getLessonExperience(age,lessonNumber);
  const result:CompetencyId[]=[];
  switch(exp.kind){
    case "listen":
    case "contrast":
    case "memory": result.push("ouvido");break;
    case "rhythm": result.push("ritmo");break;
    case "keyboard":
    case "movement": result.push("teclado");break;
    case "hands":
    case "technique": result.push("tecnica","coordenacao");break;
    case "staff": result.push("leitura");break;
    case "grand-staff":
    case "duet": result.push("leitura","coordenacao");break;
    case "harmony": result.push("harmonia");break;
    case "creation": result.push("criatividade");break;
    case "song": result.push("repertorio");break;
    case "performance": result.push("repertorio","expressao");break;
    case "practice": result.push("tecnica");break;
    case "celebration": result.push("repertorio");break;
    default: result.push(age==="2-4"?"ouvido":"teclado");
  }
  if(["loud-soft","dynamics","phrasing","legato","staccato"].includes(exp.visualKey))result.push("expressao");
  if(["two-hands-entry","two-hands-song","duet","alternate-hands"].includes(exp.visualKey))result.push("coordenacao");
  if(["triad","cfg","intervals"].includes(exp.visualKey))result.push("harmonia");
  return uniq(result);
}

export function competenciesForGame(gameId:string){return gameCompetencies[gameId]??["teclado"]}

export function competenciesForSession(input:{
  sessionType:LearningSessionType;
  age:AgeGroup;
  lessonNumber?:number|null;
  contentId?:string|null;
  metadata?:Record<string,unknown>|null;
}):CompetencyId[]{
  if(input.sessionType==="lesson"&&input.lessonNumber)return competenciesForLesson(input.age,input.lessonNumber);
  if(input.sessionType==="game"&&input.contentId)return competenciesForGame(input.contentId);
  if(input.sessionType==="song"){
    const hand=String(input.metadata?.handMode??"");
    return hand==="both"?["repertorio","leitura","coordenacao"]:["repertorio","leitura"];
  }
  if(input.sessionType==="workout"){
    const raw=input.metadata?.competencies;
    if(Array.isArray(raw)){
      const valid=raw.filter((x):x is CompetencyId=>typeof x==="string"&&x in competencyLabels);
      if(valid.length)return uniq(valid);
    }
  }
  return ["teclado"];
}

export function sessionQuality(input:{accuracy?:number|null;correct?:number;mistakes?:number;mastery?:string|null}){
  if(typeof input.accuracy==="number")return Math.max(0,Math.min(1,input.accuracy/100));
  const total=(input.correct??0)+(input.mistakes??0);
  if(total>0)return Math.max(0,Math.min(1,(input.correct??0)/total));
  if(input.mastery==="mastered")return .95;
  if(input.mastery==="reinforce")return .62;
  return .7;
}

export type StudentMetric={
  competency:CompetencyId;
  evidenceCount:number;
  successes:number;
  mistakes:number;
  masteryScore:number;
  lastAccuracy:number|null;
  lastContentId:string|null;
  updatedAt:string;
};

export function rankMetrics(metrics:StudentMetric[]){
  const byId=new Map(metrics.map(m=>[m.competency,m]));
  return (Object.keys(competencyLabels) as CompetencyId[]).map(id=>byId.get(id)??{
    competency:id,evidenceCount:0,successes:0,mistakes:0,masteryScore:.5,lastAccuracy:null,lastContentId:null,updatedAt:"",
  }).sort((a,b)=>{
    const confidenceA=Math.min(1,a.evidenceCount/6),confidenceB=Math.min(1,b.evidenceCount/6);
    const adjustedA=a.masteryScore*confidenceA+.45*(1-confidenceA);
    const adjustedB=b.masteryScore*confidenceB+.45*(1-confidenceB);
    return adjustedA-adjustedB;
  });
}
