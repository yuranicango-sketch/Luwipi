import Link from "next/link";
import { Logo } from "@/components/logo";
import { DuoAction } from "@/components/duo-action/duo-action";
import { kidsSongs } from "@/lib/music-library";
import styles from "./musicas.module.css";

function rightsLabel(rights: string) {
  if (rights === "original") return "Original Luwipi";
  if (rights === "public-domain") return "Tradicional";
  return "Licença necessária";
}

export default function MusicLibraryPage() {
  const songs = [...kidsSongs].sort((a, b) => Number(b.playable) - Number(a.playable));

  return (
    <main className={styles.page}>
      <header className="simple-header container"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>

      <section className={`container ${styles.wrap}`}>
        <div className={styles.hero}>
          <span>Biblioteca musical</span>
          <h1>Escolha uma historinha e toque. 🎵</h1>
          <p>Cada música começa com uma pequena história e termina no piano.</p>
        </div>

        <div className={styles.grid}>
          {songs.map((song) => {
            const rightsClass = song.rights === "license-required"
              ? styles.licensed
              : song.rights === "public-domain"
                ? styles.public
                : styles.original;

            return (
              <article className={styles.card} key={song.id} style={{display:"flex",flexDirection:"column"}}>
                <span className={`${styles.rights} ${rightsClass}`}>{rightsLabel(song.rights)}</span>
                <div className={styles.emoji}>{song.emoji}</div>
                <h2>{song.title}</h2>
                <p>{song.subtitle}</p>
                <div className={styles.meta}>
                  <span>{song.age === "both" ? "2–8 anos" : `${song.age} anos`}</span>
                  <span>{song.difficulty}</span>
                </div>

                <p className={styles.story} style={{fontWeight:700,lineHeight:1.55}}>
                  {song.story}
                </p>

                <div style={{marginTop:"auto",paddingTop:16}}>
                  <DuoAction href={song.playable ? `/musicas/${song.id}` : undefined} disabled={!song.playable}>
                    COMEÇAR
                  </DuoAction>

                  {song.playable && (
                    <div style={{textAlign:"center",marginTop:12}}>
                      <Link href={`/professor/tarefas?song=${song.id}`} style={{fontSize:12,fontWeight:900,color:"#6b7b91",textDecoration:"none"}}>
                        Enviar como tarefa
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
