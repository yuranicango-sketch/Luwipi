export const gameStories: Record<string, string> = {
  "elefante-passarinho":
    "O Elefante e o Passarinho perderam os seus sons. Ouça com atenção e ajude cada som a voltar para o personagem certo.",
  "leao-coelhinho":
    "O Leão fala com voz forte e o Coelhinho responde bem baixinho. Descubra quem está a tocar.",
  "siga-tambor":
    "A pequena banda só consegue caminhar quando todos seguem o mesmo pulso. Ajude o tambor a manter a marcha.",
  "eco-musical":
    "A montanha musical repete tudo o que ouve. Escute o padrão e faça o eco voltar igual.",
  "caca-teclas":
    "Pequenos tesouros esconderam-se pelo teclado. Encontre as teclas certas para abrir cada baú.",
  "caminho-cores":
    "As cores criaram uma trilha sobre o piano. Toque na ordem certa para chegar ao fim do caminho.",
  "trem-ritmo":
    "O trem musical precisa do ritmo certo para chegar à próxima estação. Ajude-o a não parar no caminho.",
  "ajude-cordeirinho":
    "Nino, o cordeirinho, ficou para trás. Cada sequência correta aproxima Nino de Maria e da escola.",
  "encontre-do":
    "Vários Dós estão escondidos no piano. Use os grupos de duas teclas pretas para encontrá-los.",
  "pauta-tecla":
    "As notas saltaram da pauta e querem voltar ao piano. Ligue cada nota à tecla certa.",
  "construa-compasso":
    "O compasso ficou incompleto. Junte as figuras certas até preencher exatamente quatro tempos.",
  "ouca-encontre":
    "Uma nota misteriosa tocou no escuro. Ouça e descubra onde ela mora no teclado.",
  "mestre-dedos":
    "Os cinco dedos receberam missões diferentes. Escolha a mão e o dedo certos para completar cada desafio.",
  "legato-staccato":
    "Duas personagens tocam de formas diferentes: uma desliza e a outra salta. Descubra quem é legato e quem é staccato.",
  "construa-acorde":
    "Três notas precisam juntar-se para formar uma equipa. Escolha as notas certas e construa o acorde.",
  "complete-melodia":
    "A melodia parou antes de chegar ao fim. Escolha uma nota para ajudá-la a terminar a história.",
};

export function getGameStory(id: string) {
  return gameStories[id] ?? "Uma pequena missão musical espera por você.";
}
