import Link from "next/link";
import { Logo } from "@/components/logo";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import styles from "./home.module.css";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const appHref = user ? "/dashboard" : "/login";

  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.nav}><Logo/><div className={styles.actions}>{user ? <Link href="/dashboard">Abrir Luwipi →</Link> : <><Link className={styles.secondary} href="/login">Entrar</Link><Link href="/login">Começar →</Link></>}</div></div></header>

    <section className={styles.hero}><div className={styles.heroCopy}><span>PIANO INFANTIL · 2 A 8 ANOS · PROFESSOR NO COMANDO</span><h1>A próxima aula já está <em>organizada.</em></h1><p>Escolha a criança, diga como ela chegou hoje e receba uma aula pronta que combina corpo, ouvido, piano e repertório — sem transformar a aula num jogo de ecrã.</p><div className={styles.heroActions}><Link href={appHref}>{user ? "Preparar a próxima aula →" : "Experimentar o Luwipi →"}</Link><a href="#como">Ver como funciona</a></div><small>Os dados da criança ficam neste dispositivo por padrão.</small></div>
      <div className={styles.flow} aria-label="Fluxo de preparação da aula"><div><b>01</b><span>Aluno</span></div><i/><div><b>02</b><span>Estado hoje</span></div><i/><div><b>03</b><span>Aula sugerida</span></div><i/><div><b>04</b><span>Começar</span></div><strong>&lt; 60 s</strong></div>
    </section>

    <section className={styles.method} id="como"><div className={styles.sectionHead}><span>O CENTRO É A AULA</span><h2>O ecrã sabe quando aparecer — e quando sair do caminho.</h2></div><div className={styles.methodGrid}><article><b>Corpo primeiro</b><p>Para os mais pequenos, movimento e pulso acontecem longe do ecrã. O corpo é o primeiro instrumento.</p></article><article><b>Piano físico primeiro</b><p>Quando chega a postura, mão e toque, o Luwipi recua para que professor e criança olhem para o instrumento.</p></article><article><b>Ouvir antes de ler</b><p>Escuta, imitação e repertório vêm antes da abstração. A leitura entra gradualmente quando já existe música para reconhecer.</p></article></div></section>

    <section className={styles.ages}><div><span>TRÊS FASES, TRÊS EXPERIÊNCIAS</span><h2>Uma criança de 2 anos não recebe a interface de uma de 8.</h2></div><div className={styles.ageGrid}><article><strong>2–3</strong><b>Descobrir</b><p>Corpo, som, contraste, imitação e vínculo com o piano.</p></article><article><strong>4–5</strong><b>Explorar</b><p>Padrões, dedos, teclado, ritmo e primeiras músicas.</p></article><article><strong>6–8</strong><b>Construir</b><p>Técnica, ouvido, leitura progressiva e repertório.</p></article></div></section>

    <section className={styles.teacher}><div><span>DEPOIS DA AULA</span><h2>O professor observa. O Luwipi regista.</h2><p>Domínio nunca é inferido por cliques. O professor valida: Emergente, Em desenvolvimento, Consolidado ou Independente. A família recebe uma prática curta e concreta para casa.</p></div><div className={styles.parentCard}><span>PARA QUEM ACOMPANHA</span><strong>Até à próxima aula</strong><p>🎧 Ouvir a música<br/>👐 Repetir o movimento<br/>🎹 Tocar um pequeno padrão</p><small>Pouco tempo. Sem pressão.</small></div></section>

    <section className={styles.cta}><span>Menos preparação. Mais presença.</span><h2>Abra a próxima aula em menos de um minuto.</h2><Link href={appHref}>{user ? "Preparar aula →" : "Começar →"}</Link></section>

    <footer className={styles.footer}><Logo compact/><div><Link href="/privacidade">Privacidade e dados</Link><Link href="/termos">Termos</Link></div><span>© Luwipi</span></footer>
  </main>;
}
