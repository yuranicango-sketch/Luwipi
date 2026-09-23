import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import styles from "./product-shell.module.css";

export function ProductShell({ children, backHref, backLabel = "Voltar" }: { children: ReactNode; backHref?: string; backLabel?: string }) {
  return <main className={styles.shell}>
    <header className={styles.header}><div className={styles.headerInner}><Logo compact />
      <nav className={styles.nav} aria-label="Área do professor">
        <Link href="/dashboard">Hoje</Link><Link href="/alunos">Alunos</Link><Link href="/curriculo">Currículo</Link><Link href="/biblioteca">Biblioteca</Link><Link href="/casa">Casa</Link>
      </nav>
      {backHref ? <Link className={styles.back} href={backHref}>← {backLabel}</Link> : <Link className={styles.back} href="/">Sair</Link>}
    </div></header>{children}
  </main>;
}
