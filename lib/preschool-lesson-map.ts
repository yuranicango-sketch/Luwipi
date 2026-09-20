import type { LessonStep } from "@/lib/lesson-engine";
import { getPreschoolLessonSteps } from "@/lib/preschool-lessons";
import { preschool13_24 } from "@/lib/preschool-lessons-13-24";
import { preschool25_36 } from "@/lib/preschool-lessons-25-36";
import { preschool37_48 } from "@/lib/preschool-lessons-37-48";
import { getSong } from "@/lib/music-library";

type RepertoirePlan={title:string;actions:string[];say:string;child:string;success:string};
const p=(title:string,actions:string[],say:string,child:string,success:string):RepertoirePlan=>({title,actions,say,child,success});

const repertoire:Record<number,RepertoirePlan>={};
const lessonExamples:Record<number,string>={7:"EXEMPLO DE PULSAÇÃO: TUM · TUM · TUM · TUM, sempre com a mesma distância. Bata nas pernas 1 — 2 — 3 — 4 e depois faça igual numa tecla: Dó — Dó — Dó — Dó. Não acelere.",9:"EXEMPLO DE ECO: PALMA · PALMA; espere; a criança responde PALMA · PALMA.",10:"EXEMPLO: tartaruga = TUM ... TUM ... TUM ... TUM. Coelhinho = TUM-TUM-TUM-TUM.",11:"EXEMPLO: Dó — Dó — [SILÊNCIO] — Dó — Dó. Na pausa, mãos fora da tecla.",14:"EXEMPLO: mostre um grupo de DUAS teclas pretas e depois um de TRÊS. Procurem o desenho 2–3 pelo teclado.",17:"EXEMPLO: Dó → Ré → Mi = sobe. Mi → Ré → Dó = desce.",20:"EXEMPLO: polegar=1, indicador=2, médio=3. Mostre primeiro na mão e depois no piano.",22:"EXEMPLO: direita toca Dó; espere; esquerda toca um Dó grave. Direita — esquerda — direita — esquerda.",26:"EXEMPLO: Dó → Mi; esconda as mãos e diga Agora tu. Se difícil, use Dó → Ré.",27:"EXEMPLO: PALMA · PALMA · pausa · PALMA; depois Dó · Dó · pausa · Dó.",29:"EXEMPLO: professor toca Dó → Mi e para. Criança responde com 1–2 sons.",31:"EXEMPLO: vermelho=Dó, amarelo=Ré, azul=Mi. Não mude a associação durante a atividade.",34:"EXEMPLO: Dó–Ré–Mi / Dó–Ré–Mi = IGUAL. Dó–Ré–Mi / Dó–Mi–Ré = SURPRESA.",39:"EXEMPLO: Dó · Dó · Dó · Dó igualmente espaçados; ESTAÇÃO = 2–3 segundos de silêncio; depois retome no mesmo andamento.",45:"EXEMPLO: professor toca Dó–Mi e passa a bola; criança responde com 1–2 notas. Não toque por cima dela."};
function month(start:number,title:string,steps:Array<Omit<RepertoirePlan,"title">>){
 steps.forEach((x,i)=>repertoire[start+i]={title,...x});
}
month(1,"Brilha, Brilha, Estrelinha",[
 p("",["Cante a música inteira uma vez com a criança. Não ensine teclas hoje.","Depois cante novamente e deixe a criança completar palavras que já conhece."],"Este mês vamos aprender esta música. Hoje só vamos cantar e conhecê-la.","Ouve, canta e reconhece a canção.","Mostra familiaridade e participa sem pressão."),
 p("",["Cante o primeiro pedacinho bem devagar.","No piano, mostre apenas as primeiras 2–3 notas da versão simplificada.","Faça uma tentativa e volte a cantar."],"Vamos aprender só este pedacinho. O resto fica para outro dia.","Canta e experimenta o primeiro trecho.","Consegue participar do primeiro trecho com ajuda."),
 p("",["Retome exatamente o trecho anterior antes de acrescentar algo.","Acrescente somente o próximo pequeno pedaço.","Junte os dois uma vez."],"Lembras deste começo? Agora vamos descobrir o que vem depois.","Recorda e acrescenta um trecho.","Liga dois pequenos trechos com ajuda."),
 p("",["Cante a música completa primeiro.","Toque/cante a primeira metade sem parar por pequenos erros.","Repita apenas o ponto em que a criança hesitou."],"Hoje vamos chegar até aqui sem pressa.","Participa da primeira metade.","Mantém a sequência da primeira metade."),
 p("",["Comece pela primeira metade já conhecida.","Apresente o próximo trecho por imitação, em unidades pequenas.","Termine cantando a música inteira."],"Já sabemos o começo. Agora a Estrelinha continua.","Aprende o trecho seguinte.","Acrescenta material novo sem perder o começo."),
 p("",["Junte os trechos conhecidos até quase o fim.","Se tocar ainda for difícil, professor toca e criança canta a parte que falta.","Não transforme em exercício técnico."],"Vamos ver quanto da nossa música já sabemos.","Canta/toca o que já aprendeu.","Reconhece a ordem geral da canção."),
 p("",["Faça uma passagem completa com professor ajudando nos pontos necessários.","Corrija no máximo um ponto importante.","Faça uma segunda passagem musical, não mecânica."],"Vamos tocar a nossa Estrelinha do começo ao fim.","Participa da música completa.","Chega ao final com ajuda."),
 p("",["Deixe a criança escolher cantar, tocar partes, ou fazer ambos.","Professor acompanha discretamente.","Termine com aplauso e marque a música como aprendida, mesmo que a versão seja simples."],"Hoje é dia de tocar a música que aprendeste este mês.","Apresenta sua versão da canção.","Participa do começo ao fim com confiança crescente.")
].map(({actions,say,child,success})=>({actions,say,child,success})));

const songs=[["Marcha, Soldado",9],["O Sapo Não Lava o Pé",17],["Ciranda, Cirandinha",25],["A Canoa Virou",33],["Maria Tinha um Cordeirinho",41]] as const;
const songIds=["estrelinha","marcha-soldado","sapo-nao-lava-pe","ciranda-cirandinha","a-canoa-virou","maria-cordeirinho"] as const;
for(const [title,start] of songs){
 const phases=[
  ["Ouvir e cantar",["Cante a música inteira com a criança. Descubra o que ela já conhece.","Não leve ao piano antes de ela reconhecer a canção."],"Este mês vamos aprender "+title+". Hoje vamos cantá-la.","Ouve e canta.","Reconhece a música e participa."],
  ["Primeiro pedacinho",["Cante o início.","Mostre apenas um trecho muito curto no piano, adequado à idade.","Cante novamente depois da tentativa."],"Vamos tocar só o comecinho.","Experimenta o início.","Participa do primeiro trecho."],
  ["Continuar",["Comece pelo trecho aprendido na aula anterior.","Acrescente apenas o próximo pedaço.","Junte os dois uma vez."],"Já sabes o começo. Vamos descobrir o que vem depois.","Recorda e continua.","Liga dois trechos com ajuda."],
  ["Primeira metade",["Cante a canção completa.","Faça a primeira metade em continuidade, ajudando quando necessário.","Isole apenas um ponto se realmente impedir a continuidade."],"Hoje vamos chegar até ao meio da música.","Canta/toca a primeira metade.","Mantém a ordem da primeira metade."],
  ["Segunda parte",["Retome a primeira metade uma vez.","Ensine o próximo trecho por imitação.","Feche cantando a música inteira."],"Agora vamos aprender mais um pedacinho.","Aprende a continuação.","Acrescenta o novo trecho."],
  ["Juntar",["Junte tudo o que já foi aprendido.","Professor completa musicalmente as partes que ainda faltam.","Evite repetir a música inteira muitas vezes."],"Olha quanta música já sabes!","Participa de quase toda a canção.","Reconhece começo, continuação e final."],
  ["Música inteira",["Faça uma passagem completa com apoio.","Escolha somente um ponto para melhorar.","Faça uma última passagem sem interromper."],"Vamos do começo ao fim.","Toca/canta a música completa com apoio.","Chega ao final mantendo a experiência musical."],
  ["Música aprendida",["A criança escolhe como apresentar: tocar, cantar e tocar, ou tocar partes enquanto o professor acompanha.","Não corrija durante a apresentação.","Celebre e marque a música como repertório aprendido."],"Esta é uma das tuas músicas agora. Vamos tocar!","Apresenta sua versão.","Conclui o mês reconhecendo e participando da canção inteira."]
 ] as const;
 phases.forEach((z,i)=>repertoire[start+i]=p(title,[...z[1]],z[2],z[3],z[4]));
}

function base(n:number):LessonStep[]|undefined{
 if(n<=12)return getPreschoolLessonSteps(n);
 return preschool13_24[n]??preschool25_36[n]??preschool37_48[n];
}
export function getCompletePreschoolLessonSteps(n:number):LessonStep[]|undefined{
 const x=base(n),r=repertoire[n]; if(!x||!r)return;
 const first=x[0],discover=x[1],mission=x[2];
 const example=lessonExamples[n];
 const songId=songIds[Math.floor((n-1)/8)]; const song=getSong(songId);\n const music:LessonStep={id:"repertoire",icon:"🎹",title:"Repertório · "+r.title,duration:"5–8 min",songId:song?.id,songEmoji:song?.emoji,songStory:song?.story,goal:"Aprender uma música conhecida ao longo do mês, um pequeno trecho de cada vez.",actions:r.actions,say:r.say,childDoes:r.child,success:r.success,tip:n%8===0?"Fecho do mês: a meta é reconhecer e fazer música, não tocar uma versão adulta perfeita.":"Na próxima aula, comece sempre pelo último trecho que a criança já conhece."};
 return [{...first,id:"arrive"},{...discover,id:"story",example:example??discover.example},{...mission,id:"mission"},music];
}
