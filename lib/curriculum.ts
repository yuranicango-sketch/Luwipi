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

const L = (number: number, title: string, focus: string, objective: string, duration: string, route?: string): CurriculumLesson => ({ number, title, focus, objective, duration, ...(route ? { route } : {}) });

export const curriculum: Record<AgeGroup, CurriculumProgram> = {
  "2-4": {
    age: "2-4",
    label: "2 a 4 anos",
    name: "Iniciação Musical com Piano",
    duration: "6 meses · 24 semanas · 48 aulas · 2 por semana",
    lessonLength: "20–30 min por aula",
    philosophy: "Aprender música brincando: ouvir, mover, imitar, explorar, interagir com o Luwipi e levar imediatamente a descoberta para o piano físico.",
    finalOutcome: "A criança reconhece contrastes sonoros, sente pulsação, orienta-se no teclado, coordena movimentos simples, imita padrões e participa de pequenas músicas e histórias no piano.",
    modules: [
      {
        id: "descoberta-sonora",
        title: "Descoberta dos sons",
        subtitle: "Ouvir, comparar e brincar",
        outcome: "Reconhecer contrastes básicos do som e associá-los a personagens, gestos e regiões do piano.",
        icon: "👂",
        lessons: [
          L(1,"O piano faz sons","Exploração livre guiada","Descobrir diferentes regiões e gestos do piano.","20 min","/aulas/sons"),
          L(2,"Elefante e passarinho","Grave e agudo","Distinguir grave e agudo por audição, movimento e piano.","20 min"),
          L(3,"Onde mora o som?","Consolidação de altura","Procurar no teclado sons parecidos com os personagens.","20 min"),
          L(4,"Leão e coelhinho","Forte e suave","Perceber e reproduzir contrastes de intensidade com controle.","20 min"),
          L(5,"Pés de gigante, pés de formiga","Consolidação de dinâmica","Transformar forte e suave em gesto, movimento e toque.","20 min"),
          L(6,"Som comprido, som curtinho","Duração e revisão","Ouvir, representar e revisar os quatro contrastes principais.","20 min"),
        ],
      },
      {
        id: "ritmo-movimento",
        title: "Pulso e movimento",
        subtitle: "Sentir antes de contar",
        outcome: "Manter pulsação e responder fisicamente a padrões rítmicos curtos.",
        icon: "👏",
        lessons: [
          L(7,"O coração da música","Pulsação","Manter uma pulsação simples com passos, palmas e piano.","25 min","/aulas/ritmo"),
          L(8,"Siga o tambor","Pulsação em movimento","Caminhar, parar e tocar seguindo uma pulsação estável.","25 min"),
          L(9,"Eco de palmas","Imitação rítmica","Repetir padrões curtos de duas a quatro pulsações.","25 min"),
          L(10,"Rápido e devagar","Andamento","Distinguir e acompanhar dois andamentos contrastantes.","20 min"),
          L(11,"Pare e continue","Silêncio e controle","Responder a sinais de início, pausa e continuação.","20 min"),
          L(12,"Festa do ritmo","Consolidação","Juntar pulsação, eco, rápido/devagar e silêncio em um jogo.","25 min"),
        ],
      },
      {
        id: "mapa-piano",
        title: "Explorando o piano",
        subtitle: "Descobrir onde os sons moram",
        outcome: "Orientar-se visualmente no teclado usando padrões simples e contrastes de registro.",
        icon: "🎹",
        lessons: [
          L(13,"Brancas e pretas","Geografia do teclado","Reconhecer visualmente teclas brancas e pretas.","20 min"),
          L(14,"Casas de 2 e 3","Grupos pretos","Encontrar grupos de duas e três teclas pretas.","25 min"),
          L(15,"Casa do grave","Registro grave","Explorar a região grave com histórias e personagens.","20 min"),
          L(16,"Casa do agudo","Registro agudo","Explorar a região aguda e comparar com a região grave.","20 min"),
          L(17,"Subir e descer","Direção sonora","Associar direita/esquerda e subir/descer à altura sonora.","20 min"),
          L(18,"Caça ao tesouro no teclado","Orientação","Resolver pequenas missões de localização no piano.","25 min"),
        ],
      },
      {
        id: "maos-dedos",
        title: "Mãos e dedos",
        subtitle: "Coordenação sem pressão",
        outcome: "Usar mãos e dedos de forma consciente, relaxada e progressivamente coordenada.",
        icon: "🖐️",
        lessons: [
          L(19,"Conheça suas mãos","Consciência corporal","Abrir, fechar, levantar e pousar as mãos de forma relaxada.","20 min"),
          L(20,"Dedinhos acordando","Mobilidade","Mover e nomear dedos através de brincadeiras e canções curtas.","20 min"),
          L(21,"Um dedo de cada vez","Independência inicial","Tocar sons isolados com diferentes dedos sem rigidez.","20 min"),
          L(22,"Direita e esquerda","Lateralidade","Alternar mãos em jogos de pergunta e resposta.","25 min"),
          L(23,"Dois e três dedinhos","Pequenos padrões","Reproduzir padrões simples usando dois ou três dedos.","25 min"),
          L(24,"A ponte dos dedos","Consolidação motora","Combinar mão, dedo e direção em uma história de movimento.","25 min"),
        ],
      },
      {
        id: "ouvido-imitacao",
        title: "Ouvido e imitação",
        subtitle: "Escutar e responder",
        outcome: "Repetir pequenos padrões e desenvolver memória auditiva de forma lúdica.",
        icon: "🧠",
        lessons: [
          L(25,"Repita um som","Memória auditiva","Ouvir um som e responder com outro semelhante no piano.","20 min"),
          L(26,"Repita dois sons","Sequência auditiva","Memorizar e repetir padrões de dois sons.","25 min"),
          L(27,"Eco de ritmo","Memória rítmica","Repetir pequenos padrões de palmas e teclas.","25 min"),
          L(28,"Eco grave e agudo","Altura + memória","Repetir sequências simples usando regiões graves e agudas.","25 min"),
          L(29,"Pergunta e resposta","Criatividade guiada","Responder musicalmente a uma frase curta do professor.","25 min"),
          L(30,"Jogo da memória musical","Consolidação auditiva","Reconhecer e repetir combinações já aprendidas.","25 min"),
        ],
      },
      {
        id: "cores-padroes",
        title: "Cores, padrões e sequências",
        subtitle: "Ver, lembrar e tocar",
        outcome: "Usar cores e formas para organizar pequenas sequências musicais sem depender de pauta.",
        icon: "🌈",
        lessons: [
          L(31,"Cada cor tem um lugar","Associação visual","Relacionar cores a pontos específicos do teclado.","25 min"),
          L(32,"Duas cores","Sequência de 2 elementos","Seguir e repetir padrões de duas cores.","25 min"),
          L(33,"Três cores","Sequência de 3 elementos","Seguir e memorizar padrões de três cores.","25 min"),
          L(34,"Igual ou diferente?","Comparação","Perceber quando uma sequência se repete ou muda.","25 min"),
          L(35,"Complete o caminho","Antecipação","Escolher qual cor/som vem a seguir em padrões simples.","25 min"),
          L(36,"O Passeio das Cores","Mini música original","Tocar uma pequena sequência colorida com começo e fim.","30 min"),
        ],
      },
      {
        id: "historias-musicas",
        title: "Histórias e pequenas músicas",
        subtitle: "Transformar habilidade em imaginação",
        outcome: "Participar de histórias musicais e tocar mini peças com intenção.",
        icon: "📖",
        lessons: [
          L(37,"Animais no piano","Som e imaginação","Criar sons para personagens usando os contrastes aprendidos.","25 min"),
          L(38,"A chuva chegou","Paisagem sonora","Criar chuva, vento e trovão com diferentes gestos no piano.","25 min"),
          L(39,"O trem musical","Pulso e sequência","Acompanhar uma história mantendo pulso e pequenas sequências.","25 min"),
          L(40,"Estrelinha no céu","Melodia tradicional simplificada","Seguir uma pequena história visual com sons guiados.","30 min"),
          L(41,"Maria e o cordeirinho","História musical","Ajudar o cordeirinho a avançar através de padrões simples.","30 min"),
          L(42,"Minha história sonora","Criação","Escolher personagens e criar uma pequena sequência musical.","30 min"),
        ],
      },
      {
        id: "consolidacao-performance",
        title: "Consolidação e mini performance",
        subtitle: "Repetir, escolher e compartilhar",
        outcome: "Rever habilidades favoritas e participar de uma pequena apresentação com confiança.",
        icon: "🌟",
        lessons: [
          L(43,"Meus sons favoritos","Revisão escolhida","Revisar contrastes e atividades preferidas da criança.","25 min"),
          L(44,"Meu ritmo favorito","Revisão rítmica","Revisar pulsação e padrões através de um jogo escolhido.","25 min"),
          L(45,"Dueto com o professor","Interação musical","Alternar e combinar pequenas frases com o professor.","30 min"),
          L(46,"Escolha sua mini música","Preparação","Selecionar uma sequência ou história para apresentar.","30 min"),
          L(47,"Ensaio divertido","Repetição positiva","Repetir sem pressão, reforçando começo, meio e fim.","30 min"),
          L(48,"Meu primeiro concerto","Performance","Compartilhar uma pequena experiência musical com alguém.","30 min"),
        ],
      },
    ],
  },

  "5-8": {
    age: "5-8",
    label: "5 a 8 anos",
    name: "Piano Infantil Estruturado",
    duration: "6 meses · 24 semanas · 48 aulas · 2 por semana",
    lessonLength: "35–45 min por aula",
    philosophy: "Construir técnica, leitura, ouvido, criatividade e repertório ao mesmo tempo, sempre usando histórias, desafios visuais e interação para manter a experiência infantil.",
    finalOutcome: "A criança orienta-se no teclado, lê padrões e notas básicas, controla ritmo e articulação, toca com as duas mãos em nível inicial, acompanha harmonias simples e apresenta pequenas peças com musicalidade.",
    modules: [
      {
        id: "fundamentos",
        title: "Conhecendo o piano",
        subtitle: "Corpo, mãos e teclado",
        outcome: "Criar uma base física e visual correta para tocar com confiança.",
        icon: "🎹",
        lessons: [
          L(1,"Postura de pianista","Ergonomia","Sentar, alinhar braços e apoiar as mãos de forma relaxada.","35 min"),
          L(2,"Os dedos no piano","Dedos 1–5","Reconhecer a numeração dos dedos e tocar pequenas sequências.","40 min","/aulas/dedos"),
          L(3,"As teclas do piano","Brancas e pretas","Reconhecer grupos de duas e três teclas pretas.","40 min","/aulas/teclas"),
          L(4,"Encontre o Dó","Orientação","Encontrar os Dós usando o grupo de duas teclas pretas.","40 min"),
          L(5,"Grave, médio e agudo","Registros","Orientar-se em três regiões do teclado pelo ouvido e pela visão.","40 min"),
          L(6,"Missão: mapa do piano","Consolidação","Revisar postura, dedos, grupos pretos, Dó e registros em desafios.","45 min"),
        ],
      },
      {
        id: "ritmo",
        title: "Ritmo fundamental",
        subtitle: "Sentir, contar e ler",
        outcome: "Manter pulsação e ler combinações rítmicas fundamentais.",
        icon: "🥁",
        lessons: [
          L(7,"Pulsação e semínima","1 tempo","Manter pulsação e reconhecer a semínima.","40 min"),
          L(8,"Mínima","2 tempos","Sustentar dois tempos de forma estável.","40 min"),
          L(9,"Pausa e silêncio","Controle rítmico","Respeitar pausas sem perder a pulsação.","40 min"),
          L(10,"Semibreve","4 tempos","Sentir e sustentar quatro tempos.","40 min"),
          L(11,"Compasso de 4 tempos","Organização","Agrupar pulsos em compassos simples de quatro tempos.","40 min"),
          L(12,"Desafio rítmico","Consolidação","Ler, bater e tocar frases combinando figuras já aprendidas.","45 min"),
        ],
      },
      {
        id: "notas-leitura",
        title: "Primeiras notas e leitura",
        subtitle: "Do teclado para a pauta",
        outcome: "Relacionar notas do teclado com leitura por padrões e referências visuais.",
        icon: "🎼",
        lessons: [
          L(13,"Dó, Ré e Mi","3 notas","Localizar e tocar Dó, Ré e Mi em pequenas melodias.","40 min"),
          L(14,"Fá e Sol","Pentacorde","Completar Dó–Ré–Mi–Fá–Sol e reconhecer direção.","40 min"),
          L(15,"A pauta e a clave de Sol","Leitura visual","Entender linhas, espaços e a função da clave de Sol.","45 min"),
          L(16,"Passos e saltos","Leitura por padrão","Reconhecer repetição, grau conjunto e pequenos saltos.","45 min"),
          L(17,"Leia e encontre","Pauta + teclado","Transformar pequenos padrões escritos em posições no teclado.","45 min"),
          L(18,"Minha primeira melodia lida","Aplicação","Tocar uma pequena melodia usando leitura guiada.","45 min"),
        ],
      },
      {
        id: "coordenacao",
        title: "Coordenação e articulação",
        subtitle: "Fazer as mãos trabalharem melhor",
        outcome: "Controlar padrões simples com ambas as mãos e articulações básicas.",
        icon: "🤲",
        lessons: [
          L(19,"Cinco dedos — mão direita","Técnica básica","Tocar um padrão de cinco dedos com estabilidade.","40 min"),
          L(20,"Cinco dedos — mão esquerda","Técnica básica","Tocar padrão equivalente com a mão esquerda.","40 min"),
          L(21,"Legato","Articulação ligada","Conectar sons mantendo a mão relaxada.","40 min"),
          L(22,"Staccato","Articulação destacada","Executar sons curtos com movimento controlado.","40 min"),
          L(23,"Mãos alternadas","Coordenação bilateral","Alternar pequenas frases entre as mãos.","45 min"),
          L(24,"Primeiros momentos com duas mãos","Coordenação conjunta","Tocar padrões muito simples com as duas mãos.","45 min"),
        ],
      },
      {
        id: "tecnica-harmonia",
        title: "Técnica e harmonia",
        subtitle: "Padrões que fazem a música funcionar",
        outcome: "Entender escalas, intervalos e acordes através de aplicações práticas.",
        icon: "✨",
        lessons: [
          L(25,"Pentacorde de Dó","5 notas","Tocar Dó–Ré–Mi–Fá–Sol com dedilhado estável.","45 min"),
          L(26,"Escala de Dó maior","1 oitava","Introduzir passagem do polegar e forma da escala.","45 min"),
          L(27,"Intervalos: 2ª e 3ª","Distância","Reconhecer visual e auditivamente segundas e terças.","45 min"),
          L(28,"Intervalos: 4ª e 5ª","Distância","Reconhecer quartas e quintas em pequenos desafios.","45 min"),
          L(29,"Acordes C, F e G","Harmonia inicial","Construir e ouvir os acordes principais de Dó maior.","45 min"),
          L(30,"Acompanhamento simples","Aplicação harmônica","Usar acordes ou notas-base para acompanhar uma melodia curta.","45 min"),
        ],
      },
      {
        id: "ouvido-criatividade",
        title: "Ouvido e criatividade",
        subtitle: "Escutar, inventar e lembrar",
        outcome: "Desenvolver ouvido interno, memória e confiança para criar pequenas ideias musicais.",
        icon: "🧠",
        lessons: [
          L(31,"Eco melódico","Treino auditivo","Imitar pequenas sequências melódicas.","40 min"),
          L(32,"Subiu, desceu ou repetiu?","Direção melódica","Reconhecer movimento sonoro sem depender da pauta.","40 min"),
          L(33,"Improviso nas teclas pretas","Improvisação","Criar livremente dentro de um espaço sonoro seguro.","40 min"),
          L(34,"Pergunta e resposta","Fraseado criativo","Criar respostas musicais para frases do professor.","45 min"),
          L(35,"Minha música de 4 compassos","Composição inicial","Organizar uma ideia curta com começo, repetição e final.","45 min"),
          L(36,"Tocar de memória","Memória musical","Memorizar uma pequena sequência usando padrões e audição.","45 min"),
        ],
      },
      {
        id: "repertorio-musicalidade",
        title: "Repertório e musicalidade",
        subtitle: "Transformar notas em música",
        outcome: "Aplicar dinâmica, fraseado, tempo e expressão em peças adequadas à idade.",
        icon: "🎵",
        lessons: [
          L(37,"Forte, piano e crescendo","Dinâmica","Controlar diferentes níveis de intensidade de forma musical.","45 min"),
          L(38,"Frases que respiram","Fraseado","Identificar e tocar pequenas frases com direção.","45 min"),
          L(39,"Tempo certo","Andamento","Manter andamento estável e reconhecer quando acelerar ou desacelerar.","45 min"),
          L(40,"Brilha, Brilha, Estrelinha","Repertório tradicional","Aprender uma peça conhecida com história e progressão visual.","45 min"),
          L(41,"Maria Tinha um Cordeirinho","Peça guiada","Ligar leitura, dedilhado, ritmo e expressão numa peça completa.","45 min"),
          L(42,"Peça Luwipi: aventura musical","Repertório original","Aprender uma música original com ilustrações e pequenas missões.","45 min"),
        ],
      },
      {
        id: "performance",
        title: "Performance e consolidação",
        subtitle: "Preparar, tocar e compartilhar",
        outcome: "Preparar duas ou três peças e concluir o ciclo com autonomia crescente.",
        icon: "🏆",
        lessons: [
          L(43,"Escolha do repertório","Planejamento","Selecionar duas ou três peças adequadas ao aluno.","40 min"),
          L(44,"Conserte os trechos difíceis","Prática inteligente","Isolar e melhorar pequenas dificuldades sem repetir tudo.","45 min"),
          L(45,"Tocar sem parar","Continuidade","Manter a peça fluindo mesmo após pequenos erros.","45 min"),
          L(46,"Memória e presença","Segurança","Memorizar uma peça curta e praticar começar com confiança.","45 min"),
          L(47,"Ensaio e gravação","Autoavaliação","Gravar, assistir e escolher um ponto simples para melhorar.","45 min"),
          L(48,"Meu primeiro recital","Performance","Apresentar o repertório e celebrar a evolução do ciclo.","45 min"),
        ],
      },
    ],
  },
};

export function getCurriculum(age: string | undefined) {
  return curriculum[age === "2-4" ? "2-4" : "5-8"];
}
