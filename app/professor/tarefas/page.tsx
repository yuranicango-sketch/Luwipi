import Link from "next/link";
import { Logo } from "@/components/logo";
import { HomeworkGenerator } from "@/components/homework-generator";

export default function TeacherHomeworkPage() {
  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/dashboard?age=5-8">← Voltar</Link></header>
      <section className="container" style={{maxWidth:900,paddingTop:36,paddingBottom:80}}>
        <div className="section-heading" style={{marginBottom:28}}>
          <span>Tarefas para casa</span>
          <h1>Crie uma prática que a criança vai querer abrir.</h1>
          <p>Escolha a atividade, defina a meta e gere um código simples para enviar ao responsável.</p>
        </div>
        <HomeworkGenerator />
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:24}}>
          <Link className="btn btn-soft" href="/musicas">Abrir biblioteca musical</Link>
          <Link className="btn btn-soft" href="/tarefa">Ver entrada dos pais</Link>
        </div>
      </section>
    </main>
  );
}
