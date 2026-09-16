import Link from "next/link";
import { Logo } from "@/components/logo";
import { kidsSongs } from "@/lib/music-library";
import styles from "./musicas.module.css";

function rightsLabel(rights: string) {
  if (rights === "original") return "Original Luwipi";
  if (rights === "public-domain") return "Tradicional / domínio público";
  return "Licença necessária";
}

export default function MusicLibraryPage() {
  return (
    <main className={styles.page}>
      <header className="simple-header container"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>
      <section className={`container ${styles.wrap}`}>
        <div className={styles.hero}>
          <span>Biblioteca musical</span>
          <h1>Músicas que viram pequenas aventuras.</h1>
          <p>Nada de “teclas secas”. Cada música pode ganhar história, personagens, cores, desafios e um caminho simples até o piano físico.</p>
        </div>

        <div className={styles.grid}>
          {kidsSongs.map((song) => {
            const rightsClass = song.rights === "license-required" ? styles.licensed : song.rights === "public-domain" ? styles.public : styles.original;
            return (
              <article className={styles.card} key={song.id}>
                <span className={`${styles.rights} ${rightsClass}`}>{rightsLabel(song.rights)}</span>
                <div className={styles.emoji} aria-hidden="true">{song.emoji}</div>
                <h2>{song.title}</h2>
                <p>{song.subtitle}</p>
                <div className={styles.meta}><span>{song.age === "both" ? "2–8 anos" : `${song.age} anos`}</span><span>{song.difficulty}</span><span>{song.theme}</span></div>
                <p className={styles.story}>{song.story}</p>
                <div className={styles.actions}>
                  {song.playable ? <Link className="btn btn-primary btn-small" href="/professor/tarefas">Criar tarefa →</Link> : <span className="btn btn-soft btn-small">Experiência em preparação</span>}
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.note}><strong>Sobre repertório conhecido:</strong> podemos desenhar experiências para músicas populares como Baby Shark e repertório do 3 Palavrinhas, mas áudio, letra e melodia protegidos só entram no produto quando tivermos autorização/licença adequada. Enquanto isso, a biblioteca pode crescer com composições originais e repertório tradicional.</div>
      </section>
    </main>
  );
}
