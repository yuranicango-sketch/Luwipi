(function(root){
"use strict";
// Original N4 studies are training content, not five-part gate exams.
// Where current score technology cannot notate a complete N4 objective,
// coverage is explicitly partial and certification remains unavailable.
const D={
 A:[{
  clefChanges:[{bar:2,staff:"RH",clef:"alto"},{bar:4,staff:"RH",clef:"treble"}],
  focus:"Registos extremos nas duas mãos: preparar a posição antes dos saltos.",
  limit:"A clave muda de Sol para Dó alto e regressa a Sol durante o exercício. Confirma a antecipação do registo com observação.",
  key:"C",bpm:60,
  rh:"c'2 e'2 g'2 c''2|g'2 e'2 c'2 g2|C2 G2 e'2 c''2|d''2 b'2 g'2 e'2|c''2 g'2 e'2 c'2|C2 E2 c'2 g'2|d''2 b'2 g'2 d'2|c'4 C4",
  lh:"C,,4 G,,4|G,,4 D,4|F,,4 C,4|C,,8|A,,,4 E,,4|F,,4 C,4|G,,4 D,4|C,,8"
 }],
 B:[{
  focus:"Reconhecer oitavas, nonas e décimas como saltos e intervalos verticais.",
  limit:"Treino específico de distâncias; não substitui leitura em várias tonalidades.",
  key:"C",bpm:64,
  rh:"C2 c2 C2 d2|D2 d2 D2 e2|E2 e2 E2 f2|F2 f2 F2 g2|G2 g2 G2 a2|A2 a2 A2 b2|B2 b2 B2 c'2|C2 c2 d2 e2",
  lh:"[C,C]4 [C,D]4|[D,D]4 [D,E]4|[E,E]4 [E,F]4|[F,F]4 [F,G]4|[G,G]4 [G,A]4|[A,A]4 [A,B]4|[B,B]4 [B,c]4|[C,C]8"
 }],
 C:[{
  keySequence:["C","C","C","C","G","G","C","G"],
  focus:"Preparar uma dominante secundária V/V em Dó e resolver a alteração em Sol.",
  limit:"A mudança de armadura Dó–Sol é agora apresentada na pauta; a função de dominante secundária é reconhecida nas perguntas do módulo.",
  key:"C",bpm:66,
  rh:"C2 E2 G2 c2|d2 c2 B2 G2|A2 c2 d2 e2|d2 ^f2 a2 c2|B2 G2 d2 B2|c2 e2 g2 e2|d2 ^f2 a2 c2|G2 B2 G4",
  lh:"C,4 G,,4|G,,4 D,4|A,,4 E,4|[D,^F,A,]4 A,,4|[G,,B,D,]4 D,4|[C,E,G,]4 G,,4|[D,^F,A,]4 A,,4|[G,,B,D,]8"
 }],
 D:[{
  focus:"Distinguir visualmente a estrutura do acorde e as tensões 9ª, 11ª e 13ª.",
  limit:"A estrutura de tensões é treinada em bloco; condução de vozes e grafias enarmónicas terão exercícios próprios.",
  key:"C",bpm:58,
  rh:"[CEGBd]4 [DFAce]4|[EGBdf]4 [FAceg]4|[GBdfa]4 [EGbd]4|[CEGBd]8|[DFAce]4 [GBdfa]4|[EGBdf]4 [CEGBd]4|[FAceg]4 [GBdfa]4|[CEGBd]8",
  lh:"C,4 G,,4|D,4 A,,4|E,4 B,,4|C,8|D,4 G,,4|E,4 C,4|F,4 G,,4|C,8"
 }],
 E:[{
  focus:"Preparar saltos rápidos entre baixo e oitava quebrada, sempre com pulso.",
  limit:"Focado em oitavas quebradas; bossa e balada têm um estudo separado neste mesmo módulo.",
  key:"C",bpm:65,
  rh:"E2 G2 c2 G2|F2 A2 c2 A2|G2 B2 d2 B2|E4 G4|A2 c2 e2 c2|F2 A2 c2 A2|G2 B2 d2 B2|c8",
  lh:"C,2 C2 G,,2 G,2|F,2 F2 C2 C,2|G,,2 G,2 D,2 D2|C,2 C2 G,,2 G,2|A,,2 A,2 E,2 E2|F,2 F2 C2 C,2|G,,2 G,2 D,2 D2|C,8"
 },{
  focus:"Reconhecer antecipadamente o baixo de bossa simples, com ataques em contratempo e silêncio.",
  limit:"Padrão bossa introdutório; síncopa com ligaduras de duração e nuances de estilo requerem repertório validado.",
  key:"C",bpm:66,
  rh:"E2 G2 c2 G2|F2 A2 c2 A2|G2 B2 d2 B2|E2 G2 c4|A2 c2 e2 c2|F2 A2 c2 A2|G2 B2 d2 B2|c8",
  lh:"C,2 z1 G,,1 C,2 z2|F,2 z1 C,1 F,2 z2|G,,2 z1 D,1 G,,2 z2|C,2 z1 G,,1 C,2 z2|A,,2 z1 E,1 A,,2 z2|F,2 z1 C,1 F,2 z2|G,,2 z1 D,1 G,,2 z2|C,8"
 }],
 F:[{
  focus:"Ler tercinas de colcheias como um grupo de três notas dentro de cada tempo.",
  limit:"Este estudo trabalha tercinas. O segundo estudo N4 F treina mudanças de compasso 5/8–7/8 na mesma partitura.",
  key:"C",bpm:64,unit:"1/4",
  rh:"C/3 D/3 E/3 F2 G|D2 E/3 F/3 G/3 A|E/3 F/3 G/3 A/3 B/3 c/3 d2|G2 A/3 B/3 c/3 d|F/3 G/3 A/3 G2 F|E2 D/3 E/3 F/3 G|A/3 G/3 F/3 E/3 D/3 C/3 D2|C/3 D/3 E/3 F2 C",
  lh:"C,2 G,,2|F,2 C,2|G,,2 D,2|C,4|F,2 C,2|G,,2 D,2|C,2 G,,2|C,4"
 }],
 G:[{
  focus:"Ler mordente superior lento totalmente escrito na pauta, sem deslocar os ataques seguintes.",
  limit:"O primeiro exercício apresenta ornamento medido. O seguinte ensina símbolos convencionais e a expansão em áudio.",
  key:"C",bpm:60,
  rh:"E/2 F/2 E G2 c2 G2|F/2 G/2 F A2 c2 A2|G/2 A/2 G B2 d2 B2|E/2 F/2 E G2 c2 G2|A/2 B/2 A c2 e2 c2|G/2 A/2 G B2 d2 B2|F/2 G/2 F A2 c2 A2|E4 C4",
  lh:"C,4 G,,4|F,4 C,4|G,,4 D,4|C,8|A,,4 E,4|G,,4 D,4|F,4 C,4|C,8"
 }],
 H:[{
  staffLayout:[{"id":"RH","clef":"treble","label":"Soprano"},{"id":"RH2","clef":"alto","label":"Alto"},{"id":"LH","clef":"bass","label":"Tenor"},{"id":"LH2","clef":"bass","label":"Baixo"}],
  focus:"Ler coral a quatro vozes com sopranos, contraltos, tenores e baixos ritmicamente independentes.",
  limit:"Treino introdutório SATB no piano; equilíbrio das vozes, legato entre mãos e voicing profissional precisam de observação.",
  key:"C",bpm:56,
  rh:"c2 B2 A2 G2|A4 G4|G2 A2 B2 c2|d4 c4|c2 d2 e2 d2|c4 B4|A2 G2 F2 E2|G4 c4",
  rh2:"E4 F4|F2 E2 D4|E4 F4|G2 F2 E4|A4 G4|E2 D2 C4|D4 E4|E4 E4",
  lh:"G,2 A,2 G,2 F,2|A,4 G,4|G,2 F,2 E,2 G,2|B,4 C4|C2 B,2 A,2 G,2|G,4 F,4|E,2 D,2 C,2 B,,2|C4 G,4",
  lh2:"C,,8|F,,8|C,,8|G,,8|A,,8|C,,8|G,,8|C,,8"
 }],
 I:[{
  focus:"Pré-leitura cronometrada de 30 segundos: prever os três pontos de maior risco antes de começar.",
  limit:"O tempo é controlado na Prática; a capacidade de manter os olhos adiantados não é medida sem observação externa.",
  key:"C",bpm:70,
  rh:"C D E G A B c e|F A c f e c A F|G B d g f d B G|A c e a g e c A|B d f b a f d B|G B d g f d B G|E G B e d B G E|C2 E2 G4",
  lh:"C,2 G,,2 E,2 G,,2|F,2 C,2 A,2 C,2|G,,2 D,2 B,,2 D,2|A,,2 E,2 C,2 E,2|B,,2 F,2 D,2 F,2|G,,2 D,2 B,,2 D,2|C,2 G,,2 E,2 G,,2|C,8"
 }],
 J:[{
  staffLayout:[{"id":"RH","clef":"treble","label":"Melodia"},{"id":"RH2","clef":"alto","label":"Clave de Dó"},{"id":"LH","clef":"bass","label":"Baixo"}],
  rh2:"E4 G4|F4 A4|G4 B4|E4 G4|A4 c4|F4 A4|G4 B4|E8",
  focus:"Preparação para acompanhamento com acordes alterados: identificar cromatismo e cifras antes de transpor à vista.",
  limit:"A pauta intermédia apresenta clave de Dó alto. A prova de leitura e acompanhamento ao vivo requer observação pedagógica.",
  key:"C",bpm:60,
  rh:"E2 G2 c2 G2|^F2 A2 c2 A2|G2 B2 d2 B2|E2 G2 c4|A2 c2 ^d2 c2|^F2 A2 c2 A2|G2 B2 d2 B2|E2 G2 C4",
  lh:"C,4 G,,4|[D,^F,A,]4 A,,4|G,,4 D,4|C,8|[A,,C,E,]4 E,4|[D,^F,A,]4 A,,4|G,,4 D,4|C,8",
  cues:["C","D7","G7","C","Am(add#11)","D7","G7","C"]
 }]
};


D.G.push({
 focus:"Reconhecer e executar símbolos de mordente, apogiatura e trinado lento no contexto do pulso.",
 limit:"Os ornamentos são exibidos na pauta e expandidos em áudio dentro da duração notada; o fraseado estilístico exige escuta e professor.",
 key:"C",bpm:58,
 rh:"E2 G2 A2 G2|F2 A2 B2 A2|G2 B2 c2 B2|E2 G2 c2 G2|A2 c2 d2 c2|F2 A2 c2 A2|G2 B2 d2 B2|E4 C4",
 lh:"C,4 G,,4|F,4 C,4|G,,4 D,4|C,8|A,,4 E,4|F,4 C,4|G,,4 D,4|C,8",
 ornaments:[{bar:0,staff:"RH",type:"mordent",neighbor:1},
  {bar:2,staff:"RH",type:"appoggiatura",neighbor:2},
  {bar:4,staff:"RH",type:"trill",neighbor:1}],
 notationLegend:["mord.: nota principal–auxiliar–principal, dentro do valor escrito.",
 "Apoiatura: auxiliar acentuada resolve na principal; tr: alternância medida."]
});

D.F.push({
 focus:"Ler cinco e sete colcheias com mudança de compasso entre 5/8 e 7/8, sem perder a unidade do pulso.",
 limit:"Mudança efetiva 5/8–7/8 em oito compassos, com articulação simples apropriada ao N4.",
 key:"C",meter:"5/8",meterSequence:["5/8","7/8","5/8","7/8","5/8","7/8","5/8","7/8"],bpm:58,
 rh:"C C D E F|G G A B c d e|E E F G A|G G A B c d e|A A G F E|D D E F G A B|G G F E D|C C D E F G A",
 lh:"C,2 G,,3|F,3 C,2 A,2|G,,2 D,3|C,3 E,2 G,2|A,,2 E,3|D,3 A,2 F,2|G,,2 D,3|C,3 G,,2 E,2"
});

function get(track,level,index=0){
 if(level!==4||!Object.prototype.hasOwnProperty.call(D,track)||!Number.isInteger(index)||index<0||index>=D[track].length)return null;
 const v=D[track][index],title=track+" · N4 · Estudo "+(index+1),unit=v.unit||"1/8";
 const score=["X:1","T:"+title,"M:"+(v.meter||"4/4"),"L:"+unit,"Q:1/4="+v.bpm,"K:"+v.key,
 "%%score { RH"+(v.rh2?" RH2":"")+" LH"+(v.lh2?" LH2":"")+" }",
 "V:RH clef=treble","V:LH clef=bass"];
 if(v.rh2)score.push("V:RH2 clef=treble");
 if(v.lh2)score.push("V:LH2 clef=bass");
 for(const [name,voice] of [["RH",v.rh],["RH2",v.rh2],["LH",v.lh],["LH2",v.lh2]])if(voice)score.push("[V:"+name+"] "+voice.split("|").join(" | ")+" |]");
 return Object.freeze({id:"special-"+track+"N4-"+String(index+1).padStart(2,"0"),track,level,title,abc:score.join("\n"),
  key:v.key,meter:v.meter||"4/4",bpm:v.bpm,intent:v.focus,proof:v.focus,limitations:v.limit,
  hands:["direita","esquerda"],specialized:true,certification:false,partialCoverage:/^Parcial:/.test(v.limit),
  secondTrebleVoice:Boolean(v.rh2),secondBassVoice:Boolean(v.lh2),cues:v.cues||null,
  meterSequence:v.meterSequence||null,keySequence:v.keySequence||null,staffLayout:v.staffLayout||null,
  clefChanges:v.clefChanges||null,octaveMarks:v.octaveMarks||null,notationLegend:v.notationLegend||null,
  ornaments:v.ornaments||null,tempoSequence:v.tempoSequence||null});
}
root.LuwipiSpecializedN4=Object.freeze({get,trackIds:Object.freeze(Object.keys(D)),supportedLevels:[4],count:track=>D[track]?.length||0});
})(typeof window!=="undefined"?window:globalThis);
