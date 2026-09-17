import Link from "next/link";
import { Logo } from "@/components/logo";
import { LessonPreview } from "@/components/lesson-preview";
import { GoogleLoginButton } from "@/components/google-login-button";

const whatsapp = "https://wa.me/244933400445?text=Ol%C3%A1%2C%20quero%20ativar%20o%20Luwipi.";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <header className="simple-header container"><Logo/><Link href="/">← Voltar ao site</Link></header>
      <div className="container auth-grid">
        <section className="auth-art"><div className="auth-quote">Grandes sonhos começam com uma nota <span>♥</span></div><LessonPreview/></section>
        <section className="auth-card">
          <div className="eyebrow">24 horas para experimentar</div>
          <h1>Entrar na Luwipi</h1>
          <p>Explore as atividades para 2 a 4 anos e 5 a 8 anos.</p>
          <GoogleLoginButton />
          <small className="muted-center">Login Google seguro através do Supabase Auth.</small>
          <div className="divider"><span>ou</span></div>
          <Link className="btn btn-soft btn-block" href="/demo">Acesso temporário →</Link>
          <small className="muted-center">O acesso temporário continua disponível enquanto configuramos as credenciais finais.</small>
          <a className="whatsapp-card" href={whatsapp} target="_blank" rel="noreferrer"><span className="wa-icon">◔</span><span><small>Ativação e pagamento pelo WhatsApp</small><strong>+244 933 400 445</strong></span></a>
          <div className="trust-row"><span>♥ Seguro para crianças</span><span>⚡ Acesso imediato</span><span>★ Sem cobrança automática</span></div>
        </section>
      </div>
    </main>
  );
}
