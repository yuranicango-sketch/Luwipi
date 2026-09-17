import Link from "next/link";
import { Logo } from "@/components/logo";
import { TrialClock } from "@/components/trial-clock";
import { DuoAction } from "@/components/duo-action/duo-action";
import { getCurriculum } from "@/lib/curriculum";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const params = await searchParams;
  const program = getCurriculum(params.age);
  const openingLessons = program.modules[0].lessons;
  const isPreschool = program.age === "2-4";

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/">Sair</Link></header>

      <section className="container demo-dashboard">
        <div className="trial-banner">🎁 Teste grátis · <TrialClock /></div>
        <h1>Vamos tocar? 🎹</h1>
        <p><strong>{program.label}</strong> · {program.name}</p>

        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",margin:"18px 0 30px"}}>
          <Link className="btn btn-soft" href={`/curriculo?age=${program.age}`}>Currículo completo</Link>
          <Link className="btn btn-soft" href="/jogos">🎮 Jogos</Link>
          <Link className="btn btn-soft" href="/musicas">🎵 Músicas</Link>
        </div>

        <div className="section-heading compact" style={{marginBottom:18}}>
          <span>Módulo 1</span>
          <h2>{program.modules[0].title}</h2>
          <p>{program.modules[0].outcome}</p>
        </div>

        <div className="lesson-grid">
          {openingLessons.map((lesson, index) => {
            const cardTone = index % 3 === 0 ? "lesson-pink" : index % 3 === 1 ? "lesson-yellow" : "lesson-blue";
            const route = lesson.route;

            return (
              <article key={lesson.number} className={`lesson-card ${cardTone}`}>
                <span>{String(lesson.number).padStart(2, "0")}</span>
                <h2>{lesson.title}</h2>
                <p>{lesson.focus} · {lesson.duration}</p>

                <div style={{marginTop:"auto",paddingTop:20}}>
                  <DuoAction href={route} disabled={!route}>
                    COMEÇAR
                  </DuoAction>
                </div>
              </article>
            );
          })}
        </div>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:30}}>
          {isPreschool && <Link className="btn btn-soft" href="/recursos/2-4/modulo-1">Materiais do módulo</Link>}
          <Link className="btn btn-primary" href="/professor/tarefas">Criar tarefa</Link>
        </div>
      </section>
    </main>
  );
}
