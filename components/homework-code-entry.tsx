"use client";

import { FormEvent, useState } from "react";

export function HomeworkCodeEntry() {
  const [code, setCode] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
    if (!normalized) return;
    window.location.href = `/tarefa/${encodeURIComponent(normalized)}`;
  }

  return (
    <form onSubmit={submit} className="code-entry">
      <label htmlFor="homework-code">Código da tarefa</label>
      <div className="code-row">
        <input id="homework-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="LUWI-4827" autoCapitalize="characters" autoComplete="off" />
        <button type="submit" className="btn btn-primary">Abrir tarefa →</button>
      </div>
      <small>Para testar agora, use <b>LUWI-4827</b>.</small>
      <style jsx>{`
        .code-entry{background:#fff;border:1px solid #e3eaf4;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(39,70,110,.1);max-width:720px;margin:0 auto}.code-entry label{display:block;font-size:12px;font-weight:900;text-transform:uppercase;color:#596983;letter-spacing:.06em;margin-bottom:8px}.code-row{display:flex;gap:10px}.code-row input{flex:1;min-width:0;border:2px solid #dce4ef;border-radius:16px;padding:14px 16px;font:inherit;font-size:20px;font-weight:900;letter-spacing:1px;text-transform:uppercase;outline:none}.code-row input:focus{border-color:#69a8f2;box-shadow:0 0 0 4px rgba(66,145,238,.12)}.code-entry small{display:block;margin-top:12px;color:#77849a}@media(max-width:620px){.code-row{flex-direction:column}.code-row button{width:100%}}
      `}</style>
    </form>
  );
}
