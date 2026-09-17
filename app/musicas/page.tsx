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
          <h1>Músicas para tocar aqui, na aula e em casa.</h1>
          <p>O professor pode abrir a música dentro do próprio Luwipi, tocar no piano virtual ou acompanhar a criança no piano físico. Enviar ao responsável é uma opção, não o único caminho.</p>
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
                {song.rightsSource && <p style={{fontSize:11,color:"#8490a3",lineHeight:1.45,margin:"8px 0 0"}}>Fonte de direitos: {song.rightsSource}</p>}
                <div className={styles.actions}>
                  {song.playable ? (
                    <>
                      <Link className="btn btn-primary btn-small" href={`/musicas/${song.id}`}>▶ Tocar agora</Link>
                      <Link className="btn btn-soft btn-small" href={`/professor/tarefas?song=${song.id}`}>Enviar como tarefa</Link>
                    </>
                  ) : <span className="btn btn-soft btn-small">Experiência em preparação</span>}
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.note}><strong>Regra da biblioteca:</strong> para repertório em domínio público, usamos a composição tradicional e criamos a nossa própria experiência, arranjo e áudio. Gravações modernas continuam protegidas. Repertório comercial como Baby Shark e 3 Palavrinhas permanece separado até existir autorização/licença adequada.</div>
      </section>
    </main>
  );
}
