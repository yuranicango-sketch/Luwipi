"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/logo";

const whatsapp = "https://wa.me/244933400445?text=Ol%C3%A1%2C%20quero%20ativar%20o%20Luwipi.";
type Age = "2-4" | "5-8";

function AgePicker() {
  const params = useSearchParams();
  const router = useRouter();
  const initial: Age | null = params.get("age") === "2-4" ? "2-4" : params.get("age") === "5-8" ? "5-8" : null;
  const [selected, setSelected] = useState<Age | null>(initial);

  function continueToDashboard() {
    if (!selected) return;
    localStorage.setItem("luwipi_age_group", selected);
    router.push(`/dashboard?age=${selected}`);
  }

  return (
    <>
      <div className="onboarding-grid">
        <button className={`choice-card choice-younger ${selected === "2-4" ? "selected" : ""}`} onClick={() => setSelected("2-4")}>
          <div className="choice-art toddler-keys"><i/><i/><i/><i/><i/></div>
          <div><h2>2 a 4 anos</h2><p>Descoberta musical, ritmo e coordenação.</p><ul><li>Sons divertidos</li><li>Atividades lúdicas</li><li>Primeiros passos</li></ul></div>
          <span className="select-pill">{selected === "2-4" ? "✓ Selecionado" : "Selecionar →"}</span>
        </button>
        <button className={`choice-card choice-older ${selected === "5-8" ? "selected" : ""}`} onClick={() => setSelected("5-8")}>
          <div className="choice-art mini-piano"><i/><i/><i/><i/><i/><i/></div>
          <div><h2>5 a 8 anos</h2><p>Piano infantil com progressão guiada.</p><ul><li>Aulas guiadas</li><li>Evolução por níveis</li><li>Desafios e conquistas</li></ul></div>
          <span className="select-pill">{selected === "5-8" ? "✓ Selecionado" : "Selecionar →"}</span>
        </button>
      </div>
      <div className={`continue-panel ${selected ? "visible" : ""}`}>
        <div><small>3 dias grátis desbloqueadas</small><strong>{selected ? `Faixa ${selected.replace("-", " a ")} anos escolhida` : "Escolha uma faixa"}</strong></div>
        <button className={`btn btn-primary ${!selected ? "disabled" : ""}`} disabled={!selected} onClick={continueToDashboard}>Começar experiência →</button>
      </div>
    </>
  );
}

export default function OnboardingPage() {
  return (
    <main className="onboarding-page">
      <header className="simple-header container"><Logo/><Link href="/">Início</Link></header>
      <section className="container onboarding-wrap">
        <div className="step-indicator"><span className="done">✓</span><i/><span>2</span><small>Passo 2 de 2</small></div>
        <div className="section-heading"><span>3 dias grátis</span><h1>Escolha a fase da criança</h1><p>Selecione a faixa etária para personalizar a experiência.</p></div>
        <Suspense fallback={<div className="loading-card">A preparar as opções…</div>}><AgePicker/></Suspense>
        <a className="onboarding-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><span className="wa-icon">◔</span><strong>Precisa de ajuda?</strong> Fale connosco · +244 933 400 445 →</a>
      </section>
    </main>
  );
}
