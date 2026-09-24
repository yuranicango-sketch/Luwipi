"use client";

import { useState } from "react";
import { clearOfflineGrace } from "@/components/offline-access-manager";
import styles from "./product-shell.module.css";

export function SignOutControl() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    await clearOfflineGrace();
    try {
      await fetch("/auth/signout", { method: "POST", credentials: "include", redirect: "follow" });
    } finally {
      location.assign("/");
    }
  }

  return <button className={styles.signoutButton} type="button" disabled={busy} onClick={() => void signOut()}>
    {busy ? "A terminar…" : "Terminar sessão"}
  </button>;
}
