import type { KidsSong } from "@/lib/music-types";

const colors=[{note:"Dó",color:"#ff5f86"},{note:"Ré",color:"#ffbf3f"},{note:"Mi",color:"#64c96b"},{note:"Fá",color:"#4fc8c1"},{note:"Sol",color:"#4b9df8"},{note:"Lá",color:"#8f74eb"},{note:"Si",color:"#d264d7"}];

export const musicDataG: KidsSong[] = [
  {
    id:"noite-de-estrelas",title:"Noite de Estrelas",subtitle:"Duas mãos · partitura calma em 3/4",age:"5-8",difficulty:"Fácil",theme:"valsa e expressão",emoji:"🌌",rights:"original",playable:true,category:"repertorio-5-8",sheetMusic:true,timeSignature:"3/4",story:"Uma peça calma para aprender a respirar entre frases e começar a coordenar as duas mãos.",colors,pianoOctaves:3,grandStaff:true,
    sections:[{label:"Estrelas",notes:["Dó4","Mi4","Sol4","Mi4","Ré4","Dó4"]},{label:"Lua",notes:["Ré4","Fá4","Lá4","Fá4","Mi4","Ré4"]},{label:"Céu",notes:["Mi4","Sol4","Si4","Lá4","Sol4","Mi4"]},{label:"Boa noite",notes:["Fá4","Mi4","Ré4","Mi4","Ré4","Dó4"]}],
    sequence:["Dó4","Mi4","Sol4","Mi4","Ré4","Dó4","Ré4","Fá4","Lá4","Fá4","Mi4","Ré4","Mi4","Sol4","Si4","Lá4","Sol4","Mi4","Fá4","Mi4","Ré4","Mi4","Ré4","Dó4"],
    scoreEvents:[
      {right:["Dó4"],left:["Dó3"],beats:1,rightFingering:[1],leftFingering:[5]},
      {right:["Mi4"],beats:1,rightFingering:[3]},
      {right:["Sol4"],left:["Sol3"],beats:1,rightFingering:[5],leftFingering:[1]},
      {right:["Mi4"],beats:1,rightFingering:[3]},
      {right:["Ré4"],left:["Sol3"],beats:1,rightFingering:[2],leftFingering:[1]},
      {right:["Dó4"],beats:1,rightFingering:[1]},
      {right:["Ré4"],left:["Ré3"],beats:1,rightFingering:[1],leftFingering:[5]},
      {right:["Fá4"],beats:1,rightFingering:[3]},
      {right:["Lá4"],left:["Lá3"],beats:1,rightFingering:[5],leftFingering:[1]},
      {right:["Fá4"],beats:1,rightFingering:[3]},
      {right:["Mi4"],left:["Lá3"],beats:1,rightFingering:[2],leftFingering:[1]},
      {right:["Ré4"],beats:1,rightFingering:[1]},
      {right:["Mi4"],left:["Mi3"],beats:1,rightFingering:[1],leftFingering:[5]},
      {right:["Sol4"],beats:1,rightFingering:[3]},
      {right:["Si4"],left:["Si3"],beats:1,rightFingering:[5],leftFingering:[1]},
      {right:["Lá4"],beats:1,rightFingering:[4]},
      {right:["Sol4"],left:["Si3"],beats:1,rightFingering:[3],leftFingering:[1]},
      {right:["Mi4"],beats:1,rightFingering:[1]},
      {right:["Fá4"],left:["Fá3"],beats:1,rightFingering:[4],leftFingering:[5]},
      {right:["Mi4"],beats:1,rightFingering:[3]},
      {right:["Ré4"],left:["Sol3"],beats:1,rightFingering:[2],leftFingering:[1]},
      {right:["Mi4"],beats:1,rightFingering:[3]},
      {right:["Ré4"],left:["Sol3"],beats:1,rightFingering:[2],leftFingering:[1]},
      {right:["Dó4"],left:["Dó3"],beats:1,rightFingering:[1],leftFingering:[5]},
    ],
  },
  {id:"mundo-bita-fazendinha",title:"Fazendinha",subtitle:"Mundo Bita · catálogo licenciado",age:"both",difficulty:"Fácil",theme:"animais e fazenda",emoji:"🐄",rights:"license-required",playable:false,category:"licenciado",story:"Experiência preparada para entrar no catálogo quando houver autorização de uso da composição."},
  {id:"mundo-bita-dinossauros",title:"Dinossauros",subtitle:"Mundo Bita · catálogo licenciado",age:"both",difficulty:"Fácil",theme:"dinossauros",emoji:"🦕",rights:"license-required",playable:false,category:"licenciado",story:"Experiência musical planejada para piano, ilustrações e pequenas missões."},
  {id:"palavra-cantada-sopa",title:"Sopa",subtitle:"Palavra Cantada · catálogo licenciado",age:"both",difficulty:"Fácil",theme:"comida e ritmo",emoji:"🥣",rights:"license-required",playable:false,category:"licenciado",story:"Experiência planejada para trabalhar ritmo e memória no piano."},
  {id:"toquinho-aquarela",title:"Aquarela",subtitle:"Catálogo licenciado",age:"5-8",difficulty:"Intermédio",theme:"imaginação e fraseado",emoji:"🎨",rights:"license-required",playable:false,category:"licenciado",story:"Experiência planejada para leitura, fraseado e ilustrações que se constroem durante a música."},
  {id:"toquinho-o-caderno",title:"O Caderno",subtitle:"Catálogo licenciado",age:"5-8",difficulty:"Intermédio",theme:"escola e memória",emoji:"📒",rights:"license-required",playable:false,category:"licenciado",story:"Experiência planejada com partitura e ilustrações escolares."},
  {id:"disney-livre-estou",title:"Livre Estou",subtitle:"Catálogo licenciado",age:"5-8",difficulty:"Intermédio",theme:"cinema e expressão",emoji:"❄️",rights:"license-required",playable:false,category:"licenciado",story:"Entrada de catálogo preparada para uma futura licença oficial."}
];
