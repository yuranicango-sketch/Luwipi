import Link from "next/link";
import { Logo } from "@/components/logo";
import { StudentManager } from "@/components/student-manager";
import { HomeworkGenerator } from "@/components/homework-generator";
import { HomeworkOverview } from "@/components/homework-overview";

export default function TeacherHomeworkPage() {
  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>
      <section className="container" style={{maxWidth:980,paddingTop:36,paddingBottom:80}}>
        <div className="section-heading" style={{marginBottom:28}}>
          <span>Espaço do professor · Fase 1</span>
          <h1>Organize alunos e mande práticas que dão vontade de abrir.</h1>
          <p>Cadastre a criança, escolha uma experiência musical e gere um código simples para o responsável.</p>
        </div>

        <StudentManager />

        <div className="section-heading compact" style={{margin:"34px 0 20px"}}>
          <span>Criar tarefa</span>
          <h2>Da aula para casa em poucos segundos.</h2>
        </div>
        <HomeworkGenerator />
        <HomeworkOverview />

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:24}}>
          <Link className="btn btn-soft" href="/musicas">Abrir biblioteca musical</Link>
          <Link className="btn btn-soft" href="/tarefa">Ver entrada dos pais</Link>
        </div>
      </section>
    </main>
  );
}
