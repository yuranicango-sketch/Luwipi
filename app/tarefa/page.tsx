import Link from "next/link";
import { Logo } from "@/components/logo";
import { HomeworkCodeEntry } from "@/components/homework-code-entry";

export default function HomeworkLandingPage() {
  return (
    <main style={{minHeight:"100vh",background:"radial-gradient(circle at 18% 10%,#fff1c7,transparent 30%),radial-gradient(circle at 84% 12%,#dff3ff,transparent 30%),#fffdf8"}}>
      <header className="simple-header container"><Logo/><Link href="/">Início</Link></header>
      <section className="container" style={{paddingTop:60,paddingBottom:90,textAlign:"center"}}>
        <div className="section-heading" style={{marginBottom:28}}>
          <span>Tarefa de casa</span>
          <h1>Vamos praticar um pouquinho? 🎹</h1>
          <p>Digite o código que o professor enviou. Não é preciso criar conta para abrir uma tarefa.</p>
        </div>
        <HomeworkCodeEntry />
        <p style={{maxWidth:620,margin:"22px auto 0",color:"#738095",fontSize:13,lineHeight:1.5}}>A tarefa foi preparada pelo professor para continuar a aprendizagem entre as aulas, de forma curta, visual e adequada para crianças.</p>
      </section>
    </main>
  );
}
