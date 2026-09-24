"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLessonHistory } from "@/lib/teacher-local-v2";
import styles from "./backup-reminder.module.css";

const LAST_BACKUP = "luwipi:v3:last-backup-at";
const SNOOZE = "luwipi:v3:backup-snooze-until";
const DAY = 24 * 60 * 60 * 1000;

export function BackupReminder(){
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState("");

  useEffect(()=>{
    async function check(){
      const snooze=Number(window.localStorage.getItem(SNOOZE) || 0);
      if(snooze>Date.now()){setShow(false);return;}
      const history=await getLessonHistory();
      if(history.length<5){setShow(false);return;}
      const last=Number(window.localStorage.getItem(LAST_BACKUP) || 0);
      const due=!last || Date.now()-last>21*DAY;
      setShow(due);
      setDetail(!last?"Ainda não há uma cópia registada neste dispositivo.":"A última cópia tem mais de 21 dias.");
    }
    void check();
    const listener=()=>void check();
    window.addEventListener("luwipi:backup-created",listener);
    window.addEventListener("luwipi:v3:history",listener);
    return()=>{window.removeEventListener("luwipi:backup-created",listener);window.removeEventListener("luwipi:v3:history",listener)};
  },[]);

  if(!show)return null;
  return <aside className={styles.banner} role="status">
    <div><span>CÓPIA DE SEGURANÇA</span><strong>Protege os dados antes de trocar ou perder este tablet.</strong><small>{detail}</small></div>
    <div><Link href="/privacidade#backup">Exportar agora</Link><button onClick={()=>{window.localStorage.setItem(SNOOZE,String(Date.now()+7*DAY));setShow(false)}}>Lembrar em 7 dias</button></div>
  </aside>;
}
