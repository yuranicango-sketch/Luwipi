import type { AgeBand, LessonBlock } from "@/lib/suzuki-lessons";
import styles from "./lesson-activity-visual.module.css";

function KeyboardMap() {
  return <svg className={styles.keyboard} viewBox="0 0 640 220" role="img" aria-label="Mapa visual do teclado com grupos de duas e três teclas pretas">
    <rect x="4" y="4" width="632" height="212" rx="24" className={styles.paper}/>
    {Array.from({length:14},(_,i)=><rect key={i} x={18+i*43} y="30" width="41" height="160" rx="5" className={styles.whiteKey}/>)}
    {[0,1,3,4,5,7,8,10,11,12].map((i)=><rect key={i} x={48+i*43} y="30" width="25" height="98" rx="4" className={styles.blackKey}/>)}
    <path d="M70 202H568" className={styles.guideLine}/>
  </svg>;
}

function PitchScene() {
  return <svg className={styles.sceneSvg} viewBox="0 0 640 230" role="img" aria-label="Contraste visual entre grave e agudo">
    <path d="M20 184C96 142 154 154 230 184" className={styles.lowHill}/>
    <circle cx="132" cy="146" r="46" className={styles.lowShape}/>
    <path d="M406 82c46-48 108-49 165-18" className={styles.highFlight}/>
    <circle cx="508" cy="68" r="19" className={styles.highShape}/>
    <path d="M132 202V166M508 45V84" className={styles.guideLine}/>
    <text x="132" y="222" textAnchor="middle" className={styles.caption}>grave</text>
    <text x="508" y="112" textAnchor="middle" className={styles.caption}>agudo</text>
  </svg>;
}

function PulseScene() {
  return <div className={styles.pulse} role="img" aria-label="Quatro pulsações regulares">
    {[1,2,3,4].map((n)=><span key={n}><i/><b>{n}</b></span>)}
  </div>;
}

function DynamicsScene() {
  return <svg className={styles.sceneSvg} viewBox="0 0 640 220" role="img" aria-label="Contraste visual entre forte e suave">
    <path d="M44 112 C98 18 150 206 206 112 S314 18 368 112" className={styles.strongWave}/>
    <path d="M410 112 C438 82 464 142 492 112 S548 82 576 112" className={styles.softWave}/>
    <text x="204" y="202" textAnchor="middle" className={styles.caption}>forte</text>
    <text x="494" y="202" textAnchor="middle" className={styles.caption}>suave</text>
  </svg>;
}


function TechniqueScene() {
  return <div className={styles.techniqueScene} role="img" aria-label="Postura e forma confortável da mão ao piano">
    <svg viewBox="0 0 640 220" aria-hidden="true">
      <rect x="92" y="154" width="456" height="38" rx="9" className={styles.pianoRail}/>
      <path d="M54 70c78 4 111 28 152 76M586 70c-78 4-111 28-152 76" className={styles.armLine}/>
      <path d="M190 143c28-43 65-64 108-59 28 3 46 18 64 42 20-22 44-31 72-23 20 6 34 19 42 41-48-11-88-5-120 19-49-17-105-24-166-20Z" className={styles.handShape}/>
      <circle cx="105" cy="64" r="9" className={styles.jointDot}/><circle cx="535" cy="64" r="9" className={styles.jointDot}/>
    </svg>
    <div><span>ombros soltos</span><span>pulso livre</span><span>mão confortável</span></div>
  </div>;
}

function ReadingScene() {
  return <div className={styles.readingScene} role="img" aria-label="Pauta com notas mostrando uma direção melódica ascendente">
    <svg viewBox="0 0 640 220" aria-hidden="true">
      {[58,82,106,130,154].map((y)=><line key={y} x1="60" x2="580" y1={y} y2={y} className={styles.staffLine}/>)}
      <path d="M120 151 210 130 300 106 390 106 480 82" className={styles.readingGuide}/>
      {[[120,151],[210,130],[300,106],[390,106],[480,82]].map(([x,y],index)=><g key={index}><ellipse cx={x} cy={y} rx="13" ry="9" className={styles.noteHead}/><line x1={x+11} x2={x+11} y1={y} y2={y-48} className={styles.noteStem}/></g>)}
    </svg>
    <p>primeiro vê a direção · depois lê os detalhes</p>
  </div>;
}

function ListenScene() {
  return <div className={styles.listen} role="img" aria-label="Símbolo visual para escuta atenta">
    <span className={styles.listenCore}/>
    <i/><i/><i/>
  </div>;
}

function RepertoireScene({title}:{title:string}) {
  return <div className={styles.repertoireScene} role="img" aria-label={`Caminho da música ${title}`}>
    <div className={styles.musicPath}>{[0,1,2,3,4].map((n)=><span key={n} data-last={n===4}><i/></span>)}</div>
    <strong>{title}</strong>
    <small>ouvir · lembrar · tocar</small>
  </div>;
}

export function LessonActivityVisual({ block, ageBand, reduced = false }: { block: LessonBlock; ageBand: AgeBand; reduced?: boolean }) {
  if (block.screenMode === "off") return null;
  const competencies = new Set(block.competencies);
  let content: React.ReactNode = null;

  if (competencies.has("reading")) content = <ReadingScene/>;
  else if (competencies.has("posture") || competencies.has("hand") || competencies.has("fingers")) content = <TechniqueScene/>;
  else if (competencies.has("keyboard") || block.kind === "piano") content = <KeyboardMap/>;
  else if (competencies.has("pitch")) content = <PitchScene/>;
  else if (competencies.has("dynamics")) content = <DynamicsScene/>;
  else if (competencies.has("pulse") || competencies.has("rhythm") || block.kind === "movement") content = <PulseScene/>;
  else if (block.kind === "repertoire") content = <RepertoireScene title={block.title}/>;
  else if (block.kind === "ear" || competencies.has("listening")) content = <ListenScene/>;

  if (!content) return null;
  return <div className={styles.visual} data-age={ageBand} data-reduced={reduced || undefined}>{content}</div>;
}
