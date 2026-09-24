"use client";
import { useEffect } from "react";
import { markOfflineLessonWindow } from "@/lib/offline-lesson-access";

export function OfflineAccessBootstrap() {
  useEffect(() => { markOfflineLessonWindow(); }, []);
  return null;
}
