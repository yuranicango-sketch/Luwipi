"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Student={id:string;name:string;age_group:"2-4"|"5-8"|"adult"};

export function StudentSwitcher({current,age,variant}:{current:string;age:string;variant:string}){
 const router=useRouter(),[students,setStudents]=useState<Student[]>([]);
 useEffect(()=>{void fetch("/api/students",{cache:"no-store"}).then(async r=>r.ok?await r.json():null).then(body=>setStudents(body?.students??[])).catch(()=>{})},[]);
 if(!students.length)return null;
 return <label style={{display:"flex",alignItems:"center",gap:7,fontSize:10,fontWeight:900,color:"#6e7d90"}}>
   ALUNO
   <select value={students.some(s=>s.id===current)?current:""} onChange={e=>{const student=students.find(s=>s.id===e.target.value);if(!student)return;router.push(`/dashboard?age=${student.age_group}&variant=${variant}&student=${encodeURIComponent(student.id)}`)}} style={{border:"1px solid #dce4eb",borderRadius:10,padding:"8px 10px",background:"#fff",fontWeight:900,color:"#31465e"}}>
    <option value="">Selecionar…</option>{students.map(student=><option value={student.id} key={student.id}>{student.name} · {student.age_group}</option>)}
   </select>
 </label>;
}
