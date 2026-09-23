"use client";

import { useEffect, useState } from "react";
import { competencyLabels, type CompetencyId } from "@/lib/learning-intelligence";
import { fetchStudentInsight, isRemoteStudentId, type StudentInsight } from "@/lib/learning-client";
import styles from "./student-learning-summary.module.css";

export function StudentLearningSummary({studentId,age}:{studentId:string;age:"2-4"|"5-8"|"adult"}){
 const[insight,setInsight]=useState<StudentInsight|null>(null),[loading,setLoading]=useState(isRemoteStudentId(studentId));
 useEffect(()=>{let alive=true;if(!isRemoteStudentId(studentId)){setInsight(null);setLoading(false);return}setLoading(true);void fetchStudentInsight(studentId,age).then(value=>{if(alive){setInsight(value);setLoading(false)}});return()=>{alive=false}},[studentId,age]);
 if(!isRemoteStudentId(studentId))return <section className={styles.empty}><div><small>INTELIGÊNCIA DE APRENDIZAGEM</small><h2>Escolha um aluno para ativar o acompanhamento.</h2><p>Quando o percurso usa um aluno real, aulas, músicas, jogos e treino começam a construir um diagnóstico contínuo.</p></div><a href="/professor/tarefas">GERIR ALUNOS →</a></section>;
 if(loading)return <section className={styles.loading}><i/><i/><i/><strong>A analisar o progresso…</strong></section>;
 if(!insight)return <section className={styles.empty}><div><small>INTELIGÊNCIA DE APRENDIZAGEM</small><h2>Ainda não há evidência suficiente.</h2><p>Faça uma aula, jogo, música ou treino com este aluno para começar a construir o perfil.</p></div></section>;
 const weakest=insight.metrics.slice(0,3),strongest=[...insight.metrics].sort((a,b)=>b.masteryScore-a.masteryScore).slice(0,2);
 return <section className={styles.panel}>
   <header><div><small>ALUNO · {insight.student.displayCode}</small><h2>O que ensinar a seguir</h2><p>O LuwiPi junta evidência de aulas, músicas, jogos e treino para evitar repetir o que já está seguro.</p></div><div className={styles.overview}><span><b>{insight.summary.completedLessons}/48</b>aulas</span><span><b>{insight.summary.practiceMinutes}</b>min prática</span><span><b>{insight.summary.totalSessions}</b>sessões</span><span><b>{insight.summary.homeworkCompleted}/{insight.summary.homeworkAssigned}</b>tarefas</span></div></header>
   <div className={styles.grid}><div className={styles.focus}><small>RECOMENDAÇÃO</small><h3>Reforçar agora</h3>{weakest.map((metric,index)=><article key={metric.competency}><span>{index+1}</span><div><strong>{competencyLabels[metric.competency]}</strong><i><b style={{width:`${Math.round(metric.masteryScore*100)}%`}}/></i></div><em>{Math.round(metric.masteryScore*100)}%</em></article>)}<a href={`/treino?age=${age}&student=${encodeURIComponent(studentId)}`}>INICIAR TREINO ADAPTATIVO →</a></div>
   <div className={styles.strong}><small>JÁ MAIS SEGURO</small><h3>Competências fortes</h3>{strongest.map(metric=><div key={metric.competency}><strong>{competencyLabels[metric.competency]}</strong><span>{Math.round(metric.masteryScore*100)}%</span></div>)}<div className={styles.next}><small>PRÓXIMA AULA</small><b>{insight.summary.currentLesson}</b><span>de 48</span></div><a href={`/aprender?age=${age}&student=${encodeURIComponent(studentId)}&lesson=${insight.summary.currentLesson}`}>CONTINUAR PERCURSO →</a></div>
   <div className={styles.recent}><small>ÚLTIMA EVIDÊNCIA</small><h3>Sessões recentes</h3>{insight.recentSessions.slice(0,4).map(session=><div key={session.id}><span>{session.sessionType==="lesson"?"Aula":session.sessionType==="song"?"Música":session.sessionType==="game"?"Jogo":"Treino"}</span><strong>{session.lessonNumber?`#${session.lessonNumber}`:session.contentId??"sessão"}</strong><em>{session.accuracy==null?"—":`${session.accuracy}%`}</em></div>)}{!insight.recentSessions.length&&<p>Ainda sem sessões registradas.</p>}{insight.summary.homeworkAssigned>0&&<div className={styles.homework}><span>CASA</span><strong>{insight.summary.homeworkCompleted} de {insight.summary.homeworkAssigned} tarefas concluídas</strong><em>{insight.summary.lastHomeworkPractice?"prática registrada":"sem prática recente"}</em></div>}</div></div>
 </section>;
}
