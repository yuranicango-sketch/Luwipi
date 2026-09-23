import Link from "next/link";
import { redirect } from "next/navigation";
import { TrialClock } from "@/components/trial-clock";
import { DuoAction } from "@/components/duo-action/duo-action";
import { ProductShell } from "@/components/product-shell";
import { StudentLearningSummary } from "@/components/student-learning-summary";
import { StudentSwitcher } from "@/components/student-switcher";
import { getEnhancedCurriculum, getVariant } from "@/lib/curriculum-v3";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";
import styles from "./dashboard.module.css";

export default async function DashboardPage({searchParams}:{searchParams:Promise<{age?:string;variant?:string;student?:string}>}){
 const params=await searchParams;
 if(params.student||params.age)redirect(contextRedirectHref({studentId:params.student,ageGroup:params.age,next:"/dashboard"}));
 const context=await resolveLearningContext(),program=getEnhancedCurriculum(context.ageGroup),variant=getVariant(program,undefined),student=context.studentId,openingLessons=program.modules[0].lessons,isPreschool=program.age==="2-4";
 return <ProductShell><section className={`container ${styles.main}`}><div className={styles.hero}><div><span className={styles.trial}>Teste grátis · <TrialClock/></span><h1>Uma experiência. Um piano.</h1><p><strong>{program.label}</strong> · {variant.label} · O percurso inteiro acontece dentro do Player LuwiPi.</p><div style={{marginTop:12}}><StudentSwitcher current={student}/></div></div><div className={styles.quick}><Link href="/aprender?map=1">Mapa do percurso</Link><Link href="/treino">Treino 5 min</Link><Link href="/musicas">Músicas</Link><Link href="/jogos">Jogos</Link></div></div><StudentLearningSummary studentId={student} age={program.age}/><div className={styles.sectionHead}><div><small>ENTRAR NO PERCURSO</small><h2>{program.modules[0].title}</h2><p>A aula, o jogo e a música mudam de cena; o piano e a experiência permanecem.</p></div><Link href="/aprender?map=1">Abrir mapa dentro do Player →</Link></div><div className={styles.grid}>{openingLessons.map(lesson=><article key={lesson.number} className={styles.card}><span className={styles.number}>AULA {String(lesson.number).padStart(2,"0")}</span><h3>{lesson.title}</h3><p>{lesson.focus} · {variant.lessonLength}</p><div><DuoAction href={`/aprender?lesson=${lesson.number}`}>ENTRAR NO PLAYER</DuoAction></div></article>)}</div><div className={styles.bottom}>{isPreschool&&<Link className="btn btn-soft" href="/recursos/2-4/modulo-1">Materiais do módulo</Link>}<Link className="btn btn-soft" href="/treino">Treino adaptativo</Link><Link className="btn btn-primary" href="/professor/tarefas">Criar tarefa</Link></div></section></ProductShell>
}
