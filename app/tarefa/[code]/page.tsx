import Link from "next/link";
import { Logo } from "@/components/logo";
import { HomeworkExperience } from "@/components/homework-experience";

export default async function HomeworkExperiencePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <main style={{minHeight:"100vh",background:"radial-gradient(circle at 12% 8%,#fff3c6,transparent 28%),radial-gradient(circle at 88% 8%,#dff4ff,transparent 30%),#fffdf8",paddingBottom:60}}>
      <header className="simple-header container"><Logo/><Link href="/tarefa">Outro código</Link></header>
      <HomeworkExperience code={decodeURIComponent(code).toUpperCase()} />
    </main>
  );
}
