(function(root){
"use strict";
// Ten composed N3 studies. A focus is isolated per score: these are guided
// first-sight/skill studies, not certified examinations.
const DATA={
 A:{key:"C",meter:"4/4",bpm:67,focus:"Ler até quatro linhas suplementares superiores e deslocar o olhar antes do salto.",
 rh:["c'2 e'2 g'2 e'2","b2 d'2 f'2 d'2","a2 c'2 e'2 c'2","g2 b2 d'2 g'2","f'2 d'2 b2 g2","e'2 c'2 a2 f2","g2 c'2 e'2 g'2","e'2 c'2 G4"],
 lh:["C,4 G,,4","G,,4 D,4","F,4 C,4","G,,4 D,4","C,4 G,,4","F,4 C,4","G,,4 D,4","C,8"],
 limitations:"Foco em linhas suplementares; o cruzamento físico das mãos exige um estudo assinalado e validado separadamente."},
 B:{key:"C",meter:"4/4",bpm:68,focus:"Ler sextas e sétimas melódicas sem contar notas e observar a distância vertical simultânea.",
 rh:["C2 A2 D2 B2","E2 c2 F2 d2","G2 e2 A2 f2","B2 g2 A2 f2","G2 e2 F2 d2","E2 c2 D2 B2","C2 A2 B,2 G2","C4 A4"],
 lh:["[C,A,]4 [D,B,]4","[E,C]4 [F,D]4","[G,E]4 [A,F]4","[B,G]4 [A,F]4","[G,E]4 [F,D]4","[E,C]4 [D,B,]4","[C,A,]4 [G,,E,]4","[C,A,]8"],
 limitations:"Qualidades alteradas e classificação enarmónica são introduzidas em estudos posteriores."},
 C:{key:"B",meter:"4/4",bpm:69,focus:"Reconhecer os cinco sustenidos de Si maior como um único mapa visual durante a leitura.",
 rh:["B2 c2 d2 e2","f2 g2 a2 b2","a2 g2 f2 e2","d2 c2 B2 A2","G2 B2 d2 f2","E2 G2 B2 e2","c2 d2 e2 f2","B4 z4"],
 lh:["B,,4 F,4","E,4 B,,4","F,4 C,4","B,,8","G,4 D,4","E,4 B,,4","F,4 C,4","B,,8"],
 limitations:"O estudo aplica cinco sustenidos; seis, sete e escalas menores exigem material novo próprio."},
 D:{key:"C",meter:"4/4",bpm:66,focus:"Agrupar tétrades diatónicas de sétima e reconhecer as notas-guia nas duas mãos.",
 rh:["[CEGB]4 [DFAc]4","[EGBd]4 [FACe]4","[GBdf]4 [EGBd]4","[DFAc]4 [CEGB]4","[FACe]4 [GBdf]4","[EGBd]4 [DFAc]4","[GBdf]4 [CEGB]4","[CEGB]8"],
 lh:["C,4 G,,4","D,4 A,,4","E,4 B,,4","F,4 C,4","G,,4 D,4","A,,4 E,4","G,,4 D,4","C,8"],
 limitations:"Inversões de sétimas, tensões e condução de vozes exigem outros exercícios."},
 E:{key:"C",meter:"4/4",bpm:70,focus:"Ver a fórmula de Alberti como grupo baixo–alto–meio–alto, em vez de oito notas isoladas.",
 rh:["E2 G2 c2 G2","F2 A2 c2 A2","G2 B2 d2 B2","E2 G2 c2 G2","F2 A2 c2 A2","G2 B2 d2 B2","E2 G2 d2 B2","c8"],
 lh:["C, G, E, G, C, G, E, G,","F, C F C F, C F C","G,, D, B, D, G,, D, B, D,","C, G, E, G, C, G, E, G,","F, C F C F, C F C","G,, D, B, D, G,, D, B, D,","C, G, E, G, G,, D, B, D,","C,8"],
 limitations:"Este estudo isola Alberti; a realização em outros tons e arpejos largos exige novos padrões."},
 F:{key:"C",meter:"4/4",bpm:64,focus:"Executar síncopas de colcheia e células de semicolcheias sobre o mesmo pulso.",
 rh:["z C3 D/2 E/2 F2 G","C/2 D/2 E/2 F/2 G2 z2 A2","z D3 E/2 F/2 G2 A","E2 z F3 G/2 A/2 G","z C3 E/2 F/2 G2 A","C/2 D/2 E/2 F/2 G2 A2 z2","z F3 G/2 A/2 B2 c","G2 z E3 D/2 C/2 C"],
 lh:["C,4 G,,4","F,4 C,4","G,,4 D,4","C,8","F,4 C,4","G,,4 D,4","C,4 G,,4","C,8"],
 limitations:"O ritmo sincopado sem ligaduras é treinado aqui; a escrita de ligaduras entre pulsações exige notação específica adicional."},
 G:{key:"C",meter:"4/4",bpm:65,focus:"Mudar o pedal apenas na troca harmónica sem perturbar o pulso.",
 rh:["E2 G2 c2 G2","F2 A2 c2 A2","G2 B2 d2 B2","E2 G2 c2 G2","F2 A2 c2 A2","G2 B2 d2 B2","E2 G2 d2 B2","c8"],
 lh:["[C,E,G,]8","[F,A,C]8","[G,,B,D]8","[C,E,G,]8","[F,A,C]8","[G,,B,D]8","[G,,B,D]8","[C,E,G,]8"],
 pedalMarks:[{beat:0,label:"Ped."},{beat:4,label:"↺"},{beat:8,label:"↺"},{beat:12,label:"↺"},{beat:16,label:"↺"},{beat:20,label:"↺"},{beat:28,label:"✱"}],
 limitations:"O símbolo ↺ significa levantar e voltar a baixar imediatamente o pedal; sem MIDI CC64 ou professor, a qualidade do pedal não é certificada."},
 H:{key:"C",meter:"4/4",bpm:62,focus:"Identificar motivo, entrada atrasada e resposta em imitação de duas vozes, mantendo o baixo.",
 rh:["E2 G2 F2 E2","D2 E2 F2 G2","A2 G2 F2 E2","D4 G4","F2 A2 G2 F2","E2 F2 G2 A2","B2 A2 G2 F2","E4 C4"],
 rh2:["z8","E2 G2 F2 E2","D2 E2 F2 G2","A2 G2 F2 E2","D4 G4","F2 A2 G2 F2","E2 F2 G2 A2","B2 A2 G2 F2"],
 lh:["C,8","G,,8","F,8","G,,8","C,8","F,8","G,,8","C,8"],
 limitations:"Imitação simples a duas vozes; coral SATB e fuga requerem estudos mais avançados."},
 I:{key:"C",meter:"4/4",bpm:70,focus:"Antecipar o próximo compasso e agrupar motivo e deslocamento, mantendo a vista na pauta.",
 rh:["C D E G A G E D","E G A c d c A G","F A B d e d B A","G B c e f e c B","A c d f g f d c","G B c e d c B G","E G A c B A G E","C2 E2 G4"],
 lh:["C,2 G,,2 E,2 G,,2","G,,2 D,2 B,,2 D,2","F,2 C,2 A,2 C,2","G,,2 D,2 B,,2 D,2","A,,2 E,2 C,2 E,2","G,,2 D,2 B,,2 D,2","C,2 G,,2 E,2 G,,2","C,8"],
 limitations:"O treino exige leitura visual um compasso à frente; não implica medição ocular ou certificação do olhar."},
 J:{key:"C",meter:"4/4",bpm:60,focus:"Transpor à vista uma quarta justa acima em lead sheet simples sem modificar a partitura original.",
 rh:["C2 E2 G2 E2","F2 A2 c2 A2","G2 B2 d2 B2","E2 G2 c2 G2","A2 c2 e2 c2","G2 B2 d2 B2","F2 A2 c2 A2","E2 G2 C4"],
 lh:["C,4 G,,4","F,4 C,4","G,,4 D,4","C,8","A,,4 E,4","G,,4 D,4","F,4 C,4","C,8"],
 transposeSemitones:5,cues:["C","F","G7","C","Am","G7","F","C"],
 limitations:"Transpõe o padrão completo 5 semitons acima; o aluno deve avaliar conscientemente registo e voicings. Leitura em clave de dó não é testada."}
};
function get(track,level){
 if(level!==3||!Object.prototype.hasOwnProperty.call(DATA,track))return null;
 const s=DATA[track],title=track+" · N3 · Estudo orientado 1";
 const lines=["X:1","T:"+title,"M:"+s.meter,"L:1/8","Q:1/4="+s.bpm,"K:"+s.key,
 "%%score { RH"+(s.rh2?" RH2":"")+" LH }","V:RH clef=treble","V:LH clef=bass"];
 if(s.rh2)lines.push("V:RH2 clef=treble");
 lines.push("[V:RH] "+s.rh.join(" | ")+" |]");
 if(s.rh2)lines.push("[V:RH2] "+s.rh2.join(" | ")+" |]");
 lines.push("[V:LH] "+s.lh.join(" | ")+" |]");
 return Object.freeze({id:"special-"+track+"N3-01",track,level,title,key:s.key,meter:s.meter,bpm:s.bpm,
 abc:lines.join("\n"),intent:s.focus,proof:s.focus,hands:["direita","esquerda"],
 specialized:true,certification:false,expression:null,secondTrebleVoice:Boolean(s.rh2),
 transposeSemitones:s.transposeSemitones||0,pedalMarks:s.pedalMarks||null,cues:s.cues||null,
 limitations:s.limitations});
}
root.LuwipiSpecializedN3=Object.freeze({get,trackIds:Object.freeze(Object.keys(DATA)),supportedLevels:[3]});
})(typeof window!=="undefined"?window:globalThis);
