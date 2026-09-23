"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (authError) {
      setError("Não foi possível abrir o Google agora.");
      setLoading(false);
    }
  }

  return <>
    <button className="btn btn-google btn-block" type="button" onClick={signIn} disabled={loading}>
      <span className="google-g">G</span>{loading ? "A abrir Google…" : "Continuar com Google →"}
    </button>
    {error && <small className="muted-center" role="alert">{error}</small>}
  </>;
}
