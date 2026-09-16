import Link from "next/link";
import { Logo } from "@/components/logo";
import { AnimalSounds } from "@/components/animal-sounds";
import { getCurriculum } from "@/lib/curriculum";
import styles from "./modulo1.module.css";

const printableUrl = "/recursos/2-4/modulo-1/imprimir";

export default function ModuleOneResourcesPage() {
  const program = getCurriculum("2-4");
  const module = program.modules[0];

  return (
    <main className={styles.page}>
      <header className="simple-header container">
        <Logo />
        <Link href="/curriculo?age=2-4">← Voltar ao currículo</Link>
      </header>

      <section className={`container ${styles.wrap}`}>
        <div className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>2–4 anos · Módulo 1</span>
            <h1>{module.title}</h1>
            <p>{module.outcome}</p>
            <div className={styles.rule}>A atividade acontece com o professor, o piano e os materiais impressos — não no ecrã.</div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span>🐘</span><span>🐦</span><span>🦁</span><span>🐇</span>
          </div>
        </div>

        <section className={styles.materialCard}>
          <div>
            <span className={styles.sectionLabel}>Materiais do módulo</span>
            <h2>Kit imprimível completo</h2>
            <p>Cartões, adesivos para o piano, atividades, mini história visual e guia rápido do professor.</p>
            <div className={styles.materialMeta}>
              <span>8 páginas</span><span>A4</span><span>Pronto para imprimir</span>
            </div>
          </div>
          <div className={styles.materialActions}>
            <Link className="btn btn-primary" href={printableUrl}>Abrir printable →</Link>
            <Link className="btn btn-soft" href={printableUrl}>Imprimir / salvar PDF</Link>
          </div>
        </section>

        <section className={styles.soundSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Áudio do professor</span>
              <h2>Sons dos personagens</h2>
            </div>
            <p>Toque o som real do animal, mostre o cartão impresso e depois leve a criança ao piano para procurar um som parecido.</p>
          </div>
          <AnimalSounds className={styles.sounds} />
          <p className={styles.attribution}>Áudios educativos provenientes do Wikimedia Commons. Elefante em CC0; passarinho e leão em domínio público; coelho sob CC BY-SA.</p>
        </section>

        <section className={styles.planSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.sectionLabel}>Roteiro do módulo</span>
              <h2>4 aulas presenciais</h2>
            </div>
            <p>O sistema orienta o professor. A experiência da criança acontece fora do ecrã.</p>
          </div>

          <div className={styles.lessonGrid}>
            {module.lessons.map((lesson) => (
              <article className={styles.lesson} key={lesson.number}>
                <span className={styles.lessonNumber}>{String(lesson.number).padStart(2, "0")}</span>
                <div>
                  <h3>{lesson.title}</h3>
                  <strong>{lesson.focus}</strong>
                  <p>{lesson.objective}</p>
                </div>
                <span className={styles.duration}>{lesson.duration}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.teacherFlow}>
          <span className={styles.sectionLabel}>Como conduzir</span>
          <h2>Um fluxo simples para a aula</h2>
          <div className={styles.flowGrid}>
            <div><b>1</b><h3>Mostre</h3><p>Escolha 1 ou 2 cartões impressos.</p></div>
            <div><b>2</b><h3>Ouça</h3><p>Toque o som do animal no Luwipi.</p></div>
            <div><b>3</b><h3>Imite</h3><p>Peça gesto, voz, movimento ou apontar.</p></div>
            <div><b>4</b><h3>Leve ao piano</h3><p>A criança procura o contraste sonoro no instrumento.</p></div>
          </div>
        </section>
      </section>
    </main>
  );
}
