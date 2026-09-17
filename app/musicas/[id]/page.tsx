import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { SongPractice } from "@/components/song-practice";
import { getSong } from "@/lib/music-library";

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = getSong(id);
  if (!song || !song.playable || !song.sequence?.length) notFound();

  return (
    <main className="dashboard-page">
      <header className="simple-header container"><Logo/><Link href="/musicas">← Músicas</Link></header>
      <SongPractice song={song} />
    </main>
  );
}
