"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAssignments, getHomeworkProgress, type HomeworkProgress } from "@/lib/teacher-local";
import type { HomeworkAssignment } from "@/lib/demo-assignments";
import { getSong } from "@/lib/music-library";

type Row = { assignment: HomeworkAssignment; progress: HomeworkProgress | null };

export function HomeworkOverview() {
  const [rows, setRows] = useState<Row[]>([]);

  function refresh() {
    setRows(getAssignments().map((assignment) => ({ assignment, progress: getHomeworkProgress(assignment.code) })));
  }

  useEffect(() => {
    refresh();
    window.addEventListener("luwipi:assignments-changed", refresh);
    window.addEventListener("luwipi:progress-changed", refresh);
    return () => {
      window.removeEventListener("luwipi:assignments-changed", refresh);
      window.removeEventListener("luwipi:progress-changed", refresh);
    };
  }, []);

  if (!rows.length) return null;

  return (
    <section className="homework-overview">
      <div className="overview-head"><div><small>Acompanhamento local</small><h2>Tarefas recentes</h2></div><span>{rows.length}</span></div>
      <div className="overview-list">
        {rows.map(({ assignment, progress }) => {
          const song = getSong(assignment.songId);
          const completed = Boolean(progress?.completedAt);
          return (
            <article key={assignment.code}>
              <div className="song-icon">{song?.emoji ?? "🎵"}</div>
              <div className="row-copy">
                <strong>{assignment.childName}</strong>
                <span>{song?.title ?? "Tarefa musical"} · {assignment.code}</span>
              </div>
              <div className={`status ${completed ? "done" : progress ? "started" : "waiting"}`}>
                {completed ? "Concluída" : progress ? `${progress.completedRepeats}/${assignment.targetRepeats} repetições` : "Ainda não praticou"}
              </div>
              <Link href={`/tarefa/${assignment.code}`}>Abrir</Link>
            </article>
          );
        })}
      </div>
      <div className="local-note">Nesta fase, o progresso aparece quando professor e tarefa usam o mesmo navegador. Na Fase 2 isso será sincronizado entre dispositivos.</div>
      <style jsx>{`
        .homework-overview{margin-top:22px;background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(44,71,106,.08)}.overview-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.overview-head small{font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#6375dc}.overview-head h2{font-size:26px;margin:4px 0}.overview-head>span{background:#f1f5ff;color:#5867c8;padding:7px 11px;border-radius:99px;font-weight:900}.overview-list{display:grid;gap:9px}.overview-list article{display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:12px;border:1px solid #edf1f5;border-radius:16px;padding:11px 13px}.song-icon{width:42px;height:42px;border-radius:13px;background:#f7f9ff;display:grid;place-items:center;font-size:22px}.row-copy{display:flex;flex-direction:column;gap:2px}.row-copy span{font-size:12px;color:#78869a}.status{font-size:11px;font-weight:900;padding:7px 10px;border-radius:99px}.waiting{background:#f2f4f7;color:#778394}.started{background:#fff6d9;color:#806519}.done{background:#edfbea;color:#397147}.overview-list a{font-size:12px;font-weight:900;color:#5d6fd6;text-decoration:none}.local-note{margin-top:14px;color:#8793a5;font-size:11px;line-height:1.45}@media(max-width:720px){.overview-list article{grid-template-columns:auto 1fr}.status,.overview-list a{grid-column:2}.status{justify-self:start}}
      `}</style>
    </section>
  );
}
