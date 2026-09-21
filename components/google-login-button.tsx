"use client";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function GoogleLoginButton({driveReconnect=false}:{driveReconnect?:boolean}) {
  const [loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null);
  async function signIn(){
    setLoading(true);setError(null);
    const supabase=createBrowserSupabaseClient();
    const next=driveReconnect?"/professor/tarefas":"/onboarding";
    const redirectTo=`${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const {error:authError}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{
        redirectTo,
        scopes:"https://www.googleapis.com/auth/drive.file",
        queryParams:{
          access_type:"offline",
          prompt:"consent",
          include_granted_scopes:"true"
        }
      }
    });
    if(authError){setError("Não foi possível abrir o Google agora.");setLoading(false)}
  }
  return <><button className="btn btn-google btn-block" type="button" onClick={signIn} disabled={loading}><span className="google-g">G</span>{loading?"Abrindo Google…":driveReconnect?"Conectar Google Drive →":"Continuar com Google →"}</button>{error&&<small className="muted-center" role="alert">{error}</small>}</>;
}
