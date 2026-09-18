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
  "2-4:1": { title: "O piano fala", focus: "Exploração + primeira mini música", objective: "Explorar regiões do piano e terminar a primeira aula já fazendo uma pequena sequência musical." },
  "2-4:4": { title: "Mãos que pousam", focus: "Toque relaxado + música", objective: "Pousar a mão sem tensão e produzir sons confortáveis dentro de uma pequena canção." },
  "2-4:31": { title: "Cada cor tem um lugar", focus: "Cor + posição + nome", objective: "Usar a cor como apoio e começar a relacioná-la com posição e nome da nota." },
  "2-4:34": { title: "Cor + nome", focus: "Transição de apoio", objective: "Mostrar cor grande e nome pequeno para iniciar a retirada gradual da pista visual." },
  "2-4:35": { title: "Nome + cor pequena", focus: "Desvanecimento da cor", objective: "Usar nome e posição como pista principal, deixando a cor apenas como apoio." },
  "2-4:40": { title: "Estrelinha completa", focus: "Música completa", objective: "Tocar Brilha, Brilha, Estrelinha do início ao fim em frases curtas." },
  "2-4:41": { title: "Maria e o cordeirinho completa", focus: "Música completa + memória", objective: "Tocar a música inteira acompanhando a jornada visual e reconhecendo suas frases." },
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
    if (lesson.number <= 6) return "Realiza a proposta principal em 4 de 5 tentativas, sem tensão e com ajuda mínima.";
    if (lesson.number <= 18) return "Mantém a tarefa por uma sequência curta e consegue repeti-la duas vezes com segurança.";
    if (lesson.number <= 36) return "Completa o padrão ou mini música com no máximo duas ajudas do professor.";
    return "Completa uma música/história curta do início ao fim com continuidade apropriada à idade.";
  }
  if (lesson.number <= 12) return "Executa o conceito em dois exemplos seguidos e aplica-o numa frase musical curta.";
  if (lesson.number <= 24) return "Lê ou executa quatro de cinco exemplos e aplica o padrão numa pequena peça.";
  if (lesson.number <= 36) return "Aplica a habilidade numa peça/atividade com pulso e técnica funcional.";
  return "Toca a peça completa com continuidade e demonstra pelo menos um elemento musical consciente.";
}

function homeFor(age: AgeGroup, lesson: CurriculumLesson) {
  if (age === "2-4") return "3–5 minutos: repetir a brincadeira principal e tocar a pequena sequência uma vez.";
  return "5–10 minutos: praticar um trecho curto, depois tocar a peça/atividade uma vez do início ao fim.";
}

function adaptationFor(age: AgeGroup, lesson: CurriculumLesson) {
  if (age === "2-4") {
    return {
      younger: lesson.number >= 19 && lesson.number <= 24
        ? "2–3 anos: priorizar mão inteira e dedos 1–3; não exigir independência dos cinco dedos."
        : "2–3 anos: reduzir a sequência, usar mais movimento e modelagem, com uma instrução por vez.",
      older: lesson.number >= 31 && lesson.number <= 36
        ? "3–4 anos: dizer o nome da nota junto com a cor e reduzir gradualmente o tamanho da pista colorida."
        : "3–4 anos: aumentar para 3–5 elementos e pedir uma pequena repetição com mais autonomia.",
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
