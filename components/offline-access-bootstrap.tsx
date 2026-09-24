"use client";
import { useEffect } from "react";
import { clearOfflineLessonWindow, markOfflineLessonWindow } from "@/lib/offline-lesson-access";

export function OfflineAccessBootstrap() {
  useEffect(() => {
    async function syncLease() {
      if (!navigator.onLine) return;
      try {
        const response = await fetch("/api/access/offline-status", {
          credentials: "include",
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (response.ok) {
          const body = await response.json() as { expiresAt?: number };
          if (typeof body.expiresAt === "number") markOfflineLessonWindow(body.expiresAt);
        } else if (response.status === 401 || response.status === 403) {
          clearOfflineLessonWindow();
        }
      } catch {
        // Preserve the last signed lease expiry while the network is unavailable.
      }
    }
    void syncLease();
    const onOnline = () => void syncLease();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);
  return null;
}
