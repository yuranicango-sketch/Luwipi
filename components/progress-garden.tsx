import styles from "./progress-garden.module.css";

const stages = ["🌱","🌿","🌼","🌳","🎵","⭐"];
const STAGE_POINTS = 3;
const CYCLE_POINTS = stages.length * STAGE_POINTS;

export function ProgressGarden({ lessons, repertoire, mastery = 0 }: { lessons: number; repertoire: number; mastery?: number }) {
  const points = lessons + repertoire * 2 + mastery * 3;
  const completedCycles = Math.floor(points / CYCLE_POINTS);
  const cyclePoints = points % CYCLE_POINTS;
  const unlocked = cyclePoints === 0 && points > 0 ? 0 : Math.ceil(cyclePoints / STAGE_POINTS);
  const cycle = completedCycles + 1;
  const recentCycles = Array.from({length:Math.min(completedCycles,4)},(_,index)=>completedCycles-Math.min(completedCycles,4)+index+1);

  return <section className={styles.garden} aria-label={`Jardim de progresso: ${lessons} aulas, ${repertoire} músicas e ${mastery} marcos consolidados`}>
    <div className={styles.head}><div><span>JARDIM DE PROGRESSO · CICLO {cycle}</span><strong>Cresce com aulas, repertório e domínio. Nunca satura.</strong></div><b>{points} pts de crescimento</b></div>
    <div className={styles.metrics}><span><b>{lessons}</b> aulas</span><span><b>{repertoire}</b> repertório</span><span><b>{mastery}</b> marcos</span></div>
    <div className={styles.plots}>{stages.map((stage,index)=><div key={stage} data-grown={index<unlocked}><span>{index<unlocked?stage:"○"}</span><small>{index<unlocked?"Cresceu":"Por crescer"}</small></div>)}</div>
    {completedCycles>0&&<div className={styles.cycles}><span>Jardins concluídos</span>{recentCycles.map((item)=><b key={item}>✓ {item}</b>)}{completedCycles>4&&<em>+{completedCycles-4}</em>}</div>}
    <p>Ao completar um ciclo, começa outro sem apagar o anterior. Competências consolidadas e independentes aceleram o crescimento.</p>
  </section>;
}
