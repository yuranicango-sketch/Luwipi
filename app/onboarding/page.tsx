"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createLocalStudent, saveLocalStudent, type LocalStudent } from "@/lib/teacher-store";
import type { AgeBand } from "@/lib/suzuki-lessons";
import { imageFileToLocalAvatar } from "@/lib/local-image";
import styles from "./onboarding.module.css";

const ages: { id: AgeBand; label: string; note: string }[] = [
  { id: "2-3", label: "2–3", note: "Corpo, ouvido e descoberta" },
  { id: "4-5", label: "4–5", note: "Imitação, padrões e primeiras músicas" },
  { id: "6-8", label: "6–8", note: "Técnica, ouvido, leitura e repertório" },
];

const levels: { id: LocalStudent["level"]; label: string }[] = [
  { id: "iniciante", label: "Está a começar" },
  { id: "em-progresso", label: "Já teve algumas aulas" },
  { id: "avancado", label: "Já toca repertório" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand>("4-5");
  const [level, setLevel] = useState<LocalStudent["level"]>("iniciante");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  async function choosePhoto(file?: File) {
    if (!file) return;
    setPhotoBusy(true);
    try { setPhotoDataUrl(await imageFileToLocalAvatar(file)); }
    finally { setPhotoBusy(false); }
  }

  async function finish() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const student = createLocalStudent({ name, ageBand, level, photoDataUrl });
      await saveLocalStudent(student);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return <main className={styles.page}>
    <section className={styles.card}>
      <header>
        <span>NOVO ALUNO · MENOS DE 30 SEGUNDOS</span>
        <h1>Quem vai tocar hoje?</h1>
        <p>O perfil fica neste dispositivo. Foto é opcional e nunca sai daqui por padrão.</p>
      </header>

      <div className={styles.identity}>
        <button type="button" className={styles.photo} onClick={() => fileRef.current?.click()} aria-label="Adicionar foto opcional">
          {photoDataUrl ? <img src={photoDataUrl} alt="Pré-visualização local do aluno" /> : <><b>+</b><small>{photoBusy ? "A preparar…" : "Foto opcional"}</small></>}
        </button>
        <input ref={fileRef} className={styles.hidden} type="file" accept="image/*" onChange={(event) => void choosePhoto(event.target.files?.[0])}/>
        <label><span>Nome ou identificação</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Sofia" /></label>
      </div>

      <div className={styles.section}>
        <strong>Idade</strong>
        <div className={styles.ageGrid}>{ages.map((age) => <button type="button" key={age.id} data-active={ageBand === age.id} onClick={() => setAgeBand(age.id)}><b>{age.label}</b><small>{age.note}</small></button>)}</div>
      </div>

      <div className={styles.section}>
        <strong>Ponto de partida</strong>
        <div className={styles.levelGrid}>{levels.map((item) => <button type="button" key={item.id} data-active={level === item.id} onClick={() => setLevel(item.id)}>{item.label}</button>)}</div>
      </div>

      <footer>
        <div><b>🔒 Local por padrão</b><small>Perfis, fotos e histórico ficam no IndexedDB deste dispositivo.</small></div>
        <button className={styles.primary} disabled={!name.trim() || photoBusy || saving} onClick={() => void finish()}>{saving ? "A guardar…" : "Criar e preparar aula →"}</button>
      </footer>
    </section>
  </main>;
}
