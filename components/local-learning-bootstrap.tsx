"use client";

import { useEffect } from "react";
import { hydrateLocalLearningMirror } from "@/lib/teacher-local-v2";

export function LocalLearningBootstrap() {
  useEffect(() => {
    void hydrateLocalLearningMirror();
  }, []);
  return null;
}
