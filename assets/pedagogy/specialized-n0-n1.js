(function(root){
"use strict";
// Original, track-targeted 8-bar reading studies. These are training material,
// NOT certified sight-reading examination pieces.
const P={
rise:"C2 D2 E2 F2|E2 F2 G2 E2|D2 E2 F2 G2|G4 E4|F2 E2 D2 C2|D2 F2 E2 C2|C2 E2 D2 F2|E4 C4",
anchor:"E2 G2 B2 G2|F2 A2 c2 A2|E2 F2 G2 A2|B4 G4|A2 G2 F2 E2|G2 B2 A2 F2|E2 G2 F2 A2|G4 E4",
repeat:"C2 C2 D2 E2|E2 E2 D2 C2|D2 E2 F2 E2|G4 G4|E2 D2 D2 C2|F2 F2 E2 D2|C2 D2 E2 F2|E4 C4",
thirds:"C2 E2 D2 F2|E2 G2 F2 A2|G2 B2 A2 c2|c4 A4|B2 G2 A2 F2|E2 G2 D2 F2|F2 A2 E2 G2|E4 C4",
alter:"C2 ^F2 G2 =F2|D2 _B2 A2 G2|E2 F2 ^F2 G2|G4 =F4|E2 D2 ^C2 D2|G2 =F2 E2 D2|C2 E2 ^F2 G2|E4 C4",
sol:"G2 A2 B2 c2|B2 c2 d2 B2|A2 G2 F2 E2|D4 G4|A2 B2 c2 d2|c2 B2 A2 G2|F2 G2 A2 B2|G8",
dyad:"[CE]4 [DF]4|[EG]4 [FA]4|[GB]4 [Ec]4|[DF]4 [CE]4|[EG]4 [DF]4|[FA]4 [GB]4|[Ec]4 [GB]4|[CE]8",
triad:"[CEG]4 [DFA]4|[EGB]4 [FAC]4|[GBd]4 [EGB]4|[DFA]4 [CEG]4|[EGB]4 [DFA]4|[FAC]4 [GBd]4|[EGB]4 [GBd]4|[CEG]8",
rhythm:"C2 z2 E4|F4 z2 E2|D2 D2 E4|G4 z4|F2 E2 D4|C4 E2 D2|E2 z2 F2 G2|E4 C4",
three:"C D E F G2|G2 A2 B2|c2 B A G2|E4 G2|A2 G2 F2|E F G A B2|c2 A2 G2|G4 E2",
phrase:"E2 F2 G2 A2|G2 F2 E2 D2|C4 E4|D2 F2 E2 C2|E2 G2 A2 G2|F2 E2 D4|C2 E2 D2 F2|E4 C4",
look:"C2 E2 G2 E2|D2 F2 A2 F2|E2 G2 B2 G2|G4 E4|F2 A2 c2 A2|G2 B2 d2 B2|E2 G2 F2 D2|C8"
},L={
pedal:"C,8|G,,8|C,8|C,8|F,8|G,,8|C,8|C,8",
fifth:"C,4 G,,4|F,4 C,4|G,,4 D,4|C,8|F,4 C,4|G,,4 D,4|C,4 G,,4|C,8",
move:"C,4 D,4|E,4 F,4|G,4 F,4|E,8|F,4 E,4|D,4 G,,4|C,4 G,,4|C,8",
rhythm:"C,4 z4|G,,2 z2 G,,4|C,2 z2 G,,4|C,8|F,4 C,4|G,,2 D,2 G,,4|C,2 G,,2 C,4|C,8",
three:"C,6|F,4 C,2|G,,4 D,2|C,6|F,4 C,2|G,,2 D,2 G,,2|C,4 G,,2|C,6",
block:"C,4 [C,E,G,]4|F,4 [F,A,C]4|G,,4 [G,,B,D]4|C,8|F,4 [F,A,C]4|G,,4 [G,,B,D]4|C,4 [C,E,G,]4|C,8"
};
const CONFIG={
A:[["rise","pedal","C","4/4","Âncoras e deslocamento visual nas claves de Sol e Fá."],["anchor","move","C","4/4","Linhas e espaços pelas notas de referência."]],
B:[["repeat","pedal","C","4/4","Repetição e segunda melódica, sempre com pulso."],["thirds","fifth","C","4/4","Terças melódicas como padrões visuais."]],
C:[["alter","pedal","C","4/4","Acidentes isolados e bequadro escrito."],["sol","fifth","G","4/4","Armadura de Sol maior em toda a frase."]],
D:[["dyad","pedal","C","4/4","Alinhamento vertical em díades."],["triad","fifth","C","4/4","Tríades diatónicas em desenho vertical."]],
E:[["phrase","pedal","C","4/4","Baixo pedal com melodia móvel."],["phrase","fifth","C","4/4","Baixo e quinta, sem olhar para a mão."]],
F:[["rhythm","rhythm","C","4/4","Pausas e ataques num pulso regular."],["three","three","C","3/4","Colcheias e ataques em compasso ternário."]],
G:[["repeat","pedal","C","4/4","Contraste staccato/tenuto sem alterar a métrica."],["phrase","fifth","C","4/4","Acentos e intensidade, sem acelerar."]],
H:[["phrase","pedal","C","4/4","Voz inferior sustentada e melodia independente."],["phrase","block","C","4/4","Melodia acompanhada em blocos verticais."]],
I:[["look","pedal","C","4/4","Pré-leitura de 30 segundos: clave, compasso e extremos."],["thirds","move","C","4/4","Agrupar visualmente e antecipar os saltos."]],
J:[["phrase","fifth","C","4/4","Relacionar cifras C e G7 ao que se lê na pauta."],["thirds","block","C","4/4","Acompanhamento por cifra com inversões simples."]]
};
const CUES=[["C","G7","C","G7","F","G7","C","C"],["C","F","G7","C","Dm","G7","C","C"]];
function get(track,level){
 const c=CONFIG[track]?.[level];if(!c)return null;
 const [rh,lh,key,meter,intent]=c,bpm=level?64:60,voice=P[rh].split("|").map((bar,i)=>{
  if(track==="J")return '"'+CUES[level][i]+'"'+bar;
  if(track==="G")return(level?(i%2?"!p!":"!accent!"):(i%2?"!tenuto!":"!staccato!"))+bar;
  return bar;
 });
 const title=track+" · N"+level+" · Estudo orientado 1";
 const abc=["X:1","T:"+title,"M:"+meter,"L:1/8","Q:1/4="+bpm,"K:"+key,
 "%%score { RH LH }","V:RH clef=treble","V:LH clef=bass",
 "[V:RH] "+voice.join(" | ")+" |]","[V:LH] "+L[lh].split("|").join(" | ")+" |]"].join("\n");
 return Object.freeze({id:"special-"+track+"N"+level+"-01",track,level,title,abc,key,meter,bpm,
  intent,proof:intent,hands:["direita","esquerda"],specialized:true,certification:false,
  expression:track==="G"?(level?"accent":"staccato-tenuto"):null,
  cues:track==="J"?CUES[level]:null,
  limitations:["G","I","J"].includes(track)?"Esta competência exige avaliação observada.":""});
}
root.LuwipiSpecializedStudies=Object.freeze({get,trackIds:Object.keys(CONFIG),supportedLevels:[0,1]});
})(typeof window!=="undefined"?window:globalThis);
