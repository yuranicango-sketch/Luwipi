import Link from "next/link";
import { Logo } from "@/components/logo";
import { getCurriculum } from "@/lib/curriculum";
import styles from "./curriculo.module.css";

export default async function CurriculumPage({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const params = await searchParams;
  const program = getCurriculum(params.age);

  return (
    <main className={styles.page}>
      <header className="simple-header container">
        <Logo />
        <Link href={`/dashboard?age=${program.age}`}>← Voltar às aulas</Link>
      </header>

      <section className={`container ${styles.wrap}`}>
        <div className={styles.hero}>
          <div className={styles.heroCard}>
            <span className={styles.eyebrow}>Currículo Luwipi · 6 meses</span>
            <h1>{program.name}</h1>
            <p>{program.philosophy}</p>
            <div className={styles.meta}>
              <span>👧 {program.label}</span>
              <span>📚 {program.duration}</span>
              <span>⏱ {program.lessonLength}</span>
            </div>
          </div>

          <aside className={styles.summaryCard}>
            <small>Resultado ao final do ciclo</small>
            <h2>O que a criança deverá conseguir fazer</h2>
            <p>{program.finalOutcome}</p>
          </aside>
        </div>

        <nav className={styles.ageSwitch} aria-label="Escolher currículo por idade">
          <Link className={`${styles.ageLink} ${program.age === "2-4" ? styles.active : ""}`} href="/curriculo?age=2-4">
            2 a 4 anos
          </Link>
          <Link className={`${styles.ageLink} ${program.age === "5-8" ? styles.active : ""}`} href="/curriculo?age=5-8">
            5 a 8 anos
          </Link>
        </nav>

        <div className={styles.moduleList}>
          {program.modules.map((module, moduleIndex) => {
            const physicalModule = program.age === "2-4" && moduleIndex === 0;
            return (
              <section className={styles.module} key={module.id}>
                <div className={styles.moduleHead}>
                  <div className={styles.moduleIcon}>{module.icon}</div>
                  <div>
                    <div className={styles.moduleNumber}>Módulo {moduleIndex + 1} · aulas {module.lessons[0].number}–{module.lessons[module.lessons.length - 1].number}</div>
                    <h2>{module.title}</h2>
                    <div className={styles.moduleSubtitle}>{module.subtitle}</div>
                    {physicalModule && (
                      <Link className={styles.resourceLink} href="/recursos/2-4/modulo-1">
                        Printables + sons dos animais →
                      </Link>
                    )}
                  </div>
                  <div className={styles.outcome}><strong>Meta do módulo:</strong> {module.outcome}</div>
                </div>

                <div className={styles.lessonGrid}>
                  {module.lessons.map((lesson) => {
                    const lessonReady = Boolean(lesson.route) && !physicalModule;
                    return (
                      <article className={`${styles.lesson} ${lessonReady ? styles.lessonReady : ""}`} key={lesson.number}>
                        <div className={styles.lessonTop}>
                          <span className={styles.lessonNumber}>{String(lesson.number).padStart(2, "0")}</span>
                          <span className={`${styles.status} ${lessonReady ? styles.statusReady : ""}`}>
                            {physicalModule ? "Atividade física" : lessonReady ? "Interativa" : "Currículo definido"}
                          </span>
                        </div>
                        <h3>{lesson.title}</h3>
                        <div className={styles.focus}>{lesson.focus}</div>
                        <p className={styles.objective}>{lesson.objective}</p>
                        <div className={styles.lessonFooter}>
                          <span>{lesson.duration}</span>
                          {physicalModule ? <span>Usar printables</span> : lesson.route ? <Link className={styles.start} href={lesson.route}>Abrir aula →</Link> : <span>Vamos construir</span>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className={styles.footerActions}>
          <Link className="btn btn-soft" href={`/dashboard?age=${program.age}`}>Voltar ao painel</Link>
          <Link className="btn btn-primary" href={`/curriculo?age=${program.age === "2-4" ? "5-8" : "2-4"}`}>Ver outra faixa etária</Link>
        </div>
      </section>
    </main>
  );
}
