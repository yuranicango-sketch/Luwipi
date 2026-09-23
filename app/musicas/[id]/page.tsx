import { notFound } from "next/navigation";
import { SongPractice } from "@/components/song-practice";
import { getSong } from "@/lib/music-library";

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = getSong(id);
  const hasNotes = Boolean(song?.sequence?.length || song?.sections?.some((section) => section.notes.length));
  if (!song || !song.playable || !hasNotes) notFound();
  return <main><SongPractice song={song}/></main>;
}
