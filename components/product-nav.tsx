"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./product-nav.module.css";

const items = [
  { href:"/dashboard", label:"Hoje", mark:"●" },
  { href:"/alunos", label:"Alunos", mark:"◉" },
  { href:"/curriculo", label:"Currículo", mark:"≋" },
  { href:"/biblioteca", label:"Biblioteca", mark:"▦" },
  { href:"/repertorio", label:"Repertório", mark:"♫" },
  { href:"/jogos", label:"Atividades", mark:"✦" },
  { href:"/casa", label:"Casa", mark:"⌂" },
] as const;

export function ProductNav({ mobile=false }: { mobile?: boolean }) {
  const pathname=usePathname();

  return <nav className={mobile?styles.mobileNav:styles.nav} aria-label={mobile?"Navegação móvel da área do professor":"Área do professor"}>
    <div className={styles.scroller}>
      {items.map((item)=>{
        const active=pathname===item.href||pathname.startsWith(item.href+"/");
        return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} data-active={active||undefined}>
          <span className={styles.mark} aria-hidden="true">{item.mark}</span>
          <span>{item.label}</span>
        </Link>;
      })}
    </div>
  </nav>;
}
