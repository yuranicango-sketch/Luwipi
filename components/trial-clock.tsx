"use client";

import { useEffect, useState } from "react";

const KEY = "luwipi_trial_started_at";
const DAY = 24 * 60 * 60 * 1000;

export function TrialClock() {
  const [label, setLabel] = useState("24h disponíveis");

  useEffect(() => {
    function update() {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        localStorage.setItem(KEY, String(Date.now()));
        setLabel("24h disponíveis");
        return;
      }
      const remaining = Math.max(0, DAY - (Date.now() - Number(raw)));
      if (remaining <= 0) {
        setLabel("Teste concluído");
        return;
      }
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      setLabel(`${hours}h ${minutes}min restantes`);
    }

    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, []);

  return <span>{label}</span>;
}
