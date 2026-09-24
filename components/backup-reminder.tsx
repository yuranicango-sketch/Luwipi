"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getLocalStudents } from "@/lib/teacher-local-v2";
import styles from "./backup-reminder.module.css";

const LAST="luwipi:v3:last-backup";
const DISMISSED="luwipi:v3:backup-reminder-dismissed";
const THIRTY_DAYS=30*24*60*60*1000;
const SEVEN_DAYS=7*24*60*60*1000;

export function BackupReminder(){
 const [show,setShow]=useState(false);
 useEffect(()=>{
   const check=async()=>{
     const students=await getLocalStudents();
     if(!students.length) return;
     const last=Number(localStorage.getItem(LAST)||0);
     const dismissed=Number(localStorage.getItem(DISMISSED)||0);
     const oldest=Math.min(...students.map((student)=>new Date(student.createdAt).getTime()));
     const due=last ? Date.now()-last>THIRTY_DAYS : Date.now()-oldest>SEVEN_DAYS;
     if(due && Date.now()-dismissed>SEVEN_DAYS) setShow(true);
   };
   void check();
   const listener=()=>void check();
   window.addEventListener("luwipi:v3:backup",listener);
   return()=>window.removeEventListener("luwipi:v3:backup",listener);
 },[]);
 if(!show)return null;
 return <aside className={styles.reminder}><div><span>CÓPIA DE SEGURANÇA</span><strong>Vai trocar de tablet algum dia? Não deixe isso para esse dia.</strong><p>Exporte uma cópia local dos alunos e histórico. O Luwipi continua local-first.</p></div><div><Link href="/privacidade#dados">Exportar dados →</Link><button onClick={()=>{localStorage.setItem(DISMISSED,String(Date.now()));setShow(false)}}>Lembrar depois</button></div></aside>;
}
