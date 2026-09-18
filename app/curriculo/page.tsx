import Link from "next/link";
import { Logo } from "@/components/logo";
import { CurriculumJourney } from "@/components/curriculum-journey";
import { getEnhancedCurriculum, getVariant } from "@/lib/curriculum-v3";
import styles from "./curriculo.module.css";

export default async function CurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{
    age?: string;
    variant?: string;
    student?: string;
    current?: string;
  }>;
}) {
  const params = await searchParams;
  const program = getEnhancedCurriculum(params.age);
  const variant = getVariant(program, params.variant);
  const studentId = params.student?.trim() || "default";
  const initialCurrent = Math.max(1, Math.min(48, Number(params.current ?? "1")));

  return (
    <main className={styles.page}>
      <header className="simple-header container">
        <Logo />
        <Link href={`/dashboard?age=${program.age}`}>← Voltar às aulas</Link>
      </header>

      <section className={`container ${styles.wrap}`}>
        <div className={styles.hero}>
          <span>Currículo Luwipi · 6 meses</span>
          <h1>{program.name}</h1>
          <p>{program.philosophy}</p>
          <div>
            <b>{program.label}</b>
            <b>48 aulas</b>
            <b>2 por semana</b>
          </div>
        </div>

        <div className={styles.switches}>
          <nav>
            <Link className={program.age === "2-4" ? styles.active : ""} href="/curriculo?age=2-4">2–4 anos</Link>
            <Link className={program.age === "5-8" ? styles.active : ""} href="/curriculo?age=5-8">5–8 anos</Link>
          </nav>
          <nav>
            {program.variants.map((item) => (
              <Link
                key={item.id}
                className={variant.id === item.id ? styles.variantActive : ""}
                href={`/curriculo?age=${program.age}&variant=${item.id}&student=${encodeURIComponent(studentId)}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <section className={styles.method}>
          <div>
            <small>Currículo espiral</small>
            <h2>Uma aula, várias habilidades.</h2>
            <p>O tema muda, mas ouvido, ritmo, piano e música continuam presentes ao longo das 24 semanas.</p>
          </div>
          <div className={styles.pillars}>
            {program.spiralPillars.map((pillar) => <span key={pillar}>{pillar}</span>)}
          </div>
          <div className={styles.variant}>
            <strong>{variant.label} · {variant.lessonLength}</strong>
            <p>{variant.note}</p>
          </div>
        </section>

        <CurriculumJourney
          program={program}
          variant={variant}
          studentId={studentId}
          initialCurrent={Number.isFinite(initialCurrent) ? initialCurrent : 1}
        />

        <section className={styles.finish}>
          <div>🏁</div>
          <div>
            <small>Ao fim dos seis meses</small>
            <h2>Resultado esperado</h2>
            <p>{program.finalOutcome}</p>
          </div>
        </section>
      </section>
    </main>
  );
}
