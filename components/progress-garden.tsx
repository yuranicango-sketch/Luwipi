import type { CompetencyId, MasteryLevel } from "@/lib/suzuki-lessons";
import styles from "./progress-garden.module.css";

const stages = ["🌱","🌿","🌼","🌳","🎵","⭐"];
const cycleNames = ["Jardim", "Bosque", "Parque", "Paisagem"];

export function ProgressGarden({ lessons, repertoire, competencies = {} }: { lessons: number; repertoire: number; competencies?: Partial<Record<CompetencyId, MasteryLevel>> }) {
  const masteryMilestones = Object.values(competencies).filter((level) => level === "consolidado" || level === "independente").length;
  const growth = lessons + repertoire * 2 + masteryMilestones * 2;
  const completedCycles = Math.floor(growth / stages.length);
  const unlocked = growth === 0 ? 0 : Math.max(1, growth % stages.length || stages.length);
  const cycle = cycleNames[completedCycles % cycleNames.length];
  const generation = Math.floor(completedCycles / cycleNames.length) + 1;

  return <section className={styles.garden} aria-label={`Progresso: ${lessons} aulas, ${repertoire} músicas e ${masteryMilestones} marcos de domínio`}>
    <div className={styles.head}><div><span>JARDIM DE PROGRESSO · {cycle.toUpperCase()} {generation > 1 ? generation : ""}</span><strong>Cresce com aulas, repertório e domínio — nunca satura.</strong></div><b>{completedCycles} {completedCycles === 1 ? "ciclo completo" : "ciclos completos"}</b></div>
    <div className={styles.plots}>{stages.map((stage,index)=><div key={stage} data-grown={index<unlocked}><span>{index<unlocked?stage:"○"}</span><small>{index<unlocked?`Marco ${completedCycles * stages.length + index + 1}`:"A crescer"}</small></div>)}</div>
    <div className={styles.metrics}><span><b>{lessons}</b> aulas</span><span><b>{repertoire}</b> músicas</span><span><b>{masteryMilestones}</b> competências consolidadas</span></div>
  </section>;
}
