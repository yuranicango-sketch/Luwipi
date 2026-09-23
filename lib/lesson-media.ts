export type LessonMedia={src:string;alt:string;credit:string;fit?:"cover"|"contain"};

const hands:LessonMedia={
 src:"https://upload.wikimedia.org/wikipedia/commons/e/e7/Hand-_und_Fingerstellung.jpg",
 alt:"Mão em posição natural sobre o teclado.",
 credit:"Marie Unschuld von Melasfeld · Wikimedia Commons",
 fit:"cover",
};
const pianoHands:LessonMedia={
 src:"https://upload.wikimedia.org/wikipedia/commons/a/a0/Piano_practice_hands.jpg",
 alt:"Mãos de uma criança repousadas sobre as teclas de um piano.",
 credit:"Scott Catron · Wikimedia Commons",
 fit:"cover",
};

export function mediaForLesson(age:"2-4"|"5-8"|"adult",lesson:number,visualKey:string):LessonMedia[]{
 if(["hand-shape","fingers-123","single-finger","hand-bridge","finger-numbers","five-fingers","right-hand","left-hand","legato","staccato"].includes(visualKey))return[hands,pianoHands];
 if(["posture","first-performance","play-through","record-review","recital","toy-concert","final-party"].includes(visualKey))return[pianoHands];
 if(age==="2-4"&&[1,5,15,16,37,40,41,46,47,48].includes(lesson))return[pianoHands];
 return[];
}
