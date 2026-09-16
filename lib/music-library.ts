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
  colors?: { note: string; color: string }[];
  sequence?: string[];
};

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
    colors: [
      { note: "Dó", color: "#ff5f86" },
      { note: "Ré", color: "#ffbf3f" },
      { note: "Mi", color: "#64c96b" },
      { note: "Sol", color: "#4b9df8" },
    ],
    sequence: ["Dó", "Ré", "Mi", "Ré", "Dó", "Mi", "Sol", "Mi"],
  },
  {
    id: "estrelinha",
    title: "Brilha, Brilha, Estrelinha",
    subtitle: "Melodia tradicional para primeiros passos",
    age: "both",
    difficulty: "Fácil",
    theme: "céu e estrelas",
    emoji: "⭐",
    rights: "public-domain",
    playable: false,
    story: "Uma estrelinha perdeu o caminho de volta para o céu. Cada pequena frase musical acende uma parte do caminho.",
  },
  {
    id: "maria-cordeirinho",
    title: "Maria Tinha um Cordeirinho",
    subtitle: "História musical com o Nino",
    age: "both",
    difficulty: "Fácil",
    theme: "história e imitação",
    emoji: "🐑",
    rights: "public-domain",
    playable: false,
    story: "Nino quer encontrar Maria. Cada sequência correta faz o cordeirinho avançar pela estrada.",
  },
  {
    id: "baby-shark",
    title: "Baby Shark",
    subtitle: "Experiência planejada para repertório popular",
    age: "both",
    difficulty: "Fácil",
    theme: "oceano e família",
    emoji: "🦈",
    rights: "license-required",
    playable: false,
    story: "A família tubarão atravessa o oceano em pequenas missões musicais, com cores, movimento e imitação.",
  },
  {
    id: "3-palavrinhas",
    title: "3 Palavrinhas",
    subtitle: "Coleção planejada de músicas infantis cristãs",
    age: "both",
    difficulty: "Fácil",
    theme: "fé, histórias e valores",
    emoji: "🎈",
    rights: "license-required",
    playable: false,
    story: "As canções entram como pequenas aventuras ilustradas, sempre com participação da criança e ligação ao piano.",
  },
];

export function getSong(id: string) {
  return kidsSongs.find((song) => song.id === id);
}
