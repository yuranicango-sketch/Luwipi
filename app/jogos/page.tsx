import Link from "next/link";
import { Logo } from "@/components/logo";
import { gamesForAge } from "@/lib/games";

function GameGroup({ age, title }: { age: "2-4" | "5-8"; title: string }) {
  const list = gamesForAge(age);
  return (
    <section style={{ marginTop: 38 }}>
      <div className="section-heading compact"><span>{age} anos</span><h2>{title}</h2><p>Jogos curtos ligados ao currículo de seis meses.</p></div>
      <div className="lesson-grid">
        {list.map((game, index) => (
          <article key={game.id} className={`lesson-card ${index % 3 === 0 ? "lesson-pink" : index % 3 === 1 ? "lesson-yellow" : "lesson-blue"}`}>
            <span>{game.emoji}</span><h2>{game.title}</h2><p>{game.skill} · {game.session}</p>
            <Link className="lesson-link" href={`/jogos/${game.id}`}>Abrir ficha →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function GamesPage() {
  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/dashboard">← Dashboard</Link></header>
      <section className="container demo-dashboard">
        <div className="eyebrow">Game Lab</div>
        <h1>16 jogos para aprender brincando 🎮</h1>
        <p>Base pronta para revisão e implementação jogo a jogo. Sem vidas, sem punição por erro e com sessões curtas.</p>
        <GameGroup age="2-4" title="Jogos de descoberta e movimento" />
        <GameGroup age="5-8" title="Jogos de leitura, ouvido e técnica" />
      </section>
    </main>
  );
}
