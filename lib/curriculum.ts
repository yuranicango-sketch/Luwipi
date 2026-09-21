export type AgeGroup = "2-4" | "5-8" | "adult";

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
    label: "5 a 9 anos",
    name: "Piano Infantil Estruturado · 5–9 anos",
    duration: "6 meses · 24 semanas · 48 aulas · 2 por semana",
    lessonLength: "35–45 min por aula",
    philosophy: "Tocar música desde a primeira semana. Leitura, técnica, ouvido, ritmo e criatividade aparecem dentro de experiências musicais concretas; repertório conhecido é aprendido progressivamente e não confundido com exercício.",
    finalOutcome: "A criança orienta-se no teclado, lê padrões nas duas claves, controla ritmos fundamentais, toca com as duas mãos em nível inicial, usa dinâmica e articulação e apresenta 2–3 peças completas.",
    modules: [
      { id:"fundamentos", title:"Mês 1 · Eu conheço o piano", subtitle:"Corpo, teclado e primeira música", outcome:"A criança encontra referências no teclado, usa os dedos com conforto e termina o mês tocando uma música conhecida em versão inicial.", icon:"🎹", lessons:[
        L(1,"Senta, toca, escuta","Postura + primeiro som","Ajustar banco, pés e braços e produzir sons bonitos sem tensão.","35 min"),
        L(2,"Os cinco dedos têm números","Dedos 1–5","Reconhecer polegar 1 até mindinho 5 nas duas mãos e usar 1–2–3 numa pequena resposta.","35 min","/aulas/dedos"),
        L(3,"As famílias pretas","Grupos de 2 e 3","Encontrar rapidamente grupos de duas e três teclas pretas em todo o piano.","35 min","/aulas/teclas"),
        L(4,"Caça ao Dó","Dó pelo grupo de 2","Encontrar todos os Dós sem autocolantes e escolher um Dó confortável para tocar.","35 min"),
        L(5,"Do grave ao agudo","Mapa sonoro","Percorrer grave, médio e agudo e reconhecer a direção pelo ouvido.","35 min"),
        L(6,"Passos no teclado","Repete, sobe, desce","Tocar pequenos padrões de notas repetidas e passos vizinhos sem precisar de pauta.","40 min"),
        L(7,"Pulso que não corre","Pulsação","Manter quatro pulsos iguais com corpo, uma tecla e uma pequena frase.","40 min"),
        L(8,"Minha primeira apresentação","Repertório do mês","Tocar a versão aprendida da música do mês com começo, continuidade e final.","40 min"),
      ]},
      { id:"ritmo", title:"Mês 2 · O ritmo organiza a música", subtitle:"Pulso, duração, silêncio e compasso", outcome:"A criança lê e executa ritmos simples sem perder a pulsação e aplica-os ao repertório.", icon:"🥁", lessons:[
        L(9,"Um passo por pulso","Semínima","Ler e tocar semínimas como um som por pulsação.","40 min"),
        L(10,"O som fica dois","Mínima","Sustentar uma nota por dois pulsos sem repetir antes da hora.","40 min"),
        L(11,"Silêncio também conta","Pausa","Contar uma pausa sem perder o lugar do próximo som.","40 min"),
        L(12,"O som fica quatro","Semibreve","Sustentar quatro pulsos e ouvir o som desaparecer naturalmente.","40 min"),
        L(13,"Dois sons dentro do pulso","Colcheias em pares","Dividir um pulso em dois sons iguais usando fala, palmas e piano.","40 min"),
        L(14,"Caixas de quatro","Compasso 4/4","Agrupar pulsos em compassos de quatro e sentir o primeiro pulso.","40 min"),
        L(15,"Caixas de três","Compasso 3/4","Sentir três pulsos por compasso e comparar com 4/4.","40 min"),
        L(16,"Ritmo vira música","Repertório do mês","Ler combinações do mês e reconhecê-las dentro da música conhecida.","45 min"),
      ]},
      { id:"notas-leitura", title:"Mês 3 · A pauta começa a falar", subtitle:"Referências, direção e leitura musical", outcome:"A criança lê por pontos de referência e padrões, em vez de decorar notas isoladas.", icon:"🎼", lessons:[
        L(17,"A pauta é um mapa","Linhas e espaços","Perceber que subir no papel corresponde a subir no teclado e vice-versa.","40 min"),
        L(18,"Dó central","Primeira referência","Localizar o Dó central no teclado e na grande pauta.","40 min"),
        L(19,"Clave de Sol: encontra o Sol","Referência da mão direita","Usar o Sol como ponto de referência para ler notas próximas.","40 min"),
        L(20,"Clave de Fá: encontra o Fá","Referência da mão esquerda","Usar o Fá como ponto de referência para ler notas próximas.","40 min"),
        L(21,"Passo, salto ou repetição?","Leitura por padrão","Identificar visualmente e tocar repetição, grau conjunto e pequenos saltos.","40 min"),
        L(22,"Lê sem escrever nomes","Leitura aplicada","Ler uma frase curta usando referências, direção e intervalos sem anotar letras.","45 min"),
        L(23,"Duas claves, um só mapa","Grande pauta","Relacionar mão direita, mão esquerda e Dó central numa leitura curta.","45 min"),
        L(24,"A música sai do papel","Repertório do mês","Tocar uma versão simples da música do mês usando a partitura como guia.","45 min"),
      ]},
      { id:"coordenacao", title:"Mês 4 · As mãos trabalham juntas", subtitle:"Técnica, articulação e coordenação", outcome:"A criança controla pequenas frases com cada mão e começa a combiná-las sem rigidez.", icon:"🤲", lessons:[
        L(25,"Cinco dedos confortáveis","Pentacorde","Tocar cinco notas vizinhas com dedos 1–5 mantendo mão e pulso soltos.","40 min"),
        L(26,"Mão direita conta uma história","Frase curta MD","Tocar uma frase de cinco dedos com direção e final claro.","40 min"),
        L(27,"Mão esquerda responde","Frase curta ME","Tocar uma resposta simples com a mão esquerda mantendo o mesmo pulso.","40 min"),
        L(28,"Som ligado","Legato","Ligar notas transferindo o peso de um dedo para o seguinte.","40 min"),
        L(29,"Som saltitante","Staccato","Fazer sons curtos e leves sem endurecer dedos ou pulso.","40 min"),
        L(30,"Uma mão de cada vez","Alternância","Alternar frases entre as mãos sem perder a contagem.","45 min"),
        L(31,"Primeiros encontros","Duas mãos","Tocar notas longas numa mão enquanto a outra faz uma frase curta.","45 min"),
        L(32,"Duas mãos na música","Repertório do mês","Aplicar a coordenação do mês numa versão simples da música conhecida.","45 min"),
      ]},
      { id:"tecnica-harmonia", title:"Mês 5 · A música ganha forma", subtitle:"Escala, intervalos, acordes e expressão", outcome:"A criança entende padrões que constroem melodias e harmonias e começa a usá-los musicalmente.", icon:"✨", lessons:[
        L(33,"Escada de Dó","Escala adaptada","Explorar Dó maior; 5–6 pode usar pentacorde e 7–8 pode avançar à oitava se estiver sem tensão.","45 min"),
        L(34,"Perto ou longe?","Intervalos","Reconhecer 2ª, 3ª, 4ª e 5ª pela forma, distância e som.","40 min"),
        L(35,"Três notas viram acorde","Tríade","Construir um acorde maior simples e perceber que as notas soam juntas.","45 min"),
        L(36,"C, F e G","Acordes principais","Encontrar e ouvir C, F e G em posições simples.","45 min"),
        L(37,"Forte, piano e crescendo","Dinâmica","Mudar intensidade sem bater nas teclas e criar direção numa frase.","40 min"),
        L(38,"Frases respiram","Fraseado","Perceber pequenas frases e evitar tocar todas as notas com o mesmo peso.","40 min"),
        L(39,"Acorde acompanha","Melodia + apoio","Usar notas-base ou acordes simples para apoiar uma melodia.","45 min"),
        L(40,"Toca como música","Repertório do mês","Juntar técnica, dinâmica, fraseado e acompanhamento na música conhecida.","45 min"),
      ]},
      { id:"performance", title:"Mês 6 · Eu sou pianista", subtitle:"Ouvido, criação, repertório e apresentação", outcome:"A criança usa o que aprendeu para ouvir, criar, estudar e apresentar música com autonomia crescente.", icon:"🏆", lessons:[
        L(41,"Eco de três notas","Ouvido e memória","Ouvir uma frase de três notas e reproduzi-la procurando pelo som.","40 min"),
        L(42,"Pergunta e resposta","Criação","Inventar uma resposta curta que combine com a frase do professor.","40 min"),
        L(43,"Improviso com regras simples","Improvisação","Criar usando um conjunto seguro de notas e um pulso definido.","40 min"),
        L(44,"Minha frase de quatro compassos","Composição","Organizar uma ideia curta com começo, repetição ou contraste e final.","45 min"),
        L(45,"Como estudar um trecho difícil","Prática inteligente","Isolar dois compassos, reduzir o andamento e reconstruir antes de voltar à peça.","45 min"),
        L(46,"Tocar sem parar","Continuidade","Chegar ao final da peça mesmo quando acontece um pequeno erro.","45 min"),
        L(47,"Ensaio e gravação","Preparação","Gravar o repertório e escolher apenas um ou dois pontos concretos para melhorar.","45 min"),
        L(48,"Meu recital Luwipi","Performance","Apresentar duas ou três peças, incluindo o repertório final do ciclo.","45 min"),
      ]},
    ],
  },
  "adult": {
    age: "adult",
    label: "Adultos",
    name: "Piano para Adultos",
    duration: "6 meses · 24 semanas · 48 aulas · 2 por semana",
    lessonLength: "45–60 min por aula",
    philosophy: "Tocar música real desde o início, construindo técnica, leitura, ouvido, ritmo, acordes e autonomia sem infantilizar a experiência.",
    finalOutcome: "O aluno lê partituras iniciais nas duas claves, toca com duas mãos, usa acordes e pedal com critério, acompanha canções simples, entende harmonia funcional básica e apresenta 2–3 peças completas.",
    modules: [
      { id:"adult-mes-1", title:"Mês 1 · Começar a tocar", subtitle:"Som, teclado, pulso e primeira música", outcome:"Criar base física, orientação no teclado e continuidade musical desde a primeira aula.", icon:"🎹", lessons:[
        L(1,"Primeiro som, primeira música","Postura + produção sonora","Ajustar banco, braços e mãos e terminar a aula tocando uma pequena frase musical.","50 min"),
        L(2,"Mapa do teclado","Grupos de 2 e 3 + Dó","Orientar-se rapidamente no teclado e encontrar os Dós sem etiquetas.","50 min"),
        L(3,"Dedos sem tensão","Dedos 1–5","Usar os cinco dedos com movimento pequeno, natural e sem rigidez.","50 min"),
        L(4,"Pulso e valores","Semínima, mínima e semibreve","Contar e tocar durações básicas mantendo pulsação estável.","50 min"),
        L(5,"Dó–Sol na mão direita","Pentacorde","Tocar padrões e uma frase curta em posição de cinco dedos.","50 min"),
        L(6,"Dó–Sol na mão esquerda","Pentacorde","Repetir a lógica na mão esquerda sem perder relaxamento.","50 min"),
        L(7,"Duas mãos em conversa","Alternância","Alternar frases curtas entre as mãos mantendo o pulso.","55 min"),
        L(8,"Primeira música completa","Fecho do mês","Tocar uma versão inicial completa do repertório do mês com continuidade.","55 min"),
      ]},
      { id:"adult-mes-2", title:"Mês 2 · Ler para tocar", subtitle:"Pauta, ritmo e duas claves", outcome:"Ler por referências e padrões, evitando dependência de decorar nota por nota.", icon:"🎼", lessons:[
        L(9,"A pauta como mapa","Linhas, espaços e direção","Entender a pauta como representação de altura e movimento.","50 min"),
        L(10,"Clave de Sol","Pontos de referência","Ler a mão direita usando Dó central e Sol como referências.","50 min"),
        L(11,"Clave de Fá","Pontos de referência","Ler a mão esquerda usando Dó central e Fá como referências.","50 min"),
        L(12,"Grande pauta","Duas claves juntas","Ver as duas claves como um único mapa em torno do Dó central.","55 min"),
        L(13,"Passos, saltos e repetição","Leitura por padrão","Reconhecer movimento antes de identificar cada nota isoladamente.","50 min"),
        L(14,"Pausas e compasso","Silêncio + 4/4","Ler pausas e organizar pulsos em compassos.","50 min"),
        L(15,"Colcheias e 3/4","Divisão + novo compasso","Tocar pares de colcheias e sentir três pulsos por compasso.","55 min"),
        L(16,"Leitura musical completa","Aplicação","Ler e tocar uma peça curta sem escrever nomes das notas na pauta.","60 min"),
      ]},
      { id:"adult-mes-3", title:"Mês 3 · As duas mãos trabalham", subtitle:"Coordenação, articulação e escala", outcome:"Ganhar independência inicial entre as mãos e técnica funcional.", icon:"🤲", lessons:[
        L(17,"Legato","Conexão","Ligar notas com transferência de peso e mão solta.","50 min"),
        L(18,"Staccato","Ataque curto","Produzir staccato leve sem rigidez no pulso.","50 min"),
        L(19,"Mãos juntas por blocos","Coordenação","Combinar notas simples das duas mãos sem acelerar.","55 min"),
        L(20,"Melodia + nota-base","Independência","Tocar melodia numa mão e notas longas na outra.","55 min"),
        L(21,"Escala de Dó maior","1 oitava","Aprender dedilhado e passagem do polegar sem tensão.","55 min"),
        L(22,"Intervalos","2ª a 5ª","Reconhecer e tocar distâncias por forma e som.","50 min"),
        L(23,"Dinâmica e frase","Expressão","Controlar piano, forte e direção de frase numa peça.","55 min"),
        L(24,"Peça com duas mãos","Fecho do mês","Tocar uma peça completa combinando leitura, coordenação e expressão.","60 min"),
      ]},
      { id:"adult-mes-4", title:"Mês 4 · Entender os acordes", subtitle:"Harmonia que pode ser usada", outcome:"Construir acordes e começar a acompanhar músicas sem depender apenas da partitura.", icon:"🎵", lessons:[
        L(25,"Como nasce um acorde","Tríades","Construir tríades maiores a partir de padrões de terças.","50 min"),
        L(26,"C, F e G","I–IV–V","Tocar os três acordes principais de Dó maior e ouvir suas funções.","55 min"),
        L(27,"Inversões","Movimento eficiente","Usar inversões para trocar acordes com menos deslocamento.","55 min"),
        L(28,"Melodia e acordes","Textura","Combinar uma melodia simples com acompanhamento harmônico.","55 min"),
        L(29,"Padrão de acompanhamento","Mão esquerda","Transformar acordes em um padrão regular de acompanhamento.","55 min"),
        L(30,"Cifra sem mistério","Símbolos de acordes","Ler cifras básicas e localizar os acordes no piano.","50 min"),
        L(31,"Acompanhar uma canção","Aplicação","Sustentar uma canção conhecida com pulso e mudanças de acorde.","60 min"),
        L(32,"Tocar sem parar","Continuidade","Completar o repertório do mês sem interromper por pequenos erros.","60 min"),
      ]},
      { id:"adult-mes-5", title:"Mês 5 · Soar como música", subtitle:"Pedal, fraseado, ouvido e criação", outcome:"Sair da execução mecânica e controlar som, forma e expressão.", icon:"✨", lessons:[
        L(33,"Pedal direito","Troca limpa","Usar o pedal depois do ataque e trocar sem borrar a harmonia.","55 min"),
        L(34,"Frases que respiram","Fraseado","Identificar pontos de chegada e respirar musicalmente.","55 min"),
        L(35,"Ouvir antes de tocar","Treino auditivo","Reconhecer direção, repetição e pequenos intervalos.","50 min"),
        L(36,"Tirar uma frase de ouvido","Ouvido aplicado","Encontrar no teclado uma frase curta sem partitura.","55 min"),
        L(37,"Improvisar com segurança","Criação","Improvisar sobre um conjunto limitado de notas e acordes.","55 min"),
        L(38,"Transpor um padrão","Transposição","Mover uma pequena ideia para outra região ou tonalidade simples.","55 min"),
        L(39,"Prática inteligente","Método de estudo","Isolar problemas, reduzir andamento e reconstruir trechos com objetivo.","50 min"),
        L(40,"Interpretação","Peça do mês","Tomar decisões conscientes de dinâmica, pedal, fraseado e andamento.","60 min"),
      ]},
      { id:"adult-mes-6", title:"Mês 6 · Pianista independente", subtitle:"Repertório, autonomia e performance", outcome:"Consolidar leitura, técnica, harmonia e prática numa pequena apresentação final.", icon:"🏆", lessons:[
        L(41,"Escolher repertório final","Planejamento","Selecionar 2–3 peças adequadas ao nível e definir prioridades.","50 min"),
        L(42,"Mapa dos trechos difíceis","Diagnóstico","Identificar pontos frágeis e criar estratégias específicas para cada um.","55 min"),
        L(43,"Mãos separadas com propósito","Correção","Usar estudo separado apenas onde ele resolve um problema real.","50 min"),
        L(44,"Do trecho à peça","Integração","Recolocar trechos trabalhados no contexto da música completa.","55 min"),
        L(45,"Memória segura","Referências","Usar forma, harmonia, ouvido e pontos de partida para fortalecer memória.","55 min"),
        L(46,"Gravar e avaliar","Autoavaliação","Gravar uma execução e escolher no máximo dois pontos concretos para melhorar.","55 min"),
        L(47,"Ensaio geral","Performance","Tocar o programa completo, treinar entradas, finais e recuperação de erros.","60 min"),
        L(48,"Recital Luwipi","Conclusão","Apresentar 2–3 peças e definir o próximo objetivo de estudo.","60 min"),
      ]},
    ],
  }
};

export function getCurriculum(age: string | undefined) {
  return curriculum[age === "2-4" ? "2-4" : age === "adult" ? "adult" : "5-8"];
}
