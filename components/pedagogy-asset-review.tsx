"use client";

import { useEffect, useState } from "react";

type Asset = {
  id: string;
  visual_key: string;
  source_url: string;
  source_name: string | null;
  license: string | null;
  alt_text: string;
  focus: string;
};

export function PedagogyAssetReview() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setMessage(null);
    try {
      const response = await fetch("/api/pedagogy-assets?status=candidate", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar as imagens.");
      setAssets(body.assets ?? []);
    } catch (error) {
      setAssets([]);
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar as imagens.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, decision: "approved" | "rejected") {
    if (busy) return;
    setBusy(id);
    setMessage(null);

    try {
      const response = await fetch(`/api/pedagogy-assets/${id}/decision`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Não foi possível guardar a decisão.");

      setAssets((current) => current.filter((asset) => asset.id !== id));
      if (body.warning) setMessage(body.warning);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar a decisão.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={{ marginTop: 36 }}>
      <p style={{ fontSize: 13, fontWeight: 900, color: "var(--blue)", letterSpacing: ".08em" }}>
        BIBLIOTECA PEDAGÓGICA
      </p>
      <h2>Imagens para aprovar</h2>
      <p>Ao aprovar, o Luwipi guarda a decisão imediatamente e tenta arquivar uma cópia otimizada no Storage.</p>
      {message && (
        <p role="status" style={{ padding: 12, borderRadius: 12, background: "#fff6df", fontWeight: 800 }}>
          {message}
        </p>
      )}
      {assets.length === 0 ? (
        <p>Nenhuma imagem pendente.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {assets.map((asset) => (
            <article
              key={asset.id}
              style={{ border: "1px solid var(--line)", borderRadius: 18, padding: 14, background: "#fff" }}
            >
              <img
                src={`/api/pedagogy-assets/${asset.id}/preview`}
                alt={asset.alt_text}
                style={{ width: "100%", height: 240, objectFit: "contain", borderRadius: 12 }}
              />
              <strong>{asset.focus || asset.visual_key}</strong>
              <p style={{ fontSize: 14 }}>{asset.source_name} · {asset.license}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  disabled={busy !== null}
                  onClick={() => decide(asset.id, "approved")}
                >
                  {busy === asset.id ? "A guardar…" : "Aprovar e guardar"}
                </button>
                <button
                  type="button"
                  className="btn btn-soft btn-small"
                  disabled={busy !== null}
                  onClick={() => decide(asset.id, "rejected")}
                >
                  {busy === asset.id ? "A guardar…" : "Reprovar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
