import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { GoogleLoginButton } from "@/components/google-login-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import styles from "./login.module.css";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
    redirect(next);
  }

  return <main className={styles.page}>
    <header className="simple-header container"><Logo/><Link href="/">← Voltar</Link></header>
    <section className={"container " + styles.wrap}>
      <div className={styles.intro}>
        <span>ÁREA DO PROFESSOR</span>
        <h1>Entre e prepare a próxima aula.</h1>
        <p>O Luwipi organiza a sessão. Você continua a observar, tocar, corrigir e decidir.</p>
        <div className={styles.points}>
          <div><b>1</b><span>Escolha a criança e diga como ela chegou hoje.</span></div>
          <div><b>2</b><span>Receba uma aula pronta e troque apenas o que precisar.</span></div>
          <div><b>3</b><span>Registe domínio e entregue uma prática curta para casa.</span></div>
        </div>
      </div>
      <section className={styles.card}>
        <h2>Entrar no Luwipi</h2>
        <p>Use a sua conta Google apenas para autenticação. Dados de crianças ficam neste dispositivo por padrão.</p>
        <GoogleLoginButton/>
        <small className={styles.privacy}>Teste gratuito disponível · autenticação via Supabase · sem acesso ao Google Drive</small>
      </section>
    </section>
  </main>;
}
