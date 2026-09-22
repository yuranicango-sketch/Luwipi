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
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const j = await r.json();

      if (!r.ok || !j.url) {
        throw new Error(j.error || "checkout_unavailable");
      }

      location.href = j.url;
    } catch {
      setError("O pagamento ainda não está configurado. Tente novamente mais tarde.");
      setLoading(null);
    }
  }

  return (
    <main className="auth-page">
      <header className="simple-header container">
        <Logo />
        <Link href="/">Início</Link>
      </header>
      <section className="container" style={{ maxWidth: 980, padding: "64px 20px 90px", textAlign: "center" }}>
        <div className="eyebrow">Luwipi completo</div>
        <h1 style={{ fontSize: "clamp(2.7rem,6vw,4.8rem)", margin: "12px 0" }}>
          Continue a ensinar sem interrupções.
        </h1>
        <p style={{ maxWidth: 700, margin: "0 auto 38px", fontSize: 18, lineHeight: 1.6 }}>
          O teste gratuito dá acesso ao primeiro módulo durante 3 dias. Para continuar com os 6 meses de currículo, alunos, tarefas, músicas e jogos, escolha uma subscrição.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
          {plans.map(([id, title, period]) => (
            <article key={id} style={{ background: "#fff", border: "1px solid #e7e1d8", borderRadius: 20, padding: 28, textAlign: "left" }}>
              <small>{period}</small>
              <h2>{title}</h2>
              <p>Acesso completo ao Luwipi enquanto a subscrição estiver ativa.</p>
              <button className="btn btn-primary btn-block" disabled={!!loading} onClick={() => checkout(id)}>
                {loading === id ? "A abrir…" : "Assinar com Paddle →"}
              </button>
            </article>
          ))}
        </div>
        {error && <p style={{ marginTop: 18 }}>{error}</p>}
        <p style={{ marginTop: 30, fontSize: 16, opacity: 0.72 }}>
          O administrador também pode conceder acesso manualmente quando necessário.
        </p>
      </section>
    </main>
  );
}
