import Link from "next/link";
import { Logo } from "@/components/logo";
import { TrialClock } from "@/components/trial-clock";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const params = await searchParams;
  const isYoung = params.age === "2-4";
  const age = isYoung ? "2 a 4 anos" : "5 a 8 anos";

  const lessons = isYoung
    ? [
        { n: "01", title: "Descobrir os sons", text: "Grave, agudo, forte e suave.", href: "/aulas/sons", tone: "lesson-pink", ready: true },
        { n: "02", title: "Ritmo em movimento", text: "Palmas, pulsação e repetição.", href: "/aulas/ritmo", tone: "lesson-yellow", ready: true },
        { n: "03", title: "Explorar as teclas", text: "Primeiros encontros com o piano.", href: "#", tone: "lesson-blue", ready: false },
      ]
    : [
        { n: "01", title: "Os dedos no piano", text: "Dedos 1–5 e primeiras sequências.", href: "/aulas/dedos", tone: "lesson-pink", ready: true },
        { n: "02", title: "As teclas do piano", text: "Brancas, pretas e grupos de 2 e 3.", href: "/aulas/teclas", tone: "lesson-yellow", ready: true },
        { n: "03", title: "Encontre o Dó", text: "Localização e orientação no teclado.", href: "#", tone: "lesson-blue", ready: false },
      ];

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/">Sair</Link></header>
      <section className="container demo-dashboard">
        <div className="trial-banner">🎁 Teste grátis · <TrialClock /></div>
        <h1>Vamos tocar? 🎹</h1>
        <p>Experiência para <strong>{age}</strong>.</p>
        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <article key={lesson.n} className={`lesson-card ${lesson.tone}`}>
              <span>{lesson.n}</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.text}</p>
              {lesson.ready ? <Link className="lesson-link" href={lesson.href}>Começar →</Link> : <button disabled>Em breve</button>}
            </article>
          ))}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:28}}>
          <Link className="btn btn-soft" href="/onboarding">Trocar faixa etária</Link>
          <a className="btn btn-primary" href="https://wa.me/244933400445?text=Ol%C3%A1%2C%20quero%20ativar%20o%20Luwipi." target="_blank" rel="noreferrer">Ativar pelo WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
