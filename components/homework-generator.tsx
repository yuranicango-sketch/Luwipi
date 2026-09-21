"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { kidsSongs } from "@/lib/music-library";
import { saveAssignment } from "@/lib/teacher-local";

type Student = { id: string; name: string; ageGroup: "2-4" | "5-8" | "adult"; parentName?: string };
const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() { const b = new Uint8Array(8); crypto.getRandomValues(b); return "LUWI-" + Array.from(b, (v) => A[v % A.length]).join(""); }

const messages: Record<string, string> = {
  unauthorized: "A sua sessão terminou. Atualize a página e entre novamente.",
  subscription_inactive: "O acesso não está ativo para criar tarefas.",
  invalid_assignment: "Revise os dados da tarefa e tente novamente.",
  database_error: "A base de dados não conseguiu guardar a tarefa.",
  profile_unavailable: "Não foi possível verificar o seu perfil agora.",
  forbidden_origin: "Pedido de segurança recusado. Atualize a página.",
};

export function HomeworkGenerator({ initialSongId }: { initialSongId?: string }) {
  const songs = useMemo(() => kidsSongs.filter((s) => s.playable), []);
  const initial = songs.some((s) => s.id === initialSongId) ? initialSongId! : songs[0]?.id ?? "";
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [manualName, setManualName] = useState("");
  const [songId, setSongId] = useState(initial);
  const [teacherNote, setTeacherNote] = useState("Faça devagar. Primeiro diga as cores, depois toque.");
  const [targetRepeats, setTargetRepeats] = useState(3);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then(async (r) => r.ok ? r.json() : { students: [] })
      .then(({ students: list }) => {
        const mapped = (list ?? []).map((x: { id: string; name: string; age_group: Student["ageGroup"]; guardian_name?: string }) => ({
          id: x.id, name: x.name, ageGroup: x.age_group, parentName: x.guardian_name,
        }));
        setStudents(mapped);
        setStudentId((c) => c || mapped[0]?.id || "");
      })
      .catch(() => setStudents([]));
  }, []);

  const selected = students.find((s) => s.id === studentId);
  const song = songs.find((s) => s.id === songId);

  async function generate() {
    if (!songId || sending) return;
    setSending(true);
    setSendError("");
    setGeneratedCode(null);

    for (let attempt = 0; attempt < 2; attempt++) {
      const code = makeCode();
      const childName = selected?.name ?? (manualName.trim() || "Pequeno músico");
      const assignment = {
        code, childName, songId, teacherNote: teacherNote.trim(), targetRepeats,
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      try {
        const r = await fetch("/api/homework", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(assignment),
        });
        const result = await r.json().catch(() => ({ error: "invalid_response" }));
        if (r.status === 409 && result.error === "code_collision") continue;
        if (!r.ok) {
          setSendError(messages[result.error] ?? "Não foi possível criar o código. Tente novamente.");
          setSending(false);
          return;
        }
        saveAssignment(assignment);
        setGeneratedCode(code);
        setSending(false);
        return;
      } catch {
        setSendError("Falha de ligação. Verifique a internet e tente novamente.");
        setSending(false);
        return;
      }
    }
    setSendError("Não foi possível gerar um código único. Tente novamente.");
    setSending(false);
  }

  return <div className="homework-generator"><div className="practice-first"><div><small>Antes de enviar</small><strong>{song?.emoji} {song?.title}</strong><p>Abra a experiência e faça a música aqui com a criança. O código para casa é opcional.</p></div>{song&&<Link className="btn btn-primary" href={`/musicas/${song.id}`}>▶ Fazer agora no Luwipi</Link>}</div><div className="homework-form-grid">{students.length>0?<label><span>Aluno</span><select value={studentId} onChange={e=>setStudentId(e.target.value)}>{students.map(s=><option key={s.id} value={s.id}>{s.name} · {s.ageGroup==="2-4"?"2–4":s.ageGroup==="adult"?"Adulto":"5–9"}</option>)}</select></label>:<label><span>Nome da criança</span><input value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Ex.: Maria"/></label>}<label><span>Tarefa musical</span><select value={songId} onChange={e=>{setSongId(e.target.value);setGeneratedCode(null)}}>{songs.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label><span>Meta de repetições em casa</span><select value={targetRepeats} onChange={e=>setTargetRepeats(Number(e.target.value))}>{[1,2,3,4,5].map(v=><option key={v} value={v}>{v} vez{v>1?"es":""}</option>)}</select></label><label className="homework-wide"><span>Recado do professor</span><textarea value={teacherNote} onChange={e=>setTeacherNote(e.target.value)} rows={3}/></label></div><div className="generator-actions">{song&&<Link className="btn btn-soft" href={`/musicas/${song.id}`}>Experimentar música</Link>}<button type="button" className="btn btn-primary" onClick={generate} disabled={sending}>{sending?"A criar código…":"Gerar código para casa"}</button></div>{sendError&&<p role="alert" style={{color:"#b42318",fontWeight:800}}>{sendError}</p>}{generatedCode&&<div className="homework-code-result"><small>Código para enviar ao responsável</small><strong>{generatedCode}</strong><p>Envie o link e o código ao responsável.</p><p><strong>{window.location.origin}/tarefa/{generatedCode}</strong></p><div className="result-actions"><Link className="btn btn-primary btn-small" href={`/musicas/${songId}`}>Fazer aqui novamente</Link><Link className="btn btn-soft btn-small" href={`/tarefa/${generatedCode}`}>Testar como responsável →</Link></div></div>}<style jsx>{`.homework-generator{background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(44,71,106,.1)}.practice-first{display:flex;align-items:center;justify-content:space-between;gap:20px;background:linear-gradient(135deg,#eef8ff,#f8f4ff);border:1px solid #dfe9f6;border-radius:20px;padding:18px 20px;margin-bottom:22px}.practice-first small{display:block;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:900;color:#6875d9}.practice-first strong{display:block;font-size:20px;margin:4px 0}.practice-first p{margin:0;color:#697891;font-size:13px}.homework-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.homework-form-grid label{display:flex;flex-direction:column;gap:7px}.homework-form-grid span{font-size:12px;font-weight:900;color:#51627d;text-transform:uppercase}.homework-form-grid input,.homework-form-grid select,.homework-form-grid textarea{width:100%;border:1px solid #d8e1ed;background:#fbfdff;border-radius:14px;padding:13px 14px;font:inherit}.homework-wide{grid-column:1/-1}.generator-actions,.result-actions{display:flex;gap:10px;flex-wrap:wrap}.homework-code-result{margin-top:24px;border:2px dashed #77ca7d;background:#f3fff3;border-radius:22px;padding:22px;text-align:center}.homework-code-result small{display:block}.homework-code-result strong{display:block;font-size:clamp(28px,5vw,46px);color:#2d7141;margin:5px 0}.result-actions{justify-content:center}@media(max-width:700px){.homework-form-grid{grid-template-columns:1fr}.homework-wide{grid-column:auto}.practice-first{flex-direction:column;align-items:flex-start}}`}</style></div>;
}
