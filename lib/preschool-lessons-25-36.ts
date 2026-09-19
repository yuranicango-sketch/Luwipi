import type { LessonStep } from "@/lib/lesson-engine";
type T=[string,string,string,string,string,string?]; const st=(id:string,x:T,d:string):LessonStep=>({id,title:x[0],say:x[1],actions:[x[2]],childDoes:x[3],success:x[4],icon:x[5]??"🌈",duration:d,goal:x[0]}); const mk=(a:T,b:T,c:T,d:T,e:T)=>[st("warmup",a,"2–3 min"),st("discover",b,"4–5 min"),st("activity",c,"3–5 min"),st("create",d,"2–4 min"),st("close",e,"2–3 min")];
export const preschool25_36:Record<number,LessonStep[]>={
25:mk(
["Sininho escondido","Ding! Onde está o sininho?","Toque uma nota sem mostrar a mão e faça cara de procura.","Escuta e procura a região.","Fica curiosa com o som escondido.","🔔"],
["Procura um parecido","Escuta este DING... consegues achar um parecido?","Toque uma nota e deixe a criança procurar perto, sem exigir tecla exata.","Procura um som parecido.","Usa o ouvido para orientar a busca.","👂"],
["Quente ou frio","Está pertinho... ou está longe?","Quando a criança toca, responda com gestos de perto/longe e deixe continuar procurando.","Ajusta a busca pelo ouvido.","Chega mais perto sem ansiedade.","🔥"],
["Esconde para mim","Agora esconde um som para eu procurar!","A criança toca sem o professor olhar; professor procura de brincadeira.","Cria o desafio.","Percebe que pode guiar pelo som.","🙈"],
["Achei!","Faz o teu sininho favorito uma última vez.","Deixe escolher e tocar.","Escolhe um som.","Termina ouvindo a própria escolha.","⭐"]),
26:mk(
["Duas formiguinhas","Olha: uma formiguinha... e outra atrás!","Use duas formigas de papel andando em fila.","Segue a ordem visual.","Entende primeiro/depois pela história.","🐜"],
["Dois amigos sonoros","Primeiro este som... depois este.","Toque dois sons bem diferentes e mostre uma formiga para cada um.","Escuta dois sons em ordem.","Percebe que a ordem importa.","👂"],
["Formigas no piano","A primeira vai aqui. A segunda vem depois.","A criança repete dois sons/regiões na mesma ordem; repita o modelo se pedir.","Tenta repetir a dupla.","Mantém uma ordem de dois elementos.","🎹"],
["Troca a fila","Quem vai primeiro agora?","A criança troca a ordem das duas formigas e toca a nova fila.","Cria uma nova ordem.","Muda a sequência de propósito.","🔁"],
["Formigas chegaram","Uma... duas... chegaram!","Façam a sequência favorita uma vez.","Repete a dupla.","Fecha lembrando a ordem.","🏁"]),
27:mk(
["Palmas do sapinho","Pula, sapinho! PLÁ! PLÁ!","Faça um sapo de papel saltar a cada palma.","Bate palmas nos saltos.","Liga ritmo a uma ação visível.","🐸"],
["Das mãos para o piano","O sapinho fez nas mãos... agora vai fazer nas teclas.","Faça um padrão curtíssimo de palmas e repita numa tecla.","Escuta o mesmo ritmo em dois lugares.","Percebe que a brincadeira pode mudar de som.","👏"],
["Pula nas teclas","Pula, pula... parou!","A criança copia um padrão curto primeiro em palmas e depois no piano.","Copia e transfere o ritmo.","Mantém o desenho rítmico.","🎹"],
["Sapinho inventa","Agora o teu sapinho inventa os pulos.","A criança cria 2–3 pulos; professor copia.","Cria um ritmo curto.","Lidera a brincadeira.","✨"],
["Sapinho descansa","Último pulo... SPLASH!","Um último padrão e coloque o sapo no lago.","Toca e termina.","Fecha a sequência claramente.","💧"]),
28:mk(
["Quem vem primeiro?","Olha! Elefante e passarinho estão na fila.","Coloque os dois personagens lado a lado e troque a ordem.","Observa quem vem primeiro.","Lembra os personagens e a ideia de ordem.","🐘"],
["Escuta a fila","TUM... PIU. Quem veio primeiro?","Toque grave-agudo e depois agudo-grave, apontando os personagens após ouvir.","Escuta e mostra a ordem.","Reconhece duas regiões em sequência.","🐦"],
["Faz a mesma fila","Agora faz eles aparecerem na mesma ordem.","A criança repete a ordem usando qualquer grave/agudo.","Repete a sequência dos personagens.","Mantém a ordem sem precisar da tecla exata.","🎹"],
["Monta a tua fila","Tu escolhes quem vai primeiro.","A criança organiza cartões e toca a sequência; professor copia.","Cria uma ordem.","Transforma escolha visual em som.","🧩"],
["Tchau em fila","Quem diz tchau primeiro?","Escolha uma última ordem e toquem.","Repete uma dupla final.","Fecha lembrando primeiro/depois.","👋"]),
29:mk(
["Telefone de brinquedo","Trim-trim! O piano está ligando!","Use um telefone de brinquedo; toque dois sons como toque de chamada.","Atende a brincadeira.","Entende que haverá conversa.","☎️"],
["Piano diz olá","O piano disse: olá! O que tu respondes?","Toque dois sons e deixe espaço para qualquer resposta da criança.","Responde livremente.","Percebe turno de pergunta/resposta.","💬"],
["Minha vez, tua vez","Eu falo... agora tu.","Faça pequenas conversas de 1–3 sons, sempre deixando espaço claro.","Espera e responde.","Participa da conversa sonora.","🎹"],
["Liga para mim","Agora tu ligas primeiro.","A criança cria a chamada; professor responde de forma parecida.","Inicia a conversa.","Assume o primeiro turno.","📞"],
["Tchau no telefone","Diz tchau com um som.","A criança escolhe um último som; professor responde.","Faz a despedida sonora.","Fecha a conversa com intenção.","👋"]),
30:mk(
["Caixa surpresa","O que será que tem aqui dentro?","Use uma caixa com cartões de personagens/conceitos já conhecidos.","Escolhe um cartão.","Reconhece algo familiar.","🎁"],
["Olha quem saiu!","Saiu o elefante! Como ele fala no piano?","Retire um cartão por vez e relembre a brincadeira correspondente.","Recorda pelo personagem.","Liga imagem à experiência musical.","🐘"],
["Três surpresas","Vamos abrir mais três!","Use três cartões: por exemplo elefante, sapinho, ursinho; façam a ação de cada um.","Revê três brincadeiras.","Alterna ideias conhecidas sem pressão.","🎲"],
["Escolhe a surpresa","Qual amigo queres pôr na caixa?","A criança escolhe um personagem e faz o som para o professor adivinhar.","Cria uma surpresa.","Usa memória e imaginação.","✨"],
["Fecha a caixa","Escolhe um amigo para dizer tchau.","Repitam o favorito e fechem a caixa.","Escolhe e repete.","Termina reconhecendo uma brincadeira favorita.","📦"]),
31:mk(
["Três carrinhos","Vermelho, amarelo e azul chegaram!","Mostre três carrinhos/cartões grandes, cada um sobre uma tecla fixa.","Explora as três cores.","Vê três escolhas claras.","🚗"],
["Cada cor tem casa","Vermelho mora aqui. Amarelo aqui. Azul aqui.","Toque sempre a mesma tecla para cada cor e deixe a criança repetir.","Liga cada cor a uma tecla.","Mantém as três associações com ajuda.","🏠"],
["Estaciona a cor","Onde estaciona o vermelho?","Entregue uma cor por vez; a criança coloca perto da tecla e toca.","Encontra a casa da cor.","Começa a localizar pela cor.","🅿️"],
["Troca os carros","Agora tu escolhes a ordem dos carros.","A criança organiza 2–3 cores e toca nessa ordem.","Cria uma pequena sequência colorida.","Transforma ordem visual em som.","🎨"],
["Garagem fechou","Guarda cada carrinho na sua casa.","Revisem as três teclas e recolham os cartões.","Toca as três casas.","Fecha com mapa visual claro.","🌙"]),
32:mk(
["Dois vagões","Hoje o trem tem só dois vagões.","Monte locomotiva + duas cores.","Observa duas cores em fila.","Entende um caminho de dois.","🚂"],
["Caminho de duas cores","Vermelho vai primeiro... azul vem atrás.","Aponte duas cores e toque as teclas correspondentes.","Segue duas cores.","Liga sequência visual e sonora.","🎨"],
["Trem no piano","Piuí! Toca os dois vagões.","Mostre combinações de duas cores e deixe tocar sem esconder rapidamente.","Toca dois sons na ordem mostrada.","Segue caminhos curtos.","🎹"],
["Monta o teu trem","Escolhe os dois vagões.","A criança escolhe duas cores, monta e toca; professor repete.","Cria caminho de duas cores.","Lidera uma sequência visual.","🧩"],
["Trem chegou","Piuí! Última viagem.","Toquem o trem favorito e estacionem.","Repete uma dupla.","Fecha lembrando a ordem.","🏁"]),
33:mk(
["Três vagões","Hoje chegou mais um vagão!","Monte três cores em fila e conte apontando, sem cobrar números.","Observa três partes.","Aceita uma sequência um pouco maior.","🚂"],
["Caminho de três cores","Olha: vermelho, amarelo, azul. Vamos seguir.","Aponte cada cartão enquanto toca sua tecla.","Acompanha três cores.","Percebe a sequência completa.","🎨"],
["Viaja com três","Piuí! Um vagão de cada vez.","A criança toca 3 cores visíveis; se esquecer, apenas aponte de novo.","Segue o trem de três.","Chega ao fim com apoio visual.","🎹"],
["Troca um vagão","Qual cor queres pôr aqui?","Deixe a criança mudar uma das três cores e tocar a nova fila.","Altera e toca a sequência.","Faz uma escolha dentro do padrão.","🧩"],
["Estação das cores","Última viagem e estação!","Façam uma sequência favorita e guardem os vagões.","Toca três cores.","Fecha sem exigir memorização perfeita.","🏁"]),
34:mk(
["Dois gatinhos iguais","Miau! Será que estes gatinhos são gémeos?","Mostre dois cartões iguais e depois um par diferente.","Olha igual/diferente.","Entende a ideia visual primeiro.","🐱"],
["Sons gémeos","Escuta... foram iguais ou teve surpresa?","Toque duas sequências idênticas; depois mude um único som.","Mostra igual ou mudou.","Compara pequenas sequências.","👂"],
["Gémeos ou surpresa?","Polegares juntos para gémeos; mãos abertas para surpresa!","Faça pares simples de sons/cores e deixe responder com gesto.","Compara ouvindo.","Distingue igual de diferente na brincadeira.","🎭"],
["Faz uma surpresa","Toca uma vez... agora muda só uma coisa.","A criança cria duas versões; professor dramatiza a mudança.","Muda um elemento.","Entende que uma mudança altera a música.","✨"],
["Gatinhos vão dormir","Os gémeos dizem miau e vão dormir.","Faça um último par igual e encerre.","Reconhece o par igual.","Fecha com uma comparação fácil.","🌙"]),
35:mk(
["Ponte com buraco","Oh não! Falta uma peça na ponte!","Monte três cartões com um espaço vazio e um boneco esperando.","Vê o espaço que falta.","Entende o problema visual.","🌉"],
["Qual peça falta?","Qual cor ajuda o boneco a passar?","Dê apenas duas opções grandes; experimente a escolhida na sequência.","Escolhe entre duas peças.","Completa uma ideia com apoio.","🧩"],
["Salva o caminho","Vamos consertar outra ponte!","Faça caminhos muito simples com uma lacuna; toque antes e depois de completar.","Escolhe e toca a peça que falta.","Percebe continuidade.","🛠️"],
["Faz um buraco para mim","Agora tu escondes uma peça.","A criança monta uma sequência e retira uma cor para o professor descobrir.","Cria o desafio.","Usa o padrão de forma ativa.","🙈"],
["Ponte pronta","Conseguimos! O boneco passou.","Toquem uma sequência completa e movam o boneco até o fim.","Completa e celebra.","Fecha percebendo começo-fim.","⭐"]),
36:mk(
["Trenzinho das cores","Piuí! Os três vagões vieram cantar.","Monte vermelho-amarelo-azul como trem conhecido.","Reconhece os três vagões.","Entra na música pela imagem.","🚂"],
["A música dos vagões","Cada vagão tem o seu som. Escuta o trem.","Toque a pequena frase colorida apontando cada vagão.","Escuta e acompanha visualmente.","Liga a melodia às cores.","🎶"],
["Toca o passeio","Piuí! Vamos viajar juntos.","A criança toca a frase com cartões visíveis; professor acompanha cantando.","Toca a mini música por cores.","Chega ao fim com apoio.","🎹"],
["Muda um vagão","Que cor queres trocar para fazer outra viagem?","A criança muda uma cor e ouve a nova versão.","Cria uma variação pequena.","Percebe que sua escolha muda a música.","✨"],
["Trem na estação","Piuí... chegámos!","Toquem a versão favorita uma vez e estacionem os vagões.","Toca e encerra a música.","Fecha com sensação de peça completa.","🏁"])
};