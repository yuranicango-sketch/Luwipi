import type { LessonStep } from "@/lib/lesson-engine";
import { getPreschoolLessonSteps } from "@/lib/preschool-lessons";
import { preschool13_24 } from "@/lib/preschool-lessons-13-24";
import { preschool25_36 } from "@/lib/preschool-lessons-25-36";
import { preschool37_48 } from "@/lib/preschool-lessons-37-48";

type SongBeat={title:string;say:string;action:string;child:string;success:string};
const song=(n:string,say:string,action:string,child:string,success:string):SongBeat=>({title:n,say,action,child,success});

const monthlySong:Record<number,SongBeat>={
1:song("🎵 O Gigante e a Estrelinha","Agora os dois amigos vão cantar contigo.","Ouça o refrão. No TUM TUM, aponte/tocar grave; no TIM TIM, aponte/tocar agudo.","Responde aos dois personagens.","Reconhece TUM e TIM."),
2:song("🎵 O Gigante e a Estrelinha","Quando ouvires TUM, faz o elefante andar. Quando ouvires TIM, faz o passarinho voar.","Use a faixa e transforme os dois sons em movimento; ainda não peça para tocar a música toda.","Move no momento certo.","Liga grave/agudo à música."),
3:song("🎵 O Gigante e a Estrelinha","Hoje vamos descobrir onde cada som da música mora.","Durante TUM/TIM, deixe a criança apontar a região antes de tocar junto.","Aponta e toca as duas regiões.","Encontra as casas dentro da música."),
4:song("🎵 O Gigante e a Estrelinha","O gigante sabe fazer voz forte e também consegue falar baixinho.","Cante um ciclo normal; no seguinte, faça o TUM mais suave. Compare sem explicar termos.","Experimenta duas vozes do gigante.","Controla o toque dentro da canção."),
5:song("🎵 O Gigante e a Estrelinha","Faz os passos do gigante e os passinhos pequeninos da estrelinha.","Use a faixa: passos grandes no TUM, dedos leves no TIM; depois leve ao piano.","Move e toca acompanhando.","Mantém dois gestos diferentes."),
6:song("🎵 O Gigante e a Estrelinha","Hoje vamos deixar um som ficar no ar.","No último TUM de um ciclo, sustente; no TIM seguinte, faça curtinho. Depois volte à faixa normal.","Experimenta longo e curto.","Ouve a duração dentro da música."),
7:song("🎵 O Gigante e a Estrelinha","Vamos andar junto com a música sem correr.","Marque o pulso com passos enquanto a faixa toca; nos TUM/TIM, apenas responda com gesto.","Caminha no pulso.","Mantém alguns passos regulares."),
8:song("🎵 O Gigante e a Estrelinha · festa do mês","Agora tu já conheces esta música. Escolhe: queres ser Gigante ou Estrelinha?","Toque a faixa inteira. A criança escolhe um personagem e faz sua parte. Professor assume o outro.","Participa do começo ao fim à sua maneira.","Reconhece sua parte e fecha o mês fazendo música."),

9:song("🎵 O Trenzinho Vai Parar","Piuí! Hoje só vamos conhecer o trem.","Ouça um ciclo e façam rodas com os braços. Na estação, congelem.","Move e para com a faixa.","Reconhece trem e estação."),
10:song("🎵 O Trenzinho Vai Parar","A tartaruga vai conduzir devagar; depois o coelho mostra como corre.","Antes da faixa, faça um trecho lento e outro rápido; na faixa oficial, volte ao pulso estável do trem.","Compara velocidades e depois acompanha.","Distingue velocidade sem bagunçar o pulso da música."),
11:song("🎵 O Trenzinho Vai Parar","Quando chegar à estação, ninguém toca.","Toque junto numa tecla durante o trem e retire as mãos no PAROU.","Toca e faz silêncio na estação.","Para no ponto certo."),
12:song("🎵 O Trenzinho Vai Parar","Hoje tu és o maquinista.","Dê uma placa ESTAÇÃO à criança. Ela mostra a placa quando a música disser estação e todos congelam.","Dá o sinal de parada.","Antecipa a parada da música."),
13:song("🎵 O Trenzinho Vai Parar","O trem vai passar por teclas brancas e pretas.","Durante dois ciclos, mova um trem de brinquedo primeiro sobre brancas, depois perto dos grupos pretos; a criança toca uma de cada.","Explora as duas famílias.","Reconhece as famílias dentro da história."),
14:song("🎵 O Trenzinho Vai Parar","O trem procura uma estação de duas pretas... depois uma de três.","Pause antes de iniciar a faixa, encontre as duas estações; durante a música, faça o trem parar nelas.","Encontra as duas estações.","Localiza grupos de 2 e 3."),
15:song("🎵 O Trenzinho Vai Parar","Hoje o trem visita a casa do gigante.","Comece o trem na região grave. A criança toca um grave em cada chegada à estação.","Toca grave na estação.","Usa a região grave com intenção."),
16:song("🎵 O Trenzinho Vai Parar · festa do mês","Última viagem! O trem sai do gigante e termina no passarinho.","Comece grave e, a cada ciclo, mova o trem para a direita até terminar agudo. Celebre a chegada.","Acompanha a viagem pelo teclado.","Fecha o mês orientando-se entre grave e agudo."),

17:song("🎵 Acorda, Dedinho!","Os dedinhos ainda estão dormindo. Vamos ouvir quem acorda.","Ouça a música sem exigir tocar; quando ouvir 1,2,3, mostre o dedo correspondente junto com a criança.","Mostra os dedos chamados.","Conhece a nova música e seus personagens."),
18:song("🎵 Acorda, Dedinho!","Os dedinhos vão procurar um tesouro no piano.","Coloque uma estrela perto de uma tecla; quando a música chamar um dedo, esse dedo toca a tecla do tesouro.","Procura e toca o tesouro.","Liga dedo, lugar e toque."),
19:song("🎵 Acorda, Dedinho!","Antes de acordar, a mão da tartaruguinha precisa pousar macia.","Pouse a mão relaxada; só então inicie a faixa. Pare se a mão endurecer e faça a tartaruga descansar.","Pousa e toca confortável.","Mantém a mão relaxada."),
20:song("🎵 Acorda, Dedinho!","Agora já sabemos quem é 1, 2 e 3.","Durante cada chamada da música, a criança mostra o dedo e faz um DING numa tecla confortável.","Responde às chamadas.","Liga 1,2,3 aos dedos."),
21:song("🎵 Acorda, Dedinho!","Cada dedinho ganha uma campainha.","Escolha três teclas vizinhas. Cada dedo toca apenas quando for chamado e volta a descansar.","Toca um dedo por vez.","Isola o gesto sem rigidez."),
22:song("🎵 Acorda, Dedinho!","Hoje uma mão acorda primeiro e a outra responde.","Faça o primeiro ciclo com uma mão; no segundo, troque de mão. Não exija simultaneidade.","Alterna as mãos por ciclos.","Experimenta os dois lados."),
23:song("🎵 Acorda, Dedinho!","Os dedinhos acordaram e agora vão dar três passinhos.","Depois de cada chamada 1-2-3, faça 1-2-3 em três teclas vizinhas, bem devagar.","Faz três passos.","Liga os dedos numa sequência."),
24:song("🎵 Acorda, Dedinho! · festa do mês","Hoje os dedinhos fazem a música contigo.","Toque a faixa completa. A criança responde aos DINGs e pequenos 1-2-3 que já conhece. Não pare para corrigir.","Participa da faixa inteira.","Fecha o mês usando mão e dedos com conforto."),

25:song("🎵 O Sapinho","Olha o sapinho sentado. Quando ele pular, escuta bem.","Ouça um ciclo. Cada PULOU recebe um toque curto numa tecla.","Toca nos pulos.","Conhece a música e reage ao sinal."),
26:song("🎵 O Sapinho","Hoje dois pulos vão andar em fila.","Faça dois toques A-B para dois pulos. A criança responde na mesma ordem durante as pausas da faixa.","Repete dois sons.","Guarda uma ordem curta."),
27:song("🎵 O Sapinho","Primeiro nas mãos; depois nas teclas.","Bata o padrão dos pulos, espere a criança copiar e leve exatamente o mesmo padrão ao piano.","Copia em palmas e piano.","Transfere o ritmo."),
28:song("🎵 O Sapinho","Elefante ou passarinho pode dar o próximo pulo.","Use cartões dos dois personagens para decidir se o próximo toque será grave ou agudo.","Segue a ordem dos personagens.","Junta memória e região."),
29:song("🎵 O Sapinho","O sapinho pula e espera a tua resposta.","Depois de um pequeno padrão da faixa, pause/abaixe o volume e deixe a criança responder com 1–2 sons.","Responde no espaço.","Entende o turno musical."),
30:song("🎵 O Sapinho","O sapinho trouxe brincadeiras antigas.","Entre ciclos, mostre um cartão de elefante, ursinho ou trem; a criança faz rapidamente o som/gesto correspondente.","Reconhece e responde aos cartões.","Recupera aprendizagens anteriores."),
31:song("🎵 O Sapinho","Agora o sapinho pula em três pedras coloridas.","Coloque vermelho, amarelo e azul em três teclas. Em três pulos consecutivos, aponte uma cor por vez.","Toca as três pedras.","Liga cor a lugar."),
32:song("🎵 O Sapinho · festa do mês","Escolhe duas pedras para o último passeio do sapinho.","A criança monta duas cores; use essa dupla como resposta em cada espaço da música. Toquem até o fim.","Repete sua dupla dentro da música.","Fecha o mês ouvindo, lembrando e respondendo."),

33:song("🎵 O Trenzinho das Cores","Chegaram três vagões: vermelho, amarelo e azul.","Ouça um ciclo apontando cada vagão quando seu nome aparece. Depois toque as três teclas correspondentes.","Segue três cores.","Conhece a música e o mapa das cores."),
34:song("🎵 O Trenzinho das Cores","Os vagões ficaram iguais ou alguém trocou de lugar?","Mostre a ordem oficial; numa segunda fila, mude uma cor. A criança diz com gesto se é igual ou surpresa.","Compara duas filas.","Percebe mudança."),
35:song("🎵 O Trenzinho das Cores","Oh! Falta um vagão.","Monte a sequência com um espaço vazio; dê duas cores como opções. Complete e toque com a música.","Escolhe o vagão que falta.","Antecipa a sequência."),
36:song("🎵 O Trenzinho das Cores","Hoje vamos fazer a viagem inteira.","Mantenha os três cartões visíveis. Toque vermelho-amarelo-azul nos momentos combinados sem parar por pequenos erros.","Toca a sequência do começo ao fim.","Participa da mini música com continuidade."),
37:song("🎵 O Trenzinho das Cores","Um animal entrou em cada vagão.","Coloque três animais conhecidos sobre os vagões. A criança faz a voz de cada um antes de tocar a cor.","Dá voz e toca as cores.","Acrescenta expressão sem perder a sequência."),
38:song("🎵 O Trenzinho das Cores","Começou a chover na viagem.","Faça um ciclo com gotas leves entre os vagões; no próximo, retire a chuva e volte à versão normal.","Acrescenta gotas e volta à música.","Controla uma pequena variação."),
39:song("🎵 O Trenzinho das Cores","O trem toca os vagões e para na estação.","Toque a sequência no pulso; mostre ESTAÇÃO no final de cada ciclo e façam silêncio.","Toca e para.","Mantém sequência e final."),
40:song("🎵 O Trenzinho das Cores · festa do mês","Esta é a última grande viagem das cores.","A criança toca sua versão mais confortável da música inteira; professor acompanha sem interromper.","Toca a música como consegue.","Fecha o mês sentindo que já toca uma pequena peça."),

41:song("🎵 A Chuva e o Sol","Ping... ping... hoje vamos conhecer a nova história.","Ouça a faixa e use quatro imagens: nuvem, chuva, trovão, sol. A criança aponta o que está ouvindo.","Segue a história pelas imagens.","Conhece a música do último mês."),
42:song("🎵 A Chuva e o Sol","O barquinho vai atravessar a chuva e chegar ao sol.","Mova o barquinho durante a faixa. A criança faz gotas; no sol, escolhe um som final.","Acompanha a viagem.","Liga sua criação à música do mês."),
43:song("🎵 A Chuva e o Sol","Qual parte queres fazer hoje: chuva, trovão ou sol?","A criança escolhe um cartão e fica responsável apenas por essa parte durante a faixa.","Escolhe e espera sua entrada.","Participa com autonomia."),
44:song("🎵 A Chuva e o Sol","A chuva ganhou o teu ritmo.","A criança inventa um padrão de 2–3 gotas; use o mesmo padrão em todas as chuvas da faixa.","Repete o próprio ritmo.","Mantém uma criação dentro da música."),
45:song("🎵 A Chuva e o Sol","Eu faço a chuva; tu fazes o sol. Depois trocamos.","Divida dois papéis entre professor e criança; no segundo ciclo, troquem.","Toca em parceria.","Escuta e espera a vez."),
46:song("🎵 A Chuva e o Sol","Hoje escolhes como queres tocar a tua parte.","Ofereça duas opções concretas: gotas ou sol. Faça a faixa uma vez sem interromper.","Escolhe e sustenta sua parte.","Prepara uma versão que consegue apresentar."),
47:song("🎵 A Chuva e o Sol","O boneco veio assistir. Vamos tocar para ele.","Coloque o boneco como público e façam a faixa completa. Nenhuma correção durante a execução.","Toca para o boneco.","Mantém a apresentação até o fim."),
48:song("🎵 A Chuva e o Sol · festa final","Hoje tu és o músico. Eu vou tocar contigo.","A criança escolhe sua parte favorita. Façam a faixa inteira e terminem com aplausos; depois, se quiser, toque também uma música favorita dos meses anteriores.","Escolhe, toca e celebra.","Conclui os seis meses participando de uma música com confiança.")
};

function base(n:number):LessonStep[]|undefined{
 if(n<=12)return getPreschoolLessonSteps(n);
 return preschool13_24[n]??preschool25_36[n]??preschool37_48[n];
}

export function getCompletePreschoolLessonSteps(n:number):LessonStep[]|undefined{
 const x=base(n), m=monthlySong[n]; if(!x||!m)return;
 // Quatro momentos: cada aula avança como uma pequena história, sem bloco de criação/fecho repetido.
 const first=x[0],discover=x[1],mission=x[2];
 const music:LessonStep={id:"music",icon:"🎵",title:m.title,duration:"5–7 min",goal:"Fazer a música do mês crescer um pouco nesta aula.",actions:[m.action],say:m.say,childDoes:m.child,success:m.success,tip:n%8===0?"Fim do mês: não procure perfeição. Grave apenas se a criança quiser; celebre o que ela já consegue fazer.":"A música volta na próxima aula com uma pequena novidade."};
 return [
  {...first,id:"arrive",title:first.title},
  {...discover,id:"story"},
  {...mission,id:"mission"},
  music
 ];
}
