# Luwipi

Plataforma musical com duas experiências:

- **Luwipi Ensine** — escolhe, prepara e atribui atividades interativas.
- **Luwipi Aprenda** — vê, ouve, toca, joga, lê e acompanha a própria evolução.

## Estrutura

- `index.html` — landing pública.
- `app.html` — Ensine + Aprenda.
- `admin.html` — administração protegida por função admin.
- `api/videos.js` — catálogo publicado para utilizadores autenticados.
- `api/admin/videos.js` — gestão administrativa de YouTube/Vimeo.
- `api/billing/*` — Paddle server-side.
- `assets/samples/` — samples de piano e sons.
- `DESIGN.md` — identidade e tokens aprovados.
- `UX-CONTRACT.md` — comportamento consistente entre superfícies.

## Vídeo

O catálogo aceita YouTube e Vimeo. Para YouTube, usar preferencialmente conteúdo não listado com incorporação permitida. Em Vimeo, conteúdo privado precisa permitir embed no domínio do Luwipi.

## Privacidade

Dados pessoais/pedagógicos de alunos do planeador ficam no Google Drive do professor, via `drive.appdata`. A base central mantém apenas conta, acesso, billing e conteúdo não pessoal.

## Vercel

Este repositório é um projeto estático com Vercel Functions em `/api`. `vercel.json` força `framework: null` para impedir que um preset antigo de Next.js execute `next build`.

Chaves privadas nunca devem entrar em HTML.


## Activity-first

O Luwipi é centrado em **ver → ouvir → imitar → tocar → repetir**. O motor de partitura e prática interativa destaca notas, reage no teclado e dá feedback de pitch, ritmo e duração.
