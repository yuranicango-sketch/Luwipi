# Luwipi

Plataforma musical com duas experiências:

- **Luwipi Ensine** — escolhe, prepara e atribui atividades interativas.
- **Luwipi Aprenda** — vê, ouve, toca, joga, lê e acompanha a própria evolução.

## Estrutura

- `index.html` — landing pública.
- `app.html` — Ensine + Aprenda.
- `admin.html` — administração protegida por função admin.
- `assets/reading/immersive-journey.*` — entrada da jornada e apresentação do leitor.
- `assets/activities/interactive-practice.js` — piano reativo, prévias e padrões rítmicos.
- `api/billing/*` — Paddle server-side.
- `assets/samples/` — samples de piano e sons.
- `DESIGN.md` — identidade e tokens aprovados.
- `UX-CONTRACT.md` — comportamento consistente entre superfícies.

## Repertório

O catálogo integrado contém melodias tradicionais ou obras históricas de domínio público: *Mary Had a Little Lamb*, *Ode to Joy*, o minueto de Christian Petzold (transposto), *Frère Jacques*, *Brilha, brilha, estrelinha*, *Hot Cross Buns* e o refrão de *Jingle Bells*. As versões para mão esquerda são acompanhamentos didáticos simples, não transcrições de uma edição histórica.

Fontes para conferência da obra: [IMSLP Beethoven](https://imslp.org/wiki/Symphony_No.9%2C_Op.125_%28Beethoven%2C_Ludwig_van%29), [IMSLP Pierpont](https://imslp.org/wiki/The_One_Horse_Open_Sleigh_%28Pierpont%2C_James%29), [Library of Congress: Frère Jacques](https://www.loc.gov/item/afc9999005.25049/), [Library of Congress: Twinkle Twinkle](https://www.loc.gov/item/2023838232/) e [Hot Cross Buns](https://pianodemy.com/pieces/hot-cross-buns).

## Privacidade

Dados pessoais/pedagógicos de alunos do planeador ficam no Google Drive do professor, via `drive.appdata`. A base central mantém apenas conta, acesso, billing e conteúdo não pessoal.

## Vercel

Este repositório é um projeto estático com Vercel Functions em `/api`. `vercel.json` força `framework: null` para impedir que um preset antigo de Next.js execute `next build`.

Chaves privadas nunca devem entrar em HTML.


## Activity-first

O Luwipi é centrado em **ver → ouvir → imitar → tocar → repetir**. O motor de partitura e prática interativa destaca notas, reage no teclado e dá feedback de pitch, ritmo e duração.
