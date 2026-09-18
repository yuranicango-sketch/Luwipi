import type { CurriculumVariant, EnhancedLesson, EnhancedModule } from "@/lib/curriculum-v3";
import type { AgeGroup } from "@/lib/curriculum";
import { lessonResourceSummary } from "@/lib/curriculum-resources";
import { getManualLessonGuide } from "@/lib/lesson-guides";

export type LessonStep = {
  id:string; icon:string; title:string; duration:string; goal:string;
  actions:string[]; say?:string; childDoes:string; success:string; tip?:string;
  actionLabel?:string; actionHref?:string;
};

function firstLesson(age:AgeGroup):LessonStep[]{
  if(age==="2-4") return [
    {id:"warmup",icon:"👋",title:"Conhecer o piano",duration:"2–3 min",goal:"Fazer a criança sentir que o piano é um lugar seguro para explorar.",actions:["Fique ao lado do piano com a criança antes de sentá-la.","Aponte para as teclas e deixe a criança tocar livremente por 20–30 segundos.","Não corrija dedo, nota ou ritmo nesta primeira exploração."],say:"Hoje o piano vai falar com a gente. Pode tocar algumas teclas e descobrir os sons.",childDoes:"Explora algumas teclas livremente e escuta.",success:"Toca sem receio e mantém interesse por alguns segundos."},
    {id:"discover",icon:"🔎",title:"Um som grande e um som pequenino",duration:"4–5 min",goal:"Perceber que existem sons muito diferentes no mesmo piano.",actions:["Toque UMA tecla bem à esquerda.","Espere a criança escutar.","Toque UMA tecla bem à direita.","Repita esquerda → direita duas vezes.","Depois deixe a criança experimentar os dois lados."],say:"Este som parece grandão. E este parece pequenino. Agora faz tu.",childDoes:"Toca uma tecla do lado grave e depois uma do lado agudo.",success:"Experimenta os dois lados do piano, mesmo sem usar os nomes grave/agudo."},
    {id:"activity",icon:"🎮",title:"Onde mora o som?",duration:"3–4 min",goal:"Repetir a descoberta sem transformar a aula numa explicação.",actions:["Toque um som bem grave.","Peça para apontar para o lado onde acha que o som mora.","Faça o mesmo com um som bem agudo.","Faça 4 tentativas no total."],say:"Onde mora este som? Mostra com o dedo.",childDoes:"Aponta a região e, se quiser, toca uma tecla ali.",success:"Acerta ou se aproxima da região correta em 3 de 4 tentativas."},
    {id:"repertoire",icon:"🎹",title:"Mini música: Gigante e Estrelinha",duration:"5–6 min",goal:"Terminar a primeira aula já fazendo música.",actions:["Escolha uma tecla branca grave para o Gigante.","Escolha uma tecla branca aguda para a Estrelinha.","Toque: Gigante – Gigante – Estrelinha – Estrelinha.","Peça para repetir os 4 sons.","Repitam juntos mais uma vez."],say:"O Gigante dá dois passos: TUM, TUM. A Estrelinha responde: TIM, TIM.",childDoes:"Toca 2 sons graves e 2 agudos como história.",success:"Completa a sequência com ajuda, sem precisar ficar perfeita."},
    {id:"create",icon:"✨",title:"Escolher o final",duration:"2 min",goal:"Dar sensação de autoria desde a primeira aula.",actions:["Toque novamente os quatro sons.","Pare antes do fim.","Deixe a criança escolher qualquer tecla como último som."],say:"Agora tu escolhes o último som.",childDoes:"Escolhe uma tecla para terminar.",success:"Faz uma escolha e percebe que ela muda a música."},
    {id:"close",icon:"🌟",title:"Fechar e celebrar",duration:"2 min",goal:"Encerrar com uma coisa que a criança conseguiu fazer.",actions:["Pergunte qual som gostou mais.","Toquem uma última sequência.","Elogie algo concreto: escuta, coragem ou atenção."],say:"Hoje tu descobriste dois lugares do piano e já fizeste uma música.",childDoes:"Repete a mini música uma última vez.",success:"Sai da aula associando o piano a descoberta e música.",tip:"Em casa: 2 sons graves + 2 agudos. Menos de 2 minutos."}
  ];
  return [
    {id:"warmup",icon:"🪑",title:"Sentar bem sem ficar rígido",duration:"3–4 min",goal:"Ajustar o corpo para tocar confortavelmente.",actions:["Sente o aluno no meio do teclado.","Ajuste a distância até os cotovelos ficarem ligeiramente à frente do tronco.","Verifique apoio dos pés.","Peça para soltar ombros e braços por 3 segundos."],say:"Quero que fiques confortável, não parado como uma estátua.",childDoes:"Ajusta banco, pés, ombros e braços.",success:"Alcança o teclado sem ombros levantados ou braços esticados."},
    {id:"discover",icon:"🖐️",title:"A mão pousa no teclado",duration:"5–6 min",goal:"Produzir os primeiros sons sem tensão.",actions:["Deixe a mão cair relaxada ao lado do corpo.","Leve a mesma forma até o teclado.","Coloque 1–2–3 sobre três teclas brancas vizinhas.","Peça um som com 1, depois 2, depois 3."],say:"Não aperta a mão. Só pousa e deixa cada dedo fazer um som.",childDoes:"Toca três teclas vizinhas com 1–2–3.",success:"Produz três sons sem travar pulso ou ombro."},
    {id:"activity",icon:"🎯",title:"Jogo dos três dedos",duration:"4–5 min",goal:"Reconhecer 1–2–3 e responder rapidamente.",actions:["Diga um número entre 1, 2 e 3.","O aluno toca uma vez com esse dedo.","Faça 6 chamadas aleatórias.","Depois faça duas chamadas juntas, como 1–2 ou 3–2."],say:"Quando eu disser o número, toca uma vez com esse dedo.",childDoes:"Responde aos números com o dedo correspondente.",success:"Acerta 5 de 6 chamadas simples sem tensão."},
    {id:"repertoire",icon:"🎹",title:"Primeira peça: Três Passos",duration:"10 min",goal:"Tocar uma peça curta na primeira aula.",actions:["Escolha três teclas brancas vizinhas para 1–2–3.","Ensine 1–2–3.","Depois 3–2–1.","Una: 1–2–3 | 3–2–1.","Repita 3 vezes devagar."],say:"Vamos subir três passos e voltar para casa.",childDoes:"Toca 1–2–3 | 3–2–1.",success:"Toca a sequência completa duas vezes sem perder a posição."},
    {id:"create",icon:"✨",title:"Mudar o final",duration:"3–4 min",goal:"Juntar técnica e criatividade.",actions:["Toque Três Passos novamente.","Na última nota, deixe escolher uma das três teclas.","Compare o final original com o novo."],say:"Muda só a última nota. Qual final gostas mais?",childDoes:"Escolhe outro final e toca novamente.",success:"Altera o final sem perder toda a sequência."},
    {id:"close",icon:"🌟",title:"Fechar a aula",duration:"2–3 min",goal:"Sair sabendo exatamente o que praticar.",actions:["Peça uma última execução.","Diga uma coisa específica que melhorou.","Mostre a tarefa: duas execuções em casa."],say:"Hoje já tens uma primeira peça. Em casa, toca duas vezes e para.",childDoes:"Faz uma execução final.",success:"Toca com postura funcional e sabe a tarefa.",tip:"Se houver tensão, marque “Precisa reforçar”; não bloqueie a aula seguinte."}
  ];
}

function warmup(age:AgeGroup,lesson:EnhancedLesson):LessonStep{
  return age==="2-4"
    ? {id:"warmup",icon:"👋",title:"Aquecimento",duration:"2–3 min",goal:`Preparar corpo e atenção para ${lesson.focus.toLowerCase()}.`,actions:["Faça 4 pulsações com palmas ou passos.","Repita mais 4 pulsações.","Vá imediatamente ao piano e faça 2 sons simples relacionados ao tema."],say:"Faz comigo. Depois levamos a mesma ideia para o piano.",childDoes:"Imita uma sequência curta e vai para o piano.",success:"Entra na atividade sem precisar de uma longa explicação."}
    : {id:"warmup",icon:"👋",title:"Aquecimento",duration:"3–5 min",goal:`Preparar corpo, pulso e atenção para ${lesson.focus.toLowerCase()}.`,actions:["Confira rapidamente postura e mãos.","Faça 8 pulsações com palmas.","Transfira as mesmas 8 pulsações para uma tecla confortável."],say:"Primeiro sentimos o pulso; depois levamos para o piano.",childDoes:"Mantém pulsação e transfere para o teclado.",success:"Começa a aula com corpo solto e pulso estável."};
}

function discovery(age:AgeGroup,lesson:EnhancedLesson):LessonStep{
  const guide=getManualLessonGuide(age,lesson.number);
  if(!guide) throw new Error(`Falta guia manual para ${age}:${lesson.number}`);
  return {id:"discover",icon:"🎯",title:"Ensinar a ideia do dia",duration:age==="2-4"?"4–6 min":"7–10 min",goal:lesson.objective,actions:guide.teach,say:guide.say,childDoes:guide.childDoes,success:lesson.mastery};
}

function activity(age:AgeGroup,lesson:EnhancedLesson,game?:{title:string;goal:string;session:string},href?:string):LessonStep{
  const guide=getManualLessonGuide(age,lesson.number);
  if(!guide) throw new Error(`Falta guia manual para ${age}:${lesson.number}`);
  if(game&&href) return {id:"activity",icon:"🎮",title:game.title,duration:age==="2-4"?"3–5 min":"5–7 min",goal:game.goal,actions:["Abra o jogo e faça uma rodada de demonstração.","Na rodada seguinte, deixe a criança responder primeiro.","Faça apenas a sessão indicada; não repita até acertar tudo.","Volte para o piano físico ao terminar."],say:"Agora és tu. Primeiro escuta ou olha; depois escolhe.",childDoes:`Completa uma sessão curta de ${game.session}.`,success:"Entende a regra e responde à maior parte sem ajuda constante.",actionLabel:"ABRIR JOGO",actionHref:href};
  return {id:"activity",icon:"🧩",title:"Praticar a habilidade",duration:age==="2-4"?"3–5 min":"5–7 min",goal:`Praticar ${lesson.focus.toLowerCase()} sem acrescentar teoria nova.`,actions:guide.practice,say:guide.say,childDoes:guide.childDoes,success:"Consegue repetir a proposta com menos ajuda do que na primeira demonstração."};
}

function repertoire(age:AgeGroup,lesson:EnhancedLesson,songHref?:string):LessonStep{
  return {id:"repertoire",icon:"🎹",title:"Música no piano",duration:age==="2-4"?"5–8 min":"10–15 min",goal:`Aplicar a aula em ${lesson.repertoire}.`,actions:["Escolha se a prática será no Luwipi ou no piano físico.","Trabalhe apenas UMA frase de cada vez.","Faça uma demonstração curta e depois deixe a criança tocar.","Junte duas frases somente quando a primeira estiver confortável.","No final, faça uma tentativa contínua sem parar para corrigir cada erro."],say:`Vamos tocar ${lesson.repertoire} por partes. Primeiro uma frase; depois juntamos.`,childDoes:"Toca uma frase, repete e junta as partes gradualmente.",success:"Consegue completar pelo menos uma frase com começo e fim claros.",tip:"Se escolher piano físico, use o modo “Piano físico” da música: ele mostra onde começar e a sequência da frase.",actionLabel:songHref?"ABRIR MÚSICA":"ABRIR REPERTÓRIO",actionHref:songHref??"/musicas"};
}

function creation(age:AgeGroup,lesson:EnhancedLesson):LessonStep{
  if(lesson.checkpoint) return {id:"checkpoint",icon:"🏁",title:"Missão Luwipi",duration:age==="2-4"?"3–5 min":"5–8 min",goal:"Ver o que já está seguro e o que vale reforçar.",actions:["Faça 1 desafio de ouvido.","Faça 1 de ritmo.","Faça 1 de teclado ou leitura.","Peça um pequeno trecho de repertório.","Registre apenas uma coisa para reforçar."],say:"São quatro missões rápidas. Não é prova.",childDoes:"Resolve quatro pequenos desafios.",success:"Mostra o que consegue sem ajuda constante e identifica um próximo foco."};
  return {id:"create",icon:"✨",title:"Criar e responder",duration:age==="2-4"?"2–4 min":"4–6 min",goal:"Usar a habilidade do dia de forma livre.",actions:["Toque uma frase curta.","Peça uma resposta.","Aceite a primeira resposta musicalmente possível.","Repita a pergunta e peça uma segunda resposta diferente."],say:"Eu faço uma pergunta; tu inventas a resposta.",childDoes:"Cria duas respostas curtas.",success:"Faz escolhas próprias sem esperar uma nota certa."};
}

function close(age:AgeGroup,lesson:EnhancedLesson,homeworkHref:string):LessonStep{
  return {id:"close",icon:"🌟",title:"Fechar a aula",duration:"2–3 min",goal:"Sair sabendo o que conseguiu e o que fará em casa.",actions:["Peça uma última tentativa curta.","Escolha “Conseguiu” ou “Precisa reforçar”.","Diga UMA tarefa para casa.","Pare a aula; não acrescente exercício novo no final."],say:age==="2-4"?"Hoje fizeste isto. Em casa vamos repetir só um bocadinho.":"Hoje o foco foi este. Em casa pratica só o trecho combinado e depois toca a peça uma vez.",childDoes:"Faz uma tentativa final e ouve a tarefa.",success:lesson.mastery,tip:`Tarefa: ${lesson.homePractice}`,actionLabel:"PREPARAR TAREFA",actionHref:homeworkHref};
}

export function buildLessonSteps(args:{age:AgeGroup;module:EnhancedModule;lesson:EnhancedLesson;variant:CurriculumVariant;}):LessonStep[]{
  const {age,lesson}=args;
  const resources=lessonResourceSummary(age,lesson.number,lesson.repertoire);
  if(lesson.number===1) return firstLesson(age);
  const href=resources.gameHref??lesson.activityRoute;
  return [warmup(age,lesson),discovery(age,lesson),activity(age,lesson,resources.game,href),repertoire(age,lesson,resources.songHref),creation(age,lesson),close(age,lesson,resources.homeworkHref)];
}
