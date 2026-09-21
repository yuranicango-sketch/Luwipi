"use client";
import { useEffect, useState } from "react";

type Student={id:string;name:string;age_group:string;guardian_name?:string|null};
type Group={id:string;name:string;student_group_members?:{student_id:string}[]};

export function StudentManager(){
  const [students,setStudents]=useState<Student[]>([]),[groups,setGroups]=useState<Group[]>([]),[name,setName]=useState(""),[age,setAge]=useState("2-4"),[guardian,setGuardian]=useState(""),[bulk,setBulk]=useState(""),[groupName,setGroupName]=useState("");
  const [error,setError]=useState(""),[busy,setBusy]=useState(false);

  async function json(r:Response){const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.error||"request_failed");return body}
  async function refresh(){
    setError("");
    try{
      const [s,g]=await Promise.all([fetch("/api/students").then(json),fetch("/api/groups").then(json)]);
      setStudents(s.students??[]);setGroups(g.groups??[]);
    }catch(e){
      const code=e instanceof Error?e.message:"request_failed";
      setError("Não foi possível carregar alunos e turmas.");
    }
  }
  useEffect(()=>{void refresh()},[]);

  async function mutate(url:string,body:unknown){
    setBusy(true);setError("");
    try{await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(json);await refresh();return true}
    catch(e){const code=e instanceof Error?e.message:"request_failed";setError("Não foi possível guardar a alteração.");return false}
    finally{setBusy(false)}
  }
  async function add(){if(!name.trim())return;if(await mutate("/api/students",{name,ageGroup:age,guardianName:guardian})){setName("");setGuardian("")}}
  async function importList(){const rows=bulk.split(/\r?\n/).map(l=>l.split(/[,;\t]/)).filter(x=>x[0]?.trim()).map(x=>({name:x[0].trim(),ageGroup:(x[1]||"5-8").trim(),guardianName:(x[2]||"").trim()}));if(rows.length&&await mutate("/api/students",{students:rows}))setBulk("")}
  async function group(){if(!groupName.trim()||!students.length)return;if(await mutate("/api/groups",{name:groupName,studentIds:students.map(s=>s.id)}))setGroupName("")}

  return <section className="student-manager"><div className="student-head"><div><small>Meus alunos</small><h2>Alunos de piano</h2></div><span>{students.length}</span></div>{error&&<div style={{background:"#fff3f0",padding:14,borderRadius:14,marginBottom:14,fontWeight:700}} role="alert">{error}</div>}<div className="student-form"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Identificação local (não será guardada)"/><select value={age} onChange={e=>setAge(e.target.value)}><option value="2-4">2–4 anos</option><option value="5-8">5–8 anos</option><option value="adult">Adulto</option></select><input value={guardian} onChange={e=>setGuardian(e.target.value)} placeholder="Responsável (não será guardado)"/><button className="btn btn-primary btn-small" onClick={add} disabled={busy}>Adicionar</button></div><details><summary>Importar vários alunos</summary><p>Cole linhas no formato: Nome, idade, responsável. Aceita CSV, tabulação ou ponto e vírgula.</p><textarea value={bulk} onChange={e=>setBulk(e.target.value)} rows={6} placeholder={"Maria,2-4,Ana\nJoão,5-8,Carlos"}/><button className="btn btn-soft btn-small" onClick={importList} disabled={busy}>Importar lista</button></details>{students.length?<div className="student-list">{students.map(s=><article key={s.id}><div>🎹</div><div><strong>{s.name}</strong><span>{s.age_group}{s.guardian_name?` · ${s.guardian_name}`:""}</span></div></article>)}</div>:!error&&<p>Nenhum aluno ainda.</p>}<div className="group"><input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Nome da turma"/><button className="btn btn-soft btn-small" onClick={group} disabled={busy}>Criar turma com estes alunos</button></div>{groups.length>0&&<p><strong>Turmas:</strong> {groups.map(g=>g.name).join(" · ")}</p>}<style jsx>{`.student-manager{background:#fff;border:1px solid #e6edf5;border-radius:28px;padding:26px;margin-bottom:22px}.student-head{display:flex;justify-content:space-between}.student-head h2{margin:4px 0 20px}.student-form{display:grid;grid-template-columns:1fr .7fr 1fr auto;gap:10px}.student-form input,.student-form select,textarea,.group input{border:1px solid #d8e1ed;border-radius:14px;padding:12px;font:inherit}details{margin:18px 0;padding:14px;background:#f8fafc;border-radius:16px}details textarea{width:100%;margin:10px 0}.student-list{display:grid;gap:8px}.student-list article{display:flex;gap:12px;padding:11px;border:1px solid #edf1f5;border-radius:14px}.student-list article div:last-child{display:flex;flex-direction:column}.student-list span{font-size:12px;color:#77869b}.group{display:flex;gap:10px;margin-top:18px}.group input{flex:1}@media(max-width:760px){.student-form{grid-template-columns:1fr}.group{flex-direction:column}}`}</style></section>
}
