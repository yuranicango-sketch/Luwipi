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
    if (!localStorage.getItem(TRIAL_KEY)) {
      localStorage.setItem(TRIAL_KEY, String(Date.now()));
    }

    localStorage.setItem(DEMO_KEY, "true");

    const ageGroup = localStorage.getItem(AGE_KEY);
    const timeout = window.setTimeout(() => {
      router.replace(ageGroup ? `/dashboard?age=${ageGroup}` : "/onboarding");
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px",background:"radial-gradient(circle at 20% 10%, #fff3b8 0, transparent 28%), radial-gradient(circle at 80% 20%, #dff3ff 0, transparent 32%), #fffdf8"}}>
      <div style={{width:"min(460px,100%)",padding:"40px 30px",borderRadius:"30px",background:"rgba(255,255,255,.94)",boxShadow:"0 24px 70px rgba(39,70,110,.14)",border:"1px solid #eef2f6",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:"28px"}}><Logo /></div>
        <div aria-hidden="true" style={{display:"flex",justifyContent:"center",gap:"9px",marginBottom:"22px"}}>
          <span style={{width:14,height:14,borderRadius:"50%",background:"#ffcc4d",animation:"pulse 1s infinite alternate"}} />
          <span style={{width:14,height:14,borderRadius:"50%",background:"#62c86c",animation:"pulse 1s .15s infinite alternate"}} />
          <span style={{width:14,height:14,borderRadius:"50%",background:"#6f7df3",animation:"pulse 1s .3s infinite alternate"}} />
        </div>
        <h1 style={{margin:"0 0 10px",fontSize:"clamp(28px,5vw,38px)",color:"#263751"}}>A preparar o seu acesso</h1>
        <p style={{margin:0,color:"#728095",fontWeight:700}}>Modo temporário · 24h de demonstração</p>
        <style jsx>{`@keyframes pulse { from { transform: translateY(0); opacity:.55 } to { transform: translateY(-8px); opacity:1 } }`}</style>
      </div>
    </main>
  );
}
