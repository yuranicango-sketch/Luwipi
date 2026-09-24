import Link from "next/link";
import { Logo } from "@/components/logo";

export default async function AccessUnavailablePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";

  return <main className="auth-page">
    <header className="simple-header container"><Logo/><Link href="/">Início</Link></header>
    <section className="container" style={{maxWidth:760,padding:"72px 20px 100px",textAlign:"center"}}>
      <div className="eyebrow">VERIFICAÇÃO TEMPORARIAMENTE INDISPONÍVEL</div>
      <h1 style={{fontSize:"clamp(2.7rem,6vw,4.8rem)",lineHeight:1,margin:"14px 0"}}>
        Não conseguimos confirmar o teu acesso agora.
      </h1>
      <p style={{fontSize:17,lineHeight:1.65,color:"#66756f",maxWidth:620,margin:"0 auto 28px"}}>
        Isto é uma falha técnica, não significa que o teu teste ou subscrição terminou. Se este dispositivo teve uma verificação válida recentemente, o Luwipi continua a permitir a aula offline por até 8 horas.
      </p>
      <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
        <Link className="btn btn-primary" href={next}>Tentar novamente →</Link>
        <Link className="btn" href="/">Voltar ao início</Link>
      </div>
      <p style={{fontSize:12,color:"#7c8984",marginTop:26}}>Quando a ligação ou a verificação voltar, o acesso normal é confirmado automaticamente.</p>
    </section>
  </main>;
}
