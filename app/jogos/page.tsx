import { GameWorldScene } from "@/components/game-world";
import { ProductShell } from "@/components/product-shell";
import { gamesForAge } from "@/lib/games";
import { competencyLabels } from "@/lib/learning-intelligence";
import styles from "./jogos.module.css";

function Group({age,title,student}:{age:"2-4"|"5-8";title:string;student:string}){
 return <section className={styles.group}><div className={styles.head}><div><small>{age==="5-8"?"5–9":"2–4"} ANOS</small><h2>{title}</h2></div><span>3 níveis por jogo</span></div><div className={styles.grid}>{gamesForAge(age).map(game=><article className={styles.card} key={game.id}><div className={styles.art}><GameWorldScene world={game.world} progress={36} reaction="idle" level={0}/><div className={styles.artLabel}><small>{competencyLabels[game.competency]}</small><strong>{game.skill}</strong></div></div><div className={styles.meta}><span>{game.session}</span><span>3 níveis</span></div><h3>{game.title}</h3><p className={styles.story}>{game.goal}</p><div className={styles.levels}>{game.levels.map((level,index)=><span key={level.label}><b>{index+1}</b>{level.label}</span>)}</div><a className={styles.play} href={`/jogos/${game.id}?student=${encodeURIComponent(student)}`}>ENTRAR NO MUNDO →</a></article>)}</div></section>
}
export default async function GamesPage({searchParams}:{searchParams:Promise<{student?:string}>}){
 const params=await searchParams,student=params.student?.trim()||"default";
 return <ProductShell backHref="/dashboard" backLabel="Aulas"><section className={"container "+styles.wrap}><header className={styles.hero}><div><span>JOGOS LUWIPI · MUNDOS VIVOS</span><h1>Jogar também deixa evidência de aprendizagem.</h1><p>Cada jogo tem três níveis, menos pistas à medida que a criança ganha confiança e resultado ligado às competências do aluno.</p></div></header><Group age="2-4" title="Descoberta, ouvido e movimento" student={student}/><Group age="5-8" title="Leitura, técnica, harmonia e criação" student={student}/></section></ProductShell>;
}
