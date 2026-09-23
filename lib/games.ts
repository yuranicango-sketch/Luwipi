import type { CompetencyId } from "@/lib/learning-intelligence";

export type GameAge="2-4"|"5-8";
export type GameWorld="giant-sky"|"echo-canyon"|"rhythm-railway"|"keyboard-kingdom"|"color-river"|"notation-city"|"hand-workshop"|"harmony-tower"|"creation-studio";
export type GameEngine="listen_choose"|"rhythm_pulse"|"rhythm_echo"|"piano_path"|"memory_notes"|"score_hunt"|"measure_build"|"listen_find"|"finger_path"|"articulation"|"chord_build"|"melody_build";
export type GameLevel={label:string;subtitle:string;rounds:number;difficulty:1|2|3};

export type LuwipiGame={
 id:string;number:number;age:GameAge;title:string;world:GameWorld;engine:GameEngine;competency:CompetencyId;
 skill:string;goal:string;session:string;curriculum:number[];levels:[GameLevel,GameLevel,GameLevel];
};

const levels=(a:string,b:string,c:string,rounds:[number,number,number]=[4,5,6]):[GameLevel,GameLevel,GameLevel]=>[
 {label:"Descobrir",subtitle:a,rounds:rounds[0],difficulty:1},
 {label:"Confiar",subtitle:b,rounds:rounds[1],difficulty:2},
 {label:"Dominar",subtitle:c,rounds:rounds[2],difficulty:3},
];

export const games:LuwipiGame[]=[
 {id:"elefante-passarinho",number:1,age:"2-4",title:"Gigante ou Estrelinha?",world:"giant-sky",engine:"listen_choose",competency:"ouvido",skill:"Grave e agudo",goal:"Distinguir sons graves e agudos sem depender de nomes.",session:"3–5 min",curriculum:[2,3,15,16,28],levels:levels("Contrastes muito distantes","Regiões mais próximas","Decidir com menos pistas")},
 {id:"leao-coelhinho",number:2,age:"2-4",title:"Trovão ou Brisa?",world:"echo-canyon",engine:"listen_choose",competency:"expressao",skill:"Forte e suave",goal:"Perceber intensidade e intenção do som.",session:"3–5 min",curriculum:[4,5],levels:levels("Forte e suave muito claros","Contrastes moderados","Ouvir sem pista visual")},
 {id:"siga-tambor",number:3,age:"2-4",title:"Farol do Pulso",world:"rhythm-railway",engine:"rhythm_pulse",competency:"ritmo",skill:"Pulsação",goal:"Manter batidas igualmente espaçadas.",session:"3–5 min",curriculum:[7,8,12],levels:levels("Quatro pulsos","Pulso mais longo","Pulso com mudança",[2,3,3])},
 {id:"eco-musical",number:4,age:"2-4",title:"Caverna do Eco",world:"echo-canyon",engine:"rhythm_echo",competency:"ouvido",skill:"Memória rítmica",goal:"Ouvir e devolver pequenos padrões.",session:"3–5 min",curriculum:[9,27,30],levels:levels("Eco de duas batidas","Eco de três batidas","Eco de quatro batidas",[3,4,4])},
 {id:"caca-teclas",number:5,age:"2-4",title:"Reino das Teclas",world:"keyboard-kingdom",engine:"piano_path",competency:"teclado",skill:"Geografia do teclado",goal:"Encontrar regiões e teclas através de missões visuais.",session:"3–5 min",curriculum:[13,14,17,18],levels:levels("Teclas fáceis de localizar","Mais de uma região","Menos ajuda visual")},
 {id:"caminho-cores",number:6,age:"2-4",title:"Rio das Cores",world:"color-river",engine:"memory_notes",competency:"coordenacao",skill:"Sequência visual-musical",goal:"Guardar uma ordem e levá-la ao piano.",session:"3–5 min",curriculum:[31,32,33,35,36],levels:levels("Duas notas","Três notas","Quatro notas")},
 {id:"trem-ritmo",number:7,age:"2-4",title:"Expresso do Ritmo",world:"rhythm-railway",engine:"rhythm_pulse",competency:"ritmo",skill:"Andamento e controle",goal:"Manter o pulso quando a velocidade muda.",session:"3–5 min",curriculum:[10,11,12,39],levels:levels("Devagar","Velocidade média","Mudança durante a viagem",[2,3,4])},
 {id:"ajude-cordeirinho",number:8,age:"2-4",title:"Trilha da Melodia",world:"color-river",engine:"piano_path",competency:"repertorio",skill:"Sequência + narrativa",goal:"Completar um caminho tocando pequenas frases.",session:"4–6 min",curriculum:[41],levels:levels("Duas notas por trecho","Três notas","Frase musical")},

 {id:"encontre-do",number:9,age:"5-8",title:"Portal do Dó",world:"keyboard-kingdom",engine:"piano_path",competency:"teclado",skill:"Orientação",goal:"Encontrar Dó rapidamente em várias oitavas.",session:"3–5 min",curriculum:[4,6,13],levels:levels("Uma oitava","Duas oitavas","Sem indicação de região")},
 {id:"pauta-tecla",number:10,age:"5-8",title:"Cidade da Pauta",world:"notation-city",engine:"score_hunt",competency:"leitura",skill:"Leitura",goal:"Transformar a nota escrita em ação imediata no piano.",session:"4–6 min",curriculum:[15,17,18,44],levels:levels("Dó–Mi","Dó–Sol","Dó–Si")},
 {id:"construa-compasso",number:11,age:"5-8",title:"Oficina do Compasso",world:"rhythm-railway",engine:"measure_build",competency:"ritmo",skill:"Ritmo",goal:"Construir compassos completos sem ultrapassar os tempos.",session:"4–6 min",curriculum:[7,8,9,10,11,12],levels:levels("Semínimas e mínimas","Adicionar pausas","Encontrar várias soluções",[3,4,4])},
 {id:"ouca-encontre",number:12,age:"5-8",title:"Radar Sonoro",world:"echo-canyon",engine:"listen_find",competency:"ouvido",skill:"Ouvido",goal:"Ouvir e encontrar a nota no teclado sem pista visual.",session:"3–5 min",curriculum:[25,28,34],levels:levels("Regiões distantes","Notas Dó–Sol","Notas próximas")},
 {id:"mestre-dedos",number:13,age:"5-8",title:"Oficina dos Dedos",world:"hand-workshop",engine:"finger_path",competency:"tecnica",skill:"Dedilhado",goal:"Associar dedo, mão e tecla com movimento controlado.",session:"4–6 min",curriculum:[2,19,22,23],levels:levels("Mão direita","Mão esquerda","Alternar as duas mãos")},
 {id:"legato-staccato",number:14,age:"5-8",title:"Ponte da Articulação",world:"color-river",engine:"articulation",competency:"expressao",skill:"Articulação",goal:"Ouvir e distinguir sons ligados e destacados.",session:"3–5 min",curriculum:[20,21,30,42],levels:levels("Contraste evidente","Contraste curto","Identificar sem rótulo")},
 {id:"construa-acorde",number:15,age:"5-8",title:"Torre dos Acordes",world:"harmony-tower",engine:"chord_build",competency:"harmonia",skill:"Harmonia",goal:"Construir e reconhecer acordes maiores no teclado.",session:"4–6 min",curriculum:[31,32,33,36],levels:levels("Dó maior","Fá maior","Sol maior",[2,2,2])},
 {id:"complete-melodia",number:16,age:"5-8",title:"Atelier da Melodia",world:"creation-studio",engine:"melody_build",competency:"criatividade",skill:"Audição e criação",goal:"Completar frases e começar a criar finais próprios.",session:"4–6 min",curriculum:[35,36,37,38,39,40],levels:levels("Escolher final","Prever final","Criar final",[3,4,4])},
];

export function getGame(id:string){return games.find(game=>game.id===id)}
export function gamesForAge(age:GameAge){return games.filter(game=>game.age===age)}
