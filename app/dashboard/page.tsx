import Link from "next/link";
import { Logo } from "@/components/logo";
import { TrialClock } from "@/components/trial-clock";
import { getCurriculum } from "@/lib/curriculum";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const params = await searchParams;
  const program = getCurriculum(params.age);
  const openingLessons = program.modules[0].lessons;
  const isPreschool = program.age === "2-4";
  const extraReady = program.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.route && !openingLessons.includes(lesson));

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/">Sair</Link></header>
      <section className="container demo-dashboard">
        <div className="trial-banner">🎁 Teste grátis · <TrialClock /></div>
        <h1>Vamos tocar? 🎹</h1>
        <p><strong>{program.label}</strong> · {program.name} · {program.duration}</p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",margin:"20px 0 18px"}}>
          {isPreschool && <Link className="btn btn-primary" href="/recursos/2-4/modulo-1">Módulo 1 · materiais →</Link>}
          <Link className={isPreschool ? "btn btn-soft" : "btn btn-primary"} href={`/curriculo?age=${program.age}`}>Ver currículo completo →</Link>
          <Link className="btn btn-soft" href="/onboarding">Trocar faixa etária</Link>
        </div>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",margin:"0 0 34px"}}>
          <Link className="btn btn-soft" href="/jogos">🎮 Game Lab · 16 jogos</Link>
          <Link className="btn btn-soft" href="/musicas">🎵 Biblioteca musical</Link>
          <Link className="btn btn-soft" href="/professor/tarefas">🔑 Criar tarefa por código</Link>
          <Link className="btn btn-soft" href="/tarefa">👨‍👩‍👧 Entrada dos pais</Link>
        </div>

        <div className="section-heading compact" style={{marginBottom:20}}>
          <span>Módulo 1</span><h2>{program.modules[0].title}</h2><p>{program.modules[0].outcome}</p>
          {isPreschool && <p style={{maxWidth:720,margin:"10px auto 0",fontSize:13}}>O Luwipi acompanha o professor e alterna ecrã, materiais, movimento e piano físico.</p>}
        </div>

        <div className="lesson-grid">
          {openingLessons.map((lesson, index) => (
            <article key={lesson.number} className={`lesson-card ${index % 3 === 0 ? "lesson-pink" : index % 3 === 1 ? "lesson-yellow" : "lesson-blue"}`}>
              <span>{String(lesson.number).padStart(2, "0")}</span><h2>{lesson.title}</h2><p>{lesson.focus} · {lesson.duration}</p>
              {isPreschool ? <Link className="lesson-link" href="/recursos/2-4/modulo-1">Ver materiais →</Link> : lesson.route ? <Link className="lesson-link" href={lesson.route}>Começar →</Link> : <button disabled>Em preparação</button>}
            </article>
          ))}
        </div>

        {!isPreschool && extraReady.length > 0 && (
          <div style={{marginTop:28,textAlign:"center"}}><p style={{color:"#657497",fontWeight:800}}>Protótipos interativos já disponíveis:</p><div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>{extraReady.map((lesson) => <Link key={lesson.number} className="btn btn-soft" href={lesson.route!}>{lesson.title} →</Link>)}</div></div>
        )}

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:34}}><a className="btn btn-primary" href="https://wa.me/244933400445?text=Ol%C3%A1%2C%20quero%20ativar%20o%20Luwipi." target="_blank" rel="noreferrer">Ativar pelo WhatsApp</a></div>
      </section>
    </main>
  );
}
