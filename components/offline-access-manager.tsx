"use client";

import { useEffect } from "react";

const protectedPrefixes = ["/dashboard", "/aula", "/alunos", "/curriculo", "/biblioteca", "/casa", "/onboarding", "/jogos", "/partituras"];

async function postToWorker(message: unknown) {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage(message);
  } catch {
    // A app continua normalmente mesmo se o Service Worker não estiver disponível.
  }
}

async function refreshGrace() {
  if (!protectedPrefixes.some((prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + "/"))) return;
  if (!navigator.onLine) return;

  try {
    const response = await fetch("/api/access/offline-pass", {
      credentials: "include",
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (response.ok) {
      const body = await response.json() as { expiresAt?: string };
      if (body.expiresAt) await postToWorker({ type: "SET_OFFLINE_GRACE", expiresAt: body.expiresAt });
      return;
    }

    if (response.status === 401 || response.status === 403) {
      await postToWorker({ type: "CLEAR_OFFLINE_GRACE" });
    }
    // 5xx/verificação indisponível não apaga uma graça ainda válida.
  } catch {
    // Queda de rede: preservar a última verificação válida até expirar.
  }
}

export function OfflineAccessManager() {
  useEffect(() => {
    void refreshGrace();
    const onOnline = () => void refreshGrace();
    window.addEventListener("online", onOnline);
    const timer = window.setInterval(() => void refreshGrace(), 90 * 60 * 1000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.clearInterval(timer);
    };
  }, []);
  return null;
}

export async function clearOfflineGrace() {
  await postToWorker({ type: "CLEAR_OFFLINE_GRACE" });
}
