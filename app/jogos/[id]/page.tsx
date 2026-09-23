import { notFound } from "next/navigation";
import { UniversalGamePlayer } from "@/components/universal-game-player";
import { getGame } from "@/lib/games";
import { getGameStory } from "@/lib/game-stories";

export default async function GameDetailPage({params}:{params:Promise<{id:string}>}){
 const{id}=await params;const game=getGame(id);if(!game)notFound();return <UniversalGamePlayer game={game} story={getGameStory(id)}/>;
}
