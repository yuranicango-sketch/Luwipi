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
