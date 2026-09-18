import type { AgeGroup } from "@/lib/curriculum";
import { games } from "@/lib/games";
import { kidsSongs } from "@/lib/music-library";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const aliases: Array<[string, string]> = [
  ["maria", "maria-cordeirinho"],
  ["estrelinha", "estrelinha"],
  ["brilha brilha", "estrelinha"],
  ["passeio das cores", "passeio-das-cores"],
  ["marcha soldado", "marcha-soldado"],
  ["ciranda", "ciranda-cirandinha"],
  ["sapo cururu", "sapo-cururu"],
  ["sapo nao lava o pe", "sapo-nao-lava-pe"],
  ["peixe vivo", "peixe-vivo"],
  ["boi da cara preta", "boi-cara-preta"],
  ["irmao joao", "irmao-joao"],
  ["rema rema", "rema-rema-barco"],
  ["canoa", "a-canoa-virou"],
  ["cai cai balao", "cai-cai-balao"],
  ["cravo e a rosa", "o-cravo-e-a-rosa"],
  ["escravos de jo", "escravos-de-jo"],
  ["terezinha", "terezinha-de-jesus"],
  ["alecrim", "alecrim-dourado"],
  ["chuva de cores", "chuva-de-cores"],
  ["trem pequenino", "trem-pequenino"],
  ["danca dos animais", "danca-dos-animais"],
  ["baloes no ceu", "baloes-no-ceu"],
  ["passinhos do ursinho", "passinhos-do-ursinho"],
  ["festa dos sinos", "festa-dos-sinos"],
  ["barquinho azul", "barquinho-azul"],
  ["valsa da lua", "valsa-da-lua"],
  ["marcha dos dedos", "marcha-dos-dedos"],
  ["castelo das notas", "castelo-das-notas"],
  ["jardim em do", "jardim-em-do"],
  ["pequeno explorador", "pequeno-explorador"],
  ["danca das estrelas", "danca-das-estrelas"],
  ["chuva na janela", "chuva-na-janela"],
  ["trem da montanha", "trem-da-montanha"],
  ["ponte musical", "ponte-musical"],
  ["rio de melodias", "rio-de-melodias"],
  ["amanhecer no piano", "amanhecer-no-piano"],
  ["passos no bosque", "passos-no-bosque"],
  ["festa em sol", "festa-em-sol"],
  ["cancao do vento", "cancao-do-vento"],
  ["pequena sonatina", "pequena-sonatina"],
  ["aventura em do maior", "aventura-em-do-maior"],
  ["noite de estrelas", "noite-de-estrelas"],
];

export function gameForLesson(age: AgeGroup, lessonNumber: number) {
  return games.find(
    (game) => game.age === age && game.curriculum.includes(lessonNumber),
  );
}

export function songForRepertoire(repertoire: string) {
  const target = normalize(repertoire);
  const direct = kidsSongs
    .filter((song) => song.playable)
    .sort((a, b) => b.title.length - a.title.length)
    .find((song) => target.includes(normalize(song.title)));

  if (direct) return direct;

  for (const [needle, id] of aliases) {
    if (!target.includes(needle)) continue;
    const song = kidsSongs.find((item) => item.id === id && item.playable);
    if (song) return song;
  }

  return undefined;
}

export function lessonResourceSummary(
  age: AgeGroup,
  lessonNumber: number,
  repertoire: string,
) {
  const game = gameForLesson(age, lessonNumber);
  const song = songForRepertoire(repertoire);

  return {
    game,
    song,
    gameHref: game ? `/jogos/${game.id}` : undefined,
    songHref: song ? `/musicas/${song.id}` : undefined,
    homeworkHref: song
      ? `/professor/tarefas?song=${song.id}`
      : "/professor/tarefas",
  };
}
