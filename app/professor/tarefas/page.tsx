import Link from "next/link";
import { Logo } from "@/components/logo";
import { StudentManager } from "@/components/student-manager";
import { HomeworkGenerator } from "@/components/homework-generator";
import { HomeworkOverview } from "@/components/homework-overview";

export default async function TeacherHomeworkPage({ searchParams }: { searchParams: Promise<{ song?: string }> }) {
  const params = await searchParams;

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>
      <section className="container" style={{maxWidth:980,paddingTop:36,paddingBottom:80}}>
        <div className="section-heading" style={{marginBottom:28}}>
          <span>Espaço do professor</span>
          <h1>Faça a experiência na aula. Envie para casa só se quiser.</h1>
          <p>Escolha uma música, abra e pratique dentro do próprio Luwipi. Depois você pode gerar um código para o responsável continuar exatamente a mesma experiência em casa.</p>
        </div>

        <StudentManager />

        <div className="section-heading compact" style={{margin:"34px 0 20px"}}>
          <span>Música e tarefa</span>
          <h2>Uma experiência, dois contextos: aula e casa.</h2>
        </div>
        <HomeworkGenerator initialSongId={params.song} />
        <HomeworkOverview />

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:24}}>
          <Link className="btn btn-soft" href="/musicas">Abrir biblioteca musical</Link>
          <Link className="btn btn-soft" href="/tarefa">Ver entrada dos pais</Link>
        </div>
      </section>
    </main>
  );
}
