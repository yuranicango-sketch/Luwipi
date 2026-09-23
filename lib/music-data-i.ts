import type { KidsSong, PianoScoreEvent } from "@/lib/music-types";
const colors=[{note:"Dó",color:"#ff5f86"},{note:"Ré",color:"#ffbf3f"},{note:"Mi",color:"#64c96b"},{note:"Fá",color:"#4fc8c1"},{note:"Sol",color:"#4b9df8"},{note:"Lá",color:"#8f74eb"},{note:"Si",color:"#d264d7"}];
const song=(id:string,title:string,subtitle:string,emoji:string,timeSignature:"4/4"|"3/4",difficulty:KidsSong["difficulty"],story:string,sections:{label:string;notes:string[]}[],rightsSource:string,pianoOctaves:1|2|3=1,extra:Partial<KidsSong>={}):KidsSong=>({id,title,subtitle,age:"5-8",difficulty,theme:"repertório e leitura",emoji,rights:"public-domain",playable:true,category:"repertorio-5-8",sheetMusic:true,timeSignature,story,colors,sections,sequence:sections.flatMap(s=>s.notes),rightsSource,pianoOctaves,...extra});

const preludeScore:PianoScoreEvent[]=[
 {left:["Dó3","Sol3"],right:["Dó4","Mi4"],leftFingering:[5,2],rightFingering:[1,3]},
 {left:["Dó3","Sol3"],right:["Sol4","Dó5"],leftFingering:[5,2],rightFingering:[1,5]},
 {left:["Ré3","Lá3"],right:["Ré4","Fá4"],leftFingering:[5,2],rightFingering:[1,3]},
 {left:["Ré3","Lá3"],right:["Lá4","Ré5"],leftFingering:[5,2],rightFingering:[1,5]},
 {left:["Mi3","Si3"],right:["Mi4","Sol4"],leftFingering:[5,2],rightFingering:[1,3]},
 {left:["Mi3","Si3"],right:["Si4","Mi5"],leftFingering:[5,2],rightFingering:[1,5]},
 {left:["Fá3","Dó4"],right:["Fá4","Lá4"],leftFingering:[5,2],rightFingering:[1,3]},
 {left:["Sol3","Ré4"],right:["Sol4","Si4"],leftFingering:[5,2],rightFingering:[1,3]},
 {left:["Dó3","Sol3"],right:["Mi4","Sol4"],leftFingering:[5,2],rightFingering:[1,3]},
 {left:["Dó3"],right:["Ré4","Dó4"],leftFingering:[5],rightFingering:[2,1]},
];

export const musicDataI:KidsSong[]=[
 song("ode-alegria","Ode à Alegria","Beethoven · arranjo pedagógico Luwipi","🎻","4/4","Fácil","Uma melodia conhecida para transformar leitura em música desde a primeira frase.",[{label:"Tema A",notes:["Mi","Mi","Fá","Sol","Sol","Fá","Mi","Ré"]},{label:"Resposta",notes:["Dó","Dó","Ré","Mi","Mi","Ré","Ré"]},{label:"Tema A volta",notes:["Mi","Mi","Fá","Sol","Sol","Fá","Mi","Ré"]},{label:"Final",notes:["Dó","Dó","Ré","Mi","Ré","Dó","Dó"]}],"Tema da Sinfonia n.º 9 de Ludwig van Beethoven, obra em domínio público; arranjo pedagógico simplificado Luwipi."),
 song("minueto-sol-petzold","Minueto em Sol","Christian Petzold · iniciação ao repertório clássico","🏛️","3/4","Intermédio","Uma primeira peça clássica para sentir três tempos, fraseado e elegância no teclado.",[{label:"Tema inicial",notes:["Ré4","Sol4","Lá4","Si4","Dó5","Ré5"]},{label:"Resposta",notes:["Sol4","Sol4","Mi4","Dó5","Ré5","Mi5"]},{label:"Continuação",notes:["Fá5","Sol5","Lá5","Si5","Dó5","Si4"]},{label:"Cadência",notes:["Lá4","Sol4","Fá4","Mi4","Ré4","Sol4"]}],"Minueto em Sol, BWV Anh. 114, atribuído a Christian Petzold; composição em domínio público. Arranjo pedagógico Luwipi.",2),
 song("fur-elise","Für Elise","Beethoven · tema inicial adaptado","🎹","3/4","Intermédio","O tema famoso aparece em pequenas frases para trabalhar repetição, direção e expressão.",[{label:"Chamada",notes:["Mi","Ré","Mi","Ré","Mi","Si","Ré","Dó","Lá"]},{label:"Resposta",notes:["Dó","Mi","Lá","Si"]},{label:"Chamada volta",notes:["Mi","Ré","Mi","Ré","Mi","Si","Ré","Dó","Lá"]},{label:"Fecho",notes:["Dó","Si","Lá"]}],"Bagatela WoO 59 de Ludwig van Beethoven, em domínio público; tema inicial simplificado e transposto para a faixa pedagógica Luwipi."),
 song("preludio-do-maior-bach","Prelúdio em Dó Maior","J. S. Bach · duas mãos e grande pauta","🎼","4/4","Intermédio","O padrão do prelúdio vira uma primeira experiência séria de coordenação entre clave de Sol e clave de Fá.",[{label:"Padrão 1",notes:["Dó4","Mi4","Sol4","Dó5","Mi5","Sol5","Mi5","Dó5"]},{label:"Padrão 2",notes:["Ré4","Fá4","Lá4","Ré5","Fá5","Lá5","Fá5","Ré5"]},{label:"Padrão 3",notes:["Mi4","Sol4","Si4","Mi5","Sol5","Si5","Sol5","Mi5"]},{label:"Retorno",notes:["Dó4","Mi4","Sol4","Dó5","Sol5","Mi5","Ré5","Dó5"]}],"Prelúdio em Dó Maior, BWV 846, de J. S. Bach, em domínio público; redução pedagógica Luwipi.",3,{grandStaff:true,scoreEvents:preludeScore})
];
