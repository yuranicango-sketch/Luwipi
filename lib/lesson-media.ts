export type LessonMedia={src:string;alt:string;credit:string;fit?:"cover"|"contain"};
const commons=(file:string,alt:string,credit:string,fit:"cover"|"contain"="cover"):LessonMedia=>({
 src:`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`,alt,credit,fit
});

const elephant=commons("Mother and child(elephant).jpg","Elefantes numa paisagem natural.","PRAB1988 · Wikimedia Commons · CC BY-SA 4.0");
const bird=commons("Thebluebird.jpg","Pássaro azul pousado.","Bradleyff869 · Wikimedia Commons · CC BY-SA");
const lion=commons("African lion animal.jpg","Leão africano.","U.S. Fish and Wildlife Service · domínio público");
const rabbit=commons("Rabbit face.jpg","Coelho visto de perto.","Love Krittaya · domínio público");
const hands=commons("Hand- und Fingerstellung.jpg","Mão em posição natural sobre o teclado.","Wikimedia Commons");
const pianoHands=commons("Piano practice hands.jpg","Mãos a tocar um piano.","Wikimedia Commons");

export function mediaForLesson(age:"2-4"|"5-8"|"adult",lesson:number,visualKey:string):LessonMedia[]{
 if(visualKey==="high-low"||visualKey==="sound-homes")return[elephant,bird];
 if(visualKey==="loud-soft")return[lion,rabbit];
 if(["hand-shape","fingers-123","single-finger","hand-bridge","finger-numbers","five-fingers","right-hand","left-hand","legato","staccato"].includes(visualKey))return[hands,pianoHands];
 if(["posture","first-performance","play-through","record-review","recital","toy-concert","final-party"].includes(visualKey))return[pianoHands];
 if(age==="2-4"&&[1,5,15,16,37,40,41,46,47,48].includes(lesson))return[pianoHands];
 return[];
}
