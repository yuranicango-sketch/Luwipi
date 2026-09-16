import Link from "next/link";
import { FloatingNotes } from "@/components/floating-notes";
import { LessonPreview } from "@/components/lesson-preview";
import { Logo } from "@/components/logo";

const whatsapp = "https://wa.me/244933400445?text=Ol%C3%A1%2C%20quero%20ativar%20o%20Luwipi.";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="container nav-wrap">
          <Logo />
          <nav className="main-nav" aria-label="Navegação principal">
            <a href="#inicio">Início</a>
            <a href="#faixas">Faixas etárias</a>
            <Link href="/tarefa">Tarefa de casa</Link>
          </nav>
          <Link className="btn btn-outline btn-small" href="/login">Entrar</Link>
        </div>
      </header>

      <section className="hero" id="inicio">
        <FloatingNotes />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Música que cresce com a criança</div>
            <h1>Piano para crianças, <span>de forma lúdica</span> e inteligente.</h1>
            <p>Aulas interativas para desenvolver música, coordenação e criatividade desde cedo.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-pulse" href="/login">▶ Experimentar 24h grátis</Link>
              <Link className="btn btn-google" href="/login"><span className="google-g">G</span> Entrar com Google</Link>
            </div>
            <a className="whatsapp-line" href={whatsapp} target="_blank" rel="noreferrer"><span className="wa-icon">◔</span>Pagamento por WhatsApp: <strong>+244 933 400 445</strong></a>
            <div className="hero-benefits"><span>♥ Mais confiança</span><span>▥ Melhor coordenação</span><span>★ Mais criatividade</span></div>
          </div>
          <div className="hero-visual">
            <div className="visual-sticker sticker-one">Pequenos passos,<br/>grandes músicos ♥</div>
            <div className="visual-sticker sticker-two">Sonhe · toque · evolua</div>
            <LessonPreview />
          </div>
        </div>
      </section>

      <section className="age-section" id="faixas">
        <div className="container">
          <div className="section-heading"><span>Escolha a fase certa</span><h2>Uma experiência para cada idade.</h2></div>
          <div className="age-grid">
            <Link className="age-card age-younger" href="/onboarding?age=2-4">
              <div className="age-doodles" aria-hidden="true"><span>♪</span><span>♫</span><span>★</span></div>
              <div className="age-icon toddler-keys"><i/><i/><i/><i/><i/></div>
              <div><h3>2 a 4 anos</h3><p>Descoberta musical, ritmo e coordenação.</p><strong>Explorar →</strong></div>
            </Link>
            <Link className="age-card age-older" href="/onboarding?age=5-8">
              <div className="age-doodles" aria-hidden="true"><span>♫</span><span>♪</span><span>★</span></div>
              <div className="age-icon mini-piano"><i/><i/><i/><i/><i/><i/></div>
              <div><h3>5 a 8 anos</h3><p>Piano infantil com progressão guiada.</p><strong>Explorar →</strong></div>
            </Link>
          </div>
        </div>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="container">
          <div className="section-heading compact"><span>Como funciona</span><h2>Começar é simples.</h2></div>
          <div className="steps">
            <article><b>1</b><div><h3>Entrar</h3><p>Crie a conta em poucos cliques.</p></div></article>
            <article><b>2</b><div><h3>Experimentar 24h grátis</h3><p>Explore as atividades sem compromisso.</p></div></article>
            <article><b>3</b><div><h3>Ativar pelo WhatsApp</h3><p>Continue quando a família decidir.</p></div></article>
          </div>
        </div>
      </section>

      <section className="final-cta"><div className="container cta-card"><div><small>Comece hoje</small><h2>O primeiro passo pode ser uma única nota.</h2></div><Link className="btn btn-primary" href="/login">Quero testar grátis →</Link></div></section>

      <footer className="footer"><div className="container footer-grid"><Logo compact/><div className="footer-links"><a href="#faixas">Faixas etárias</a><Link href="/musicas">Músicas</Link><Link href="/tarefa">Tarefa de casa</Link><Link href="/termos">Termos</Link><Link href="/privacidade">Privacidade</Link></div><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp · +244 933 400 445</a></div></footer>
    </main>
  );
}
