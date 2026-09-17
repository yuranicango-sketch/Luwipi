import Link from "next/link";
import { Logo } from "@/components/logo";
import { DuoAction } from "@/components/duo-action/duo-action";
import { gamesForAge } from "@/lib/games";
import { getGameStory } from "@/lib/game-stories";

const playable = new Set([
  "elefante-passarinho","leao-coelhinho","siga-tambor","eco-musical","caca-teclas","caminho-cores","trem-ritmo","ajude-cordeirinho",
  "encontre-do","pauta-tecla","construa-compasso","ouca-encontre","mestre-dedos","legato-staccato","construa-acorde","complete-melodia",
]);
function GameGroup({age,title}:{age:"2-4"|"5-8";title:string}){const list=gamesForAge(age);return <section style={{marginTop:34}}><div className="section-heading compact"><span>{age} anos</span><h2>{title}</h2></div><div className="lesson-grid">{list.map((game,index)=>{const ready=playable.has(game.id);return <article key={game.id} className={`lesson-card ${index%3===0?"lesson-pink":index%3===1?"lesson-yellow":"lesson-blue"}`} style={{display:"flex",flexDirection:"column"}}><span style={{fontSize:32}}>{game.emoji}</span><h2>{game.title}</h2><p style={{fontWeight:800}}>{game.skill} · {game.session}</p><p style={{fontSize:13,lineHeight:1.5,opacity:.8}}>{getGameStory(game.id)}</p><div style={{marginTop:"auto",paddingTop:18}}><DuoAction href={ready?`/jogos/${game.id}`:undefined} disabled={!ready}>JOGAR</DuoAction></div></article>})}</div></section>}
export default function GamesPage(){return <main className="dashboard-page"><header className="simple-header container"><Logo/><Link href="/dashboard">← Voltar</Link></header><section className="container demo-dashboard"><div className="eyebrow">Jogos</div><h1>Ouça. Toque. Aprenda. 🎮</h1><p>Jogos curtos para usar durante a aula ou praticar em casa.</p><GameGroup age="2-4" title="Descoberta e movimento"/><GameGroup age="5-8" title="Ouvido, leitura e teclado"/></section></main>}
