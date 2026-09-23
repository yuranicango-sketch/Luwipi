import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import styles from "./product-shell.module.css";

export function ProductShell({ children, backHref, backLabel = "Voltar" }: { children: ReactNode; backHref?: string; backLabel?: string }) {
  return <main className={styles.shell}><header className={styles.header}><div className={`container ${styles.headerInner}`}><Logo/><nav className={styles.nav} aria-label="Área do professor"><Link href="/dashboard">Aulas</Link><Link href="/treino">Treino</Link><Link href="/musicas">Músicas</Link><Link href="/jogos">Jogos</Link><Link href="/professor/tarefas">Tarefas</Link></nav>{backHref ? <Link className={styles.back} href={backHref}>← {backLabel}</Link> : <Link className={styles.back} href="/">Sair</Link>}</div></header>{children}</main>;
}
