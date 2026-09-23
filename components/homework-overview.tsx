"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSong } from "@/lib/music-library";

type Progress={sessions:number;repeats:number;completed:boolean;last_practiced_at:string|null;updated_at:string;notes_played:number};
type Assignment={id:string;code:string;student_id:string|null;child_name:string;song_id:string;target_repeats:number;valid_until:string;created_at:string;revoked_at:string|null;homework_progress:Progress[]|Progress|null};

function progressOf(value:Assignment["homework_progress"]){return Array.isArray(value)?value[0]??null:value??null}

export function HomeworkOverview(){
 const[rows,setRows]=useState<Assignment[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function refresh(){setLoading(true);setError("");try{const r=await fetch("/api/homework",{cache:"no-store"}),body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.error||"request_failed");setRows(body.assignments??[])}catch{setError("Não foi possível sincronizar as tarefas.")}finally{setLoading(false)}}
 useEffect(()=>{void refresh()},[]);
 if(loading)return <section className="homework-overview loading">A sincronizar tarefas…<style jsx>{base}</style></section>;
 if(error)return <section className="homework-overview"><p role="alert">{error}</p><button className="btn btn-soft btn-small" onClick={()=>void refresh()}>Tentar novamente</button><style jsx>{base}</style></section>;
 if(!rows.length)return null;
 return <section className="homework-overview"><div className="overview-head"><div><small>Sincronizado no Supabase</small><h2>Tarefas recentes</h2></div><span>{rows.length}</span></div><div className="overview-list">{rows.map(assignment=>{const song=getSong(assignment.song_id),progress=progressOf(assignment.homework_progress),completed=Boolean(progress?.completed),expired=new Date(assignment.valid_until).getTime()<Date.now();return <article key={assignment.id}><div className="song-icon">{song?.title.slice(0,1)??"M"}</div><div className="row-copy"><strong>{assignment.child_name}</strong><span>{song?.title??"Tarefa musical"} · {assignment.code}</span></div><div className={`status ${completed?"done":progress?"started":expired?"expired":"waiting"}`}>{completed?"Concluída":progress?`${progress.repeats}/${assignment.target_repeats} repetições`:expired?"Expirada":"Ainda não praticou"}</div><Link href={`/tarefa/${assignment.code}`}>Abrir</Link></article>})}</div><div className="sync-note">O progresso desta lista vem da base de dados e pode ser consultado noutro dispositivo com a mesma conta.</div><style jsx>{base}</style></section>;
}

const base=`
.homework-overview{margin-top:22px;background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;box-shadow:0 18px 48px rgba(44,71,106,.08)}.loading{font-size:12px;font-weight:900;color:#6f7e92}.overview-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.overview-head small{font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:950;color:#6375dc}.overview-head h2{font-size:26px;margin:4px 0}.overview-head>span{background:#f1f5ff;color:#5867c8;padding:7px 11px;border-radius:99px;font-weight:900}.overview-list{display:grid;gap:9px}.overview-list article{display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:12px;border:1px solid #edf1f5;border-radius:16px;padding:11px 13px}.song-icon{width:42px;height:42px;border-radius:13px;background:#eef1ff;color:#6170c3;display:grid;place-items:center;font-size:16px;font-weight:950}.row-copy{display:flex;flex-direction:column;gap:2px}.row-copy span{font-size:12px;color:#78869a}.status{font-size:11px;font-weight:900;padding:7px 10px;border-radius:99px}.waiting{background:#f2f4f7;color:#778394}.started{background:#fff6d9;color:#806519}.done{background:#edfbea;color:#397147}.expired{background:#fcecec;color:#9b4a4a}.overview-list a{font-size:12px;font-weight:900;color:#5d6fd6;text-decoration:none}.sync-note{margin-top:14px;color:#8793a5;font-size:11px;line-height:1.45}@media(max-width:720px){.overview-list article{grid-template-columns:auto 1fr}.status,.overview-list a{grid-column:2}.status{justify-self:start}}`;
