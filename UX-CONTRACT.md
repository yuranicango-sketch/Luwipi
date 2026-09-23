# Luwipi UX Contract

## Scope
This contract covers the authenticated teacher product. Business policy lives in the product brief and Supabase access model; this file records observable UI behavior.

## Navigation
- `Hoje` is the default teacher destination.
- Primary destinations are Hoje, Alunos, Currículo, Biblioteca and Casa.
- Games, songs and training are lesson resources, never primary product destinations.
- Terminar sessão performs a real server-side sign-out.

## Lesson preparation
- Student selection → state check → one recommended lesson → optional swap → start.
- The recommendation considers age, teacher-validated mastery, spiral prerequisites/review, lesson history, current state and current external repertoire.
- The teacher can override the recommendation.
- No competence changes automatically from clicks or completion.

## Live lesson
- Physical-piano blocks may explicitly ask the teacher to look away from the screen.
- Child-facing feedback never uses red/error scoring for musical attempts.
- Coringa handles boredom/focus/technical interruption. Pausa/Acolhimento handles emotional regulation. They are never merged.
- Block swap ranks alternatives by age, block type and shared competencies.
- Luwi appears only as a pedagogical/transitional guide.

## Age registers
- 2–3: larger forms, minimal text, body/listening/contrast.
- 4–5: shapes + short labels, pattern and keyboard discovery.
- 6–8: denser structure, technique/reading/repertoire.
- Color never carries meaning alone.

## Local data and privacy
- Child profiles, optional photos and lesson history are stored in IndexedDB on the current device.
- The active lesson uses localStorage only as a small crash/session-resume record.
- Legacy localStorage child records migrate once to IndexedDB and are then removed.
- Export/import happens locally in the browser.
- Deleting local learning data requires an explicit second activation.
- Authenticated HTML/API responses are never cached by the Service Worker.

## Offline
- Static lesson assets are cacheable; authenticated navigation and APIs are not.
- While a lesson is already loaded, loss of connectivity must not stop local piano/audio, block navigation, notes or final save.
- The dashboard and lesson routes are prefetched while online to improve same-session navigation.
- Account, billing and fresh server authorization still require network access.

## Forms and controls
- Native selects are intentional: OS popup behavior is acceptable for short option lists.
- Search exposes a clear button when non-empty.
- Busy state blocks duplicate writes.
- Destructive local-data deletion uses an explicit two-step confirmation in the owned UI; no browser alert/confirm/prompt.

## Feedback
- Persistent failures remain inline near the action.
- Offline state is text-labeled, not color-only.
- Saved-local/offline state must state that data is on the device.
