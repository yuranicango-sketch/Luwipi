export type GameAge = "2-4" | "5-8";
export type GameEngine = "listen_choose" | "sequence_repeat" | "piano_action" | "drag_build" | "adventure_progress";

export type LuwipiGame = {
  id: string;
  number: number;
  age: GameAge;
  title: string;
  emoji: string;
  image?: string;
  engine: GameEngine;
  skill: string;
  goal: string;
  session: string;
  curriculum: number[];
  levels: string[];
};

export const games: LuwipiGame[] = [
  { id:"elefante-passarinho", number:1, age:"2-4", title:"Elefante ou Passarinho?", emoji:"🐘🐦", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piano%20practice%20hands.jpg", engine:"listen_choose", skill:"Grave e agudo", goal:"Distinguir regiões graves e agudas pela audição.", session:"1–2 min", curriculum:[2,3,15,16,28], levels:["Contrastes extremos","Regiões menos extremas","Sons mais próximos"] },
  { id:"leao-coelhinho", number:2, age:"2-4", title:"Leão ou Coelhinho?", emoji:"🦁🐰", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piano%20practice%20hands.jpg", engine:"listen_choose", skill:"Forte e suave", goal:"Distinguir intensidade com controle.", session:"1–2 min", curriculum:[4,5], levels:["Contraste amplo","Contraste moderado","Ouvir e reproduzir"] },
  { id:"siga-tambor", number:3, age:"2-4", title:"Siga o Tambor", emoji:"🥁", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piano%20practice%20hands.jpg", engine:"sequence_repeat", skill:"Pulsação", goal:"Manter uma pulsação simples e estável.", session:"2 min", curriculum:[7,8,12], levels:["4 pulsos","8 pulsos","Mudança de andamento"] },
  { id:"eco-musical", number:4, age:"2-4", title:"Eco Musical", emoji:"👏", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Hand-%20und%20Fingerstellung.jpg", engine:"sequence_repeat", skill:"Memória rítmica", goal:"Repetir padrões curtos de 2 a 4 elementos.", session:"2–3 min", curriculum:[9,27,30], levels:["2 batidas","3 batidas","4 elementos"] },
  { id:"caca-teclas", number:5, age:"2-4", title:"Caça às Teclas", emoji:"🎹", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cartoon%20Piano%20Keyboard.jpg", engine:"piano_action", skill:"Geografia do teclado", goal:"Encontrar teclas e regiões do piano.", session:"2–3 min", curriculum:[13,14,17,18], levels:["Brancas/pretas","Grupos de 2/3","Grave/agudo"] },
  { id:"caminho-cores", number:6, age:"2-4", title:"Caminho das Cores", emoji:"🌈", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piano%20practice%20hands.jpg", engine:"sequence_repeat", skill:"Sequência visual-musical", goal:"Memorizar e tocar padrões de cores.", session:"2–3 min", curriculum:[31,32,33,35,36], levels:["2 cores","3 cores","4 cores"] },
  { id:"trem-ritmo", number:7, age:"2-4", title:"Trem do Ritmo", emoji:"🚂", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piano%20practice%20hands.jpg", engine:"sequence_repeat", skill:"Andamento e controle", goal:"Responder a rápido/devagar e pare/continue.", session:"2–3 min", curriculum:[10,11,12,39], levels:["Lento/rápido","Mudança durante percurso","Parar/continuar"] },
  { id:"ajude-cordeirinho", number:8, age:"2-4", title:"Ajude o Cordeirinho", emoji:"🐑", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piano%20practice%20hands.jpg", engine:"adventure_progress", skill:"Sequência + narrativa", goal:"Tocar padrões para mover Nino até Maria.", session:"3–5 min", curriculum:[41], levels:["2 notas","3 notas","Frases curtas"] },
  { id:"encontre-do", number:9, age:"5-8", title:"Encontre o Dó", emoji:"🎯", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cartoon%20Piano%20Keyboard.jpg", engine:"piano_action", skill:"Orientação", goal:"Encontrar Dó usando grupos de duas teclas pretas.", session:"2 min", curriculum:[4,6,13], levels:["1 oitava","2 oitavas","Dó a Sol"] },
  { id:"pauta-tecla", number:10, age:"5-8", title:"Pauta → Tecla", emoji:"🎼", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cartoon%20Piano%20Keyboard.jpg", engine:"piano_action", skill:"Leitura", goal:"Relacionar nota na pauta à tecla correta.", session:"3 min", curriculum:[15,17,18,44], levels:["Dó–Mi","Dó–Sol","Dó–Si"] },
  { id:"construa-compasso", number:11, age:"5-8", title:"Construa o Compasso", emoji:"⏱️", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cartoon%20Piano%20Keyboard.jpg", engine:"drag_build", skill:"Ritmo", goal:"Completar compassos de quatro tempos.", session:"3 min", curriculum:[7,8,9,10,11,12], levels:["Semínimas/mínimas","Com pausas","Várias soluções"] },
  { id:"ouca-encontre", number:12, age:"5-8", title:"Ouça e Encontre", emoji:"👂", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Hand-%20und%20Fingerstellung.jpg", engine:"listen_choose", skill:"Ouvido", goal:"Encontrar nota ou região pela audição.", session:"2–3 min", curriculum:[25,28,34], levels:["Regiões","Dó–Sol","Padrões de 2 notas"] },
  { id:"mestre-dedos", number:13, age:"5-8", title:"Mestre dos Dedos", emoji:"🖐️", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Clementi1801Fingering.png", engine:"piano_action", skill:"Dedilhado", goal:"Reconhecer mãos e dedos 1–5.", session:"2–3 min", curriculum:[2,19,22,23], levels:["Uma mão","Duas mãos","Mão + dedo + tecla"] },
  { id:"legato-staccato", number:14, age:"5-8", title:"Legato ou Staccato?", emoji:"🎵", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Hand-%20und%20Fingerstellung.jpg", engine:"listen_choose", skill:"Articulação", goal:"Ouvir, identificar e reproduzir legato/staccato.", session:"3 min", curriculum:[20,21,30,42], levels:["Ouvir","Ler","Reproduzir"] },
  { id:"construa-acorde", number:15, age:"5-8", title:"Construa o Acorde", emoji:"🏗️", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cartoon%20Piano%20Keyboard.jpg", engine:"drag_build", skill:"Harmonia", goal:"Montar e reconhecer C, F e G maiores.", session:"3–4 min", curriculum:[31,32,33,36], levels:["Dó maior","Dó/Fá","Dó/Fá/Sol"] },
  { id:"complete-melodia", number:16, age:"5-8", title:"Complete a Melodia", emoji:"🧩", image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cartoon%20Piano%20Keyboard.jpg", engine:"drag_build", skill:"Audição e criação", goal:"Escolher ou criar continuação para uma frase.", session:"3–4 min", curriculum:[35,36,37,38,39,40], levels:["2 opções","4 opções","Criar final"] },
];

export function getGame(id: string) {
  return games.find((game) => game.id === id);
}

export function gamesForAge(age: GameAge) {
  return games.filter((game) => game.age === age);
}
