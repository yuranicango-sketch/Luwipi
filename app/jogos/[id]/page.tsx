import { notFound } from "next/navigation";
import { UniversalGamePlayer } from "@/components/universal-game-player";
import { getGame } from "@/lib/games";
import { getGameStory } from "@/lib/game-stories";

export default async function GameDetailPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{student?:string}>}){
 const [{id},query]=await Promise.all([params,searchParams]);
 const game=getGame(id);if(!game)notFound();
 return <UniversalGamePlayer game={game} story={getGameStory(id)} studentId={query.student?.trim()||"default"}/>;
}
