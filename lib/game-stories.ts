export const gameStories:Record<string,string>={
 "elefante-passarinho":"No Vale do Gigante, um som profundo acorda o Gigante e um som brilhante acende a Estrelinha. Ouça sem pressa e descubra quem chamou.",
 "leao-coelhinho":"O desfiladeiro responde de duas formas: às vezes como um trovão, às vezes como uma brisa. Descubra a intensidade antes do eco desaparecer.",
 "siga-tambor":"As luzes da Estação do Ritmo só ficam verdes quando o pulso está estável. Mantenha a mesma distância entre as batidas para abrir caminho.",
 "eco-musical":"A Caverna do Eco guarda padrões curtos. Ouça primeiro e devolva o ritmo para fazer as ondas atravessarem o vale.",
 "caca-teclas":"O Reino das Teclas esconde portais pelo teclado. Cada tecla certa acende um novo ponto do caminho até ao castelo.",
 "caminho-cores":"Pedras musicais atravessam o Rio das Cores. Memorize a ordem e toque-a no piano para iluminar a próxima pedra.",
 "trem-ritmo":"O Expresso do Ritmo só chega à estação se o pulso continuar firme quando a viagem fica mais rápida.",
 "ajude-cordeirinho":"Uma pequena melodia atravessa o rio por etapas. Cada frase correta constrói a próxima parte da trilha.",
 "encontre-do":"Os portais de Dó aparecem em regiões diferentes do teclado. Use o mapa das teclas pretas e encontre-os sem depender de etiquetas.",
 "pauta-tecla":"Na Cidade da Pauta, cada símbolo precisa encontrar a tecla que lhe dá voz. Leia primeiro; só depois toque.",
 "construa-compasso":"A Oficina do Compasso precisa de exatamente quatro tempos. Construa cada compasso sem ultrapassar a medida.",
 "ouca-encontre":"O Radar Sonoro envia uma nota sem mostrar onde ela está. Ouça, procure no teclado e confirme com o ouvido.",
 "mestre-dedos":"A Oficina dos Dedos liga número, mão e tecla. Complete o caminho com movimento controlado, sem tensão.",
 "legato-staccato":"Na Ponte da Articulação, alguns sons atravessam ligados e outros saltam de pedra em pedra. Descubra como cada frase se move.",
 "construa-acorde":"A Torre dos Acordes só acende quando as três notas certas se juntam. Construa Dó, Fá e Sol maior por níveis.",
 "complete-melodia":"No Atelier da Melodia, as frases ficam incompletas de propósito. Primeiro reconheça finais; depois comece a criar os seus.",
};
export function getGameStory(id:string){return gameStories[id]??"Uma missão musical em três níveis espera por você."}
