import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { ListenChoiceGame } from "@/components/listen-choice-game";
import { KeyboardHuntGame } from "@/components/keyboard-hunt-game";
import { RhythmTapGame } from "@/components/rhythm-tap-game";
import { EchoMusicalGame } from "@/components/echo-musical-game";
import { ListenFindGame } from "@/components/listen-find-game";
import { ChordBuildGame } from "@/components/chord-build-game";
import { getGame } from "@/lib/games";
import { getGameStory } from "@/lib/game-stories";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  const story = getGameStory(id);

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/jogos">← Jogos</Link></header>

      {id === "elefante-passarinho" || id === "leao-coelhinho" ? (
        <ListenChoiceGame gameId={id} story={story} />
      ) : id === "caca-teclas" || id === "encontre-do" ? (
        <KeyboardHuntGame gameId={id} story={story} />
      ) : id === "siga-tambor" ? (
        <RhythmTapGame story={story} />
      ) : id === "eco-musical" ? (
        <EchoMusicalGame story={story} />
      ) : id === "ouca-encontre" ? (
        <ListenFindGame story={story} />
      ) : id === "construa-acorde" ? (
        <ChordBuildGame story={story} />
      ) : (
        <section className="container demo-dashboard" style={{maxWidth:720}}>
          <div className="eyebrow">{game.age} anos</div>
          <h1>{game.emoji} {game.title}</h1>
          <p>{story}</p>
          <div style={{marginTop:24}}><span className="btn btn-soft">Em preparação</span></div>
        </section>
      )}
    </main>
  );
}
