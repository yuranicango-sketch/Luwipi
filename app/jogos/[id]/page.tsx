import { notFound, redirect } from "next/navigation";
import { UniversalGamePlayer } from "@/components/universal-game-player";
import { getGame } from "@/lib/games";
import { getGameStory } from "@/lib/game-stories";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";

export default async function GameDetailPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string;age?:string}>}){
 const [{id},query]=await Promise.all([params,searchParams]);
 if(query.student||query.age)redirect(contextRedirectHref({studentId:query.student,ageGroup:query.age,next:`/jogos/${id}`}));
 const context=await resolveLearningContext(),game=getGame(id);
 if(!game)notFound();
 const expectedAge=context.ageGroup==="2-4"?"2-4":"5-8";
 if(game.age!==expectedAge)redirect("/jogos");
 return <UniversalGamePlayer game={game} story={getGameStory(id)} studentId={context.studentId}/>;
}
