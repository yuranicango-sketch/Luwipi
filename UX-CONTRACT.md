# Luwipi UX Contract

This file records durable product behavior. Visual identity lives in `DESIGN.md`.

## Product register

Luwipi is a live teaching instrument for an individual piano teacher working with children aged 2–8. The teacher remains the decision-maker. The child-facing surface may be playful and visual, but the product must not become an autonomous game loop.

## Canonical navigation

Authenticated teacher navigation has five primary destinations:

1. **Hoje** — prepare and begin the next lesson.
2. **Alunos** — profiles, repertoire references, competencies and history.
3. **Currículo** — spiral milestones and pedagogical progression.
4. **Biblioteca** — modular lesson blocks for substitution or preparation.
5. **Casa** — parent-facing practice cards generated from completed lessons.

Games, songs, virtual piano and training are tools inside lessons or library blocks, not primary products.

## Flow ledger

| Operation | Trigger | Pending / intermediate | Success | Failure / recovery |
| --- | --- | --- | --- | --- |
| Add student | New student | Single short form | Return to teaching flow with student selectable | Preserve entered values; no server upload |
| Prepare lesson | Select student + daily state | One primary recommendation with reasons | Start lesson in Modo Aula | Teacher can choose another lesson |
| Swap block | Trocar | Show only age-compatible alternatives of same block type | Replace current block; keep rest of lesson | Keep original block |
| Coringa | Coringa | 60–90 second focus/technical reset | Continue to next inserted block, then lesson | Never presented as prize |
| Emotional pause | Pausa | Reduce stimulation; no countdown | Resume only when teacher chooses | Session remains saved |
| Save and exit | Guardar e sair | Persist current block locally | Return to Hoje with Retomar card | IndexedDB mirror remains fallback |
| Resume lesson | Retomar aula | Restore same student, block and lesson | Continue where stopped | If session is unavailable, return to Hoje |
| Finish lesson | Fechar aula | Teacher may validate observed competencies | Save history + repertoire + home card | Mastery never changes automatically |
| Export local data | Exportar cópia | Create local JSON backup | File remains under teacher control | Existing data stays untouched |
| Restore local data | Importar cópia | Validate Luwipi backup | Restore profiles/history locally | Reject incompatible file without overwriting |
| Sign out | Terminar sessão | POST sign-out | Return to public landing | Child learning data stays local on device |

## Mastery contract

Competency state is one of:

- Emergente
- Em desenvolvimento
- Consolidado
- Independente

Only the teacher can change mastery. Completing blocks, pressing virtual keys, Wait Mode responses, lesson duration or streak-like activity must never infer mastery.

## Recommendation contract

The lesson recommender may use:

- age band;
- teacher-selected level;
- manually validated competencies;
- lesson history;
- spaced review;
- repetition preference;
- current repertoire reference;
- today's state.

It must provide human-readable reasons. It may suggest; it never locks progression or changes student data by itself.

Observed learning needs outrank unassessed competencies. Unassessed areas may be proposed for observation after known emergent/developing needs.

## Suzuki repetition

Per student:

- **Repeat consciously** — keep the lesson structure substantially identical.
- **Light variation** — change only safe presentation details while preserving the pedagogical objective.

The system must not vary a block merely to create novelty.

## Child feedback

Never use red error states, crosses, failure sounds, scores or shame-based copy for musical response.

Canonical recovery language is neutral and invitational, such as “Tenta outra vez” or “O caminho continua à espera”.

## Physical piano and screen behavior

When a block requires posture, hand shape, tactile correction or direct instrument work with a physical piano, the screen recedes. It must not compete for visual attention.

Movement/body blocks may intentionally require no screen.

The virtual piano is a fallback/teaching tool, not a substitute for physical piano when one is available.

## Coringa vs Pausa

These are separate states:

- **Coringa**: boredom, lost focus or minor technical interruption; short and active.
- **Pausa/Acolhimento**: frustration, crying, overload or emotional dysregulation; no timer, no reward framing, no pressure to resume.

Never merge them into one “break” feature.

## Parent role

At the end of a completed lesson, the teacher may copy a short parent summary and home-practice card.

Home practice must be concrete and brief: listen, move, or repeat a small piano task. Avoid generic “practice for N minutes” as the only instruction.

## Repertoire references

A teacher may record a published method and current piece as an external reference. Luwipi may use the title to organize suggestions, but must not reproduce copyrighted scores, recordings or proprietary lesson text without appropriate rights.

## Local-first privacy

Child profile, optional photo, mastery, teacher notes and lesson history remain on the device by default.

- No child-learning API is required for normal lessons.
- `localStorage` is the fast synchronous mirror.
- IndexedDB is the durable local fallback.
- Export/import is explicit and teacher-controlled.
- Account, billing and admin data may use Supabase because they concern the teacher/service relationship.

A future cloud-sync feature requires an explicit product/privacy decision and must not be silently introduced.

## Offline contract

After the relevant application shell/static assets have loaded, the classroom core should not require network calls.

Service Worker caching is restricted to static assets. Authenticated HTML and API responses must not be stored in shared Cache Storage.

## Accessibility and sensory behavior

- Color never communicates meaning alone.
- Interactive controls use native button/link semantics.
- Touch targets remain generous for tablet use.
- Reduced stimulation removes non-essential movement and decorative intensity.
- Reduced-motion preferences are respected.
- Important child actions use shape, position, symbol and/or short text in addition to hue.

## Age-specific presentation

Teacher navigation stays consistent across age bands. Child-facing lesson presentation changes:

- **2–3**: largest forms, minimal child text, body/sound contrast.
- **4–5**: shapes plus short labels, patterns and keyboard geography.
- **6–8**: more structured information, technique, reading and repertoire context.

Age variation must not fork business logic into three unrelated products.

## Future instrument input

Microphone/MIDI note detection is a future adapter behind the maintained instrument-input interface. It must not be required for the current lesson flow and must not infer mastery automatically.
