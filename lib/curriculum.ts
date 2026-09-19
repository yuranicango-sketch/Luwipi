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
        id:"mes-1-descoberta", title:"Mês 1 · O piano ganha vida", subtitle:"Ouvir, imaginar e descobrir", outcome:"A criança percebe contrastes sonoros e começa a tratar o piano como um mundo que consegue explorar.", icon:"🌟",
        lessons:[
          L(1,"O piano fala","Primeiro encontro","Conhecer o piano e descobrir sons grandões e pequeninos.","20 min"),
          L(2,"Elefante e passarinho","Grave e agudo","Encontrar duas vozes muito diferentes no piano.","20 min"),
          L(3,"Onde mora o som?","Localização","Levar cada personagem para a região onde a sua voz mora.","20 min"),
          L(4,"Leão e coelhinho","Forte e suave","Fazer duas vozes sem bater nas teclas.","20 min"),
          L(5,"Gigante e formiguinha","Contrastes","Juntar tamanho, movimento e som.","20 min"),
          L(6,"Fita e bolinha","Longo e curto","Ouvir um som que fica e outro que pula.","20 min"),
          L(7,"Tum-tum","Pulso","Sentir um andar regular com corpo e piano.","20 min"),
          L(8,"O ursinho dorme","Som e silêncio","Tocar, parar e escutar o silêncio.","20 min"),
        ],
      },
      {
        id:"mes-2-eu-mando", title:"Mês 2 · Eu mando no som", subtitle:"Imitar, acelerar, parar e encontrar", outcome:"A criança começa a controlar quando, onde e como o som acontece.", icon:"🚂",
        lessons:[
          L(9,"O eco","Imitação","Copiar uma ideia curtinha de palmas e piano.","20 min"),
          L(10,"Tartaruga e coelhinho","Devagar e rápido","Mudar claramente entre duas velocidades.","20 min"),
          L(11,"Estátua musical","Tocar e parar","Parar no sinal e voltar sem perder a brincadeira.","20 min"),
          L(12,"Festa do ritmo","Juntar habilidades","Usar pulso, eco, velocidade e silêncio numa festa.","25 min"),
          L(13,"Duas famílias","Brancas e pretas","Descobrir as duas famílias de teclas.","20 min"),
          L(14,"Casinhas de 2 e 3","Mapa do teclado","Encontrar grupos de duas e três pretas.","20 min"),
          L(15,"O gigante passeia","Região grave","Passear com segurança pelo lado grave.","20 min"),
          L(16,"O passarinho canta","Região aguda","Passear e comparar o lado agudo.","20 min"),
        ],
      },
      {
        id:"mes-3-minhas-maos", title:"Mês 3 · Minhas mãos tocam", subtitle:"Do movimento aos primeiros caminhos", outcome:"A criança começa a orientar-se no teclado e a usar mãos e dedos sem tensão.", icon:"🖐️",
        lessons:[
          L(17,"O balão","Subir e descer","Seguir caminhos que sobem e descem.","20 min"),
          L(18,"Caça ao tesouro","Orientação","Usar pistas conhecidas para encontrar lugares no teclado.","20 min"),
          L(19,"A tartaruguinha da mão","Mão relaxada","Pousar a mão sem apertar.","20 min"),
          L(20,"Acorda, dedinho!","Dedos 1, 2 e 3","Reconhecer e mover os primeiros dedos.","20 min"),
          L(21,"A campainha","Um dedo de cada vez","Fazer um toque isolado e descansar.","20 min"),
          L(22,"Duas mãos dizem olá","Alternância","Dar uma vez a cada mão.","20 min"),
          L(23,"Passinhos dos dedos","Pequena sequência","Fazer dois ou três passos confortáveis.","20 min"),
          L(24,"A ponte do ursinho","Coordenação","Usar as mãos para completar um pequeno caminho.","25 min"),
        ],
      },
      {
        id:"mes-4-ouvir-lembrar", title:"Mês 4 · Eu ouço e lembro", subtitle:"Escutar, copiar e responder", outcome:"A criança desenvolve memória auditiva curta e começa a responder musicalmente sem depender sempre de demonstração visual.", icon:"👂",
        lessons:[
          L(25,"O sininho escondido","Escuta e procura","Procurar um som parecido com o que ouviu.","20 min"),
          L(26,"Duas formiguinhas","Ordem de dois sons","Guardar e repetir dois sons em ordem.","20 min"),
          L(27,"O sapinho","Ritmo","Levar uma brincadeira de palmas para o piano.","20 min"),
          L(28,"Quem vem primeiro?","Memória de contrastes","Repetir a ordem de dois personagens sonoros.","20 min"),
          L(29,"Telefone musical","Turnos","Escutar uma chamada e responder.","20 min"),
          L(30,"Caixa surpresa","Memória","Reconhecer brincadeiras já aprendidas.","20 min"),
          L(31,"Carrinhos coloridos","Cor e lugar","Associar três cores a três teclas.","20 min"),
          L(32,"Trem de dois vagões","Sequência visual","Tocar duas cores na ordem mostrada.","20 min"),
        ],
      },
      {
        id:"mes-5-minha-musica", title:"Mês 5 · Eu consigo tocar uma música", subtitle:"Ver, organizar e tocar", outcome:"A criança transforma cores e pequenas sequências em música com começo e fim.", icon:"🚂",
        lessons:[
          L(33,"Trem de três vagões","Sequência de três","Seguir três cores no piano.","20 min"),
          L(34,"Gémeos ou surpresa?","Comparação","Perceber quando uma sequência ficou igual ou mudou.","20 min"),
          L(35,"A ponte com buraco","Completar","Escolher o som que completa um caminho.","20 min"),
          L(36,"O Trenzinho das Cores","Mini música","Tocar a música do módulo do começo ao fim com apoio.","25 min"),
          L(37,"O zoológico","Expressão","Dar vozes diferentes a personagens conhecidos.","20 min"),
          L(38,"A chuva e o sol","História sonora","Construir uma história com chuva, trovão, silêncio e sol.","20 min"),
          L(39,"O trem e a estação","Pulso e forma","Manter o trem andando e parar na estação.","20 min"),
          L(40,"Estrelinha","Repertório","Participar de uma canção conhecida em pequenos trechos.","25 min"),
        ],
      },
      {
        id:"mes-6-pequeno-musico", title:"Mês 6 · Eu sou pequeno músico", subtitle:"Escolher, tocar e compartilhar", outcome:"A criança usa o que aprendeu para tocar, criar, escolher repertório e participar de uma pequena apresentação.", icon:"🌟",
        lessons:[
          L(41,"Onde está o cordeirinho?","Repertório","Participar de Maria Tinha um Cordeirinho por pequenos trechos.","25 min"),
          L(42,"A viagem do barquinho","Criação","Criar uma história sonora com começo, aventura e chegada.","25 min"),
          L(43,"Baú dos favoritos","Escolha","Revisitar duas experiências preferidas.","20 min"),
          L(44,"O meu ritmo","Criação rítmica","Escolher, repetir e inventar um ritmo curto.","20 min"),
          L(45,"Bola musical","Dueto","Esperar, responder e tocar junto com o professor.","25 min"),
          L(46,"Esta é a minha música","Repertório pessoal","Escolher a música que quer apresentar.","25 min"),
          L(47,"Concerto para o boneco","Pré-apresentação","Tocar para um público de brincadeira sem interrupções.","25 min"),
          L(48,"A minha festa no piano","Celebração","Compartilhar uma música e uma brincadeira favoritas.","25 min"),
        ],
      },
    ],  },

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
