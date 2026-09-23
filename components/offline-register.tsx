"use client";

import { useEffect } from "react";

export function OfflineRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    if (document.readyState === "complete") void register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
