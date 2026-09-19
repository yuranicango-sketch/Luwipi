import {
  curriculum as baseCurriculum,
  type AgeGroup,
  type CurriculumLesson,
  type CurriculumModule,
} from "@/lib/curriculum";

export type AgeVariant = "2-3" | "3-4" | "5-6" | "7-8";

export type EnhancedLesson = CurriculumLesson & {
  activityRoute?: string;
  mastery: string;
  homePractice: string;
  repertoire: string;
  adaptation: { younger: string; older: string };
  pillars: string[];
  checkpoint: boolean;
};

export type EnhancedModule = Omit<CurriculumModule, "lessons"> & {
  accent: string;
  surface: string;
  illustration:
    | "sound"
    | "rhythm"
    | "keyboard"
    | "hands"
    | "ear"
    | "colors"
    | "story"
    | "performance"
    | "reading"
    | "harmony"
    | "creativity";
  lessons: EnhancedLesson[];
};

export type CurriculumVariant = {
  id: AgeVariant;
  label: string;
  lessonLength: string;
  note: string;
};

export type EnhancedProgram = Omit<
  ReturnType<typeof getBaseProgram>,
  "modules"
> & {
  variants: CurriculumVariant[];
  spiralPillars: string[];
  modules: EnhancedModule[];
};

function getBaseProgram(age: AgeGroup) {
  return baseCurriculum[age];
}

const variants: Record<AgeGroup, CurriculumVariant[]> = {
  "2-4": [
    { id: "2-3", label: "2–3 anos", lessonLength: "15–20 min", note: "Mais movimento, imitação e exploração. Não exigir independência dos cinco dedos." },
    { id: "3-4", label: "3–4 anos", lessonLength: "20–30 min", note: "Mais sequências, lateralidade, dedos 1–5 e autonomia gradual." },
  ],
  "5-8": [
    { id: "5-6", label: "5–6 anos", lessonLength: "30–35 min", note: "Mais jogo, leitura por padrões e técnica sem pressa. Escala completa é opcional." },
    { id: "7-8", label: "7–8 anos", lessonLength: "35–45 min", note: "Mais autonomia de leitura, grande pauta e repertório com partitura." },
  ],
};

const moduleTheme: Record<AgeGroup, Record<string,{accent:string;surface:string;illustration:EnhancedModule["illustration"]}>> = {
  "2-4": {
    "descoberta-sonora": { accent: "#ff76a8", surface: "#fff0f6", illustration: "sound" },
    "ritmo-movimento": { accent: "#ffb32f", surface: "#fff6df", illustration: "rhythm" },
    "mapa-piano": { accent: "#43a4f5", surface: "#edf7ff", illustration: "keyboard" },
    "maos-dedos": { accent: "#8d73ec", surface: "#f4f0ff", illustration: "hands" },
    "ouvido-imitacao": { accent: "#47c6b4", surface: "#eafbf7", illustration: "ear" },
    "cores-padroes": { accent: "#ed6ad5", surface: "#fff0fb", illustration: "colors" },
    "historias-musicas": { accent: "#55b96c", surface: "#eefaf0", illustration: "story" },
    "consolidacao-performance": { accent: "#f28f3b", surface: "#fff4e9", illustration: "performance" },
  },
  "5-8": {
    fundamentos: { accent: "#2f9cf4", surface: "#edf7ff", illustration: "keyboard" },
    ritmo: { accent: "#ffad32", surface: "#fff6df", illustration: "rhythm" },
    "notas-leitura": { accent: "#7e6ce7", surface: "#f4f0ff", illustration: "reading" },
    coordenacao: { accent: "#55bd75", surface: "#eefaf1", illustration: "hands" },
    "tecnica-harmonia": { accent: "#ec6ebd", surface: "#fff0fa", illustration: "harmony" },
    "ouvido-criatividade": { accent: "#42c6b5", surface: "#eafbf8", illustration: "creativity" },
    "repertorio-musicalidade": { accent: "#ff7e62", surface: "#fff1ed", illustration: "reading" },
    performance: { accent: "#e5a528", surface: "#fff8e4", illustration: "performance" },
  },
};

const repertoire24 = [
  "O Gigante e a Estrelinha","Passos do Elefante","O Leão Acordou o Coelho","Chuva de Cores","O Trem Pequenino","Mini concerto: escolha da criança",
  "Marcha, Soldado","O Trem Pequenino","Dança dos Animais","Marcha, Soldado","Balões no Céu","Marcha, Soldado ou O Trem Pequenino",
  "Passinhos do Ursinho","Barquinho Azul","Boi da Cara Preta","Brilha, Brilha, Estrelinha","O Passeio das Cores","O Passeio das Cores ou Brilha, Brilha",
  "Passinhos do Ursinho","Festa dos Sinos","Chuva de Cores","Eco Musical","Maria Tinha um Cordeirinho","Maria ou Festa dos Sinos",
  "Sapo Cururu","O Sapo Não Lava o Pé","Ciranda, Cirandinha","Boi da Cara Preta","Peixe Vivo","Música favorita de memória",
  "O Passeio das Cores","Chuva de Cores","O Passeio das Cores","Brilha, Brilha, Estrelinha","Maria Tinha um Cordeirinho","O Passeio das Cores",
  "Boi da Cara Preta","Chuva de Cores","Marcha, Soldado","Brilha, Brilha, Estrelinha","Maria Tinha um Cordeirinho","Peça original da criança",
  "Repertório favorito","Ciranda ou Marcha, Soldado","Música escolhida","Repertório final","Repertório final","1–2 músicas completas",
];

const repertoire58 = [
  "Três Passos","Marcha dos Dedos","O Castelo das Notas","Jardim em Dó Maior","Pequeno Explorador","Peça do módulo",
  "Marcha dos Dedos","Valsa da Lua","Chuva na Janela","Trem da Montanha","Valsa da Lua + Marcha dos Dedos","Peça rítmica curta",
  "A Ponte Musical","Jardim em Dó Maior","Dança das Estrelas","Rio de Melodias","Pequeno Explorador","Amanhecer no Piano",
  "Passos no Bosque","Canção do Vento","Aventura em Dó Maior","Noite de Estrelas","Festa em Sol","Pequena Sonatina Luwipi",
  "Jardim em Dó Maior","Aventura em Dó Maior","Rio de Melodias","O Castelo das Notas","Festa em Sol","Canção do Vento",
  "Peixe Vivo","Dança das Estrelas","Improviso nas teclas pretas","A Ponte Musical","Composição do aluno","Peça escolhida de memória",
  "Valsa da Lua","Amanhecer no Piano","Trem da Montanha","Brilha, Brilha, Estrelinha","Maria Tinha um Cordeirinho","Pequena Sonatina Luwipi",
  "2–3 peças escolhidas","Repertório final","Repertório final","Peça principal","Programa do recital","2–3 peças completas",
];

const keyOverrides: Partial<Record<string, Partial<Pick<EnhancedLesson,"title"|"focus"|"objective"|"mastery">>>> = {
  "2-4:1": { title:"O piano fala", focus:"Primeira descoberta", objective:"Descobrir que o piano tem sons grandões e pequeninos e terminar fazendo uma mini música." },
  "2-4:2": { title:"Elefante e passarinho", focus:"Sons grandões e pequeninos", objective:"Ouvir o elefante e o passarinho e encontrá-los em lados diferentes do piano." },
  "2-4:3": { title:"Onde mora o som?", focus:"Casas dos sons", objective:"Levar cada personagem para o lado do piano onde mora o seu som." },
  "2-4:4": { title:"Leão e coelhinho", focus:"Voz forte e voz suave", objective:"Fazer a voz do leão e a do coelhinho sem bater nas teclas." },
  "2-4:5": { title:"Gigante e formiguinha", focus:"Passos grandes e leves", objective:"Transformar passos de gigante e formiguinha em sons no piano." },
  "2-4:6": { title:"Som que passeia, som que pula", focus:"Sons compridos e curtinhos", objective:"Brincar com um som que fica e outro que desaparece depressa." },
  "2-4:7": { title:"O coração da música", focus:"Tum, tum, tum", objective:"Sentir o coração da música com passos, palmas e uma tecla." },
  "2-4:8": { title:"O tambor manda", focus:"Andar e congelar", objective:"Andar quando o tambor toca e virar estátua quando ele para." },
  "2-4:9": { title:"Copia as minhas palmas", focus:"Eu faço, tu fazes", objective:"Ouvir uma pequena brincadeira de palmas e tentar fazer igual." },
  "2-4:10": { title:"O trem muda de velocidade", focus:"Devagar e rápido", objective:"Acompanhar um trem que anda devagar e depois fica rápido." },
  "2-4:11": { title:"O som foi dormir", focus:"Tocar e parar", objective:"Parar quando o som dorme e voltar quando ele acorda." },
  "2-4:12": { title:"Festa do ritmo", focus:"Passos, palmas e silêncio", objective:"Juntar as brincadeiras de ritmo numa pequena festa musical." },
  "2-4:13": { title:"Duas famílias de teclas", focus:"Brancas e pretas", objective:"Encontrar e brincar com as teclas brancas e as teclas pretas." },
  "2-4:14": { title:"Casinhas de 2 e de 3", focus:"Teclas pretas em grupos", objective:"Procurar pelo piano casinhas de duas e três teclas pretas." },
  "2-4:15": { title:"O gigante passeia", focus:"Lado dos sons grandões", objective:"Levar o gigante para passear pelo lado dos sons grandões." },
  "2-4:16": { title:"O passarinho canta", focus:"Lado dos sons pequeninos", objective:"Encontrar o lado onde o passarinho gosta de cantar." },
  "2-4:17": { title:"A escada dos sons", focus:"Subir e descer", objective:"Fazer pequenos caminhos que sobem e descem pelo piano." },
  "2-4:18": { title:"Caça ao tesouro", focus:"Procurar no piano", objective:"Encontrar pequenos tesouros escondidos pelo teclado." },
  "2-4:19": { title:"Mão de conchinha", focus:"Pousar sem apertar", objective:"Pousar a mão confortavelmente e fazer sons sem ficar dura." },
  "2-4:20": { title:"Acorda, dedinho!", focus:"Dedos 1, 2 e 3", objective:"Acordar alguns dedinhos pelo número e levá-los ao piano." },
  "2-4:21": { title:"Um dedinho toca", focus:"Um de cada vez", objective:"Deixar um dedinho tocar enquanto os outros descansam." },
  "2-4:22": { title:"Uma mão pergunta", focus:"Direita e esquerda", objective:"Brincar de pergunta e resposta com uma mão de cada vez." },
  "2-4:23": { title:"Passinhos dos dedos", focus:"Dois ou três passinhos", objective:"Fazer pequenos caminhos usando dois ou três dedos confortáveis." },
  "2-4:24": { title:"A ponte dos dedos", focus:"Subir e descer a ponte", objective:"Fazer uma mão subir a ponte e a outra ajudar a descer." },
  "2-4:25": { title:"Encontra o som escondido", focus:"Escutar e procurar", objective:"Ouvir um som escondido e procurar no piano outro que se pareça." },
  "2-4:26": { title:"Dois amigos sonoros", focus:"Ouvir dois e copiar", objective:"Ouvir dois sons e tentar chamá-los na mesma ordem." },
  "2-4:27": { title:"Das palmas para o piano", focus:"Copiar uma brincadeira", objective:"Copiar uma pequena brincadeira de palmas e levá-la para uma tecla." },
  "2-4:28": { title:"Elefante, passarinho... quem vem?", focus:"Ordem dos personagens", objective:"Ouvir dois ou três personagens e fazê-los aparecer na mesma ordem." },
  "2-4:29": { title:"O piano faz uma pergunta", focus:"Perguntar e responder", objective:"Responder com o piano a uma pequena pergunta do professor." },
  "2-4:30": { title:"A caixa das surpresas", focus:"Brincadeiras que já conheço", objective:"Abrir pequenas surpresas musicais e reconhecer brincadeiras já conhecidas." },
  "2-4:31": { title:"Cada cor tem uma casa", focus:"Cor e lugar", objective:"Descobrir em que tecla mora cada uma das três cores." },
  "2-4:32": { title:"Caminho de duas cores", focus:"Duas cores", objective:"Seguir um caminho curtinho de duas cores no piano." },
  "2-4:33": { title:"Caminho de três cores", focus:"Três cores", objective:"Olhar três cores e fazer o mesmo caminho no piano." },
  "2-4:34": { title:"Gémeos ou surpresa?", focus:"Igual ou mudou", objective:"Ouvir dois pequenos caminhos e descobrir se ficaram iguais ou se houve uma surpresa." },
  "2-4:35": { title:"Quem salva o caminho?", focus:"A peça que falta", objective:"Escolher entre duas cores qual completa um caminho simples." },
  "2-4:36": { title:"O Passeio das Cores", focus:"As cores viram música", objective:"Tocar uma pequena música das cores do começo até ao fim." },
  "2-4:37": { title:"O zoológico do piano", focus:"Vozes dos animais", objective:"Escolher sons para fazer diferentes animais ganharem voz." },
  "2-4:38": { title:"Tempestade no piano", focus:"Chuva, trovão e silêncio", objective:"Fazer nascer uma pequena tempestade usando sons do piano." },
  "2-4:39": { title:"O trem e a estação", focus:"Andar, parar e continuar", objective:"Fazer o trem andar com a música, parar na estação e voltar a andar." },
  "2-4:40": { title:"Estrelinha no céu", focus:"Uma música conhecida", objective:"Aprender Estrelinha em pequenos pedaços e juntá-los aos poucos." },
  "2-4:41": { title:"Onde está o cordeirinho?", focus:"Música e história", objective:"Ajudar o cordeirinho a chegar até Maria tocando pequenos pedaços da música." },
  "2-4:42": { title:"A minha aventura no piano", focus:"Inventar uma história", objective:"Escolher um personagem e inventar uma pequena aventura sonora." },
  "2-4:43": { title:"Eu escolho!", focus:"Brincadeiras favoritas", objective:"Escolher duas brincadeiras musicais favoritas e voltar a fazê-las." },
  "2-4:44": { title:"O meu jogo de ritmo", focus:"Ritmo favorito", objective:"Escolher um jogo de ritmo conhecido e levá-lo para o piano." },
  "2-4:45": { title:"Piano a dois", focus:"Eu toco, tu respondes", objective:"Fazer um pequeno dueto com o professor, escutando e esperando a vez." },
  "2-4:46": { title:"Esta é a minha música", focus:"Escolher uma música", objective:"Escolher uma música favorita e prepará-la sem transformar a aula num ensaio cansativo." },
  "2-4:47": { title:"Concerto para um boneco", focus:"Brincar de apresentar", objective:"Tocar a música escolhida para o professor, um boneco ou alguém conhecido." },
  "2-4:48": { title:"A minha festa no piano", focus:"Celebrar e tocar", objective:"Mostrar uma ou duas músicas favoritas e celebrar tudo o que a criança descobriu." },
  "5-8:1": { title: "Postura + primeira peça", focus: "Ergonomia + repertório", objective: "Sentar, alinhar braços, produzir som relaxado e terminar tocando uma mini peça de três notas." },
  "5-8:7": { title: "Pulsação e semínima", focus: "1 tempo + repertório" },
  "5-8:8": { title: "Mínima e semibreve", focus: "2 e 4 tempos" },
  "5-8:9": { title: "Pausas", focus: "Silêncio + leitura" },
  "5-8:10": { title: "Colcheias em pares", focus: "Divisão simples", objective: "Introduzir pares de colcheias por fala, movimento e leitura simples, sempre ligados a uma frase musical." },
  "5-8:11": { title: "3/4, 4/4 e mapa da pauta", focus: "Compasso + pré-leitura", objective: "Sentir compassos de três e quatro pulsos e reconhecer linhas e espaços antes da leitura nota por nota." },
  "5-8:12": { title: "Construa o compasso", focus: "Revisão rítmica + leitura" },
  "5-8:13": { title: "Dó, Ré, Mi na pauta", focus: "Referências + repertório" },
  "5-8:15": { title: "Clave de Sol e pontos de referência", focus: "Leitura contextual", objective: "Usar pontos de referência e leitura por relação, evitando decorar a pauta como uma lista." },
  "5-8:16": { title: "Passos, saltos e repetição", focus: "Leitura por padrão" },
  "5-8:18": { title: "Primeira peça lida completa", focus: "Leitura + musicalidade" },
  "5-8:20": { title: "Mão esquerda + clave de Fá", focus: "Mão esquerda + nova clave", objective: "Introduzir a clave de Fá como mapa da mão esquerda usando Fá e Dó como referências." },
  "5-8:21": { title: "Grande pauta", focus: "Clave de Sol + clave de Fá", objective: "Ver as duas claves como um único mapa organizado em torno do Dó central." },
  "5-8:24": { title: "Primeira peça com duas mãos", focus: "Coordenação conjunta" },
  "5-8:26": { title: "Escala de Dó — conforme a idade", focus: "Coordenação técnica adaptativa", objective: "Explorar a escala sem tornar a passagem do polegar uma obrigação precoce." },
  "5-8:40": { title: "Brilha, Brilha completa", focus: "Repertório + leitura" },
  "5-8:41": { title: "Maria completa", focus: "Repertório + memória" },
  "5-8:42": { title: "Peça Luwipi com partitura", focus: "Leitura + interpretação" },
};

function masteryFor(age: AgeGroup, lesson: CurriculumLesson) {
  if (age === "2-4") {
    if (lesson.number <= 6) return "A criança já entra na brincadeira e começa a mostrar a diferença que ouviu, mesmo que ainda copie ou peça ajuda.";
    if (lesson.number <= 12) return "A criança acompanha a brincadeira com o corpo, palmas ou piano e já percebe quando é hora de continuar ou parar.";
    if (lesson.number <= 18) return "A criança encontra no piano o lugar pedido e começa a fazer pequenas escolhas sem o professor mostrar tudo primeiro.";
    if (lesson.number <= 24) return "A criança usa mãos e dedinhos com conforto e participa sem ficar presa à ideia de tocar perfeito.";
    if (lesson.number <= 30) return "A criança escuta uma ideia curtinha e tenta responder ou fazer algo parecido no piano.";
    if (lesson.number <= 36) return "A criança segue o caminho visual ou sonoro e consegue chegar ao fim da brincadeira com a ajuda que precisar.";
    if (lesson.number <= 42) return "A criança entra na história, usa o piano para dar voz aos personagens e participa de um pedacinho da música.";
    return "A criança escolhe, toca e compartilha uma brincadeira ou música conhecida com confiança crescente.";
  }
  if (lesson.number <= 12) return "Executa o conceito em dois exemplos seguidos e aplica-o numa frase musical curta.";
  if (lesson.number <= 24) return "Lê ou executa quatro de cinco exemplos e aplica o padrão numa pequena peça.";
  if (lesson.number <= 36) return "Aplica a habilidade numa peça/atividade com pulso e técnica funcional.";
  return "Toca a peça completa com continuidade e demonstra pelo menos um elemento musical consciente.";
}

function homeFor(age: AgeGroup, lesson: CurriculumLesson) {
  if (age === "2-4") return "2–3 minutinhos: repetir em casa a brincadeira favorita da aula uma ou duas vezes e parar enquanto ainda está divertido.";
  return "5–10 minutos: praticar um trecho curto, depois tocar a peça/atividade uma vez do início ao fim.";
}

function adaptationFor(age: AgeGroup, lesson: CurriculumLesson) {
  if (age === "2-4") {
    return {
      younger: lesson.number >= 19 && lesson.number <= 24
        ? "2–3 anos: deixe a mão brincar inteira ou use só os dedinhos que se mexem naturalmente. Não force todos os dedos."
        : "2–3 anos: faça uma coisa de cada vez, mostre primeiro e use mais corpo, personagens e imitação.",
      older: lesson.number >= 31 && lesson.number <= 36
        ? "3–4 anos: continue com as cores e comece a dizer o nome da nota naturalmente, sem transformar isso numa pergunta."
        : "3–4 anos: quando estiver fácil, acrescente só mais um passo à brincadeira e deixe a criança tentar primeiro.",
    };
  }

  return {
    younger: lesson.number === 26
      ? "5–6 anos: trabalhar pentacorde/tetracordes; escala de uma oitava só se o movimento surgir sem tensão."
      : "5–6 anos: menos notas por vez, mais leitura por padrões e pausas frequentes entre tarefas.",
    older: lesson.number === 26
      ? "7–8 anos: introduzir uma oitava com passagem do polegar apenas quando a mão estiver relaxada."
      : "7–8 anos: ampliar a leitura, pedir maior autonomia e usar a partitura com menos pistas visuais.",
  };
}

function pillarsFor(age: AgeGroup, lesson: CurriculumLesson) {
  const base = age === "2-4" ? ["Ouvido","Ritmo","Piano","Música"] : ["Ritmo","Técnica","Leitura","Repertório"];
  if (lesson.focus.toLowerCase().includes("cri") || lesson.focus.toLowerCase().includes("impro")) return [...base.slice(0,3),"Criação"];
  return base;
}

function enhanceLesson(age: AgeGroup, lesson: CurriculumLesson): EnhancedLesson {
  const key = `${age}:${lesson.number}`;
  const override = keyOverrides[key] ?? {};
  const repertoire = age === "2-4" ? repertoire24[lesson.number - 1] : repertoire58[lesson.number - 1];

  return {
    ...lesson,
    ...override,
    activityRoute: lesson.route,
    mastery: override.mastery ?? masteryFor(age, lesson),
    homePractice: homeFor(age, lesson),
    repertoire,
    adaptation: adaptationFor(age, lesson),
    pillars: pillarsFor(age, lesson),
    checkpoint: lesson.number % 8 === 0,
  };
}

export function getEnhancedCurriculum(ageValue: string | undefined): EnhancedProgram {
  const age: AgeGroup = ageValue === "2-4" ? "2-4" : "5-8";
  const base = getBaseProgram(age);

  return {
    ...base,
    philosophy: age === "2-4"
      ? "Ouvir, mover, tocar e imaginar em todas as aulas. O repertório começa na primeira semana e as cores funcionam como ponte, não como dependência."
      : "Técnica, leitura, ouvido, ritmo, criatividade e repertório aparecem em espiral. A criança toca música desde o início e aprende a ler porque já tem algo musical para dizer.",
    finalOutcome: age === "2-4"
      ? "A criança reconhece contrastes, mantém pulsações curtas, orienta-se no teclado, usa mãos e dedos de forma relaxada, imita padrões e toca pequenas músicas completas."
      : "A criança lê padrões em clave de Sol e referências da clave de Fá, controla ritmos fundamentais incluindo colcheias e 3/4, toca peças simples com duas mãos e apresenta 2–3 peças completas.",
    variants: variants[age],
    spiralPillars: age === "2-4"
      ? ["Ouvido","Ritmo","Piano","Música","Jogo/criação"]
      : ["Ouvido","Ritmo","Técnica","Leitura","Repertório/criação"],
    modules: base.modules.map((module) => ({
      ...module,
      ...moduleTheme[age][module.id],
      lessons: module.lessons.map((lesson) => enhanceLesson(age, lesson)),
    })),
  };
}

export function getVariant(program: EnhancedProgram, value: string | undefined) {
  return program.variants.find((variant) => variant.id === value) ?? program.variants[0];
}

export function findLesson(program: EnhancedProgram, lessonNumber: number) {
  for (const module of program.modules) {
    const lesson = module.lessons.find((item) => item.number === lessonNumber);
    if (lesson) return { module, lesson };
  }
  return null;
}
