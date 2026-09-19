import type { LessonStep } from "@/lib/lesson-engine";
type T=[string,string,string,string,string,string?]; const st=(id:string,x:T,d:string):LessonStep=>({id,title:x[0],say:x[1],actions:[x[2]],childDoes:x[3],success:x[4],icon:x[5]??"🌈",duration:d,goal:x[0]}); const mk=(a:T,b:T,c:T,d:T,e:T)=>[st("warmup",a,"2–3 min"),st("discover",b,"4–5 min"),st("activity",c,"3–5 min"),st("create",d,"2–4 min"),st("close",e,"2–3 min")];
export const preschool37_48:Record<number,LessonStep[]>={
37:mk(
["Porta do zoológico","Abriu o zoológico! Quem vamos encontrar?","Mostre dois animais conhecidos e faça seus gestos.","Imita os animais.","Entra numa história concreta.","🦁"],
["Cada bicho tem voz","O elefante fala assim... e o passarinho assim...","Associe cada animal a um som já conhecido no piano.","Toca a voz de cada animal.","Recorda contrastes por personagens.","🐘"],
["Passeio no zoológico","Olha quem apareceu agora!","Mostre um animal por vez; a criança faz sua voz no piano.","Responde aos animais com sons.","Usa o piano para representar.","🐦"],
["Inventa um animal","Escolhe um bichinho e mostra como ele fala.","A criança escolhe um animal simples e cria um som; professor imita.","Cria uma voz de animal.","Faz uma escolha sonora compreensível.","🐾"],
["Zoológico fechou","Todos os bichinhos vão dormir.","Escolha dois animais para uma despedida sonora.","Toca duas vozes e termina.","Fecha lembrando personagens.","🌙"]),
38:mk(
["Nuvem chegando","Olha a nuvem... acho que vem chuva.","Mostre uma nuvem de papel e faça dedos de gotinhas no ar.","Imita gotas com os dedos.","Entende a cena antes do piano.","☁️"],
["Ping, ping, BUM!","Ping... ping... e de repente: BUM!","Faça gotas leves no agudo e um trovão grave amigável.","Faz chuva e trovão.","Relaciona região/toque a imagens claras.","🌧️"],
["Faz chover","Primeiro pouquinha chuva... agora mais... BUM... parou.","A criança controla gotas, chuva, trovão e silêncio com ajuda visual.","Conta a tempestade no piano.","Segue a ordem da história.","⚡"],
["Tu és o tempo","Que tempo vai fazer agora?","A criança escolhe nuvem, chuva, trovão ou sol e cria o som.","Escolhe uma cena e toca.","Usa som para representar clima.","☀️"],
["O sol voltou","A chuva foi embora. Olha o sol!","Faça um acorde/som suave final e mostre o sol.","Toca o final calmo.","Termina a história claramente.","🌞"]),
39:mk(
["Todos a bordo!","Piuí! Sobe no trenzinho!","Façam braços de rodas e quatro passos regulares.","Move como trem.","Entra no pulso pela brincadeira.","🚂"],
["O trem anda e para","Vai, vai, vai... ESTAÇÃO!","Toque pulsos regulares e pare completamente na estação.","Anda/toca e congela.","Percebe movimento e parada.","🚉"],
["Viagem no piano","Piuí! Não deixa as rodas fugirem.","A criança toca uma tecla no pulso até ver a placa ESTAÇÃO.","Mantém o trem e para no sinal.","Segue um pulso curto e respeita a pausa.","🎹"],
["Tu és o maquinista","Quando é a próxima estação?","A criança levanta a placa para mandar parar e abaixa para partir.","Controla partida e parada.","Lidera a forma da brincadeira.","👨‍✈️"],
["Chegámos!","Última estação. Todo mundo desce!","Façam quatro pulsos finais, parem e acenem.","Toca e para.","Fecha com começo e fim claros.","🏁"]),
40:mk(
["Estrela no céu","Olha aquela estrelinha lá em cima.","Mostre uma estrela grande e façam o gesto de brilhar com os dedos.","Imita a estrela.","Reconhece o tema visual.","⭐"],
["Brilha, Brilha","Vamos ouvir a estrelinha cantar.","Toque/cante apenas o primeiro pedacinho conhecido, mostrando as pistas visuais disponíveis.","Ouve e acompanha.","Reconhece a melodia.","✨"],
["Ajuda a estrela a brilhar","Cada pedacinho tocado acende uma estrela.","A criança toca pequenos trechos com apoio; acenda/mova uma estrela após cada trecho.","Toca pequenos pedaços da música.","Participa da canção sem pressão de tocar inteira.","🌟"],
["Escolhe uma estrela","Qual estrela vai brilhar no final?","A criança escolhe uma estrela/cor para marcar o último som ou trecho.","Escolhe um final visual.","Participa da apresentação da música.","🎨"],
["Boa noite, estrelinha","Brilha uma última vez... boa noite.","Toquem/cantem o trecho favorito e guardem a estrela.","Repete o favorito.","Termina reconhecendo a música.","🌙"]),
41:mk(
["Cadê o cordeirinho?","Maria está procurando o cordeirinho. Vamos ajudar?","Mostre Maria de um lado e o cordeiro do outro com um caminho simples entre eles.","Entra na história.","Entende o objetivo visual.","🐑"],
["Primeiros passinhos","Cada pedacinho da música faz o cordeirinho andar.","Toque/cante um trecho curto de 'Maria Tinha um Cordeirinho' e mova o personagem.","Ouve e vê o cordeiro avançar.","Liga trecho musical a progresso visual.","👣"],
["Leva até Maria","Toca um pedacinho... ele anda mais um pouco!","A criança toca trechos curtos com apoio e move o cordeiro após cada um.","Ajuda o cordeiro tocando.","Participa da música por pequenas partes.","🎹"],
["Escolhe o caminho","Por onde o cordeirinho vai passar?","Dê duas rotas ilustradas; a criança escolhe e vocês continuam a música.","Escolhe a rota e toca.","Mantém envolvimento na história.","🛤️"],
["Encontrou!","Chegou na Maria!","Façam o trecho favorito e juntem os personagens.","Toca/canta e celebra.","Fecha a música com uma história concluída.","❤️"]),
42:mk(
["Barquinho vazio","Olha este barquinho. Quem vai viajar nele?","Mostre um barquinho e 2–3 personagens conhecidos.","Escolhe um personagem.","Começa por uma escolha concreta.","⛵"],
["Começa a viagem","O teu amigo entrou no barco. Que som faz quando parte?","A criança escolhe um som para a partida; professor move o barco.","Cria um som de partida.","Liga som a uma ação visual.","🌊"],
["No meio do mar","Oh! Apareceu uma onda! O que acontece agora?","Mostre uma onda grande/pequena e deixe a criança criar sons para atravessar.","Toca a aventura do barco.","Constrói uma história com imagens.","🌊"],
["Escolhe o final","Vai chegar numa ilha ou voltar para casa?","Dê duas imagens de final; a criança escolhe e cria o som final.","Escolhe e toca o final.","Dá conclusão à própria história.","🏝️"],
["Fim da viagem","O barquinho chegou. Tchau!","Repitam rapidamente partida-aventura-final.","Reconta a viagem com sons.","Consegue reconhecer as partes da própria história.","👋"]),
43:mk(
["Baú dos favoritos","Abre o baú! Quem está aqui?","Coloque imagens de 3–4 brincadeiras conhecidas num baú/caixa.","Revê personagens conhecidos.","Reconhece experiências anteriores.","🧰"],
["Escolhe dois","Pega nos dois amigos de que mais gostaste.","A criança escolhe duas imagens, sem o professor decidir.","Escolhe favoritos.","Mostra preferência espontânea.","❤️"],
["Vamos brincar outra vez","Qual vem primeiro?","Façam uma rodada curta de cada escolha na ordem decidida pela criança.","Repete duas brincadeiras favoritas.","Mostra memória de como brincar.","🎲"],
["Mistura os dois","E se os dois amigos brincarem juntos?","Juntem os personagens numa mini cena simples no piano.","Combina duas ideias.","Cria usando material conhecido.","✨"],
["Guarda no baú","Qual fica por cima para lembrar primeiro?","A criança escolhe a imagem final e guarda.","Escolhe a lembrança da aula.","Fecha com autonomia.","📦"]),
44:mk(
["Três cartões de ritmo","Olha: sapinho, palmas e trenzinho. Qual quer brincar?","Mostre três imagens de jogos rítmicos já conhecidos.","Escolhe um jogo.","Reconhece as opções visualmente.","🥁"],
["Brinca primeiro","Vamos fazer o teu escolhido!","Faça a brincadeira escolhida exatamente como a criança já conhece.","Participa do jogo.","Recupera o ritmo pela memória.","🎲"],
["Leva para o piano","Agora esse ritmo vai passear nas teclas.","Repitam o mesmo ritmo numa tecla ou região confortável.","Toca o ritmo escolhido.","Transfere pela imitação, sem explicação abstrata.","🎹"],
["Tu inventas","Faz um ritmo para eu copiar.","A criança cria um padrão curtinho; professor copia.","Lidera um ritmo.","Cria algo simples e claro.","👑"],
["Aplauso final","Esse ritmo foi teu!","Repitam uma vez e aplaudam.","Repete e recebe aplauso.","Fecha valorizando a criação.","👏"]),
45:mk(
["Bola musical","A bola vai para mim... agora vai para ti.","Passe uma bola macia de um para o outro.","Espera e recebe a vez.","Entende turnos concretamente.","⚽"],
["Eu toco, tu tocas","Eu faço dois sons... agora é tua vez.","Professor toca dois sons; passa a bola; criança responde livremente.","Responde no seu turno.","Escuta antes de tocar.","🎹"],
["Conversa a dois","Minha vez... tua vez...","Alternem pequenos sons, sempre usando a bola para mostrar quem toca.","Participa de uma conversa musical.","Mantém turnos sem sobreposição constante.","💬"],
["Tu começas","Agora a bola começa contigo.","A criança cria primeiro; professor responde.","Inicia a conversa.","Assume liderança musical.","👑"],
["Som juntos","No fim, tocamos juntos!","Combinem um único toque final ao mesmo tempo.","Toca o final com o professor.","Fecha compartilhando música.","🤝"]),
46:mk(
["Cartazes das músicas","Olha quantas músicas já conheces!","Mostre capas/imagens de 2–3 músicas realmente trabalhadas.","Reconhece músicas pelas imagens.","Recorda repertório conhecido.","🖼️"],
["Escolhe a tua","Qual queres tocar hoje?","A criança escolhe uma capa; toque/cante um pedacinho para confirmar.","Escolhe uma música.","Mostra preferência clara.","❤️"],
["Vamos tocar","Esta é a tua música de hoje.","Toquem juntos, usando imagens/cores/partes conhecidas; não pare por pequenos erros.","Participa da música escolhida.","Consegue seguir boa parte com apoio.","🎹"],
["Dá-lhe um nome bonito","Queres pôr uma estrela ou coração na tua música?","A criança escolhe um adesivo/símbolo para marcar a favorita.","Personaliza sua escolha.","Sente autoria sobre o repertório.","⭐"],
["Guarda para o concerto","Vamos guardar esta para mostrar.","Façam um último pedacinho e coloque a capa na pasta do concerto.","Repete e guarda.","Fecha sabendo qual música escolheu.","📁"]),
47:mk(
["O público chegou","Olha quem veio assistir!","Coloque um boneco/animal de pelúcia sentado como público.","Cumprimenta o público.","Entende concerto como brincadeira.","🧸"],
["Entrada de artista","Chega, senta, sorri... pronto!","Ensaiem apenas entrar, ficar pronto e fazer um gesto de começo.","Prepara-se para tocar.","Percebe começo sem rigidez.","🎭"],
["Concerto para o boneco","O boneco está ouvindo a tua música.","A criança toca sua música escolhida; não interrompa para corrigir.","Toca para o boneco.","Segue até um final natural com ajuda se precisar.","🎹"],
["Aplausos!","O boneco adorou!","Faça o boneco aplaudir; se a criança quiser, troquem os papéis.","Recebe/aplica aplausos.","Associa apresentação a experiência positiva.","👏"],
["Reverência divertida","Tchau, público!","Façam uma pequena reverência ou aceno e encerrem.","Despede-se do público.","Fecha o ritual do concerto.","👋"]),
48:mk(
["Dia da festa","Hoje é a tua festa no piano!","Decore com 2–3 imagens/personagens favoritos do percurso.","Reconhece o ambiente de celebração.","Entra feliz na última aula.","🎉"],
["Escolhe os convidados","Quem vai estar na tua festa?","A criança escolhe personagens e uma música/brincadeira favorita.","Escolhe o que quer mostrar.","Mostra memória e preferência.","🐘"],
["Mostra o que gostas","Agora é a tua vez!","Faça a brincadeira/música escolhida com um adulto ou boneco assistindo; sem correções durante.","Compartilha algo aprendido.","Participa da apresentação à sua maneira.","🎹"],
["Última escolha","Queres gigante, sapinho, trem ou outra coisa para terminar?","A criança escolhe uma última brincadeira conhecida e lidera.","Lidera a despedida musical.","Usa o que aprendeu de forma espontânea.","👑"],
["Até logo, Luwipi!","Olha quanta coisa fizeste com o piano!","Aplaudam, entreguem um certificado/estrela e façam um último toque juntos.","Celebra e toca o som final.","Termina associando piano a descoberta, brincadeira e música.","🌟"])
};