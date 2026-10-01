(function(root){
"use strict";
// Individually authored N2 material. Training only: never use as a certified gate.
// Each voice has eight real, metrically validated measures, including rests.
const studies={
 A:{
  key:"C",meter:"4/4",bpm:65,focus:"Duas linhas suplementares na clave de Sol, saltos preparados nas duas mãos.",
  rh:["G,2 A,2 B,2 C2","A,2 C2 E2 A2","G,2 B,2 D2 G2","A,2 C2 F2 A2","C2 E2 c2 G2","B,2 D2 F2 B2","G,2 A,2 C2 E2","B,2 D2 C4"],
  lh:["C,,4 G,,4","F,,4 C,4","G,,4 D,4","F,,4 C,4","C,,4 E,4","G,,4 D,4","C,,4 G,,4","C,,8"],
  limitations:"A mudança de clave e os registos mais extremos são treinados nos níveis seguintes."
 },
 B:{
  key:"C",meter:"4/4",bpm:67,focus:"Reconhecer quartas e quintas melódicas na direita e harmónicas na esquerda.",
  rh:["C2 F2 C2 G2","D2 G2 D2 A2","E2 A2 E2 B2","F2 B2 F2 c2","G2 c2 G2 d2","A2 d2 A2 e2","B2 e2 B2 f2","c2 f2 g2 c2"],
  lh:["[C,F,]4 [G,,D,]4","[D,G,]4 [A,,E,]4","[E,A,]4 [B,,F,]4","[F,B,]4 [C,G,]4","[G,C]4 [D,A,]4","[A,D]4 [E,B,]4","[B,E]4 [F,C]4","[C,F]4 [G,C]4"],
  limitations:"As qualidades aumentada e diminuta são abordadas nos níveis seguintes."
 },
 C:{
  key:"A",meter:"4/4",bpm:70,focus:"Armadura com três sustenidos: reconhecer visualmente Fá, Dó e Sol alterados sem soletrar.",
  rh:["A2 B2 c2 d2","e2 f2 g2 a2","a2 g2 f2 e2","d2 c2 B2 A2","F2 A2 c2 e2","G2 B2 d2 f2","e2 c2 B2 A2","A4 z4"],
  lh:["A,4 E,4","D,4 A,4","E,4 B,,4","A,8","F,4 C,4","D,4 A,4","E,4 B,,4","A,8"],
  limitations:"Este estudo cobre três sustenidos; a variante com quatro alterações e os modos menores exigem estudos separados."
 },
 D:{
  key:"C",meter:"4/4",bpm:64,focus:"Identificar a fundamental através da forma da primeira e segunda inversão.",
  rh:["[EGc]4 [Gce]4","[A c f]4 [c f a]4","[Bdg]4 [dgb]4","[EGc]8","[Acf]4 [cfa]4","[Bdg]4 [dgb]4","[EGc]4 [Gce]4","[CEG]8"],
  lh:["C,4 [E,G,C]4","F,4 [A,C,F]4","G,,4 [B,D,G]4","C,8","F,4 [A,C,F]4","G,,4 [B,D,G]4","C,4 [E,G,C]4","C,8"],
  limitations:"A leitura de sétimas e condução de vozes aparece nos módulos posteriores."
 },
 E:{
  key:"C",meter:"3/4",bpm:68,focus:"Baixo de valsa: agrupar baixo e dois acordes em 3/4 como um padrão da mão esquerda.",
  rh:["E2 G2 c2","d2 c2 B2","A2 F2 D2","G4 E2","F2 A2 c2","B2 G2 D2","E2 G2 B2","c6"],
  lh:["C,2 [E,G,]2 [E,G,]2","G,,2 [B,D,]2 [B,D,]2","F,2 [A,C]2 [A,C]2","C,2 [E,G,]2 [E,G,]2","F,2 [A,C]2 [A,C]2","G,,2 [B,D,]2 [B,D,]2","C,2 [E,G,]2 [E,G,]2","C,6"],
  limitations:"Oom-pah binário e acompanhamento em bloco precisam de variantes próprias adicionais."
 },
 F:{
  key:"C",meter:"6/8",bpm:72,focus:"6/8 em dois pulsos: agrupar semínima pontuada e células de colcheias mantendo a continuidade.",
  rh:["C3 E3","D2 E1 F3","G3 z1 F2","E2 D1 C3","F3 G3","A2 G1 F3","E3 D3","C6"],
  lh:["C,3 G,,3","F,3 C,3","G,,3 D,3","C,6","F,3 C,3","G,,3 D,3","C,3 G,,3","C,6"],
  limitations:"Tercinas e irregularidade métrica surgem em níveis posteriores."
 },
 G:{
  key:"C",meter:"4/4",bpm:67,focus:"Crescer e diminuir ao longo de frases mantendo o mesmo ataque rítmico nas duas mãos.",
  rh:["E2 F2 G2 A2","G2 A2 B2 c2","d2 c2 B2 A2","G4 e4","e2 d2 c2 B2","A2 G2 F2 E2","D2 F2 E2 D2","C8"],
  lh:["C,4 G,,4","F,4 C,4","G,,4 D,4","C,8","F,4 C,4","G,,4 D,4","C,4 G,,4","C,8"],
  expression:"cresc-dim",
  limitations:"A indicação de frase dinâmica é mostrada e reproduzida; ligaduras de expressão e pedal ainda exigem representação e avaliação próprias."
 },
 H:{
  key:"C",meter:"4/4",bpm:63,focus:"Duas vozes verdadeiramente independentes na pauta superior, com durações e hastes opostas.",
  rh:["e4 d4","c4 B4","d4 c4","B4 A4","c4 d4","e4 f4","g4 e4","d4 c4"],
  rh2:["C2 E2 G2 E2","D2 F2 A2 F2","E2 G2 B2 G2","F2 A2 c2 A2","G2 B2 d2 B2","A2 c2 e2 c2","B2 d2 f2 d2","C2 E2 G2 C2"],
  lh:["C,8","G,,8","C,8","F,8","G,,8","A,,8","G,,8","C,8"],
  limitations:"Treino introdutório a duas vozes na mesma pauta; não é ainda uma invenção nem prova de fuga."
 },
 I:{
  key:"C",meter:"4/4",bpm:69,focus:"Pré-leitura de 30 segundos e antecipação visual de um pulso com pequenos deslocamentos.",
  rh:["C2 E1 F1 G2 c2","D2 F1 G1 A2 d2","E2 G1 A1 B2 e2","F2 A1 B1 c2 f2","G2 B1 c1 d2 g2","A2 c1 d1 e2 a2","G2 D1 E1 F2 B2","C2 E2 G4"],
  lh:["C,2 G,,2 E,2 G,,2","D,2 A,,2 F,2 A,,2","E,2 B,,2 G,2 B,,2","F,2 C,2 A,2 C,2","G,,2 D,2 B,,2 D,2","A,,2 E,2 C,2 E,2","G,,2 D,2 B,,2 D,2","C,8"],
  limitations:"O movimento real do olhar não pode ser medido apenas pelo piano: a execução serve de treino, não de certificação."
 },
 J:{
  key:"C",meter:"4/4",bpm:62,focus:"Transpor um tom acima, à primeira vista, uma melodia curta com baixo sustentado, mantendo o pulso.",
  rh:["C2 D2 E2 G2","E2 F2 G2 c2","A2 G2 F2 E2","D4 G4","E2 G2 A2 G2","F2 E2 D2 C2","D2 F2 E2 D2","C8"],
  lh:["C,8","G,,8","F,8","G,,8","C,8","F,8","G,,8","C,8"],
  transposeSemitones:2,
  limitations:"A pauta apresenta a escrita original, mas o corretor espera ambos os registos um tom acima. Claves de Dó e reduções orquestrais requerem estudos separados."
 }
};
function get(track,level){
 if(level!==2||!Object.prototype.hasOwnProperty.call(studies,track))return null;
 const s=studies[track],id="special-"+track+"N2-01",title=track+" · N2 · Estudo específico 1";
 const voices=["V:RH clef=treble","V:LH clef=bass"];
 const lines=["X:1","T:"+title,"M:"+s.meter,"L:1/8",
 "Q:"+(s.meter==="6/8"?"3/8":"1/4")+"="+s.bpm,"K:"+s.key,
 "%%score { RH"+(s.rh2?" RH2":"")+" LH }",...voices];
 if(s.rh2)lines.push("V:RH2 clef=treble");
 lines.push("[V:RH] "+s.rh.join(" | ")+" |]");
 if(s.rh2)lines.push("[V:RH2] "+s.rh2.join(" | ")+" |]");
 lines.push("[V:LH] "+s.lh.join(" | ")+" |]");
 return Object.freeze({id,track,level,title,key:s.key,meter:s.meter,bpm:s.bpm,
 abc:lines.join("\n"),intent:s.focus,proof:s.focus,hands:["direita","esquerda"],
 specialized:true,certification:false,expression:s.expression||null,
 transposeSemitones:s.transposeSemitones||0,secondTrebleVoice:Boolean(s.rh2),limitations:s.limitations});
}
root.LuwipiSpecializedN2=Object.freeze({get,trackIds:Object.freeze(Object.keys(studies)),supportedLevels:[2]});
})(typeof window!=="undefined"?window:globalThis);
