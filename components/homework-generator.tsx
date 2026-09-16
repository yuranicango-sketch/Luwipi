"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { kidsSongs } from "@/lib/music-library";
import { getStudents, saveAssignment, type Student } from "@/lib/teacher-local";

function makeCode() {
  return `LUWI-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function HomeworkGenerator() {
  const availableSongs = useMemo(() => kidsSongs.filter((song) => song.playable), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [manualName, setManualName] = useState("");
  const [songId, setSongId] = useState(availableSongs[0]?.id ?? "");
  const [teacherNote, setTeacherNote] = useState("Faça devagar. Primeiro diga as cores, depois toque.");
  const [targetRepeats, setTargetRepeats] = useState(3);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  function refreshStudents() {
    const list = getStudents();
    setStudents(list);
    if (!studentId && list[0]) setStudentId(list[0].id);
  }

  useEffect(() => {
    refreshStudents();
    window.addEventListener("luwipi:students-changed", refreshStudents);
    return () => window.removeEventListener("luwipi:students-changed", refreshStudents);
  }, [studentId]);

  const selectedStudent = students.find((student) => student.id === studentId);

  function generate() {
    const code = makeCode();
    const childName = selectedStudent?.name ?? manualName.trim() || "Pequeno músico";
    const assignment = {
      code,
      childName,
      studentId: selectedStudent?.id,
      songId,
      teacherNote: teacherNote.trim(),
      targetRepeats,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    saveAssignment(assignment);
    setGeneratedCode(code);
  }

  return (
    <div className="homework-generator">
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
          <select value={songId} onChange={(event) => setSongId(event.target.value)}>
            {availableSongs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
          </select>
        </label>
        <label>
          <span>Meta de repetições</span>
          <select value={targetRepeats} onChange={(event) => setTargetRepeats(Number(event.target.value))}>
            {[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} vez{value > 1 ? "es" : ""}</option>)}
          </select>
        </label>
        <label className="homework-wide">
          <span>Recado do professor</span>
          <textarea value={teacherNote} onChange={(event) => setTeacherNote(event.target.value)} rows={3} />
        </label>
      </div>

      <button type="button" className="btn btn-primary" onClick={generate}>Gerar código da tarefa</button>

      {generatedCode && (
        <div className="homework-code-result">
          <small>Código para enviar ao responsável</small>
          <strong>{generatedCode}</strong>
          <p>O responsável entra em <b>Tarefa de casa</b> e digita este código.</p>
          <div><Link className="btn btn-soft btn-small" href={`/tarefa/${generatedCode}`}>Testar como responsável →</Link></div>
        </div>
      )}

      <div className="homework-prototype-note">Fase 1: alunos, tarefas e progresso ficam neste navegador. Na Fase 2, o Supabase sincroniza professor e responsável em dispositivos diferentes.</div>

      <style jsx>{`
        .homework-generator{background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(44,71,106,.1)}.homework-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.homework-form-grid label{display:flex;flex-direction:column;gap:7px}.homework-form-grid span{font-size:12px;font-weight:900;color:#51627d;text-transform:uppercase;letter-spacing:.05em}.homework-form-grid input,.homework-form-grid select,.homework-form-grid textarea{width:100%;border:1px solid #d8e1ed;background:#fbfdff;border-radius:14px;padding:13px 14px;color:#20324d;font:inherit;outline:none}.homework-form-grid input:focus,.homework-form-grid select:focus,.homework-form-grid textarea:focus{border-color:#73aef5;box-shadow:0 0 0 4px rgba(71,147,241,.12)}.homework-wide{grid-column:1/-1}.homework-code-result{margin-top:24px;border:2px dashed #77ca7d;background:#f3fff3;border-radius:22px;padding:22px;text-align:center}.homework-code-result small{display:block;color:#5d6d7f;font-weight:800}.homework-code-result strong{display:block;font-size:clamp(32px,6vw,52px);letter-spacing:3px;color:#2d7141;margin:5px 0}.homework-code-result p{color:#68758b}.homework-prototype-note{margin-top:18px;padding:14px 16px;border-radius:16px;background:#fff8df;color:#695725;font-size:12px;line-height:1.5}@media(max-width:650px){.homework-form-grid{grid-template-columns:1fr}.homework-wide{grid-column:auto}}
      `}</style>
    </div>
  );
}
