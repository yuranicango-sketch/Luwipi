import Link from "next/link";
import { LocalDataPanel } from "@/components/local-data-panel";

export default function PrivacidadePage() {
  return <main style={{minHeight:"100vh",background:"#f5f8f6",color:"#17362d",padding:"40px 20px 80px"}}>
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <Link href="/dashboard" style={{fontSize:12,fontWeight:850,color:"#48665b"}}>← Voltar ao Luwipi</Link>
      <span style={{display:"block",marginTop:26,fontSize:10,fontWeight:950,letterSpacing:".13em",color:"#477162"}}>PRIVACIDADE</span>
      <h1 style={{fontSize:"clamp(38px,6vw,62px)",letterSpacing:"-2px",lineHeight:.98,margin:"8px 0 12px"}}>Dados de crianças ficam locais por padrão.</h1>
      <p style={{maxWidth:720,color:"#697871",lineHeight:1.65}}>Nome ou identificação, foto opcional, competências, notas privadas e histórico da aula são guardados no navegador deste dispositivo. O Luwipi não precisa enviar esses dados para a nuvem para conduzir uma aula.</p>

      <section style={{display:"grid",gap:12,marginTop:28}}>
        <article style={{background:"#fff",border:"1px solid #dce5e0",borderRadius:18,padding:18}}><strong>O que sai do dispositivo?</strong><p style={{color:"#6e7c76",lineHeight:1.55,marginBottom:0}}>Nada dos perfis de crianças sai por padrão. Uma futura sincronização só deve acontecer depois de uma ação explícita do professor e consentimento adequado. Login e subscrição do professor podem continuar a usar os serviços de conta necessários.</p></article>
        <article style={{background:"#fff",border:"1px solid #dce5e0",borderRadius:18,padding:18}}><strong>Se o tablet for perdido ou trocado</strong><p style={{color:"#6e7c76",lineHeight:1.55,marginBottom:0}}>Dados locais não aparecem automaticamente noutro dispositivo. Use a exportação abaixo antes de trocar de tablet. A cópia é um ficheiro sob o seu controlo.</p></article>
        <article style={{background:"#fff",border:"1px solid #dce5e0",borderRadius:18,padding:18}}><strong>Notas do professor</strong><p style={{color:"#6e7c76",lineHeight:1.55,marginBottom:0}}>Registe apenas observações pedagógicas necessárias. Evite informações médicas, diagnósticos ou outros dados sensíveis que não sejam indispensáveis para a aula.</p></article>
      </section>

      <LocalDataPanel />
    </div>
  </main>;
}
