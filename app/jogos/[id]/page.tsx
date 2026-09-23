import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { ListenChoiceGame } from "@/components/listen-choice-game";
import { KeyboardHuntGame } from "@/components/keyboard-hunt-game";
import { RhythmTapGame } from "@/components/rhythm-tap-game";
import { EchoMusicalGame } from "@/components/echo-musical-game";
import { ListenFindGame } from "@/components/listen-find-game";
import { ChordBuildGame } from "@/components/chord-build-game";
import { ColorPathGame, TrainRhythmGame, LambAdventureGame, StaffToKeyGame, BuildMeasureGame, FingerMasterGame, ArticulationGame, CompleteMelodyGame } from "@/components/extra-games";
import { getGame } from "@/lib/games";
import { getGameStory } from "@/lib/game-stories";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const game = getGame(id); if (!game) notFound(); const story = getGameStory(id);
  return <main className="dashboard-page game-detail"><header className="simple-header container"><Logo/><Link href="/jogos">← Jogos</Link></header>{game.image&&<div className="game-real-art"><img src={game.image} alt="" /></div>}
    {id === "elefante-passarinho" || id === "leao-coelhinho" ? <ListenChoiceGame gameId={id} story={story} />
    : id === "caca-teclas" || id === "encontre-do" ? <KeyboardHuntGame gameId={id} story={story} />
    : id === "siga-tambor" ? <RhythmTapGame story={story} />
    : id === "eco-musical" ? <EchoMusicalGame story={story} />
    : id === "caminho-cores" ? <ColorPathGame story={story} />
    : id === "trem-ritmo" ? <TrainRhythmGame story={story} />
    : id === "ajude-cordeirinho" ? <LambAdventureGame story={story} />
    : id === "pauta-tecla" ? <StaffToKeyGame story={story} />
    : id === "construa-compasso" ? <BuildMeasureGame story={story} />
    : id === "ouca-encontre" ? <ListenFindGame story={story} />
    : id === "mestre-dedos" ? <FingerMasterGame story={story} />
    : id === "legato-staccato" ? <ArticulationGame story={story} />
    : id === "construa-acorde" ? <ChordBuildGame story={story} />
    : id === "complete-melodia" ? <CompleteMelodyGame story={story} />
    : <section className="container demo-dashboard" style={{maxWidth:720}}><div className="eyebrow">{game.age} anos</div><h1>{game.emoji} {game.title}</h1><p>{story}</p></section>}
  <style>{`.game-real-art{width:min(700px,calc(100% - 24px));height:210px;margin:18px auto -8px;border-radius:28px;overflow:hidden;background:#eef3f8}.game-real-art img{width:100%;height:100%;object-fit:cover}.game-detail .big,.game-detail .characters{display:none!important}`}</style></main>;
}
