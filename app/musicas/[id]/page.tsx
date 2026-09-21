import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { SongPractice } from "@/components/song-practice";
import { getSong } from "@/lib/music-library";

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = getSong(id);
  if (!song || !song.playable || !song.sequence?.length) notFound();

  const homeworkHref = "/professor/tarefas?song=" + encodeURIComponent(song.id);

  return (
    <main className="dashboard-page">
      <header className="simple-header container">
        <Logo />
        <Link href="/musicas">← Músicas</Link>
      </header>

      <section className="container" style={{ maxWidth: 1100, padding: "18px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "#fff", border: "1px solid #e6edf5", borderRadius: 20, padding: "16px 18px" }}>
          <div>
            <small style={{ fontWeight: 900, letterSpacing: ".08em", opacity: .65 }}>TAREFA PARA CASA</small>
            <p style={{ margin: "5px 0 0" }}>Pratique a música na aula e envie a mesma experiência para o aluno continuar em casa.</p>
          </div>
          <Link className="btn btn-primary" href={homeworkHref}>Criar tarefa desta música →</Link>
        </div>
      </section>

      <SongPractice song={song} />
    </main>
  );
}
