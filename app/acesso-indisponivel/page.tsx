import Link from "next/link";
import { Logo } from "@/components/logo";

export default async function AccessUnavailablePage({searchParams}:{searchParams:Promise<{next?:string}>}) {
  const params=await searchParams;
  const next=params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  return <main className="auth-page">
    <header className="simple-header container"><Logo/><Link href="/">Início</Link></header>
    <section className="container" style={{maxWidth:760,padding:"80px 20px",textAlign:"center"}}>
      <div className="eyebrow">VERIFICAÇÃO INDISPONÍVEL</div>
      <h1 style={{fontSize:"clamp(2.5rem,7vw,4.5rem)",lineHeight:1,margin:"12px 0"}}>Não conseguimos confirmar o acesso agora.</h1>
      <p style={{fontSize:18,lineHeight:1.6,opacity:.75}}>Isto é uma falha técnica de verificação, não significa que o teste ou a subscrição expiraram. Se este dispositivo tiver uma validação recente, o Luwipi usa automaticamente essa janela curta.</p>
      <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:28}}>
        <Link className="btn btn-primary" href={next}>Tentar novamente →</Link>
        <Link className="btn" href="/offline-aula">Retomar aula local</Link>
      </div>
    </section>
  </main>;
}
