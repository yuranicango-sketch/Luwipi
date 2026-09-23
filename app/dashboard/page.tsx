import Link from "next/link";
import { TrialClock } from "@/components/trial-clock";
import { DuoAction } from "@/components/duo-action/duo-action";
import { ProductShell } from "@/components/product-shell";
import { getCurriculum } from "@/lib/curriculum";
import styles from "./dashboard.module.css";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const params = await searchParams;
  const program = getCurriculum(params.age);
  const openingLessons = program.modules[0].lessons;
  const isPreschool = program.age === "2-4";
  return <ProductShell><section className={`container ${styles.main}`}><div className={styles.hero}><div><span className={styles.trial}>Teste grátis · <TrialClock/></span><h1>Pronto para a próxima aula?</h1><p><strong>{program.label}</strong> · {program.name}</p></div><div className={styles.quick}><Link href={`/curriculo?age=${program.age}`}>Currículo</Link><Link href={`/treino?age=${program.age}`}>⚡ Treino 5 min</Link><Link href="/musicas">Músicas</Link><Link href="/jogos">Jogos</Link></div></div><div className={styles.sectionHead}><div><small>MÓDULO 1</small><h2>{program.modules[0].title}</h2><p>{program.modules[0].outcome}</p></div><Link href={`/curriculo?age=${program.age}`}>Ver percurso completo →</Link></div><div className={styles.grid}>{openingLessons.map((lesson) => <article key={lesson.number} className={styles.card}><span className={styles.number}>AULA {String(lesson.number).padStart(2,"0")}</span><h3>{lesson.title}</h3><p>{lesson.focus} · {lesson.duration}</p><div><DuoAction href={`/aulas/${program.age}/${lesson.number}`}>ABRIR MODO AULA</DuoAction></div></article>)}</div><div className={styles.bottom}>{isPreschool && <Link className="btn btn-soft" href="/recursos/2-4/modulo-1">Materiais do módulo</Link>}<Link className="btn btn-soft" href={`/treino?age=${program.age}`}>Treino adaptativo</Link><Link className="btn btn-primary" href="/professor/tarefas">Criar tarefa</Link></div></section></ProductShell>;
}
