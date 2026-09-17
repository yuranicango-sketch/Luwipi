import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { getGame } from "@/lib/games";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/jogos">← Todos os jogos</Link></header>
      <section className="container demo-dashboard" style={{ maxWidth: 900 }}>
        <div className="eyebrow">Jogo {String(game.number).padStart(2, "0")} · {game.age} anos</div>
        <h1>{game.emoji} {game.title}</h1>
        <p><strong>{game.skill}</strong> · {game.session}</p>
        <div className="auth-card" style={{ margin: "28px auto", maxWidth: 760, textAlign: "left" }}>
          <h2>Objetivo</h2><p>{game.goal}</p>
          <h2 style={{ marginTop: 24 }}>Progressão</h2>
          <ol>{game.levels.map((level) => <li key={level} style={{ margin: "10px 0" }}>{level}</li>)}</ol>
          <p style={{ marginTop: 22 }}><strong>Aulas relacionadas:</strong> {game.curriculum.join(", ")}</p>
          <p><strong>Motor:</strong> {game.engine}</p>
        </div>
        <p style={{ color: "#657497" }}>Esta é a ficha-base. A experiência interativa será refinada jogo por jogo.</p>
      </section>
    </main>
  );
}
