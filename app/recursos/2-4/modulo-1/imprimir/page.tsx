import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import styles from "./print.module.css";

const cards = [
  ["🐘", "GRAVE", "Lado esquerdo do piano"],
  ["🐦", "AGUDO", "Lado direito do piano"],
  ["🦁", "FORTE", "Toque com energia"],
  ["🐇", "SUAVE", "Toque bem leve"],
] as const;

export default function PrintableModuleOnePage() {
  return (
    <main className={styles.shell}>
      <div className={styles.toolbar}>
        <Link href="/recursos/2-4/modulo-1">← Voltar</Link>
        <strong>Luwipi · Módulo 1</strong>
        <PrintButton />
      </div>

      <section className={styles.page}>
        <div className={styles.brand}>Luwipi</div>
        <span className={styles.kicker}>2–4 anos · Módulo 1</span>
        <h1>Descoberta sonora</h1>
        <p>Materiais para imprimir, recortar e usar com o piano nas primeiras quatro aulas.</p>
        <div className={styles.coverGrid}>{cards.map(([icon, title]) => <div key={title}><span>{icon}</span><b>{title.toLowerCase()}</b></div>)}</div>
        <div className={styles.tip}>Imprima em papel firme ou cole em cartolina. Se possível, plastifique para reutilizar.</div>
      </section>

      <section className={styles.page}>
        <Header title="Adesivos para o piano" />
        <p className={styles.lead}>Recorte e use com fita removível. Evite colar permanentemente nas teclas.</p>
        <div className={styles.cardGrid}>{cards.map(([icon, title, text]) => <Card key={title} icon={icon} title={title} text={text} />)}</div>
        <h2>Etiquetas coloridas</h2>
        <div className={styles.badges}>{[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}</div>
      </section>

      <section className={styles.page}>
        <Header title="Cartões · grave e agudo" />
        <div className={styles.bigCards}>
          <Card icon="🐘" title="GRAVE" text="Elefante · som mais baixo" />
          <Card icon="🐦" title="AGUDO" text="Passarinho · som mais alto" />
        </div>
        <div className={styles.tip}>Toque sons à esquerda e à direita do piano. A criança aponta para o cartão correspondente.</div>
      </section>

      <section className={styles.page}>
        <Header title="Cartões · forte, suave, rápido e lento" />
        <div className={styles.cardGrid}>
          <Card icon="🦁" title="FORTE" text="Leão · som com energia" />
          <Card icon="🐇" title="SUAVE" text="Coelhinho · som delicado" />
          <Card icon="🚗" title="RÁPIDO" text="Movimento depressa" />
          <Card icon="🐢" title="LENTO" text="Movimento com calma" />
        </div>
      </section>

      <section className={styles.page}>
        <Header title="Atividade · quem combina com o som?" />
        <p className={styles.lead}>A criança pode ligar, apontar ou colocar um marcador.</p>
        <div className={styles.matchList}>
          {[["🐘 Elefante","GRAVE"],["🐦 Passarinho","AGUDO"],["🦁 Leão","FORTE"],["🐇 Coelhinho","SUAVE"]].map(([a,b]) => <div key={a}><span>{a}</span><i/><strong>{b}</strong></div>)}
        </div>
      </section>

      <section className={styles.page}>
        <Header title="Atividade · o que você ouviu?" />
        <div className={styles.cardGrid}>{cards.map(([icon, title]) => <Card key={title} icon={icon} title={title} text="Circule ou aponte" />)}</div>
        <div className={styles.tip}><b>Professor:</b> toque um som e pergunte “grave ou agudo?”; depois “forte ou suave?”.</div>
      </section>

      <section className={styles.page}>
        <Header title="Mini história · o passeio sonoro do Nino" />
        <div className={styles.storyGrid}>
          <Story title="1. Nino acorda" art="🐑 ☀️" prompt="Toque um som suave." />
          <Story title="2. Nino vê um pássaro" art="🐑 🐦" prompt="Toque um som agudo." />
          <Story title="3. Surge um elefante" art="🐑 🐘" prompt="Toque um som grave." />
          <Story title="4. Nino corre feliz" art="🐑 🎵" prompt="Toque rápido e forte." />
        </div>
      </section>

      <section className={styles.page}>
        <Header title="Guia rápido do professor" />
        <h2>Roteiro de 20–30 minutos</h2>
        <ol className={styles.steps}>
          <li><b>Boas-vindas:</b> escolha apenas um contraste por vez.</li>
          <li><b>Mostrar:</b> apresente os cartões e os personagens.</li>
          <li><b>Ouvir:</b> use os sons dos animais disponíveis no Luwipi.</li>
          <li><b>Ir ao piano:</b> procure o contraste sonoro no instrumento.</li>
          <li><b>Encerrar:</b> faça uma atividade curta ou a mini história.</li>
        </ol>
        <div className={styles.tip}>Instruções curtas, muita repetição e mudança de atividade antes de a criança cansar.</div>
      </section>
    </main>
  );
}

function Header({ title }: { title: string }) {
  return <><div className={styles.brandRow}><b>Luwipi</b><span>Pacote imprimível · Módulo 1</span></div><h1>{title}</h1></>;
}

function Card({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className={styles.card}><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>;
}

function Story({ title, art, prompt }: { title: string; art: string; prompt: string }) {
  return <div className={styles.story}><h3>{title}</h3><div>{art}</div><p>{prompt}</p></div>;
}
