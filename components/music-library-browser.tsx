"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { KidsSong } from "@/lib/music-types";
import styles from "./music-library-browser.module.css";

type AgeFilter = "all" | "2-4" | "5-8";
type DifficultyFilter = "all" | KidsSong["difficulty"];
const FAVORITES_KEY = "luwipi:music:favorites:v1";

function ageLabel(age: KidsSong["age"]) { return age === "both" ? "2–9 anos" : age === "5-8" ? "5–9 anos" : "2–4 anos"; }
function rightsLabel(song: KidsSong) { return song.rights === "original" ? "LuwiPi" : song.rights === "public-domain" ? "Tradicional" : "Licença futura"; }

export function MusicLibraryBrowser({ songs }: { songs: KidsSong[] }) {
  const [query, setQuery] = useState("");
  const [age, setAge] = useState<AgeFilter>("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [onlyScore, setOnlyScore] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => { try { setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]")); } catch { setFavorites([]); } }, []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  const filtered = useMemo(() => songs.filter((song) => {
    const text = `${song.title} ${song.subtitle} ${song.theme}`.toLocaleLowerCase("pt");
    const matchesText = !query.trim() || text.includes(query.trim().toLocaleLowerCase("pt"));
    const matchesAge = age === "all" || song.age === "both" || song.age === age;
    const matchesDifficulty = difficulty === "all" || song.difficulty === difficulty;
    const matchesScore = !onlyScore || Boolean(song.sheetMusic);
    const matchesFavorite = !onlyFavorites || favorites.includes(song.id);
    return matchesText && matchesAge && matchesDifficulty && matchesScore && matchesFavorite;
  }), [songs, query, age, difficulty, onlyScore, onlyFavorites, favorites]);

  const playable = songs.filter((song) => song.playable).length;
  const scoreCount = songs.filter((song) => song.playable && song.sheetMusic).length;

  return <div className={styles.wrap}>
    <section className={styles.hero}>
      <div><span className={styles.eyebrow}>BIBLIOTECA MUSICAL</span><h1>Escolha uma música.<br/><em>O LuwiPi ensina o resto.</em></h1><p>Partitura interativa, modo “espera pela nota”, piano na tela, MIDI e reconhecimento pelo microfone.</p><div className={styles.stats}><span><b>{playable}</b> prontas para tocar</span><span><b>{scoreCount}</b> com partitura</span><Link href="/treino">Treino de 5 min →</Link></div></div>
      <div className={styles.heroScore} aria-hidden="true"><i>𝄞</i><div><span>♪</span><span>♪</span><span>♩</span><span>♪</span></div><b>TOCA. O CURSOR ESPERA.</b></div>
    </section>

    <section className={styles.controls}>
      <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Procurar música, tema ou atividade…" /></label>
      <div className={styles.filters}>
        <select value={age} onChange={(event) => setAge(event.target.value as AgeFilter)} aria-label="Filtrar por idade"><option value="all">Todas as idades</option><option value="2-4">2–4 anos</option><option value="5-8">5–9 anos</option></select>
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)} aria-label="Filtrar por dificuldade"><option value="all">Todos os níveis</option><option value="Muito fácil">Muito fácil</option><option value="Fácil">Fácil</option><option value="Intermédio">Intermédio</option></select>
        <button type="button" data-active={onlyScore} onClick={() => setOnlyScore((value) => !value)}>𝄞 Partitura</button>
        <button type="button" data-active={onlyFavorites} onClick={() => setOnlyFavorites((value) => !value)}>♥ Favoritas</button>
      </div>
    </section>

    <div className={styles.resultLine}><strong>{filtered.length}</strong> {filtered.length === 1 ? "música encontrada" : "músicas encontradas"}</div>
    <section className={styles.grid}>
      {filtered.map((song) => {
        const favorite = favorites.includes(song.id);
        return <article className={styles.card} key={song.id} data-playable={song.playable ? "true" : "false"}>
          <div className={styles.art}><span>{song.emoji}</span>{song.sheetMusic && <b>𝄞</b>}<button type="button" onClick={() => toggleFavorite(song.id)} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} data-on={favorite}>{favorite ? "♥" : "♡"}</button></div>
          <div className={styles.body}><div className={styles.badges}><span>{ageLabel(song.age)}</span><span>{song.difficulty}</span>{song.timeSignature && <span>{song.timeSignature}</span>}</div><h2>{song.title}</h2><p>{song.subtitle}</p><div className={styles.capabilities}>{song.sheetMusic && <span>✓ Partitura</span>}<span>✓ Piano</span>{song.playable && <span>✓ MIDI / mic</span>}</div><div className={styles.cardBottom}><small>{rightsLabel(song)}</small>{song.playable ? <Link href={`/musicas/${song.id}`}>TOCAR →</Link> : <span className={styles.soon}>EM BREVE</span>}</div></div>
        </article>;
      })}
    </section>
    {!filtered.length && <section className={styles.empty}><span>🎼</span><h2>Nenhuma música com estes filtros.</h2><button type="button" onClick={() => { setQuery(""); setAge("all"); setDifficulty("all"); setOnlyScore(false); setOnlyFavorites(false); }}>Limpar filtros</button></section>}
  </div>;
}
