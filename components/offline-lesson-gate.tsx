"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveLesson } from "@/components/live-lesson";
import { canUseOfflineLessonWindow } from "@/lib/offline-lesson-access";
import { getActiveLesson } from "@/lib/teacher-local-v2";

export function OfflineLessonGate() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    setAllowed(canUseOfflineLessonWindow() && Boolean(getActiveLesson()));
  }, []);
  if (allowed === null) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center"}}>A abrir a aula local…</main>;
  if (!allowed) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,textAlign:"center"}}><div><h1>Esta aula local já não está disponível.</h1><p>Ligue a internet para validar novamente o acesso do professor.</p><Link href="/login">Voltar ao login</Link></div></main>;
  return <LiveLesson offlineShell />;
}
