import styles from "./progress-garden.module.css";

const stages = ["🌱","🌿","🌼","🌳","🎵","⭐"];

export function ProgressGarden({ lessons, repertoire }: { lessons: number; repertoire: number }) {
  const unlocked = Math.max(0, Math.min(stages.length, Math.ceil(lessons / 3)));
  return <section className={styles.garden} aria-label={`Jardim de progresso: ${lessons} aulas e ${repertoire} músicas no repertório`}>
    <div className={styles.head}><div><span>JARDIM DE PROGRESSO</span><strong>Cresce com presença, nunca murcha por faltas.</strong></div><b>{lessons} {lessons===1?"aula":"aulas"}</b></div>
    <div className={styles.plots}>{stages.map((stage,index)=><div key={stage} data-grown={index<unlocked}><span>{index<unlocked?stage:"○"}</span><small>{index<unlocked?`Marco ${index+1}`:"Por crescer"}</small></div>)}</div>
    <p>{repertoire ? `${repertoire} ${repertoire===1?"música já faz":"músicas já fazem"} parte da jornada.` : "O primeiro marco aparece depois das primeiras aulas."}</p>
  </section>;
}
