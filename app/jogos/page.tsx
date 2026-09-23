import { redirect } from "next/navigation";
import { GameWorldScene } from "@/components/game-world";
import { ProductShell } from "@/components/product-shell";
import { gamesForAge } from "@/lib/games";
import { competencyLabels } from "@/lib/learning-intelligence";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";
import styles from "./jogos.module.css";

function Group({age,title}:{age:"2-4"|"5-8";title:string}){
 return <section className={styles.group}><div className={styles.head}><div><small>{age==="5-8"?"5–9":"2–4"} ANOS</small><h2>{title}</h2></div><span>3 níveis por jogo</span></div><div className={styles.grid}>{gamesForAge(age).map(game=><article className={styles.card} key={game.id}><div className={styles.art}><GameWorldScene world={game.world} progress={36} reaction="idle" level={0}/><div className={styles.artLabel}><small>{competencyLabels[game.competency]}</small><strong>{game.skill}</strong></div></div><div className={styles.meta}><span>{game.session}</span><span>3 níveis</span></div><h3>{game.title}</h3><p className={styles.story}>{game.goal}</p><div className={styles.levels}>{game.levels.map((level,index)=><span key={level.label}><b>{index+1}</b>{level.label}</span>)}</div><a className={styles.play} href={`/jogos/${game.id}`}>ENTRAR NO MUNDO →</a></article>)}</div></section>
}

export default async function GamesPage({searchParams}:{searchParams:Promise<{student?:string;age?:string}>}){
 const params=await searchParams;
 if(params.student||params.age)redirect(contextRedirectHref({studentId:params.student,ageGroup:params.age,next:"/jogos"}));
 const context=await resolveLearningContext();
 const gameAge=context.ageGroup==="2-4"?"2-4":"5-8";
 const title=gameAge==="2-4"?"Descoberta, ouvido e movimento":"Leitura, técnica, harmonia e criação";
 return <ProductShell backHref="/dashboard" backLabel="Aulas"><section className={"container "+styles.wrap}><header className={styles.hero}><div><span>JOGOS LUWIPI · {gameAge==="2-4"?"2–4":"5–9"} ANOS</span><h1>Jogos certos para este aluno.</h1><p>Sem escolher idade outra vez: o LuwiPi usa automaticamente a faixa do aluno ativo.</p></div></header><Group age={gameAge} title={title}/></section></ProductShell>;
}
