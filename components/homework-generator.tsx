"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { kidsSongs } from "@/lib/music-library";
import { getStudents, saveAssignment, type Student } from "@/lib/teacher-local";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join("");
  return `LUWI-${suffix}`;
}

export function HomeworkGenerator({ initialSongId }: { initialSongId?: string }) {
  const availableSongs = useMemo(() => kidsSongs.filter((song) => song.playable), []);
  const initialSong = availableSongs.some((song) => song.id === initialSongId) ? initialSongId! : availableSongs[0]?.id ?? "";
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [manualName, setManualName] = useState("");
  const [songId, setSongId] = useState(initialSong);
  const [teacherNote, setTeacherNote] = useState("Faça devagar. Primeiro diga as cores, depois toque.");
  const [targetRepeats, setTargetRepeats] = useState(3);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    function refreshStudents() {
      const list = getStudents();
      setStudents(list);
      setStudentId((current) => current || list[0]?.id || "");
    }
    refreshStudents();
    window.addEventListener("luwipi:students-changed", refreshStudents);
    return () => window.removeEventListener("luwipi:students-changed", refreshStudents);
  }, []);

  const selectedStudent = students.find((student) => student.id === studentId);
  const selectedSong = availableSongs.find((song) => song.id === songId);

  async function generate() {
    if(!songId)return;
    setSending(true);setSendError("");
    const code=makeCode();
    const childName=selectedStudent?.name ?? (manualName.trim() || "Pequeno músico");
    const assignment={code,childName,studentId:selectedStudent?.id,songId,teacherNote:teacherNote.trim(),targetRepeats,validUntil:new Date(Date.now()+7*24*60*60*1000).toISOString(),createdAt:new Date().toISOString()};
    try{
      const response=await fetch("/api/homework",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(assignment)});
      if(!response.ok)throw new Error("save_failed");
      saveAssignment(assignment);setGeneratedCode(code);
    }catch{setSendError("Não foi possível criar o código. Tente novamente.");}
    finally{setSending(false);}
  }

  return (
    <div className="homework-generator">
      <div className="practice-first">
        <div>
          <small>Antes de enviar</small>
          <strong>{selectedSong?.emoji} {selectedSong?.title}</strong>
          <p>Abra a experiência e faça a música aqui com a criança. O código para casa é opcional.</p>
        </div>
        {selectedSong && <Link className="btn btn-primary" href={`/musicas/${selectedSong.id}`}>▶ Fazer agora no Luwipi</Link>}
      </div>

      <div className="homework-form-grid">
        {students.length > 0 ? (
          <label>
            <span>Aluno</span>
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.ageGroup === "2-4" ? "2–4" : "5–8"}</option>)}
            </select>
          </label>
        ) : (
          <label>
            <span>Nome da criança</span>
            <input value={manualName} onChange={(event) => setManualName(event.target.value)} placeholder="Ex.: Maria" />
          </label>
        )}
        <label>
          <span>Tarefa musical</span>
          <select value={songId} onChange={(event) => { setSongId(event.target.value); setGeneratedCode(null); }}>
            {availableSongs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
          </select>
        </label>
        <label>
          <span>Meta de repetições em casa</span>
          <select value={targetRepeats} onChange={(event) => setTargetRepeats(Number(event.target.value))}>
            {[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} vez{value > 1 ? "es" : ""}</option>)}
          </select>
        </label>
        <label className="homework-wide">
          <span>Recado do professor</span>
          <textarea value={teacherNote} onChange={(event) => setTeacherNote(event.target.value)} rows={3} />
        </label>
      </div>

      <div className="generator-actions">
        {selectedSong && <Link className="btn btn-soft" href={`/musicas/${selectedSong.id}`}>Experimentar música</Link>}
        <button type="button" className="btn btn-primary" onClick={generate} disabled={sending}>{sending?"A criar código…":"Gerar código para casa"}</button>
      </div>

      {sendError && <p style={{color:"#b42318",fontWeight:800}}>{sendError}</p>}

      {generatedCode && (
        <div className="homework-code-result">
          <small>Código para enviar ao responsável</small>
          <strong>{generatedCode}</strong>
          <p>A mesma experiência que você pode fazer aqui fica disponível ao responsável através deste código.</p>
          <div className="result-actions">
            <Link className="btn btn-primary btn-small" href={`/musicas/${songId}`}>Fazer aqui novamente</Link>
            <Link className="btn btn-soft btn-small" href={`/tarefa/${generatedCode}`}>Testar como responsável →</Link>
          </div>
        </div>
      )}

      <div className="homework-prototype-note"><strong>Fluxo correto:</strong> professor pode demonstrar e praticar dentro do Luwipi durante a aula; depois, se quiser, envia a mesma experiência para casa.</div>

      <style jsx>{`
        .homework-generator{background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(44,71,106,.1)}.practice-first{display:flex;align-items:center;justify-content:space-between;gap:20px;background:linear-gradient(135deg,#eef8ff,#f8f4ff);border:1px solid #dfe9f6;border-radius:20px;padding:18px 20px;margin-bottom:22px}.practice-first small{display:block;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:900;color:#6875d9}.practice-first strong{display:block;font-size:20px;margin:4px 0}.practice-first p{margin:0;color:#697891;font-size:13px;line-height:1.5}.homework-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.homework-form-grid label{display:flex;flex-direction:column;gap:7px}.homework-form-grid span{font-size:12px;font-weight:900;color:#51627d;text-transform:uppercase;letter-spacing:.05em}.homework-form-grid input,.homework-form-grid select,.homework-form-grid textarea{width:100%;border:1px solid #d8e1ed;background:#fbfdff;border-radius:14px;padding:13px 14px;color:#20324d;font:inherit;outline:none}.homework-form-grid input:focus,.homework-form-grid select:focus,.homework-form-grid textarea:focus{border-color:#73aef5;box-shadow:0 0 0 4px rgba(71,147,241,.12)}.homework-wide{grid-column:1/-1}.generator-actions,.result-actions{display:flex;gap:10px;flex-wrap:wrap}.homework-code-result{margin-top:24px;border:2px dashed #77ca7d;background:#f3fff3;border-radius:22px;padding:22px;text-align:center}.homework-code-result small{display:block;color:#5d6d7f;font-weight:800}.homework-code-result strong{display:block;font-size:clamp(28px,5vw,46px);letter-spacing:2px;color:#2d7141;margin:5px 0}.homework-code-result p{color:#68758b}.result-actions{justify-content:center}.homework-prototype-note{margin-top:18px;padding:14px 16px;border-radius:16px;background:#fff8df;color:#695725;font-size:12px;line-height:1.5}@media(max-width:700px){.homework-form-grid{grid-template-columns:1fr}.homework-wide{grid-column:auto}.practice-first{align-items:flex-start;flex-direction:column}}
      `}</style>
    </div>
  );
}
