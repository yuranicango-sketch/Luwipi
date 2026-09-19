import type { LessonStep } from "@/lib/lesson-engine";
type T=[string,string,string,string,string,string?];
const st=(id:string,x:T,d:string):LessonStep=>({id,title:x[0],say:x[1],actions:[x[2]],childDoes:x[3],success:x[4],icon:x[5]??"🌈",duration:d,goal:x[0]});
const mk=(a:T,b:T,c:T,d:T,e:T)=>[st("warmup",a,"2–3 min"),st("discover",b,"4–5 min"),st("activity",c,"3–5 min"),st("create",d,"2–4 min"),st("close",e,"2–3 min")];
export const preschool13_24:Record<number,LessonStep[]>={
13:mk(
["Teclas de neve e carvão","Olha! Umas são branquinhas e outras pretinhas.","Mostre duas teclas grandes brancas e duas pretas; deixe tocar cada família.","Toca brancas e pretas.","Vê que existem duas famílias de teclas.","⚪"],
["Duas famílias","Estas são brancas. Estas são pretas. Vamos visitar as duas.","Passeie com um bonequinho primeiro sobre brancas, depois sobre pretas.","Leva o boneco às duas famílias.","Separa visualmente brancas de pretas.","⚫"],
["Pisa só aqui!","O boneco só pode pisar nas pretas! Agora só nas brancas!","Dê o boneco à criança e troque a regra a cada pequena viagem.","Move o boneco e toca a família escolhida.","Escolhe a família sem confundir a brincadeira.","👣"],
["Casa nova","Onde o teu boneco quer morar hoje?","A criança escolhe branco ou preto e inventa três passos ali.","Escolhe uma família e cria um passeio.","Faz uma escolha clara.","🏠"],
["Tchau, duas famílias","Dá um toque branco e um preto para dizer tchau.","Façam os dois toques e encerrem.","Toca uma de cada família.","Termina lembrando das duas.","👋"]),
14:mk(
["Dois patinhos, três patinhos","Quá, quá! Vieram dois... agora chegaram três!","Mostre dois dedos juntos e depois três; façam dois e três passos.","Imita grupos de dois e três.","Percebe dois grupos diferentes.","🦆"],
["Casinhas pretas","Olha esta casinha: tem duas pretas. Esta tem três!","Aponte grupos reais de 2 e 3 teclas pretas pelo piano.","Encontra grupos de duas e três.","Começa a ver o desenho repetido do teclado.","🏠"],
["Caça às casinhas","Encontra uma casa de DOIS! Agora uma de TRÊS!","Use dois cartões grandes com 2 e 3 bolinhas; a criança procura a casa correspondente.","Procura pelo teclado.","Encontra pelo menos uma casa de cada tipo com ajuda se precisar.","🔎"],
["Esconde o bichinho","Onde vamos esconder o bichinho: na casa de dois ou de três?","A criança escolhe uma casa e coloca um pequeno personagem perto dela.","Escolhe e encontra uma casa.","Usa o padrão do teclado para decidir.","🐭"],
["Última casinha","Mostra a tua casinha favorita.","Deixe apontar e tocar as teclas pretas dela.","Mostra e toca a favorita.","Fecha reconhecendo um grupo.","⭐"]),
15:mk(
["Passos do gigante","TUM... TUM... o gigante está chegando!","Andem para a esquerda do piano com passos grandes.","Anda como gigante.","Liga o gigante ao lado grave.","👣"],
["Onde mora o gigante?","O gigante gosta dos sons grandões daqui.","Toque dois graves bem separados e deixe a criança experimentar.","Explora sons graves.","Procura naturalmente a região grave.","🧌"],
["Passeio do gigante","TUM, TUM... para onde ele vai agora?","Mova um boneco gigante sobre 3–4 teclas graves enquanto a criança toca.","Faz passos graves para o gigante.","Mantém a brincadeira na região grave.","🎹"],
["Gigante escolhe o caminho","Faz o teu gigante passear.","A criança escolhe livremente alguns graves; o professor acompanha com passos.","Cria um passeio grave.","Usa o lado grave por escolha própria.","🛤️"],
["Gigante vai dormir","Um último TUM... boa noite, gigante.","Toque um grave final e deixe soar.","Toca e escuta o último grave.","Termina reconhecendo a voz do gigante.","🌙"]),
16:mk(
["Asas no ar","Abre as asas! O passarinho vai voar.","Façam braços de asas e caminhem para a direita do piano.","Voa como passarinho.","Liga o passarinho ao lado agudo.","🐦"],
["Onde canta o passarinho?","Piu, piu! Ele canta pequenininho aqui em cima.","Toque agudos leves e deixe a criança responder.","Explora sons agudos.","Procura naturalmente a região aguda.","🎶"],
["Voo do passarinho","Piu aqui... piu ali!","Mova um passarinho de papel por 3–4 teclas agudas; a criança toca onde ele pousa.","Segue o passarinho no piano.","Mantém a brincadeira na região aguda.","🪽"],
["Passarinho escolhe galho","Onde ele vai pousar agora?","A criança escolhe uma tecla aguda para o pássaro pousar.","Escolhe um agudo.","Faz uma escolha dentro da região.","🌳"],
["Passarinho volta ao ninho","Piu... boa noite, passarinho.","Um toque agudo final e gesto de ninho com as mãos.","Toca e faz o ninho.","Termina lembrando da voz aguda.","🌙"]),
17:mk(
["Balão no chão","Segura o balão... ainda está aqui embaixo.","Finja segurar um balão e agachem.","Fica baixo com o balão.","Entende a posição inicial da história.","🎈"],
["O balão sobe!","Olha! Está subindo, subindo, subindo!","Toque três teclas vizinhas subindo enquanto a mão/balão sobe; depois faça o caminho de volta.","Segue subir e descer com olhos e ouvidos.","Percebe direção como movimento.","⬆️"],
["Leva o balão","Faz o balão subir no piano!","A criança toca 3 teclas vizinhas para a direita; depois volta pelas mesmas.","Faz um caminho para cima e para baixo.","Consegue seguir uma direção curta.","🎹"],
["Vento no balão","Tu decides: ele sobe ou desce?","A criança aponta a direção e cria o caminho; o professor move o balão.","Escolhe a direção.","Controla o movimento sonoro.","💨"],
["Balão voltou","Desce, desce... chegou!","Façam um último caminho descendente e coloquem o balão no chão.","Toca descendo e termina.","Fecha entendendo a volta.","🎈"]),
18:mk(
["Mapa do tesouro","Tenho um mapa! O tesouro está escondido no piano.","Mostre um mapa simples com ícones: casa de 2, casa de 3, elefante, passarinho.","Olha os símbolos do mapa.","Reconhece personagens/lugares conhecidos.","🗺️"],
["Primeira pista","A pista diz: casa de duas pretas!","Mostre uma pista por vez e procurem juntos.","Encontra o lugar da pista.","Usa o que já conhece para procurar.","🔎"],
["Caça ao tesouro","Agora tu és o explorador!","Entregue 3 pistas concretas, uma de cada vez; esconda uma estrela de papel no último lugar.","Segue as pistas no teclado.","Chega ao tesouro sem virar prova.","⭐"],
["Esconde para mim","Agora esconde o tesouro e dá-me uma pista.","A criança escolhe um lugar conhecido e o professor procura.","Cria uma pista simples.","Usa uma ideia musical para guiar alguém.","🪄"],
["Tesouro encontrado!","Achámos! Guarda a estrela de hoje.","Celebrem e façam um toque no lugar onde o tesouro apareceu.","Toca no lugar final.","Termina com sensação de descoberta.","🏆"]),
19:mk(
["Mão tartaruguinha","Faz uma casinha com a mão para a tartaruguinha.","Arredonde a mão naturalmente no ar, sem corrigir dedo por dedo.","Faz uma mão redondinha e relaxada.","Mantém a mão confortável.","🐢"],
["Tartaruga pousa","A tartaruguinha vai pousar no piano... bem devagar.","Pouse sua mão relaxada; a criança imita e depois levanta.","Pousa e levanta a mão.","Não endurece para manter a forma.","🎹"],
["Olá, piano!","A tartaruga pousa e diz: olá!","Pouse a mão e deixe qualquer dedo confortável tocar uma vez; depois retire.","Pousa, toca e descansa.","Toca sem apertar a mão.","👋"],
["Passeio da tartaruga","Onde ela quer pousar agora?","A criança escolhe 2–3 lugares do teclado para pousar a mão.","Escolhe lugares e pousa.","Mantém conforto durante a brincadeira.","🌿"],
["Tartaruga descansa","A tartaruguinha cansou. Vai dormir na tua perna.","Pouse a mão relaxada no colo e encerre.","Relaxa a mão no colo.","Termina sem tensão.","🌙"]),
20:mk(
["Dedinhos dormindo","Shhh... os dedinhos estão dormindo.","Feche a mão suavemente e finja pequenos roncos.","Entra na brincadeira dos dedos.","Olha para os próprios dedos com curiosidade.","💤"],
["Acorda, dedinho 1!","Polegar é o dedinho 1. Bom dia, um!","Acorde primeiro 1, depois 2, depois 3 com pequenos gestos; não force 4–5.","Mostra 1, 2 e 3.","Começa a ligar número ao dedo.","☝️"],
["Quem acordou?","Acorda o 2! Agora o 1!","Mostre cartões 1,2,3 e deixe a criança levantar o dedo possível.","Responde aos números com os dedos.","Reconhece os principais dedos sem tensão.","🔢"],
["Dedinho diz olá","Escolhe um dedinho para dizer olá ao piano.","A criança escolhe 1,2 ou3 e toca uma tecla confortável.","Escolhe e toca com um dedo.","Leva a brincadeira ao piano.","👋"],
["Boa noite, dedinhos","Um, dois, três... boa noite!","Toquem uma vez com cada dedo confortável e relaxem.","Faz três pequenos olás e descansa.","Termina sem esforço.","🌙"]),
21:mk(
["Um dedinho curioso","Quem quer tocar primeiro hoje?","Deixe a criança escolher entre dedos 1–3.","Escolhe um dedo.","Mostra vontade de experimentar.","☝️"],
["Toca e descansa","Toca... e deixa o dedinho descansar.","Demonstre um único toque leve; os outros dedos apenas ficam confortáveis.","Faz um toque isolado.","Começa a mover um dedo sem prender a mão.","🎹"],
["Campainha dos dedos","Ding! Quem toca a campainha agora?","Chame 1,2 ou3 usando cartões; cada chamada vale um único toque.","Toca uma vez com o dedo chamado.","Responde sem transformar em velocidade.","🔔"],
["Escolhe a campainha","Agora tu escolhes o dedinho e eu digo DING!","A criança escolhe a ordem de três dedos; professor narra.","Cria uma pequena ordem.","Faz escolhas com os dedos.","✨"],
["Último DING","Qual dedinho vai dizer tchau?","Deixe escolher e fazer um último toque.","Escolhe e toca.","Fecha com controle simples.","👋"]),
22:mk(
["Duas mãos dizem olá","Olá, mão direita! Olá, mão esquerda!","Acenem com uma mão e depois com a outra.","Distingue as duas mãos pela brincadeira.","Percebe alternância sem teoria.","👐"],
["Pergunta e resposta","Esta mão diz: oi! A outra responde: olá!","Toque uma nota com cada mão alternadamente.","Alterna as mãos.","Espera uma mão antes da outra.","💬"],
["Bola vai, bola volta","A bola vai para uma mão... e volta para a outra.","Passe uma bolinha entre as mãos; cada recepção ganha um toque no piano.","Toca alternando conforme recebe a bola.","Coordena troca de mãos.","⚽"],
["Tu fazes a pergunta","Escolhe qual mão fala primeiro.","A criança toca com uma mão; professor responde; depois invertem.","Lidera a conversa.","Usa as duas mãos em turnos.","👑"],
["As duas dizem tchau","Direita... esquerda... tchau!","Um toque de cada mão e fim.","Faz dois toques alternados.","Fecha a alternância com calma.","👋"]),
23:mk(
["Dois passinhos","Um passinho... outro passinho.","Faça indicador e médio caminharem sobre a mesa.","Caminha com dois dedos.","Entende a imagem dos dedos andando.","👣"],
["Dedos caminham no piano","Agora os passinhos vão para as teclas.","Use dois dedos confortáveis em duas teclas vizinhas, devagar.","Faz dois sons vizinhos.","Move dedos sem pressa.","🎹"],
["Caminho curtinho","Vai, vai... parou!","Faça dois ou três passos de dedos e uma parada clara.","Copia o caminho e para.","Consegue fazer pequena sequência.","🛤️"],
["Faz um caminho para mim","Onde os teus dedinhos vão passear?","A criança inventa 2–3 passos; professor imita.","Cria um caminho curto.","Lidera uma sequência simples.","✨"],
["Dedinhos chegaram","Chegaram! Agora descansam.","Repita o caminho favorito e mãos no colo.","Toca e relaxa.","Termina sem tensão.","🏁"]),
24:mk(
["Ponte para o ursinho","O ursinho precisa atravessar a ponte!","Faça uma ponte com um arco de papel sobre 3 teclas.","Move o ursinho sobre a ponte.","Entende a história antes de tocar.","🌉"],
["Uma mão sobe","Esta mão leva o ursinho para cima.","Faça três sons vizinhos subindo com uma mão confortável.","Toca um pequeno caminho ascendente.","Segue o movimento com uma mão.","🐻"],
["A outra ajuda a voltar","Agora a outra mão traz o ursinho para casa.","Faça o caminho descendente com a outra mão, sem exigir posição perfeita.","Usa a outra mão para voltar.","Experimenta troca de mãos.","🏠"],
["Escolhe quem começa","Qual mão leva o ursinho primeiro?","A criança escolhe a mão e vocês fazem a travessia.","Escolhe e realiza a ponte.","Coordena a história com as mãos.","👐"],
["Ursinho chegou","Chegou em casa! Dá um último toque.","Um toque final conjunto ou alternado, sem repetir por perfeição.","Termina a travessia.","Fecha confortável.","⭐"])
};