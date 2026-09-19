import type { LessonStep } from "@/lib/lesson-engine";

type PStep = { title:string; say:string; actions:string[]; child:string; ok:string; icon?:string };
type PLesson = { open:PStep; discover:PStep; play:PStep; create:PStep; close:PStep };

const S=(title:string,say:string,actions:string[],child:string,ok:string,icon="🌈"):PStep=>({title,say,actions,child,ok,icon});
const L=(open:PStep,discover:PStep,play:PStep,create:PStep,close:PStep):PLesson=>({open,discover,play,create,close});

export const preschoolLessons:Record<number,PLesson>={
1:L(
S("Olá, piano!","Olá, piano! Vamos ver que sons moram aqui.",["Deixe a criança tocar algumas teclas livremente.","Sorria e imite um som que ela fizer."],"Explora o piano livremente.","Entra na brincadeira e quer ouvir mais.","👋"),
S("Gigante e Estrelinha","Escuta... TUM! O gigante mora aqui. TIM! A estrelinha mora lá.",["Toque um som bem grave e faça passos de gigante.","Toque um som bem agudo e aponte uma estrela imaginária no alto."],"Faz o gigante e a estrelinha com o piano.","Percebe que os dois personagens têm sons diferentes.","👣"),
S("Onde cada amigo mora?","Quem mora aqui: o gigante ou a estrelinha?",["Mostre os dois lados do piano.","Toque um som e deixe a criança apontar o personagem."],"Aponta e depois procura o som no piano.","Começa a ligar cada personagem ao seu lado do piano.","🏠"),
S("Faz a tua história","Quem chega primeiro hoje?",["Deixe escolher Gigante ou Estrelinha.","A criança toca; o professor faz o gesto do personagem."],"Escolhe a ordem dos personagens e toca.","Faz uma escolha musical própria.","✨"),
S("Tchau, Gigante! Tchau, Estrelinha!","Qual amigo queres chamar só mais uma vez?",["Deixe escolher um personagem.","Toquem uma última vez e façam tchau."],"Escolhe, toca e se despede.","Termina querendo voltar a brincar.","👋")),
2:L(
S("Passos de elefante","TUM... TUM... Quem está chegando?",["Ande devagar com passos grandes.","Faça a criança andar junto antes de tocar."],"Anda como um elefante.","Reconhece a brincadeira pelos passos.","🐘"),
S("Elefante e Passarinho","O elefante faz TUM! O passarinho faz PIU!",["Toque grave para o elefante.","Toque agudo para o passarinho e mexa as mãos como asas."],"Imita os dois animais e procura seus sons.","Liga elefante ao grave e passarinho ao agudo.","🐦"),
S("Quem falou?","Fecha os olhos... quem falou?",["Toque um grave ou um agudo sem mostrar a mão.","Deixe apontar o animal antes de tocar."],"Escuta, escolhe o animal e procura o som.","Começa a reconhecer os animais só pelo som.","👂"),
S("O passeio dos dois","Quem vai passear primeiro?",["A criança escolhe a ordem dos animais.","Façam uma história curtinha com dois sons de cada."],"Cria um passeio com elefante e passarinho.","Escolhe e organiza os dois sons.","🎭"),
S("Até amanhã, amigos!","Manda um beijo para o elefante e para o passarinho.",["Repitam o animal favorito.","Terminem com um gesto de despedida."],"Repete o favorito e termina.","Sai lembrando de um dos dois sons.","🌟")),
3:L(
S("Cadê o som?","Eu escondi um som no piano. Vamos achar?",["Toque escondendo a mão com um pano ou folha.","Deixe a criança apontar para a esquerda ou direita."],"Procura de onde veio o som.","Aponta uma região sem precisar nomeá-la.","🙈"),
S("Duas casas","Aqui é a casa do som grandão. Lá é a casa do som pequenino.",["Coloque um cartão/personagem em cada lado.","Toque uma vez em cada casa."],"Visita as duas casas no teclado.","Distingue os dois lugares.","🏠"),
S("Corre para a casa","O som chamou! Vai para a casa dele!",["Toque um som grave ou agudo.","A criança leva o personagem para o lado correspondente."],"Move o personagem e toca naquele lado.","Escolhe a casa pelo que ouviu.","🏃"),
S("Troca as casas","Agora tu escondes o som de mim.",["A criança escolhe um lado e toca.","O professor finge procurar e deixa a criança confirmar."],"Toca para o professor adivinhar.","Assume a liderança da brincadeira.","🪄"),
S("Casa favorita","Qual casa gostaste mais hoje?",["Deixe escolher grave ou agudo.","Toquem juntos uma última vez."],"Escolhe uma casa e toca.","Consegue mostrar sua preferência.","❤️")),
4:L(
S("Acorda, leão!","Shhh... o leão está dormindo.",["Finja que há um leão dormindo.","Façam silêncio e depois acordem com um rugido divertido."],"Faz silêncio e ruge com o professor.","Entra na história forte/suave.","🦁"),
S("Leão e Coelhinho","ROAR! O leão fala forte. O coelhinho fala baixinho: oi...",["Toque uma nota forte sem bater.","Depois toque a mesma nota bem suave."],"Imita leão forte e coelho suave.","Percebe a diferença de volume.","🐰"),
S("Quem está falando?","É leão ou coelhinho?",["Toque forte ou suave.","A criança mostra o animal e depois imita no piano."],"Escuta, escolhe e toca forte ou suave.","Começa a controlar dois volumes.","👂"),
S("Conversa dos animais","O leão fala... e o coelhinho responde.",["A criança cria um som de leão.","Depois cria a resposta do coelho."],"Faz uma conversa forte/suave.","Usa volume para representar personagens.","🎭"),
S("Boa noite, leão","Agora o leão vai falar baixinho para dormir.",["Façam um último som suave.","Deitem o leão imaginário para dormir."],"Termina com um som suave.","Consegue terminar controlando o toque.","🌙")),
5:L(
S("Passo gigante, passo formiga","Faz um passão... agora um passinho.",["Alterne passos grandes e pequenos no chão.","A criança copia sem piano."],"Faz passos grandes e pequenos.","Entende o contraste pelo corpo.","👣"),
S("Gigante e Formiguinha","O gigante faz um som grandão. A formiguinha faz um som pequenininho.",["Escolha um grave cheio para o gigante.","Escolha um agudo leve para a formiga."],"Toca os dois personagens.","Diferencia os personagens pelo som.","🐜"),
S("Quem passou aqui?","Escuta as pegadas. Quem passou?",["Faça 3 pequenas rodadas.","Depois deixe a criança produzir a pegada."],"Adivinha e cria pegadas sonoras.","Reconhece o contraste sem explicação longa.","🔎"),
S("Caminho maluco","Faz gigante, formiga, gigante!",["Diga uma sequência curta de personagens.","A criança toca usando as regiões correspondentes."],"Segue uma sequência de personagens.","Mantém uma ordem simples de sons.","🛤️"),
S("Última pegada","Escolhe quem deixa a última pegada.",["Deixe escolher gigante ou formiga.","Toque junto e encerre."],"Escolhe o último personagem.","Fecha a aula lembrando do contraste.","⭐")),
6:L(
S("Fita comprida, bolinha","Estica a fita... agora joga a bolinha!",["Estique os braços lentamente.","Depois faça um gesto curto de pulo."],"Imita longo e curto com o corpo.","Sente dois tipos de duração.","🎀"),
S("Som comprido e som pulinho","Ooooooh... este som fica. PIM! Este já foi!",["Deixe uma nota soar bastante.","Depois faça um toque curtinho."],"Escuta e imita longo/curto.","Percebe duração sem termos técnicos.","🔔"),
S("Segura ou pula?","Este som quer ficar ou quer pular?",["Alterne sons longos e curtos.","A criança faz braços abertos para longo e um pulo para curto."],"Responde com gesto e piano.","Relaciona duração a uma ação clara.","🤸"),
S("Faz para eu copiar","Agora tu escolhes: comprido ou pulinho.",["A criança toca.","O professor copia exatamente a duração."],"Cria um som longo ou curto.","Escolhe a duração de propósito.","✨"),
S("Um som que vai embora","Faz um som comprido e escuta até ele sumir.",["Toquem uma nota e deixem soar.","Esperem juntos até desaparecer."],"Escuta o som até o fim.","Consegue esperar e ouvir.","👂")),
7:L(
S("Tum-tum do coração","Põe a mão aqui. Tum... tum... tum...",["Mão no peito e quatro pulsações suaves.","Caminhem juntos nesse pulso."],"Sente e caminha no pulso.","Mantém alguns passos regulares.","❤️"),
S("O tambor invisível","Tum, tum, tum, tum. Não deixa ele fugir!",["Marque um pulso simples nas pernas.","Passe o mesmo pulso para uma tecla."],"Bate e toca no mesmo andar.","Liga movimento e pulso.","🥁"),
S("Anda com a música","Cada TUM ganha um passo.",["Toque pulsos regulares.","A criança caminha e depois toca uma tecla por pulso."],"Anda e toca junto.","Acompanha sem correr atrás do som.","🚶"),
S("Tu és o tambor","Agora eu sigo o teu TUM.",["A criança marca um pulso confortável.","O professor acompanha."],"Lidera um pulso curto.","Mantém um andar musical próprio.","👑"),
S("Coração calminho","Tum... tum... e acabou.",["Façam quatro pulsações finais.","Mão no coração e silêncio."],"Termina quatro pulsos e para.","Percebe começo e fim.","🌟")),
8:L(
S("Urso dormindo","Shhh... não acorda o ursinho.",["Finjam um urso dormindo.","Façam silêncio total por alguns segundos."],"Fica quieta na história.","Entende o momento de parar.","🐻"),
S("Urso acordou!","ACORDA! Agora o urso dança.",["Toque um pulso alegre enquanto o urso está acordado.","Pare completamente quando ele dormir."],"Move quando há som e congela no silêncio.","Distingue som e pausa pelo jogo.","💤"),
S("Dança e dorme","Dança... dança... DORMIU!",["Alterne trechos curtos de música e silêncio.","A criança toca uma tecla no pulso quando acordada."],"Toca/move e para junto.","Para sem precisar de explicação.","🕺"),
S("Manda o urso dormir","Agora tu decides quando ele dorme.",["A criança faz sinal de parar.","O professor corta o som imediatamente."],"Controla som e silêncio.","Usa a pausa como parte da brincadeira.","🪄"),
S("Boa noite, ursinho","Dá um último TUM e põe o urso na cama.",["Um último toque.","Silêncio e despedida."],"Toca e para.","Fecha entendendo o silêncio.","🌙")),
9:L(
S("Palmas mágicas","Eu bato, tu bates.",["Faça duas palmas fáceis.","Espere a criança responder."],"Copia duas palmas.","Percebe a brincadeira de eco.","👏"),
S("Eco na caverna","Olá! ... olá! O eco faz igual.",["Faça um padrão curto de palmas.","Repita como eco e depois convide a criança."],"Escuta e devolve o padrão.","Copia uma ideia curta.","🗣️"),
S("Palma vira piano","Agora as palmas vão morar numa tecla.",["Faça um padrão simples.","A criança copia primeiro com palmas e depois numa tecla."],"Leva o eco ao piano.","Mantém a forma da brincadeira.","🎹"),
S("Eu copio-te","Agora tu inventas e eu copio.",["A criança cria 2–3 batidas.","O professor imita com entusiasmo."],"Lidera um eco.","Cria uma ideia curta.","👑"),
S("Eco baixinho","Faz o último eco bem baixinho.",["Façam um eco suave.","Acenem e terminem."],"Copia o último eco.","Termina ouvindo e respondendo.","👂")),
10:L(
S("Tartaruga andando","Um passinho... outro passinho...",["Andem bem devagar como tartarugas.","Mantenha o movimento divertido."],"Anda devagar.","Reconhece a tartaruga pelo movimento.","🐢"),
S("Chegou o coelhinho!","Olha! O coelhinho corre!",["Faça quatro passos rápidos de coelho.","Volte à tartaruga e contraste."],"Alterna devagar e rápido.","Percebe duas velocidades.","🐇"),
S("Quem está andando?","Tartaruga ou coelhinho?",["Toque repetições lentas ou rápidas numa tecla.","A criança mostra o animal e imita."],"Escolhe e toca na velocidade do animal.","Controla devagar/rápido.","👂"),
S("Corrida dos amigos","Tu escolhes quem sai agora.",["A criança aponta um animal.","Todos tocam/movem na velocidade dele."],"Escolhe a velocidade pelo personagem.","Muda de velocidade com intenção.","🏁"),
S("Tartaruga chegou","A tartaruga chegou devagarinho. Tchau!",["Façam quatro passos lentos finais.","Um toque final no piano."],"Termina devagar.","Consegue voltar ao andamento lento.","⭐")),
11:L(
S("Estátua!","Quando eu disser ESTÁTUA, ninguém mexe.",["Andem com um pulso simples.","Diga ESTÁTUA e congelem."],"Move e congela.","Responde à parada.","🗿"),
S("Som dormindo","O som também sabe dormir.",["Toque duas vezes e faça silêncio.","Mostre o silêncio com dedo nos lábios."],"Toca e espera.","Percebe que o silêncio ocupa um momento.","🤫"),
S("Toca, para, toca","Vai... PAROU... vai!",["Faça ciclos curtos numa tecla.","A criança acompanha sem preencher a pausa."],"Toca apenas quando é hora.","Respeita a pausa.","🚦"),
S("Tu mandas parar","Agora tu és o chefe da estátua.",["A criança dá o sinal de parar.","Professor e criança obedecem."],"Decide quando o som para.","Usa silêncio de propósito.","👑"),
S("Silêncio final","Shhh... acabou.",["Um último som.","Esperem em silêncio até ele desaparecer."],"Escuta o final.","Não precisa preencher o silêncio.","🌙")),
12:L(
S("Festa dos pés","Hoje os pés, as mãos e o piano vão brincar juntos!",["Faça quatro passos.","Faça quatro palmas."],"Entra na sequência corporal.","Lembra brincadeiras conhecidas.","🎉"),
S("Lembra do TUM?","Mostra-me o TUM que não corre.",["Revisem pulso, eco e parada em mini brincadeiras.","Sem explicar nomes."],"Reconhece as brincadeiras.","Participa sem longa instrução.","🥁"),
S("Circuito musical","Passos, palmas, estátua... piano!",["Monte um circuito visual curto.","Façam juntos uma vez e depois a criança lidera."],"Passa pelas quatro estações.","Segue a sequência brincando.","🎪"),
S("Escolhe a tua favorita","Qual queres fazer outra vez?",["Mostre duas brincadeiras conhecidas.","A criança escolhe e lidera."],"Escolhe e repete.","Mostra preferência e memória.","❤️"),
S("Aplausos!","Hoje tu mandaste na festa!",["Aplaudam juntos.","Façam um toque final de celebração."],"Recebe os aplausos.","Termina orgulhosa e tranquila.","👏"))
};

function toStep(id:string,p:PStep,duration:string):LessonStep{
 return {id,icon:p.icon??"🌈",title:p.title,duration,goal:p.title,actions:p.actions,say:p.say,childDoes:p.child,success:p.ok};
}

export function getPreschoolLessonSteps(n:number):LessonStep[]|undefined{
 const x=preschoolLessons[n]; if(!x) return;
 return [
  toStep("warmup",x.open,"2–3 min"),
  toStep("discover",x.discover,"4–5 min"),
  toStep("activity",x.play,"3–5 min"),
  toStep("create",x.create,"2–4 min"),
  toStep("close",x.close,"2–3 min")
 ];
}
