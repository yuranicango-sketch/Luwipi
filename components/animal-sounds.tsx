"use client";

import { useRef, useState } from "react";

type AnimalSound = {
  name: string;
  emoji: string;
  concept: string;
  prompt: string;
  audio: string;
  source: string;
};

const sounds: AnimalSound[] = [
  {
    name: "Elefante",
    emoji: "🐘",
    concept: "grave",
    prompt: "Ouça o elefante e depois procure um som bem grave no piano.",
    audio: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Elephant_voice_-_trumpeting.ogg",
    source: "https://commons.wikimedia.org/wiki/File:Elephant_voice_-_trumpeting.ogg",
  },
  {
    name: "Passarinho",
    emoji: "🐦",
    concept: "agudo",
    prompt: "Ouça o passarinho e procure um som bem agudo no piano.",
    audio: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Budgerigar_chirping.ogg",
    source: "https://commons.wikimedia.org/wiki/File:Budgerigar_chirping.ogg",
  },
  {
    name: "Leão",
    emoji: "🦁",
    concept: "forte",
    prompt: "Ouça o rugido e experimente um som forte, sem bater no teclado.",
    audio: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lion_raring-sound1TamilNadu178.ogg",
    source: "https://commons.wikimedia.org/wiki/File:Lion_raring-sound1TamilNadu178.ogg",
  },
  {
    name: "Coelhinho",
    emoji: "🐇",
    concept: "suave",
    prompt: "Ouça com atenção: o coelho é bem mais discreto. Depois toque bem suave.",
    audio: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Laut%C3%A4u%C3%9Ferung_Kaninchen.flac",
    source: "https://commons.wikimedia.org/wiki/File:Laut%C3%A4u%C3%9Ferung_Kaninchen.flac",
  },
];

export function AnimalSounds({ className = "" }: { className?: string }) {
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function play(sound: AnimalSound) {
    setError(null);
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }

    const audio = new Audio(sound.audio);
    currentAudio.current = audio;
    setPlaying(sound.name);
    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      setPlaying(null);
      setError(`Não foi possível carregar o som de ${sound.name}. Tente novamente com internet ativa.`);
    };
    void audio.play().catch(() => {
      setPlaying(null);
      setError(`O navegador bloqueou o áudio de ${sound.name}. Toque novamente no botão.`);
    });
  }

  return (
    <div className={className}>
      <div className="animal-sound-grid">
        {sounds.map((sound) => (
          <article className="animal-sound-card" key={sound.name}>
            <div className="animal-sound-emoji" aria-hidden="true">{sound.emoji}</div>
            <div className="animal-sound-copy">
              <div className="animal-sound-concept">{sound.concept}</div>
              <h3>{sound.name}</h3>
              <p>{sound.prompt}</p>
            </div>
            <button
              className={`animal-sound-button ${playing === sound.name ? "is-playing" : ""}`}
              type="button"
              onClick={() => play(sound)}
            >
              {playing === sound.name ? "🔊 Tocando…" : "▶ Ouvir som"}
            </button>
            <a className="animal-sound-source" href={sound.source} target="_blank" rel="noreferrer">
              Fonte do áudio
            </a>
          </article>
        ))}
      </div>
      {error && <div className="animal-sound-error" role="status">{error}</div>}
    </div>
  );
}
