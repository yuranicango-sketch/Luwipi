"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

const plans = [
  ["monthly", "Mensal", "1 mês"],
  ["quarterly", "Trimestral", "3 meses"],
  ["semiannual", "Semestral", "6 meses"],
] as const;

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function checkout(plan: string) {
    setLoading(plan);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = await response.json();
      if (!response.ok || !body.url) throw new Error(body.error || "checkout_unavailable");
      location.href = body.url;
    } catch {
      setError("O pagamento ainda não está configurado. Tente novamente mais tarde.");
      setLoading(null);
    }
  }

  return <main className="auth-page">
    <header className="simple-header container"><Logo/><Link href="/">Início</Link></header>
    <section className="container" style={{ maxWidth: 980, padding: "64px 20px 90px", textAlign: "center" }}>
      <div className="eyebrow">Luwipi completo</div>
      <h1 style={{ fontSize: "clamp(2.7rem,6vw,4.8rem)", margin: "12px 0" }}>Continue a ensinar sem interromper o fluxo.</h1>
      <p style={{ maxWidth: 700, margin: "0 auto 38px", fontSize: 18, lineHeight: 1.6 }}>
        Continue com Aulas Prontas, currículo em espiral, perfis locais dos alunos, Modo Aula e cartões de prática para a família.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
        {plans.map(([id, title, period]) => <article key={id} style={{ background: "#fff", border: "1px solid #e7e1d8", borderRadius: 20, padding: 28, textAlign: "left" }}>
          <small>{period}</small><h2>{title}</h2><p>Acesso ao Luwipi enquanto a subscrição estiver ativa.</p>
          <button className="btn btn-primary btn-block" disabled={!!loading} onClick={() => checkout(id)}>{loading === id ? "A abrir…" : "Assinar com Paddle →"}</button>
        </article>)}
      </div>
      {error && <p style={{ marginTop: 18 }}>{error}</p>}
      <p style={{ marginTop: 30, fontSize: 16, opacity: 0.72 }}>O administrador também pode conceder acesso manual quando necessário.</p>
    </section>
  </main>;
}
