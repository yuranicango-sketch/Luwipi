# UX Contract

## Product context

- Audience: utilizadores do Luwipi Ensine e Luwipi Aprenda.
- Primary jobs: preparar aula; abrir ferramentas durante a aula; seguir aulas audiovisuais em percurso; praticar leitura, ritmo e jogos.
- Target market(s): global, interface portuguesa nesta fase.
- Active locales: pt.
- Language/content register and native-review policy: português simples; labels de ação consistentes.
- Timezone/calendar policy: não há fluxo dependente de calendário nesta fase.
- Accessibility target: WCAG 2.2 AA.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Permission model | Supabase `profiles.role` + APIs server-side | Domain/API | 2026-09-25 |
| Student personal data | `privacidade.html` + Google Drive appDataFolder implementation | Privacy/product | 2026-09-25 |
| Billing / payment | `api/billing/*` + Paddle env config | Billing/API | 2026-09-25 |
| Product modes | Current product brief: Luwipi Ensine / Luwipi Aprenda | Product brief | 2026-09-25 |

## Visual contract

- Project `DESIGN.md`: `DESIGN.md`.
- Token ownership model: runtime CSS remains canonical implementation; DESIGN.md mirrors approved values.
- Runtime design-system/token source: CSS custom properties in `index.html`, `app.html`, `admin.html`.
- Mapping/export/adapters: semantic CSS variables only; no framework theme layer.
- Token drift gate: manual diff + premium audit until automated export is introduced.
- Supported themes: light only.
- Design-context owner/review policy: branding changes update DESIGN.md and all three runtime surfaces together.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native select | DESIGN + this contract | native | keyboard + narrow viewport |
| Form | App-owned HTML form + manual validation | this contract | planner / admin video | validation flow |
| Scrollbar | Global app stylesheet | DESIGN | geometry exceptions | computed/static audit |
| CRUD | Server API + admin form/list | API code + this contract | create / publish-toggle | full flow |

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button | brand/neutral | stronger contrast | visible 3px ring | pressed | muted/no click | same geometry | inline recovery |
| Input | white/border | border emphasis | visible ring | n/a | muted | n/a | text + aria |
| Textarea | white/border | border emphasis | visible ring | n/a | muted | n/a | text + aria |
| Table/list | stable rows | subtle surface | action focus | n/a | n/a | stable loading row | retry message |

## Dataset navigation

- Admin tables: render up to 200 accounts/videos; revisit pagination before exceeding that scale.
- Exploratory lists: video catalogue renders published lessons; audience metadata remains internal unless it becomes necessary for navigation.
- URL state: product mode lives in `?mode=ensine|aprenda`; audiovisual lesson completion/current lesson stays local to the browser for now.
- Page size: current admin cap 200.
- Empty/no-results/error/loading treatment: stable inline state inside the owning panel. Aprenda Aulas uses a large audiovisual player plus ordered lesson rail; when no lessons are published it shows an empty state instead of mock lessons.
- Back/scroll restoration: view navigation resets to top.
- Selection scope: not applicable.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Prepare lesson | submit planner | dedicated Luwipi preparation surface; submit disabled | generated AI plan | plan shown | form restored with inline recovery | result heading | `api/prepare-lesson.js` + app planner |
| Create video | admin save | save disabled | video list | inline status | preserve fields + retry | form/status | `api/admin/videos.js` |
| Toggle video | publish button | row action disabled | same list | row refresh | inline status | action/list | `api/admin/videos.js` |
| Block account | block action | confirmation | same list | list refresh | cancel/retry | initiating row | `api/admin/users.js` |
| Switch mode | Ensine/Aprenda control | immediate | home/current valid route | selected state | n/a | chosen mode | app shell |
| Follow audiovisual lesson | open Aulas / choose lesson | stable player/loading state | same audiovisual course view | active lesson + local completion state | retry catalogue; keep previous completion data | current lesson/player | app audiovisual lesson shell |

## Navigation and responsive behavior

- Route document title policy: landing, app, admin and legal pages have explicit titles; app title changes with mode.
- Route error / 403 page behavior: admin remains undiscoverable in public navigation; server authorization is authoritative.
- Breadcrumb/tab/route-state policy: app uses view-level back controls; mode is encoded in URL.
- Sidebar/drawer/bottom-sheet transformation: none.
- Responsive table strategy: admin list becomes horizontally scrollable within its panel.
- Truncation/full-value access: account email remains visible/wrapped; video titles wrap.
- Focus restoration and sticky-obstruction policy: no sticky obstruction; focus-visible remains exposed.

## Overlays and feedback

- Dialog primitive: native `<dialog>` styled by the app for destructive admin confirmation.
- Destructive confirmation levels: blocking an account requires explicit confirmation.
- Toast placement/duration/deduplication: not used; status messages are inline.
- Alert/banner scope and persistence: inline to owning surface.
- Tooltip delay/dismissal: not used.
- Unsaved-changes behavior: admin video form is short-lived; navigation does not silently auto-save.
- Layer/z-index contract: access overlay > dialog > application.

## Async and resilience

- Mutation default: pessimistic for billing/admin; the lesson planner is server-generated through an authenticated OpenAI request.
- Idempotency and duplicate-submit policy: submit buttons are disabled while mutations/generation run; Paddle webhook remains idempotent.
- Planner pending state: the form is replaced by a dedicated Luwipi loading surface with changing preparation stages; no fake percentage is shown.
- Auto-save/draft recovery: student planner data saves to teacher Google Drive only after a successful plan generation.
- Planner privacy boundary: the student's name/apelido stays in the browser/Drive and is not included in the AI payload; only lesson settings and pedagogical context needed to generate the plan are sent.
- Offline/read-stale/write behavior: AI plan generation requires network access; a failed request restores the filled form for retry. Drive failure does not discard a successfully generated plan.
- Retry/backoff/timeout behavior: planner requests have a finite timeout and user-triggered retry; catalogue/auth also use user-triggered retry; no infinite retry loop.
- Session expiry/re-authentication: Supabase session gate owns access.
- Stale-request cancellation/invalidation and pending-state ownership: video catalogue uses one active request per refresh; planner owns one generation request per submit.
- Aprenda audiovisual progress: completed lesson IDs and the current lesson are stored in localStorage; no child/student identity is attached to this progress record.

## Validation

- Schema/validation layer: server sanitization + explicit client checks.
- Trigger timing: on submit/action.
- Error summary/inline policy: inline beside form/panel.
- Server error mapping: generic user message; detailed error only in server logs.
- Sensitive-value handling: no secret keys in browser; student personal data remains in teacher Drive.
- Product forms use `novalidate`; textareas use `resize:none`.

## Permission and clipboard

- Permission UI strategy: admin controls have no public navigation and server-side admin checks; product modes are not permission levels.
- Clipboard copy policy: homework link copy never exposes server secrets.
- Disabled-state explanation: busy state text/status beside owning action.

## Verification

- Required static commands: premium audit, HTML/JS syntax extraction, secret scan.
- Browser/device/locale/theme matrix: desktop + narrow mobile; light theme; pt.
- Accessibility checks: semantic controls, focus-visible, labels, reduced motion.
- Canonical sibling flow used for comparison: preparar aula remains the dominant Ensine flow; Aulas remains the dominant Aprenda flow.
- Project audit command/result: recorded after implementation.

## Ritmo · leitura contínua
- Leitura rítmica contínua básica em 4/4: sequência sem interrupção, contagem inicial de quatro tempos, metrónomo opcional e tap de prática.
- Vocabulário básico atual: semínimas, mínimas e pausas simples; sem colcheias neste nível.
- O objetivo principal é manter o pulso e continuar a leitura, não parar para corrigir cada compasso.
- O exercício mostra feedback de timing e pontuação de ataques, mas não bloqueia a progressão do fluxo.


## Ritmo contínuo · representações
- O mesmo exercício básico pode ser mostrado como Figuras, Palmas & Shhh ou Misto.
- Palmas & Shhh é uma camada de leitura visual: PALMA marca o ataque; SHHH marca silêncio; PALMA — marca a nota de dois tempos.
- Trocar a representação não muda o padrão rítmico nem a progressão e reinicia a tentativa em curso.

## Leitura contínua de notas
- Básico atual: clave de Sol, mão direita, Dó4–Sol4, uma nota a cada dois tempos.
- O exercício não para em erros; feedback serve para corrigir sem quebrar o pulso.
- Respostas podem ser feitas pelos botões de nomes ou pelo piano virtual em desktop.
- Visual Normal é o padrão e serve adolescentes/adultos.
- Trenzinho é uma apresentação opcional para crianças; nunca é ativado automaticamente para adultos e a preferência fica guardada localmente.

## Pequeninos · Bolhas do Som
- Local: `Jogos → Pequeninos · 2–4 anos`; o card usa thumbnail própria e abre um playfield dedicado.
- Nome da atividade: **Bolhas do Som**.
- A criança joga sem depender de leitura: tocar nas bolhas é a ação principal; início, silêncio e conclusão são comunicados visualmente.
- Cada toque válido numa bolha toca **exatamente a próxima nota** da melodia atual. Bolhas ignoradas não avançam a música.
- A cada 4 acertos entra um intervalo de silêncio obrigatório de aproximadamente 2,7 s com o sticker visual 🤫; durante esse intervalo não toca nenhuma nota e a sequência musical não avança.
- Cada nova partida usa um shuffle-bag entre melodias infantis de domínio público (inicialmente Brilha, Brilha, Estrelinha; Mary Had a Little Lamb; Irmão João), evitando repetir a mesma música em partidas consecutivas quando possível.
- O feedback sonoro usa timbre de piano/musical; beep/bip não é permitido em nenhum estado.
- A atividade não guarda identidade da criança nem pontuação pessoal. O único estado local persistente é a rotação anónima das melodias para reduzir repetição.
- Alvos interativos são grandes e táteis; controles adultos de entrar/sair/repetir mantêm nomes acessíveis e `focus-visible`.
- `prefers-reduced-motion` desativa animações não essenciais sem alterar a sequência som → silêncio → som.

## Pequeninos · Piano dos Bichinhos
- Local: `Jogos → Pequeninos · 2–4 anos`; o jogo é uma atividade dedicada e não substitui **Bolhas do Som**.
- Nome da atividade: **Piano dos Bichinhos**.
- O piano tem cinco teclas grandes. Cada tecla possui um animal e uma cor própria.
- A tecla correta fica **inteiramente colorida**; não se usa apenas uma barra, faixa ou pequeno indicador.
- O animal da tecla-alvo salta continuamente até a criança tocar. O cenário mantém movimento ambiental leve para a atividade parecer viva.
- Quando a próxima nota exige a **mesma tecla novamente**, o estado muda para uma animação distinta: dois saltos, dois pulsos e movimento da própria tecla. A repetição precisa parecer uma nova ação, não um indicador parado.
- Cada acerto avança exatamente uma nota da sequência musical; tocar numa tecla errada apenas produz uma pequena reação visual e não avança a música.
- Cada partida usa shuffle-bag entre as melodias atualmente disponíveis (Mary Had a Little Lamb, Irmão João, Ode to Joy, Row Row Row Your Boat e uma adaptação de Brilha Brilha para cinco teclas), evitando repetição imediata quando possível.
- A versão **Happy Birthday não faz parte da atividade neste momento**.
- O feedback sonoro é musical/piano-like e nunca usa beep/bip. Durante `prefers-reduced-motion`, movimento ambiental é reduzido, mas a indicação essencial da tecla-alvo permanece perceptível.

## Leitura · Guia visual
- O **Guia** é uma ajuda opcional e persistente para Leitura. Fica desligado por padrão e pode ser ativado/desativado dentro da área Leitura, Leitura contínua, exercícios e músicas.
- Quando ativo, apenas a **nota atual** recebe destaque visual na partitura e apenas a **tecla correspondente** recebe um highlight animado no piano virtual.
- O highlight do piano move-se/rola para a próxima tecla automaticamente quando a leitura avança.
- O highlight **nunca toca som sozinho**. O som ocorre uma única vez, através do comportamento normal da tecla quando o utilizador a pressiona.
- Em exercícios e músicas de mão direita, um toque correto avança o Guia para a próxima nota. Se a próxima nota repetir a mesma tecla, a animação muda para um pulso duplo para comunicar claramente “toca novamente”.
- Com o Guia ativo, uma tecla errada no piano recebe apenas feedback visual e fica silenciosa; não avança a leitura.
- Em Leitura contínua, o Guia acompanha a nota corrente do fluxo temporal existente e não altera o princípio “ler sem parar”.
- Em páginas de música, o Guia acompanha atualmente a linha melódica da mão direita; a sincronização passo a passo de duas mãos não é inferida como se fosse uma única sequência.
- Ao terminar os compassos visíveis de uma música e existir página seguinte, o Guia avança para os compassos seguintes.
- Com o Guia desligado, o comportamento existente da Leitura é preservado.
- Em ecrãs onde o piano virtual não é mostrado por limitação responsiva, o destaque da partitura continua disponível sem inventar uma segunda superfície de piano.

## Modo ao Vivo · motor musical
- Local: ferramenta própria na sequência principal do dashboard, disponível em **Ensine** e **Aprenda**. Não substitui Leitura, Ritmo, Jogos ou Aulas.
- O motor central vive em `assets/music/score-engine.js` e trabalha sobre um modelo estruturado de eventos musicais. Posição na pauta é calculada a partir do pitch + clave; músicas futuras não devem redesenhar coordenadas nota a nota.
- O renderer cobre clave de Sol/Fá, linhas suplementares, acidentes, figuras básicas conforme duração, ponto de aumento, compasso, tonalidade, dinâmica e articulações quando a fonte contém esses dados.
- **MIDI** é o formato estruturado principal: notas, ataques, duração, velocity/dinâmica aproximada, BPM e compasso são lidos localmente. MIDI format 0/1 é suportado; SMPTE e format 2 são recusados explicitamente.
- **MusicXML** também é estruturado e preserva mais informação editorial quando presente, incluindo dinâmica e articulações básicas.
- **PDF** é tratado defensivamente como documento visual original. O Luwipi nunca inventa notas a partir do PDF. Play, Guia e avaliação só ficam disponíveis quando existir MIDI/MusicXML; PDF + MIDI da mesma peça podem coexistir.
- Os ficheiros importados nesta versão são processados localmente no browser; não são enviados para uma nova API nem guardados automaticamente no servidor.
- Playback usa o mesmo motor de samples de piano já existente no Luwipi; não cria beep/bip nem um segundo som de confirmação.
- Entrada externa preferida: **Web MIDI**, por fornecer pitch, acordes, velocity e note-off com precisão.
- Entrada por **microfone** é explicitamente monofónica/experimental para piano acústico. Serve melhor uma nota de cada vez e não afirma reconhecer acordes polifónicos com precisão.
- No treino, pitch e ritmo são avaliados separadamente. A primeira nota correta estabelece a referência temporal; ataques seguintes são comparados ao BPM da partitura.
- Timing próximo recebe feedback **Quase** com indicação cedo/tarde. Um erro rítmico maior não avança automaticamente: o utilizador pode ouvir o trecho esperado e repetir.
- Em MIDI, a duração da tecla também é comparada com a duração escrita e pode indicar nota curta/longa.
- Guia visual é opcional: destaca a nota/grupo atual sem alterar a cabeça da nota. Com Guia desligado, a avaliação pode continuar sem revelar a próxima nota.
- Ao sair do Modo ao Vivo, microfone/MIDI são desligados e playback/treino são interrompidos.

## Modo ao Vivo → Leitura
- Uma partitura estruturada importada no **Modo ao Vivo** só entra no módulo **Leitura** por decisão explícita através de **Adicionar à Leitura**.
- Importar, tocar ou treinar uma peça no Modo ao Vivo não modifica automaticamente a biblioteca de Leitura.
- As músicas adicionadas aparecem em **Leitura → Músicas adicionadas** e são renderizadas pelo mesmo `Score Engine`.
- A biblioteca usa IndexedDB no browser, com fallback local. Nesta fase, a decisão persiste no mesmo browser/dispositivo; não é apresentada como sincronização cloud.
- Abrir uma música adicionada oferece partitura, playback com os samples existentes, Guia opcional e acesso ao piano de prática.
- Adicionar novamente a mesma partitura é idempotente e não cria duplicados.

## Tarefas · piano de prática
- Links de tarefa de leitura (exercício ou música) abrem com o piano de prática visível automaticamente.
- O piano faz parte da tarefa também em ecrãs pequenos; a regra global que esconde o dock abaixo de 700 px é sobrescrita apenas em `parent-mode`.
- O botão **Fechar** continua disponível.
- O piano reutiliza o motor/samples já existentes; não cria áudio alternativo ou beep.



### MIDI como fonte de verdade
- A importação manual de MIDI é um fluxo de produto, não uma operação de desenvolvimento. O utilizador deve poder adicionar ficheiros sem pedir que uma música/exercício seja codificado manualmente.
- O motor mantém duas camadas: **performance MIDI original** e **notação automática**. A performance conserva ataques, durações, velocity, acordes e sustain; a notação é quantizada para leitura sem destruir os dados originais.
- Playback de MIDI importado usa a camada de performance original. Leitura/Guia usam a camada notada.
- O parser preserva mapas de tempo, compasso e tonalidade quando presentes no MIDI, além do pedal sustain (CC64).
- A notação automática escolhe uma grelha rítmica, usa a tonalidade para preferir sustenidos/bemóis e divide notas que atravessam barras com ligaduras.
- MIDI não contém todas as decisões editoriais de uma partitura impressa. Para beaming, vozes, dedilhado, slurs, layout e grafia editorial exata, MusicXML é a fonte preferida. O Luwipi não deve apresentar essas decisões ausentes como se viessem do MIDI.
- No Modo ao Vivo há decisões separadas **Música na Leitura** e **Exercício na Leitura**. Nenhuma delas acontece automaticamente.
- A mesma partitura pode ser guardada como música e como exercício; duplicação dentro da mesma categoria é evitada.
