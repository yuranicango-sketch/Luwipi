(function(root){
"use strict";
// Specialist N3 training pieces. They are NOT certification or gate material.
// Written with both hands and eight complete measures; extra variants intentionally
// separate distinct competencies (crossing, minor melodic, arpeggio, transposition).
const DATA={
 A:[
  {focus:"Ler 3–4 linhas suplementares acima e abaixo da clave de Sol sem perder o pulso.",key:"C",bpm:56,
   rh:"c'2 d'2 e'2 g'2|g'2 e'2 d'2 c'2|D,2 F,2 A,2 C2|E,2 G,2 B,2 D2|e'2 d'2 c'2 b2|F,2 A,2 C2 E2|c'2 e'2 d'2 c'2|g4 c'4",
   lh:"C,,4 G,,4|F,,4 C,4|G,,4 D,4|C,,8|F,,4 C,4|G,,4 D,4|C,,4 G,,4|C,,8",
   limitations:"Registos extremos exigem técnica prévia; reduzir o andamento, não memorizar as notas."},
  {focus:"Praticar cruzamento de mãos: a esquerda lê acima da direita nos compassos 2 e 4.",key:"C",bpm:58,
   rh:"E2 G2 c2 G2|C2 D2 E2 G2|E2 G2 c2 G2|C2 E2 G2 E2|D2 F2 A2 F2|E2 G2 B2 G2|C2 G2 E2 D2|C8",
   lh:"C,4 G,4|c2 g2 e2 c2|F,4 C4|c2 g2 e2 c2|G,4 D4|C,2 E,2 G,2 C2|G,4 C4|C,8",
   crossingMeasures:[1,3],limitations:"Executar a mão esquerda por cima no momento indicado; a posição real das mãos exige observação."}
 ],
 B:[{focus:"Reconhecer 6ªs e 7ªs ascendentes/descendentes e como acordes nas duas mãos.",key:"C",bpm:62,
   rh:"C2 A2 C2 B2|D2 B2 D2 c2|E2 c2 E2 d2|F2 d2 F2 e2|g2 B2 a2 c2|f2 A2 e2 G2|d2 F2 c2 E2|C2 A2 B2 C2",
   lh:"[C,A,]4 [C,B,]4|[D,B,]4 [D,C]4|[E,C]4 [E,D]4|[F,D]4 [F,E]4|[G,E]4 [G,F]4|[A,F]4 [A,G]4|[G,E]4 [F,D]4|[C,A,]4 [C,B,]4",
   limitations:"O teste de qualidade intervalar (maior/menor/aumentada) tem rubrica própria em níveis seguintes."}],
 C:[
  {focus:"Aplicar a armadura de Si maior com cinco sustenidos em ambas as mãos.",key:"B",bpm:62,
   rh:"B2 c2 d2 e2|f2 g2 a2 b2|b2 a2 g2 f2|e2 d2 c2 B2|G2 B2 d2 f2|A2 c2 e2 g2|f2 d2 c2 B2|B4 z4",
   lh:"B,,4 F,4|E,4 B,,4|F,4 C,4|B,,8|G,4 D,4|E,4 B,,4|F,4 C,4|B,,8",
   limitations:"A alteração da armadura é constante; 6–7 acidentes em tonalidades distantes precisam de estudos adicionais."},
  {focus:"Ler Lá menor melódica: Fá# e Sol# na subida, forma natural na descida.",key:"Am",bpm:60,
   rh:"A2 B2 c2 d2|e2 ^f2 ^g2 a2|a2 g2 f2 e2|d2 c2 B2 A2|A2 c2 e2 ^f2|^g2 a2 =g2 =f2|e2 d2 c2 B2|A4 z4",
   lh:"A,4 E,4|D,4 A,,4|E,4 B,,4|A,8|F,4 C,4|D,4 A,,4|E,4 B,,4|A,8",
   limitations:"Os acidentes devem ser confirmados visualmente; não há mudança automática de armadura a meio do compasso."}
 ],
 D:[{focus:"Reconhecer sétimas diatónicas com raiz, 1ª, 2ª e 3ª inversões.",key:"C",bpm:58,
   rh:"[CEGB]4 [EGBc]4|[GBce]4 [Bceg]4|[DFAc]4 [FAcd]4|[A c d f]4 [c d f a]4|[GBdf]4 [Bdfg]4|[dfgb]4 [fgbd']4|[EGBd]4 [GBde]4|[CEGB]8",
   lh:"C,4 G,,4|C,4 G,,4|D,4 A,,4|D,4 A,,4|G,,4 D,4|G,,4 D,4|E,4 B,,4|C,8",
   limitations:"A harmonia deve ser reconhecida como bloco; ainda não avalia condução de vozes ou cifras complexas."}],
 E:[
  {focus:"Ler o baixo de Alberti como quatro notas agrupadas, sem procurar cada tecla.",key:"C",bpm:64,
   rh:"E2 G2 c2 E2|F2 A2 c2 A2|G2 B2 d2 B2|E4 G4|F2 A2 c2 A2|G2 B2 d2 B2|E2 G2 c2 G2|C8",
   lh:"C,2 G,2 E,2 G,2|F,2 C2 A,2 C2|G,2 D2 B,2 D2|C,2 G,2 E,2 G,2|F,2 C2 A,2 C2|G,2 D2 B,2 D2|C,2 G,2 E,2 G,2|C,8",
   limitations:"Padrão Alberti em 4/4; o ritmo deve permanecer regular mesmo quando o acorde muda."},
  {focus:"Reconhecer arpejos regulares de quatro notas na mão esquerda.",key:"C",bpm:66,
   rh:"E4 G4|F4 A4|G4 B4|E4 c4|A4 c4|B4 d4|G4 E4|C8",
   lh:"C,2 E,2 G,2 C2|F,2 A,2 C2 F2|G,2 B,2 D2 G2|C,2 E,2 G,2 C2|F,2 A,2 C2 F2|G,2 B,2 D2 G2|C,2 E,2 G,2 C2|C,8",
   limitations:"Arpejo aberto de quatro notas, sem stride nem oitavas quebradas."}
 ],
 F:[{focus:"Executar síncopas em contratempo e células de semicolcheias com subdivisão contínua.",key:"C",bpm:60,
   rh:"z C3 z E3|C/2 D/2 E F G2 A3|z D3 z F3|E/2 F/2 G A B2 c3|z E3 z G3|F/2 G/2 A B c2 d3|z G3 z B3|C/2 D/2 E F G2 C3",
   lh:"C,2 G,,2 C,2 G,,2|F,2 C,2 F,2 C,2|G,,2 D,2 G,,2 D,2|C,2 G,,2 C,2 G,,2|F,2 C,2 F,2 C,2|G,,2 D,2 G,,2 D,2|C,2 G,,2 C,2 G,,2|C,8",
   limitations:"A síncopa é desenhada por ataques após pausas; não representa todas as possibilidades de ligaduras entre tempos."}],
 G:[{focus:"Trocar o pedal exatamente nas mudanças harmónicas, preservando o pulso em oito compassos.",key:"C",bpm:60,
   rh:"E2 G2 c2 G2|F2 A2 c2 A2|G2 B2 d2 B2|E4 c4|F2 A2 c2 A2|G2 B2 d2 B2|E2 G2 c2 G2|C8",
   lh:"C,8|F,8|G,,8|C,8|F,8|G,,8|C,8|C,8",
   pedalEveryBar:true,limitations:"Os símbolos mostram onde trocar o pedal; o piano virtual não avalia a libertação física nem ressonâncias."}],
 H:[{focus:"Ler a entrada de resposta imitativa na segunda voz, mantendo ambas as linhas independentes.",key:"C",bpm:58,
   rh:"E2 F2 G4|A4 G4|F2 E2 D4|E4 C4|G2 A2 B4|c4 B4|A2 G2 F4|E8",
   rh2:"z8|G2 _A2 _B4|c4 B4|A2 G2 F4|G4 E4|E2 F2 G4|A4 G4|G8",
   lh:"C,8|G,,8|F,8|C,8|G,,8|C,8|F,8|C,8",
   limitations:"Imitação introdutória com resposta deslocada um compasso; não equivale a uma prova de invenção/fuga."}],
 I:[{focus:"Olhar um compasso à frente e antecipar deslocamentos independentes de ambas as mãos.",key:"C",bpm:68,
   rh:"C2 E1 G1 c2 e2|D2 F1 A1 d2 f2|E2 G1 B1 e2 g2|F2 A1 c1 f2 a2|G2 B1 d1 g2 b2|A2 c1 e1 a2 c'2|G2 E1 D1 B2 G2|C2 G2 E4",
   lh:"C,2 E,2 G,2 E,2|D,2 F,2 A,2 F,2|E,2 G,2 B,2 G,2|F,2 A,2 C2 A,2|G,,2 B,,2 D,2 B,,2|A,,2 C,2 E,2 C,2|G,,2 D,2 B,,2 D,2|C,8",
   limitations:"O tempo de preparação é fixo; o direcionamento real do olhar requer observação humana."}],
 J:[
  {focus:"Acompanhar cifra e transpor à primeira vista uma quarta justa acima nas duas mãos.",key:"C",bpm:60,transposeSemitones:5,
   cues:["C","F","G7","C","Am","Dm","G7","C"],
   rh:"E2 G2 c2 G2|F2 A2 c2 A2|G2 B2 d2 B2|E4 c4|A2 c2 e2 c2|F2 A2 d2 A2|G2 B2 d2 G2|C8",
   lh:"C,4 G,,4|F,4 C,4|G,,4 D,4|C,8|A,,4 E,4|D,4 A,,4|G,,4 D,4|C,8",
   limitations:"Lê a pauta escrita e executa tudo +5 semitons; as cifras originais são referências, não prova profissional."},
  {focus:"Manter o pulso ao transpor uma quinta justa acima com padrões de acompanhamento.",key:"C",bpm:60,transposeSemitones:7,
   cues:["C","Am","Dm","G7","C","F","G7","C"],
   rh:"G2 E2 D2 C2|A2 c2 e2 c2|F2 A2 d2 A2|G2 B2 d2 B2|E2 G2 c2 G2|F2 A2 c2 A2|G2 B2 d2 B2|C8",
   lh:"C,4 G,,4|A,,4 E,4|D,4 A,,4|G,,4 D,4|C,4 G,,4|F,4 C,4|G,,4 D,4|C,8",
   limitations:"Quinta +7 semitons; a prestação de cantor e redução de conjunto exigem atividades próprias."}
 ]
};
const tracks=Object.keys(DATA);
function get(track,level,index=0){
 if(level!==3||!DATA[track]||!Number.isInteger(index)||index<0||index>=DATA[track].length)return null;
 const d=DATA[track][index],meter=d.meter||"4/4",bpm=d.bpm||62;
 const title=track+" · N3 · Estudo "+(index+1);
 const parts=["X:1","T:"+title,"M:"+meter,"L:1/8","Q:1/4="+bpm,"K:"+d.key,
  "%%score { RH"+(d.rh2?" RH2":"")+" LH }","V:RH clef=treble","V:LH clef=bass"];
 if(d.rh2)parts.push("V:RH2 clef=treble");
 parts.push("[V:RH] "+d.rh.split("|").join(" | ")+" |]");
 if(d.rh2)parts.push("[V:RH2] "+d.rh2.split("|").join(" | ")+" |]");
 parts.push("[V:LH] "+d.lh.split("|").join(" | ")+" |]");
 return Object.freeze({id:"special-"+track+"N3-0"+(index+1),track,level,title,abc:parts.join("\n"),key:d.key,meter,bpm,
  hands:["direita","esquerda"],intent:d.focus,proof:d.focus,specialized:true,certification:false,
  secondTrebleVoice:Boolean(d.rh2),transposeSemitones:d.transposeSemitones||0,
  pedalEveryBar:Boolean(d.pedalEveryBar),crossingMeasures:d.crossingMeasures||null,cues:d.cues||null,
  limitations:d.limitations});
}
root.LuwipiSpecializedN3=Object.freeze({get,trackIds:Object.freeze(tracks),supportedLevels:[3],count:track=>DATA[track]?.length||0});
})(typeof window!=="undefined"?window:globalThis);
