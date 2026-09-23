"use client";
import { useEffect, useState } from "react";
import { getLessonHistory, getLocalStudents, type LessonHistory, type LocalStudent } from "@/lib/teacher-local-v2";
import styles from "./home-practice-panel.module.css";

export function HomePracticePanel(){
 const [history,setHistory]=useState<LessonHistory[]>([]),[students,setStudents]=useState<LocalStudent[]>([]),[copied,setCopied]=useState("");
 useEffect(()=>{void Promise.all([getLessonHistory(),getLocalStudents()]).then(([nextHistory,nextStudents])=>{setHistory(nextHistory);setStudents(nextStudents)})},[]);
 function nameFor(id:string){return students.find((s)=>s.id===id)?.name??"Aluno"}
 return <div className={styles.page}><header><span>CASA</span><h1>O pai precisa de saber o que repetir — e quando parar.</h1><p>Sem streaks. Sem culpa. Uma tarefa curta, clara e ligada ao que aconteceu na aula.</p></header><section className={styles.grid}>{history.length?history.slice(0,20).map((item)=>{
   const fallbackPractice=[`🎧 Ouvir: ${item.repertoire}`,"👐 Repetir uma brincadeira curta da aula","🎹 Tocar ou imitar apenas o pequeno trecho que ficou confortável"];
   const practice=item.homePractice?.length?item.homePractice:fallbackPractice;
   const summary=item.parentSummary??`Hoje ${nameFor(item.studentId)} trabalhou ${item.lessonTitle} e levou “${item.repertoire}” como referência musical. 🌱`;
   const text=`${summary}\n\nAté à próxima aula:\n${practice.join("\n")}\n\nPouco tempo, sem pressão. Pare enquanto ainda está agradável.`;
   return <article key={item.id}><div><span>{new Date(item.completedAt).toLocaleDateString("pt-PT")}</span><b>{nameFor(item.studentId)}</b></div><h2>{item.repertoire}</h2><p>{summary}</p><ul>{practice.map((task)=><li key={task}>{task}</li>)}</ul><button onClick={async()=>{await navigator.clipboard?.writeText(text);setCopied(item.id)}}>{copied===item.id?"Copiado ✓":"Copiar para os pais"}</button></article>
 }):<div className={styles.empty}><strong>Ainda não há cartões.</strong><span>Conclua uma aula no novo Modo Aula e o primeiro aparece aqui.</span></div>}</section></div>
}
