import type { AgeGroup } from "@/lib/curriculum";
import type { LessonExperience } from "@/lib/lesson-experience";

export type LessonWorldId =
  | "giant-sky"
  | "whisper-forest"
  | "rhythm-railway"
  | "keyboard-kingdom"
  | "moon-garden"
  | "hand-workshop"
  | "story-valley"
  | "notation-city"
  | "hand-bridge"
  | "harmony-tower"
  | "creation-studio"
  | "concert-hall";

const giantSky=new Set(["high-low","sound-homes","big-small"]);
const whisperForest=new Set(["loud-soft","animal-voices"]);
const railway=new Set(["pulse","tempo","stop-go","rhythm-party","train-station","clap-to-piano","own-rhythm","quarter-note","half-note","rest","whole-note","eighth-pairs","four-four","three-four","rhythm-song","warmup-pulse"]);
const keyboardKingdom=new Set(["piano-world","white-black","black-groups","low-region","high-region","up-down","treasure-hunt","find-c","steps","color-place","two-step","three-step","missing-step"]);
const moonGarden=new Set(["long-short","sound-silence","echo","hidden-sound","two-sounds","sound-order","memory-box","rain-sun","star-song","lamb-song","three-note-echo","warmup-listen"]);
const handWorkshop=new Set(["hand-shape","fingers-123","single-finger","finger-steps","hand-bridge","posture","finger-numbers","five-fingers","right-hand","left-hand","legato","staccato","warmup-hands"]);
const handBridge=new Set(["alternate-hands","two-hands-entry","two-hands-song","duet","call-response"]);
const notationCity=new Set(["staff-map","middle-c","treble","bass","steps-skips","read-no-names","grand-staff","read-piece","mini-song"]);
const harmonyTower=new Set(["c-scale","intervals","triad","cfg","dynamics","phrasing","melody-support","musical-performance"]);
const creationStudio=new Set(["sound-journey","favorites","question-answer","guided-improv","four-bars","smart-practice","creation"]);
const concertHall=new Set(["first-performance","play-through","record-review","recital","toy-concert","final-party","own-song","repertoire-live","checkpoint","close"]);

export function worldForLesson(age:AgeGroup,experience:LessonExperience):LessonWorldId{
 const key=experience.visualKey;
 if(giantSky.has(key)) return "giant-sky";
 if(whisperForest.has(key)) return "whisper-forest";
 if(railway.has(key)||experience.kind==="rhythm") return "rhythm-railway";
 if(notationCity.has(key)||experience.kind==="staff"||experience.kind==="grand-staff") return "notation-city";
 if(handBridge.has(key)||experience.kind==="duet") return "hand-bridge";
 if(handWorkshop.has(key)||experience.kind==="hands"||experience.kind==="technique") return "hand-workshop";
 if(harmonyTower.has(key)||experience.kind==="harmony") return "harmony-tower";
 if(creationStudio.has(key)||experience.kind==="creation"||experience.kind==="practice") return "creation-studio";
 if(concertHall.has(key)||experience.kind==="performance"||experience.kind==="celebration") return "concert-hall";
 if(keyboardKingdom.has(key)||experience.kind==="keyboard"||experience.kind==="movement") return "keyboard-kingdom";
 if(moonGarden.has(key)||experience.kind==="listen"||experience.kind==="memory") return "moon-garden";
 return age==="2-4"?"story-valley":"creation-studio";
}

export function worldLabel(world:LessonWorldId){
 const labels:Record<LessonWorldId,string>={
  "giant-sky":"Vale do Gigante",
  "whisper-forest":"Floresta dos Sons",
  "rhythm-railway":"Estação do Ritmo",
  "keyboard-kingdom":"Reino das Teclas",
  "moon-garden":"Jardim da Lua",
  "hand-workshop":"Oficina das Mãos",
  "story-valley":"Vale das Histórias",
  "notation-city":"Cidade da Pauta",
  "hand-bridge":"Ponte das Duas Mãos",
  "harmony-tower":"Torre da Harmonia",
  "creation-studio":"Atelier da Música",
  "concert-hall":"Grande Palco",
 };
 return labels[world];
}
