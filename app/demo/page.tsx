"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

const TRIAL_KEY = "luwipi_trial_started_at";
const DEMO_KEY = "luwipi_demo_access";
const AGE_KEY = "luwipi_age_group";

export default function DemoAccessPage() {
  const router = useRouter();

  useEffect(() => {
    const now = Date.now();

    if (!localStorage.getItem(TRIAL_KEY)) {
      localStorage.setItem(TRIAL_KEY, String(now));
    }

    localStorage.setItem(DEMO_KEY, "true");

    const ageGroup = localStorage.getItem(AGE_KEY);
    const timeout = window.setTimeout(() => {
      router.replace(ageGroup ? "/dashboard" : "/onboarding");
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="demo-access-page">
      <div className="demo-access-card">
        <Logo />
        <div className="demo-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1>A preparar o seu acesso</h1>
        <p>Modo temporário · 24h de demonstração</p>
      </div>
    </main>
  );
}
