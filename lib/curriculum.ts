export type AgeGroup = "2-4" | "5-8";

export type CurriculumLesson = {
  number: number;
  title: string;
  focus: string;
  objective: string;
  duration: string;
  route?: string;
};

export type CurriculumModule = {
  id: string;
  title: string;
  subtitle: string;
  outcome: string;
  icon: string;
  lessons: CurriculumLesson[];
};

export type CurriculumProgram = {
  age: AgeGroup;
  label: string;
  name: string;
  duration: string;
  lessonLength: string;
  philosophy: string;
  finalOutcome: string;
  modules: CurriculumModule[];
};

export const curriculum: Record<AgeGroup, CurriculumProgram> = {
  "2-4": {
    age: "2-4",
    label: "2 a 4 anos",
    name: "Iniciação Musical com Piano",
    duration: "6 meses · 24 aulas",
    lessonLength: "20–30 min por aula",
    philosophy:
      "Aprender música antes de aprender teoria: ouvir, mover, imitar, explorar e tocar. Sem depender de leitura formal de partitura.",
    finalOutcome:
      "A criança reconhece contrastes sonoros, mantém pulsação simples, explora o teclado com intenção, imita pequenos padrões e toca mini-sequências com confiança.",
    modules: [
      {
        id: "descoberta-sonora",
        title: "Descoberta sonora",
        subtitle: "Ouvir, comparar e explorar",
        outcome: "Reconhecer diferenças básicas do som e explorar o piano com curiosidade.",
        icon: "👂",
        lessons: [
          {
            number: 1,
            title: "O piano faz sons",
            focus: "Exploração livre guiada",
            objective: "Descobrir que diferentes regiões e gestos produzem sons diferentes.",
            duration: "20 min",
            route: "/aulas/sons",
          },
          {
            number: 2,
            title: "Grave e agudo",
            focus: "Altura sonora",
            objective: "Distinguir sons graves e agudos por audição e movimento.",
            duration: "20 min",
          },
          {
            number: 3,
            title: "Forte e suave",
            focus: "Dinâmica",
            objective: "Perceber e reproduzir contrastes de intensidade sem tensão nas mãos.",
            duration: "20 min",
          },
          {
            number: 4,
            title: "Som longo e som curto",
            focus: "Duração",
            objective: "Ouvir e representar sons longos e curtos com voz, corpo e piano.",
            duration: "20 min",
          },
        ],
      },
      {
        id: "ritmo-movimento",
        title: "Ritmo e movimento",
        subtitle: "Sentir antes de contar",
        outcome: "Sentir pulsação e responder fisicamente a padrões rítmicos simples.",
        icon: "👏",
        lessons: [
          {
            number: 5,
            title: "O coração da música",
            focus: "Pulsação",
            objective: "Manter uma pulsação simples com passos, palmas e batidas leves.",
            duration: "25 min",
            route: "/aulas/ritmo",
          },
          {
            number: 6,
            title: "Eco de palmas",
            focus: "Imitação rítmica",
            objective: "Repetir padrões curtos de 2 a 4 pulsações.",
            duration: "25 min",
          },
          {
            number: 7,
            title: "Rápido e devagar",
            focus: "Andamento",
            objective: "Distinguir e acompanhar dois andamentos contrastantes.",
            duration: "20 min",
          },
          {
            number: 8,
            title: "Pare e continue",
            focus: "Controle e silêncio",
            objective: "Responder a sinais de início, pausa e continuação mantendo atenção musical.",
            duration: "20 min",
          },
        ],
      },
      {
        id: "mapa-piano",
        title: "Mapa do piano",
        subtitle: "Descobrir onde os sons moram",
        outcome: "Orientar-se visualmente no teclado usando padrões simples.",
        icon: "🎹",
        lessons: [
          {
            number: 9,
            title: "Teclas brancas e pretas",
            focus: "Geografia do teclado",
            objective: "Reconhecer visualmente os dois tipos de teclas.",
            duration: "20 min",
          },
          {
            number: 10,
            title: "Casas de 2 e 3",
            focus: "Grupos de teclas pretas",
            objective: "Encontrar grupos de duas e três teclas pretas em diferentes regiões.",
            duration: "25 min",
          },
          {
            number: 11,
            title: "Subir e descer",
            focus: "Direção sonora",
            objective: "Associar movimento para a direita a sons mais agudos e para a esquerda a sons mais graves.",
            duration: "20 min",
          },
          {
            number: 12,
            title: "Caça ao teclado",
            focus: "Orientação",
            objective: "Responder a pequenos desafios visuais de localização no piano.",
            duration: "25 min",
          },
        ],
      },
      {
        id: "maos-dedos",
        title: "Mãos e dedos",
        subtitle: "Coordenação sem pressão",
        outcome: "Usar mãos e dedos de forma consciente em movimentos simples e relaxados.",
        icon: "🖐️",
        lessons: [
          {
            number: 13,
            title: "Conheça suas mãos",
            focus: "Consciência corporal",
            objective: "Identificar dedos e explorar abrir, fechar, levantar e pousar a mão.",
            duration: "20 min",
          },
          {
            number: 14,
            title: "Um dedo de cada vez",
            focus: "Independência inicial",
            objective: "Tocar sons isolados com diferentes dedos sem exigir técnica formal.",
            duration: "20 min",
          },
          {
            number: 15,
            title: "Direita e esquerda",
            focus: "Lateralidade",
            objective: "Alternar mãos em jogos simples de pergunta e resposta.",
            duration: "25 min",
          },
          {
            number: 16,
            title: "Dedos em sequência",
            focus: "Coordenação",
            objective: "Reproduzir pequenos padrões de 2 e 3 dedos.",
            duration: "25 min",
          },
        ],
      },
      {
        id: "ouvido-imitacao",
        title: "Ouvido e imitação",
        subtitle: "Escutar e responder",
        outcome: "Repetir pequenos padrões sonoros e começar a antecipar sequências.",
        icon: "🧠",
        lessons: [
          {
            number: 17,
            title: "Repita um som",
            focus: "Memória auditiva",
            objective: "Ouvir um som e responder com um som semelhante no piano.",
            duration: "20 min",
          },
          {
            number: 18,
            title: "Repita dois sons",
            focus: "Sequência auditiva",
            objective: "Memorizar e repetir padrões de duas notas ou dois registros.",
            duration: "25 min",
          },
          {
            number: 19,
            title: "Som + ritmo",
            focus: "Integração",
            objective: "Combinar altura aproximada e ritmo simples numa resposta musical.",
            duration: "25 min",
          },
          {
            number: 20,
            title: "Pergunta e resposta",
            focus: "Criatividade",
            objective: "Responder musicalmente a uma pequena frase criada pelo professor.",
            duration: "25 min",
          },
        ],
      },
      {
        id: "mini-musicas",
        title: "Mini músicas e histórias",
        subtitle: "Transformar habilidade em música",
        outcome: "Tocar pequenas sequências com intenção e participar de uma mini apresentação.",
        icon: "🌟",
        lessons: [
          {
            number: 21,
            title: "Animais no piano",
            focus: "Som e imaginação",
            objective: "Criar sons para personagens usando grave, agudo, forte e suave.",
            duration: "25 min",
          },
          {
            number: 22,
            title: "Minha música de 3 sons",
            focus: "Sequência musical",
            objective: "Tocar e repetir uma pequena música usando três pontos do teclado.",
            duration: "25 min",
          },
          {
            number: 23,
            title: "Maria e o cordeirinho",
            focus: "História musical",
            objective: "Acompanhar uma história com notas e padrões simplificados no piano.",
            duration: "30 min",
          },
          {
            number: 24,
            title: "Meu primeiro concerto",
            focus: "Consolidação",
            objective: "Rever habilidades favoritas e tocar uma pequena sequência para alguém.",
            duration: "30 min",
          },
        ],
      },
    ],
  },

  "5-8": {
    age: "5-8",
    label: "5 a 8 anos",
    name: "Piano Infantil Estruturado",
    duration: "6 meses · 24 aulas",
    lessonLength: "35–45 min por aula",
    philosophy:
      "Construir técnica, leitura, ouvido e musicalidade ao mesmo tempo, mantendo cada conceito ligado a uma experiência prática e lúdica.",
    finalOutcome:
      "A criança orienta-se no teclado, lê padrões e notas básicas, controla ritmo e articulação, toca com as duas mãos em nível inicial e apresenta pequenas peças com musicalidade.",
    modules: [
      {
        id: "fundamentos",
        title: "Fundamentos do piano",
        subtitle: "Corpo, mãos e teclado",
        outcome: "Criar uma base física e visual correta para tocar.",
        icon: "🎹",
        lessons: [
          {
            number: 1,
            title: "Postura e posição",
            focus: "Ergonomia",
            objective: "Sentar, alinhar braços e apoiar as mãos de forma relaxada.",
            duration: "35 min",
          },
          {
            number: 2,
            title: "Os dedos no piano",
            focus: "Dedos 1–5",
            objective: "Reconhecer a numeração dos dedos nas duas mãos e tocar pequenas sequências.",
            duration: "40 min",
            route: "/aulas/dedos",
          },
          {
            number: 3,
            title: "As teclas do piano",
            focus: "Brancas e pretas",
            objective: "Reconhecer o padrão visual de grupos de duas e três teclas pretas.",
            duration: "40 min",
            route: "/aulas/teclas",
          },
          {
            number: 4,
            title: "Encontre o Dó",
            focus: "Orientação",
            objective: "Encontrar todos os Dós usando o grupo de duas teclas pretas como referência.",
            duration: "40 min",
          },
        ],
      },
      {
        id: "ritmo-leitura",
        title: "Ritmo e leitura inicial",
        subtitle: "Sentir, contar e reconhecer",
        outcome: "Manter pulsação e ler figuras rítmicas fundamentais.",
        icon: "🥁",
        lessons: [
          {
            number: 5,
            title: "Pulsação e semínima",
            focus: "1 tempo",
            objective: "Manter pulsação e reconhecer a semínima como unidade de um tempo.",
            duration: "40 min",
          },
          {
            number: 6,
            title: "Mínima e pausa",
            focus: "2 tempos e silêncio",
            objective: "Sustentar dois tempos e respeitar pausas simples.",
            duration: "40 min",
          },
          {
            number: 7,
            title: "Compasso de 4 tempos",
            focus: "Organização rítmica",
            objective: "Agrupar pulsações em compassos simples de quatro tempos.",
            duration: "40 min",
          },
          {
            number: 8,
            title: "Desafio de ritmos",
            focus: "Leitura aplicada",
            objective: "Ler, bater e tocar pequenas frases combinando semínimas, mínimas e pausas.",
            duration: "45 min",
          },
        ],
      },
      {
        id: "primeiras-notas",
        title: "Primeiras notas e pauta",
        subtitle: "Do teclado para a leitura",
        outcome: "Relacionar notas do teclado com padrões básicos de leitura musical.",
        icon: "🎼",
        lessons: [
          {
            number: 9,
            title: "Dó, Ré e Mi",
            focus: "3 notas",
            objective: "Localizar, ouvir e tocar Dó, Ré e Mi em pequenas melodias.",
            duration: "40 min",
          },
          {
            number: 10,
            title: "Fá e Sol",
            focus: "Padrão de 5 notas",
            objective: "Completar Dó–Ré–Mi–Fá–Sol e reconhecer movimento ascendente e descendente.",
            duration: "40 min",
          },
          {
            number: 11,
            title: "A pauta e a clave de Sol",
            focus: "Leitura visual",
            objective: "Entender linhas, espaços e a função da clave de Sol sem memorização excessiva.",
            duration: "45 min",
          },
          {
            number: 12,
            title: "Passos e saltos",
            focus: "Leitura por padrão",
            objective: "Reconhecer notas repetidas, movimentos por grau conjunto e pequenos saltos.",
            duration: "45 min",
          },
        ],
      },
      {
        id: "coordenacao-articulacao",
        title: "Coordenação e articulação",
        subtitle: "Fazer as mãos trabalharem melhor",
        outcome: "Controlar padrões simples com ambas as mãos e duas articulações básicas.",
        icon: "🤲",
        lessons: [
          {
            number: 13,
            title: "Padrão de 5 dedos — direita",
            focus: "Mão direita",
            objective: "Tocar um padrão de cinco dedos com estabilidade e relaxamento.",
            duration: "40 min",
          },
          {
            number: 14,
            title: "Mão esquerda e clave de Fá",
            focus: "Mão esquerda",
            objective: "Introduzir orientação da mão esquerda e referência básica da clave de Fá.",
            duration: "45 min",
          },
          {
            number: 15,
            title: "Legato e staccato",
            focus: "Articulação",
            objective: "Distinguir e executar sons ligados e destacados.",
            duration: "40 min",
          },
          {
            number: 16,
            title: "Duas mãos juntas",
            focus: "Coordenação bilateral",
            objective: "Tocar padrões curtos com as duas mãos em simultâneo ou alternância organizada.",
            duration: "45 min",
          },
        ],
      },
      {
        id: "tecnica-harmonia",
        title: "Técnica e harmonia",
        subtitle: "Escalas, intervalos e acordes",
        outcome: "Começar a compreender como notas se organizam em padrões e harmonia.",
        icon: "✨",
        lessons: [
          {
            number: 17,
            title: "Pentacorde de Dó",
            focus: "Técnica de 5 notas",
            objective: "Tocar Dó–Ré–Mi–Fá–Sol com dedilhado estável nas duas mãos separadamente.",
            duration: "45 min",
          },
          {
            number: 18,
            title: "Escala de Dó maior",
            focus: "1 oitava",
            objective: "Introduzir a passagem do polegar e a ideia de escala de uma oitava de forma gradual.",
            duration: "45 min",
          },
          {
            number: 19,
            title: "Intervalos",
            focus: "2ª, 3ª e 5ª",
            objective: "Reconhecer visual e auditivamente distâncias simples entre notas.",
            duration: "45 min",
          },
          {
            number: 20,
            title: "Acordes C, F e G",
            focus: "Harmonia inicial",
            objective: "Construir e ouvir os acordes principais de Dó maior em formato adequado à idade.",
            duration: "45 min",
          },
        ],
      },
      {
        id: "musicalidade-performance",
        title: "Musicalidade e performance",
        subtitle: "Transformar notas em música",
        outcome: "Aplicar ouvido, dinâmica, fraseado e segurança numa pequena apresentação.",
        icon: "🏆",
        lessons: [
          {
            number: 21,
            title: "Ouça e responda",
            focus: "Treino auditivo",
            objective: "Imitar pequenas sequências melódicas e rítmicas sem depender da pauta.",
            duration: "40 min",
          },
          {
            number: 22,
            title: "Dinâmica e fraseado",
            focus: "Expressão",
            objective: "Usar forte, piano e direção de frase para tocar de forma expressiva.",
            duration: "45 min",
          },
          {
            number: 23,
            title: "Maria Tinha um Cordeirinho",
            focus: "Peça guiada",
            objective: "Tocar uma peça completa ligando leitura, dedilhado, ritmo e expressão.",
            duration: "45 min",
          },
          {
            number: 24,
            title: "Meu primeiro recital",
            focus: "Performance e revisão",
            objective: "Preparar, tocar e concluir uma pequena apresentação com autonomia crescente.",
            duration: "45 min",
          },
        ],
      },
    ],
  },
};

export function getCurriculum(age: string | undefined) {
  return curriculum[age === "2-4" ? "2-4" : "5-8"];
}
