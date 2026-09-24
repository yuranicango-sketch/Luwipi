import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { OfflineAccessBootstrap } from "@/components/offline-access-bootstrap";
import { BackupReminder } from "@/components/backup-reminder";
import { SignOutControl } from "@/components/sign-out-control";
import { ProductNav } from "@/components/product-nav";
import styles from "./product-shell.module.css";

export function ProductShell({ children, backHref, backLabel = "Voltar" }: { children: ReactNode; backHref?: string; backLabel?: string }) {
  return <main className={styles.shell}>
    <OfflineAccessBootstrap/><header className={styles.header}><div className={styles.headerInner}><Logo compact />
      <ProductNav/>
      {backHref
        ? <Link className={styles.back} href={backHref}>← {backLabel}</Link>
        : <div className={styles.signout}><SignOutControl/></div>}
    </div></header><BackupReminder/>{children}<ProductNav mobile/>
  </main>;
}
