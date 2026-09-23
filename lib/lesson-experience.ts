import type { AgeGroup } from "@/lib/curriculum";
import type { AgeVariant } from "@/lib/curriculum-v3";

export type LessonExperienceKind =
  | "story" | "listen" | "contrast" | "rhythm" | "keyboard" | "movement"
  | "hands" | "memory" | "sequence" | "staff" | "grand-staff" | "technique"
  | "harmony" | "creation" | "song" | "performance" | "practice" | "duet"
  | "celebration";

export type LessonGate = "teacher" | "listen" | "piano" | "rhythm" | "choice" | "score" | "free";

export type LessonExperience = {
  kind: LessonExperienceKind;
  gate: LessonGate;
  chapter: string;
  visualKey: string;
};

const P = (kind:LessonExperienceKind,gate:LessonGate,chapter:string,visualKey:string=kind):LessonExperience=>({kind,gate,chapter,visualKey});

/**
 * Every lesson is deliberately assigned to a presentation grammar.
 * The Player never infers its primary UI from prose or regex.
 */
const preschool:LessonExperience[]=[
 P("story","free","Descobrir o piano","piano-world"),
 P("contrast","listen","Descobrir o piano","high-low"),
 P("contrast","choice","Descobrir o piano","sound-homes"),
 P("contrast","listen","Descobrir o piano","loud-soft"),
 P("contrast","choice","Descobrir o piano","big-small"),
 P("listen","choice","Descobrir o piano","long-short"),
 P("rhythm","rhythm","Sentir o pulso","pulse"),
 P("rhythm","teacher","Sentir o pulso","sound-silence"),
 P("memory","rhythm","Imitar e lembrar","echo"),
 P("rhythm","choice","Imitar e lembrar","tempo"),
 P("rhythm","teacher","Imitar e lembrar","stop-go"),
 P("performance","rhythm","Imitar e lembrar","rhythm-party"),
 P("keyboard","piano","Conhecer o teclado","white-black"),
 P("keyboard","piano","Conhecer o teclado","black-groups"),
 P("keyboard","free","Conhecer o teclado","low-region"),
 P("keyboard","free","Conhecer o teclado","high-region"),
 P("movement","piano","Caminhos no piano","up-down"),
 P("keyboard","piano","Caminhos no piano","treasure-hunt"),
 P("hands","teacher","As mãos começam","hand-shape"),
 P("hands","teacher","As mãos começam","fingers-123"),
 P("hands","piano","As mãos começam","single-finger"),
 P("duet","piano","As mãos começam","alternate-hands"),
 P("sequence","piano","As mãos começam","finger-steps"),
 P("hands","piano","As mãos começam","hand-bridge"),
 P("listen","piano","Ouvir e encontrar","hidden-sound"),
 P("memory","piano","Ouvir e encontrar","two-sounds"),
 P("rhythm","rhythm","Ouvir e encontrar","clap-to-piano"),
 P("memory","choice","Ouvir e encontrar","sound-order"),
 P("duet","piano","Ouvir e encontrar","call-response"),
 P("memory","choice","Ouvir e encontrar","memory-box"),
 P("sequence","piano","Ver e tocar","color-place"),
 P("sequence","piano","Ver e tocar","two-step"),
 P("sequence","piano","Ver e tocar","three-step"),
 P("memory","choice","Ver e tocar","same-different"),
 P("sequence","choice","Ver e tocar","missing-step"),
 P("song","score","Ver e tocar","mini-song"),
 P("contrast","free","Contar histórias com som","animal-voices"),
 P("story","free","Contar histórias com som","rain-sun"),
 P("rhythm","rhythm","Contar histórias com som","train-station"),
 P("song","score","Repertório","star-song"),
 P("song","score","Repertório","lamb-song"),
 P("creation","free","Criar uma aventura","sound-journey"),
 P("creation","choice","Criar uma aventura","favorites"),
 P("creation","rhythm","Criar uma aventura","own-rhythm"),
 P("duet","piano","Tocar com alguém","duet"),
 P("song","score","Preparar para tocar","own-song"),
 P("performance","teacher","Preparar para tocar","toy-concert"),
 P("celebration","teacher","Celebrar","final-party"),
];

const child:LessonExperience[]=[
 P("hands","teacher","Começar no piano","posture"),
 P("hands","teacher","Começar no piano","finger-numbers"),
 P("keyboard","piano","Começar no piano","black-groups"),
 P("keyboard","piano","Começar no piano","find-c"),
 P("listen","choice","Começar no piano","high-low"),
 P("sequence","piano","Começar no piano","steps"),
 P("rhythm","rhythm","Pulso e duração","pulse"),
 P("performance","teacher","Pulso e duração","first-performance"),
 P("rhythm","rhythm","Pulso e duração","quarter-note"),
 P("rhythm","rhythm","Pulso e duração","half-note"),
 P("rhythm","rhythm","Pulso e duração","rest"),
 P("rhythm","rhythm","Pulso e duração","whole-note"),
 P("rhythm","rhythm","Pulso e duração","eighth-pairs"),
 P("rhythm","rhythm","Pulso e duração","four-four"),
 P("rhythm","rhythm","Pulso e duração","three-four"),
 P("song","score","Pulso e duração","rhythm-song"),
 P("staff","score","A pauta vira mapa","staff-map"),
 P("grand-staff","score","A pauta vira mapa","middle-c"),
 P("staff","score","A pauta vira mapa","treble"),
 P("grand-staff","score","A pauta vira mapa","bass"),
 P("staff","score","A pauta vira mapa","steps-skips"),
 P("staff","score","A pauta vira mapa","read-no-names"),
 P("grand-staff","score","A pauta vira mapa","grand-staff"),
 P("song","score","A pauta vira mapa","read-piece"),
 P("hands","piano","As mãos trabalham","five-fingers"),
 P("technique","piano","As mãos trabalham","right-hand"),
 P("technique","piano","As mãos trabalham","left-hand"),
 P("technique","piano","As mãos trabalham","legato"),
 P("technique","piano","As mãos trabalham","staccato"),
 P("duet","piano","As mãos trabalham","alternate-hands"),
 P("grand-staff","score","As mãos trabalham","two-hands-entry"),
 P("song","score","As mãos trabalham","two-hands-song"),
 P("technique","piano","Forma e harmonia","c-scale"),
 P("harmony","choice","Forma e harmonia","intervals"),
 P("harmony","piano","Forma e harmonia","triad"),
 P("harmony","piano","Forma e harmonia","cfg"),
 P("contrast","piano","Fazer soar música","dynamics"),
 P("performance","teacher","Fazer soar música","phrasing"),
 P("harmony","piano","Fazer soar música","melody-support"),
 P("song","score","Fazer soar música","musical-performance"),
 P("memory","piano","Ouvido e criação","three-note-echo"),
 P("creation","free","Ouvido e criação","question-answer"),
 P("creation","free","Ouvido e criação","guided-improv"),
 P("creation","free","Ouvido e criação","four-bars"),
 P("practice","teacher","Preparar performance","smart-practice"),
 P("performance","teacher","Preparar performance","play-through"),
 P("performance","teacher","Preparar performance","record-review"),
 P("celebration","teacher","Preparar performance","recital"),
];

if(preschool.length!==48||child.length!==48) throw new Error("Lesson experience map must contain exactly 48 lessons per child programme.");

export function getLessonExperience(age:AgeGroup,lessonNumber:number):LessonExperience{
 const list=age==="2-4"?preschool:child;
 return list[Math.max(0,Math.min(47,lessonNumber-1))]??P("story","teacher","Aprender","lesson");
}

export function experienceForStep(base:LessonExperience,stepId:string,hasGame=false,hasSong=false):LessonExperience{
 if(hasGame)return P("practice","choice",base.chapter,"embedded-game");
 if(hasSong)return P("song","score",base.chapter,"embedded-song");
 if(stepId==="repertoire")return P("performance","teacher",base.chapter,"repertoire-live");
 if(stepId==="create")return P("creation","free",base.chapter,"creation");
 if(stepId==="checkpoint")return P("celebration","teacher",base.chapter,"checkpoint");
 if(stepId==="close")return P("celebration","teacher",base.chapter,"close");
 if(stepId==="arrive"||stepId==="warmup"){
   if(base.kind==="rhythm")return P("rhythm","rhythm",base.chapter,"warmup-pulse");
   if(["listen","contrast","memory"].includes(base.kind))return P("listen","listen",base.chapter,"warmup-listen");
   if(["hands","technique","duet"].includes(base.kind))return P("hands","teacher",base.chapter,"warmup-hands");
   return P("story","teacher",base.chapter,"warmup");
 }
 if(stepId==="story")return P("story","teacher",base.chapter,base.visualKey);
 return base;
}

export type VariantExperiencePolicy={
 showPianoLabels:boolean;
 readingLabels:boolean;
 instructionWords:"minimal"|"short";
 repetitions:number;
 scoreCoach:boolean;
};

export function getVariantExperiencePolicy(variant:AgeVariant,kind:LessonExperienceKind):VariantExperiencePolicy{
 if(variant==="2-3")return{showPianoLabels:false,readingLabels:false,instructionWords:"minimal",repetitions:1,scoreCoach:true};
 if(variant==="3-4")return{showPianoLabels:false,readingLabels:false,instructionWords:"minimal",repetitions:2,scoreCoach:true};
 if(variant==="5-6")return{showPianoLabels:!["staff","grand-staff"].includes(kind),readingLabels:true,instructionWords:"short",repetitions:2,scoreCoach:true};
 if(variant==="7-8")return{showPianoLabels:!["staff","grand-staff","song"].includes(kind),readingLabels:false,instructionWords:"short",repetitions:3,scoreCoach:false};
 return{showPianoLabels:true,readingLabels:false,instructionWords:"short",repetitions:3,scoreCoach:false};
}


const childChallenges:Partial<Record<number,string[]>>={
 1:["Dó4","Ré4","Mi4"],2:["Dó4","Ré4","Mi4"],3:["Dó4","Mi4","Sol4"],4:["Dó4","Dó5","Dó3"],5:["Dó3","Dó4","Dó5"],6:["Dó4","Ré4","Mi4","Ré4"],
 17:["Dó4","Ré4","Mi4"],18:["Dó4","Dó4","Dó4"],19:["Sol4","Lá4","Fá4","Sol4"],20:["Fá3","Sol3","Mi3","Fá3"],
 21:["Dó4","Ré4","Mi4","Sol4"],22:["Dó4","Mi4","Ré4","Fá4"],23:["Fá3","Dó4","Sol4","Mi4"],
 25:["Dó4","Ré4","Mi4","Fá4","Sol4"],26:["Dó4","Ré4","Mi4","Fá4"],27:["Dó3","Ré3","Mi3","Fá3"],
 28:["Dó4","Ré4","Mi4","Fá4"],29:["Sol4","Fá4","Mi4","Ré4"],30:["Dó4","Mi4","Dó3","Mi3"],31:["Dó3","Dó4","Mi4","Sol4"],
 33:["Dó4","Ré4","Mi4","Fá4","Sol4"],35:["Dó4","Mi4","Sol4"],36:["Dó4","Fá4","Sol4"],37:["Dó4","Mi4","Sol4"],
 39:["Dó3","Sol3","Dó4","Mi4"],41:["Dó4","Mi4","Sol4"]
};
const preschoolChallenges:Partial<Record<number,string[]>>={
 13:["Dó4","Mi4","Sol4"],14:["Dó4","Mi4","Sol4"],15:["Dó4","Ré4"],16:["Sol4","Lá4"],17:["Dó4","Ré4","Mi4"],
 18:["Dó4","Mi4","Sol4"],21:["Dó4","Ré4"],22:["Dó4","Dó4"],23:["Dó4","Ré4","Mi4"],24:["Dó4","Mi4","Sol4"],
 25:["Sol4","Mi4"],26:["Dó4","Mi4"],29:["Dó4","Mi4"],31:["Dó4","Mi4","Sol4"],32:["Dó4","Mi4"],33:["Dó4","Mi4","Sol4"],
 39:["Dó4","Dó4","Dó4","Dó4"],45:["Dó4","Mi4","Sol4"]
};

export function lessonPitchChallenge(age:AgeGroup,lessonNumber:number){
 return (age==="2-4"?preschoolChallenges:childChallenges)[lessonNumber]??[];
}
