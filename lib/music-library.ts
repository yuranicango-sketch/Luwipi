export type MusicRights = "original" | "public-domain" | "license-required";

export type KidsSong = {
  id: string;
  title: string;
  subtitle: string;
  age: "2-4" | "5-8" | "both";
  difficulty: "Muito fácil" | "Fácil" | "Intermédio";
  theme: string;
  emoji: string;
  rights: MusicRights;
  playable: boolean;
  story: string;
  rightsSource?: string;
  colors?: { note: string; color: string }[];
  sequence?: string[];
};

const rainbowNotes = [
  { note: "Dó", color: "#ff5f86" },
  { note: "Ré", color: "#ffbf3f" },
  { note: "Mi", color: "#64c96b" },
  { note: "Fá", color: "#4fc8c1" },
  { note: "Sol", color: "#4b9df8" },
  { note: "Lá", color: "#8f74eb" },
  { note: "Si", color: "#d264d7" },
];

const song = (
  id: string,
  title: string,
  subtitle: string,
  age: KidsSong["age"],
  difficulty: KidsSong["difficulty"],
  theme: string,
  emoji: string,
  story: string,
  sequence: string[],
  rightsSource = "Cantiga tradicional em domínio público; arranjo pedagógico simplificado Luwipi.",
): KidsSong => ({
  id, title, subtitle, age, difficulty, theme, emoji,
  rights: "public-domain", playable: true, story, sequence,
  colors: rainbowNotes, rightsSource,
});

export const kidsSongs: KidsSong[] = [
  {
    id: "passeio-das-cores",
    title: "O Passeio das Cores",
    subtitle: "Uma mini música original Luwipi",
    age: "2-4",
    difficulty: "Muito fácil",
    theme: "cores e movimento",
    emoji: "🌈",
    rights: "original",
    playable: true,
    story: "Quatro cores querem atravessar o jardim musical. Cada tecla ajuda uma cor a dar um passo. Vamos levar todas até a festa?",
    colors: rainbowNotes,
    sequence: ["Dó", "Ré", "Mi", "Ré", "Dó", "Mi", "Sol", "Mi"],
  },
  song("estrelinha", "Brilha, Brilha, Estrelinha", "Melodia tradicional para primeiros passos", "both", "Fácil", "céu e estrelas", "⭐", "Uma estrelinha perdeu o caminho de volta para o céu. Cada frase musical acende uma nova estrela até o céu ficar completo.", ["Dó","Dó","Sol","Sol","Lá","Lá","Sol","Fá","Fá","Mi","Mi","Ré","Ré","Dó"]),
  song("maria-cordeirinho", "Maria Tinha um Cordeirinho", "História musical com o Nino", "both", "Fácil", "história e imitação", "🐑", "Maria foi para a escola, mas Nino ficou para trás. Cada sequência correta ajuda o cordeirinho a seguir as pegadas de Maria.", ["Mi","Ré","Dó","Ré","Mi","Mi","Mi","Ré","Ré","Ré","Mi","Sol","Sol"]),
  song("irmao-joao", "Irmão João", "O sino que acorda a vila", "both", "Fácil", "sinos e repetição", "🔔", "A vila ainda está dormindo. Toque pequenas frases para acordar as janelas, o sino e finalmente o Irmão João.", ["Dó","Ré","Mi","Dó","Dó","Ré","Mi","Dó","Mi","Fá","Sol","Mi","Fá","Sol"]),
  song("rema-rema-barco", "Rema, Rema, Rema o Barco", "Uma viagem de barco pelo rio musical", "both", "Fácil", "água e movimento", "🚣", "O barquinho precisa atravessar o rio. Cada nota faz o barco remar um pouco mais até chegar à margem colorida.", ["Dó","Dó","Dó","Ré","Mi","Mi","Ré","Mi","Fá","Sol"]),
  song("se-essa-rua-fosse-minha", "Se Essa Rua Fosse Minha", "Uma rua que se constrói nota por nota", "both", "Fácil", "imaginação e fraseado", "🏘️", "A rua começa vazia. Cada trecho musical coloca pedrinhas, árvores e luzes até ela virar uma rua encantada.", ["Mi","Mi","Ré","Mi","Fá","Mi","Ré","Dó","Ré","Mi","Fá","Sol","Fá","Mi","Ré"]),
  song("ciranda-cirandinha", "Ciranda, Cirandinha", "Cantiga de roda para transformar ritmo em movimento", "both", "Fácil", "roda e movimento", "🟡", "A roda está vazia. Cada frase musical chama um novo amigo até todos darem as mãos na ciranda.", ["Sol","Sol","Mi","Mi","Fá","Fá","Ré","Sol","Sol","Mi","Mi","Fá","Fá","Ré"]),
  song("sapo-cururu", "Sapo Cururu", "Uma noite musical na beira do rio", "both", "Fácil", "animais e noite", "🐸", "O sapinho está à beira do rio. Cada frase musical ilumina uma vitória-régia e mostra o caminho de casa.", ["Dó","Dó","Ré","Mi","Mi","Ré","Dó","Mi","Mi","Fá","Sol","Sol","Fá","Mi"]),
  song("sapo-nao-lava-pe", "O Sapo Não Lava o Pé", "Ritmo, humor e repetição", "both", "Fácil", "animais e ritmo", "🫧", "O sapo deixou pegadas pela lagoa. Cada trecho tocado limpa uma pegadinha até a trilha ficar brilhando.", ["Dó","Fá","Fá","Dó","Ré","Dó","Lá","Dó","Fá","Fá","Dó","Ré","Dó","Lá"]),
  song("a-canoa-virou", "A Canoa Virou", "Uma aventura para remar no pulso certo", "both", "Fácil", "mar, pulso e nomes", "🛶", "A canoa virou e os amigos ficaram espalhados pela água. Cada frase musical ajuda um amigo a voltar para bordo.", ["Sol","Sol","Mi","Mi","Fá","Fá","Ré","Ré","Mi","Fá","Sol","Sol","Sol","Dó"]),
  song("peixe-vivo", "Peixe Vivo", "Melodia brasileira para tocar com expressão", "5-8", "Intermédio", "água e fraseado", "🐟", "Um peixinho atravessa águas calmas e agitadas. A música ajuda o peixe a respirar entre uma onda e outra.", ["Sol","Sol","Lá","Sol","Mi","Sol","Sol","Lá","Sol","Mi","Mi","Ré","Dó","Ré","Mi"]),
  song("boi-cara-preta", "Boi da Cara Preta", "Graves, passos e contrastes sonoros", "2-4", "Muito fácil", "grave e movimento", "🐂", "Um boi grandalhão caminha devagar pelo campo. Cada nota faz uma pegada aparecer no caminho.", ["Sol","Sol","Mi","Mi","Fá","Fá","Ré","Mi","Mi","Ré","Ré","Dó"]),
  song("cai-cai-balao", "Cai, Cai, Balão", "Uma aventura de festa e movimento", "both", "Fácil", "festa, altura e direção", "🎈", "Um balão colorido sobe e desce sobre a festa. Cada frase musical ajuda a guiá-lo com segurança pelo céu.", ["Sol","Sol","Fá","Mi","Sol","Sol","Fá","Mi","Sol","Lá","Sol","Fá","Mi","Ré"]),
  song("o-cravo-e-a-rosa", "O Cravo e a Rosa", "Uma história musical entre duas flores", "both", "Fácil", "história e diálogo musical", "🌹", "O Cravo e a Rosa estão em lados diferentes do jardim. Cada frase musical faz uma ponte de flores crescer entre os dois.", ["Sol","Sol","Mi","Mi","Fá","Fá","Ré","Mi","Fá","Sol","Mi","Ré","Dó"]),
  song("escravos-de-jo", "Escravos de Jó", "Pulso, coordenação e jogo coletivo", "5-8", "Intermédio", "ritmo e coordenação", "🪘", "Pequenos objetos coloridos precisam passar de mão em mão sem perder o pulso. A música mantém todos juntos.", ["Dó","Mi","Sol","Sol","Sol","Mi","Dó","Ré","Fá","Lá","Lá","Sol","Fá","Mi"]),
  song("marcha-soldado", "Marcha, Soldado", "Passos firmes para sentir a pulsação", "both", "Muito fácil", "pulso e movimento", "🥁", "Um pequeno desfile atravessa a cidade. Cada nota correta faz a banda avançar mais uma casa.", ["Sol","Sol","Dó","Dó","Ré","Ré","Dó","Mi","Mi","Fá","Fá","Sol"]),
  song("terezinha-de-jesus", "Terezinha de Jesus", "Uma cantiga de roda para ouvir e contar", "5-8", "Fácil", "melodia e memória", "🌼", "Terezinha percorre um jardim musical. Cada frase memorizada abre um novo portão entre as flores.", ["Sol","Sol","Lá","Sol","Fá","Mi","Ré","Mi","Fá","Sol","Sol","Fá","Mi","Ré"]),
  song("alecrim-dourado", "Alecrim Dourado", "Uma pequena história no jardim", "both", "Fácil", "natureza e melodia", "🌿", "No jardim do Luwipi, cada nota faz nascer uma nova folha de alecrim. Ao completar a frase, o jardim floresce.", ["Dó","Mi","Sol","Sol","Fá","Mi","Ré","Dó","Ré","Mi","Fá","Sol","Mi","Dó"]),
  {
    id: "baby-shark", title: "Bebê Tubarão", subtitle: "Experiência planejada para repertório popular", age: "both", difficulty: "Fácil", theme: "oceano e família", emoji: "🦈", rights: "license-required", playable: false,
    story: "A família tubarão atravessa o oceano em pequenas missões musicais, com cores, movimento e imitação.",
  },
  {
    id: "3-palavrinhas", title: "3 Palavrinhas", subtitle: "Coleção planejada de músicas infantis cristãs", age: "both", difficulty: "Fácil", theme: "fé, histórias e valores", emoji: "🎈", rights: "license-required", playable: false,
    story: "As canções entram como pequenas aventuras ilustradas, sempre com participação da criança e ligação ao piano.",
  },
];

export function getSong(id: string) {
  return kidsSongs.find((song) => song.id === id);
}
