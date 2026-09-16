import Link from "next/link";
import { Logo } from "@/components/logo";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const params = await searchParams;
  const age = params.age === "2-4" ? "2 a 4 anos" : "5 a 8 anos";

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/">Sair</Link></header>
      <section className="container demo-dashboard">
        <div className="trial-banner">🎁 Teste grátis · 24h disponíveis</div>
        <h1>Bem-vindo à Luwipi</h1>
        <p>Experiência inicial para <strong>{age}</strong>.</p>
        <div className="lesson-grid">
          <article className="lesson-card lesson-pink"><span>01</span><h2>Descobrir os sons</h2><p>Grave, agudo, forte e suave.</p><button>Começar →</button></article>
          <article className="lesson-card lesson-yellow"><span>02</span><h2>Ritmo em movimento</h2><p>Palmas, pulsação e repetição.</p><button>Em breve</button></article>
          <article className="lesson-card lesson-blue"><span>03</span><h2>Primeiras teclas</h2><p>Explore o piano de forma guiada.</p><button>Em breve</button></article>
        </div>
        <p className="dashboard-note">Esta é a fundação visual do produto. As aulas interativas serão adicionadas por fases.</p>
      </section>
    </main>
  );
}
