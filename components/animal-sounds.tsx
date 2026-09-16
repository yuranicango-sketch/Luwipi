"use client";

import { useRef, useState } from "react";

type AnimalSound = {
  name: string;
  emoji: string;
  concept: string;
  prompt: string;
  audio: string[];
  source: string;
  volume: number;
  maxSeconds: number;
};

const sounds: AnimalSound[] = [
  {
    name: "Elefante",
    emoji: "🐘",
    concept: "grave",
    prompt: "Ouça o som grave do elefante e depois procure um som bem lá embaixo no piano.",
    audio: [
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Bee-Threat-Elicits-Alarm-Call-in-African-Elephants-pone.0010346.s003.ogg",
    ],
    source: "https://commons.wikimedia.org/wiki/File:Bee-Threat-Elicits-Alarm-Call-in-African-Elephants-pone.0010346.s003.ogg",
    volume: 0.82,
    maxSeconds: 4.2,
  },
  {
    name: "Passarinho",
    emoji: "🐦",
    concept: "agudo",
    prompt: "Ouça o pio fininho e depois procure um som bem lá no alto no piano.",
    audio: [
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Eastern_Kingbird_Call.ogg",
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Budgerigar_chirping.ogg",
    ],
    source: "https://commons.wikimedia.org/wiki/File:Eastern_Kingbird_Call.ogg",
    volume: 0.48,
    maxSeconds: 2.8,
  },
  {
    name: "Leão",
    emoji: "🦁",
    concept: "forte",
    prompt: "Ouça o rugido e experimente um som forte no piano — com energia, sem bater nas teclas.",
    audio: [
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lion_raring-sound1TamilNadu178.ogg",
    ],
    source: "https://commons.wikimedia.org/wiki/File:Lion_raring-sound1TamilNadu178.ogg",
    volume: 0.48,
    maxSeconds: 3.4,
  },
  {
    name: "Coelhinho",
    emoji: "🐇",
    concept: "suave",
    prompt: "Ouça o coelhinho ronronando baixinho enquanto recebe carinho. Depois toque uma tecla com a mesma delicadeza.",
    audio: [
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4e/Rabbit_grinding_teeth.webm/Rabbit_grinding_teeth.webm.240p.vp9.webm",
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4e/Rabbit_grinding_teeth.webm/Rabbit_grinding_teeth.webm.144p.mjpeg.mov",
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Laut%C3%A4u%C3%9Ferung_Kaninchen.flac",
    ],
    source: "https://commons.wikimedia.org/wiki/File:Rabbit_grinding_teeth.webm",
    volume: 0.42,
    maxSeconds: 4.2,
  },
];

export function AnimalSounds({ className = "" }: { className?: string }) {
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const stopTimer = useRef<number | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function stopCurrent() {
    if (stopTimer.current !== null) {
      window.clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }

    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
  }

  function play(sound: AnimalSound) {
    setError(null);
    stopCurrent();
    setPlaying(sound.name);

    const trySource = (index: number) => {
      if (index >= sound.audio.length) {
        setPlaying(null);
        setError(`Não foi possível carregar o som de ${sound.name}. Tente novamente com internet ativa.`);
        return;
      }

      const audio = new Audio(sound.audio[index]);
      audio.preload = "auto";
      audio.volume = sound.volume;
      currentAudio.current = audio;

      let movedToFallback = false;
      const fallback = () => {
        if (movedToFallback) return;
        movedToFallback = true;
        audio.pause();
        trySource(index + 1);
      };

      audio.onerror = fallback;
      audio.onended = () => {
        if (currentAudio.current === audio) {
          setPlaying(null);
          currentAudio.current = null;
        }
      };

      void audio.play().then(() => {
        stopTimer.current = window.setTimeout(() => {
          if (currentAudio.current === audio) {
            audio.pause();
            audio.currentTime = 0;
            currentAudio.current = null;
            setPlaying(null);
          }
        }, sound.maxSeconds * 1000);
      }).catch(fallback);
    };

    trySource(0);
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
