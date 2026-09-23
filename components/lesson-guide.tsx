import type { AgeBand, BlockKind } from "@/lib/suzuki-lessons";
import styles from "./lesson-guide.module.css";

const labels: Record<BlockKind, string> = {
  arrival: "Cheguei",
  movement: "Corpo",
  ear: "Escuta",
  piano: "Piano",
  repertoire: "Música",
  closing: "Fechar",
};

const marks: Record<BlockKind, string> = {
  arrival: "♪",
  movement: "↟",
  ear: "◖",
  piano: "▥",
  repertoire: "♫",
  closing: "✦",
};

export function LessonGuide({ ageBand, kind, reduced = false }: { ageBand: AgeBand; kind: BlockKind; reduced?: boolean }) {
  return <div className={styles.guide} data-age={ageBand} data-kind={kind} data-reduced={reduced || undefined} aria-label={`Luwi guia: ${labels[kind]}`}>
    <svg className={styles.face} viewBox="0 0 120 120" role="img" aria-label="Luwi">
      <path className={styles.body} d="M60 9c27 0 48 18 48 45 0 31-22 57-48 57S12 85 12 54C12 27 33 9 60 9Z"/>
      <path className={styles.earLeft} d="M20 32 5 22l6 25Z"/><path className={styles.earRight} d="m100 32 15-10-6 25Z"/>
      <circle className={styles.eye} cx="44" cy="52" r="5"/><circle className={styles.eye} cx="76" cy="52" r="5"/>
      <path className={styles.smile} d="M45 70c8 8 22 8 30 0" fill="none" strokeWidth="5" strokeLinecap="round"/>
      <circle className={styles.cheek} cx="32" cy="66" r="6"/><circle className={styles.cheek} cx="88" cy="66" r="6"/>
      <text x="60" y="98" textAnchor="middle" className={styles.mark}>{marks[kind]}</text>
    </svg>
    <span>{labels[kind]}</span>
  </div>;
}
