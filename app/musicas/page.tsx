import Link from "next/link";
import { Logo } from "@/components/logo";
import { DuoAction } from "@/components/duo-action/duo-action";
import { kidsSongs, type KidsSong } from "@/lib/music-library";

function SongCard({ song }: { song: KidsSong }) {
  return (
    <article className="songCard">
      <div className="topline">
        <span className="emoji">{song.emoji}</span>
        <div className="badges">
          {song.sheetMusic && <span className="scoreBadge">🎼 PARTITURA</span>}
          <span className={song.rights === "license-required" ? "license" : "traditional"}>
            {song.rights === "license-required" ? "LICENÇA" : song.rights === "original" ? "LUWIPI" : "TRADICIONAL"}
          </span>
        </div>
      </div>

      <h3>{song.title}</h3>
      <p className="subtitle">{song.subtitle}</p>
      <p className="story">{song.story}</p>

      <div className="meta">
        <span>{song.age === "both" ? "2–8 anos" : `${song.age} anos`}</span>
        <span>{song.difficulty}</span>
        {song.timeSignature && <span>{song.timeSignature}</span>}
      </div>

      <div className="action">
        <DuoAction href={song.playable ? `/musicas/${song.id}` : undefined} disabled={!song.playable}>
          {song.sheetMusic ? "TOCAR COM PARTITURA" : "COMEÇAR"}
        </DuoAction>
      </div>
    </article>
  );
}

function SongSection({ title, subtitle, songs }: { title: string; subtitle: string; songs: KidsSong[] }) {
  return (
    <section className="section">
      <div className="sectionHead">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <strong>{songs.length}</strong>
      </div>
      <div className="grid">
        {songs.map((song) => <SongCard key={song.id} song={song} />)}
      </div>
    </section>
  );
}

export default function MusicLibraryPage() {
  const playable = kidsSongs.filter((song) => song.playable);
  const preschool = playable.filter((song) => song.age === "2-4");
  const shared = playable.filter((song) => song.age === "both");
  const older = playable.filter((song) => song.age === "5-8");
  const licensed = kidsSongs.filter((song) => song.rights === "license-required");

  return (
    <main className="page">
      <header className="simple-header container">
        <Logo />
        <Link href="/dashboard?age=5-8">← Voltar</Link>
      </header>

      <div className="container wrap">
        <section className="hero">
          <span>BIBLIOTECA MUSICAL</span>
          <h1>Músicas para tocar, não apenas ouvir.</h1>
          <p>{playable.length} experiências tocáveis. As peças de 5–8 anos incluem repertório próprio com partitura.</p>
        </section>

        <SongSection title="2–4 anos" subtitle="Histórias, cores, animais e músicas curtas para primeiras aulas." songs={preschool} />
        <SongSection title="Cantigas para as duas idades" subtitle="Repertório tradicional completo, dividido em partes curtas." songs={shared} />
        <SongSection title="5–8 anos · Piano + Partitura" subtitle="Peças completas para leitura, dedilhado, fraseado e progressão no piano." songs={older} />
        <SongSection title="Catálogo licenciado" subtitle="Repertório comercial preparado para ativação quando houver a licença da composição." songs={licensed} />
      </div>

      <style jsx>{`
        .page{min-height:100vh;background:#f7f9fc}.wrap{padding-bottom:70px}.hero{text-align:center;max-width:760px;margin:35px auto 48px}.hero>span{font-size:11px;font-weight:950;letter-spacing:.1em;color:#6c75cd}.hero h1{font-size:clamp(34px,6vw,60px);letter-spacing:-2px;margin:8px 0 12px}.hero p{color:#69778b;line-height:1.6}.section{margin-top:44px}.sectionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:18px}.sectionHead h2{font-size:clamp(26px,4vw,38px);margin:0}.sectionHead p{margin:5px 0 0;color:#748196}.sectionHead>strong{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #e0e7ef;color:#53617a}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.songCard{display:flex;flex-direction:column;background:#fff;border:1px solid #e3e9f1;border-radius:24px;padding:20px;box-shadow:0 10px 28px #364b6710}.topline{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.emoji{font-size:42px}.badges{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.badges span{font-size:9px;font-weight:950;letter-spacing:.06em;padding:6px 8px;border-radius:999px}.scoreBadge{background:#eef8e8;color:#478827}.traditional{background:#eef4ff;color:#4e69a4}.license{background:#fff0e4;color:#9a5b22}.songCard h3{font-size:21px;margin:14px 0 4px}.subtitle{font-size:13px;font-weight:800;color:#68778c;margin:0}.story{font-size:13px;color:#7b8798;line-height:1.5}.meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.meta span{background:#f2f5f8;color:#69778b;border-radius:999px;padding:6px 8px;font-size:10px;font-weight:800}.action{margin-top:auto;padding-top:18px}@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.grid{grid-template-columns:1fr}.sectionHead{align-items:flex-start}.hero{margin-top:20px}.songCard{border-radius:20px}}
      `}</style>
    </main>
  );
}
