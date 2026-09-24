"use client";

import { useState } from "react";
import { clearOfflineLessonWindow } from "@/lib/offline-lesson-access";
import styles from "./product-shell.module.css";

export function SignOutControl() {
  const [busy,setBusy]=useState(false);
  async function signOut(){
    if(busy)return;
    setBusy(true);
    clearOfflineLessonWindow();
    try {
      await fetch("/auth/signout",{method:"POST",credentials:"include",redirect:"follow"});
    } finally {
      location.assign("/");
    }
  }
  return <button type="button" className={styles.signoutButton} disabled={busy} onClick={()=>void signOut()}>{busy?"A terminar…":"Terminar sessão"}</button>;
}
