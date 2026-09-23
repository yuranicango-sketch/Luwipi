"use client";

import { useRef, useState } from "react";
import { clearAllLocalLearningData, exportLocalBackup, importLocalBackup } from "@/lib/teacher-store";
import styles from "./local-data-panel.module.css";

export function LocalDataPanel() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  async function downloadBackup() {
    if (busy) return;
    setBusy(true);
    try {
      const backup = await exportLocalBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `luwipi-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus(`Cópia criada com ${backup.students.length} aluno(s) e ${backup.history.length} aula(s).`);
    } finally {
      setBusy(false);
    }
  }

  async function restore(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    try {
      const body = JSON.parse(await file.text()) as unknown;
      const result = await importLocalBackup(body);
      setStatus(`Cópia restaurada: ${result.students} aluno(s), ${result.history} aula(s).`);
    } catch {
      setStatus("Não foi possível restaurar este ficheiro. Use uma cópia criada pelo Luwipi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function clear() {
    if (busy) return;
    if (!confirmClear) { setConfirmClear(true); setStatus("Toque novamente para confirmar a eliminação local."); return; }
    setBusy(true);
    try {
      await clearAllLocalLearningData();
      setConfirmClear(false);
      setStatus("Dados de aprendizagem eliminados deste dispositivo.");
    } finally {
      setBusy(false);
    }
  }

  return <section className={styles.panel}>
    <div className={styles.head}><div><span>DADOS DE APRENDIZAGEM</span><h2>Este tablet é a casa dos dados da criança.</h2></div><b>🔒 IndexedDB local</b></div>
    <div className={styles.grid}>
      <article><strong>Vai trocar de tablet?</strong><p>Crie uma cópia local. O ficheiro contém perfis, domínio, repertório e histórico. Guarde-o num lugar sob o seu controlo.</p><button disabled={busy} onClick={() => void downloadBackup()}>Exportar cópia</button></article>
      <article><strong>Trazer dados para este tablet</strong><p>Escolha uma cópia criada pelo Luwipi. A leitura acontece no próprio navegador; o ficheiro não é enviado ao servidor.</p><button disabled={busy} onClick={() => fileRef.current?.click()}>Importar cópia</button><input ref={fileRef} type="file" accept="application/json,.json" onChange={(event) => void restore(event.target.files?.[0])}/></article>
      <article className={styles.danger}><strong>Apagar deste dispositivo</strong><p>Remove alunos, histórico e aula em andamento. Esta ação não pode ser desfeita sem uma cópia exportada.</p><button disabled={busy} onClick={() => void clear()}>{confirmClear ? "Confirmar eliminação" : "Apagar dados locais"}</button></article>
    </div>
    {status && <p className={styles.status} role="status">{status}</p>}
  </section>;
}
