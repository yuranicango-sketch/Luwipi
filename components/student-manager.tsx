"use client";

import { useEffect, useState } from "react";
import { getStudents, removeStudent, saveStudent, type Student } from "@/lib/teacher-local";

function makeId() {
  return `aluno-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<"2-4" | "5-8">("2-4");
  const [parentName, setParentName] = useState("");

  function refresh() {
    setStudents(getStudents());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("luwipi:students-changed", refresh);
    return () => window.removeEventListener("luwipi:students-changed", refresh);
  }, []);

  function addStudent() {
    const cleanName = name.trim();
    if (!cleanName) return;
    saveStudent({
      id: makeId(),
      name: cleanName,
      ageGroup,
      parentName: parentName.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    setName("");
    setParentName("");
  }

  return (
    <section className="student-manager">
      <div className="student-head">
        <div><small>Meus alunos</small><h2>Quem está aprendendo comigo?</h2></div>
        <span>{students.length} aluno{students.length === 1 ? "" : "s"}</span>
      </div>

      <div className="student-form">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome da criança" />
        <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value as "2-4" | "5-8")}>
          <option value="2-4">2 a 4 anos</option>
          <option value="5-8">5 a 8 anos</option>
        </select>
        <input value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Responsável (opcional)" />
        <button type="button" className="btn btn-primary btn-small" onClick={addStudent}>Adicionar aluno</button>
      </div>

      {students.length > 0 ? (
        <div className="student-list">
          {students.map((student) => (
            <article key={student.id}>
              <div className="avatar">{student.ageGroup === "2-4" ? "🧸" : "🎹"}</div>
              <div><strong>{student.name}</strong><span>{student.ageGroup === "2-4" ? "2 a 4 anos" : "5 a 8 anos"}{student.parentName ? ` · ${student.parentName}` : ""}</span></div>
              <button type="button" onClick={() => removeStudent(student.id)} aria-label={`Remover ${student.name}`}>×</button>
            </article>
          ))}
        </div>
      ) : <div className="empty-students">Adicione o primeiro aluno para começar a organizar tarefas e progresso.</div>}

      <style jsx>{`
        .student-manager{background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(44,71,106,.08);margin-bottom:22px}.student-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:20px}.student-head small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6375dc}.student-head h2{font-size:26px;margin:4px 0}.student-head>span{background:#f1f5ff;color:#5867c8;padding:8px 11px;border-radius:99px;font-size:12px;font-weight:900}.student-form{display:grid;grid-template-columns:1.2fr .8fr 1fr auto;gap:10px}.student-form input,.student-form select{border:1px solid #d8e1ed;background:#fbfdff;border-radius:14px;padding:12px 13px;color:#20324d;font:inherit}.student-list{display:grid;gap:9px;margin-top:18px}.student-list article{display:flex;align-items:center;gap:12px;border:1px solid #edf1f5;border-radius:16px;padding:11px 13px}.avatar{width:42px;height:42px;border-radius:13px;background:#f6f8ff;display:grid;place-items:center;font-size:22px}.student-list div:nth-child(2){display:flex;flex-direction:column;gap:2px;flex:1}.student-list strong{color:#243651}.student-list span{color:#77869b;font-size:12px}.student-list button{border:0;background:#fff1f1;color:#b94a4a;border-radius:10px;width:31px;height:31px;cursor:pointer;font-size:20px}.empty-students{margin-top:16px;padding:16px;border-radius:15px;background:#f8fafc;color:#7a8799;font-size:13px}@media(max-width:780px){.student-form{grid-template-columns:1fr 1fr}.student-form button{grid-column:1/-1}}@media(max-width:520px){.student-form{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
