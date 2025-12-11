## Project Outline — TerisChristmas.com

- Purpose: single-use, browser-based Wordle-style experience for Teri’s Christmas present, matching NYT Wordle feel with light Christmas accents.
- Scope: three sequential puzzles with fixed answers (`TERIS`, `HAPPY`, `BOARD`), then reveal a provided image; no accounts, no persistence beyond page session.

### Experience & Styling Notes

- Preserve NYT Wordle layout/interaction patterns (grid, keyboard, animations).
- Christmas vibe but subtle: palette (deep green, off-white, muted red/gold), gentle snow/garland accents, optional soft background texture; avoid heavy theming that obscures familiarity.
- Typographic feel similar to Wordle (clean sans serif); festive accent only on minimal elements (header, win screen).

### Gameplay Flow

1. Landing screen with brief intro/instructions tailored for Teri.
2. Puzzle 1 → answer `TERIS`.
3. On success, brief celebratory transition and auto-advance to Puzzle 2 → answer `HAPPY`.
4. Puzzle 2 success → auto-advance to Puzzle 3 → answer `BOARD`.
5. After final success, reveal the provided image (and a short message).

- Each puzzle uses classic Wordle rules: 5-letter grid, 6 guesses, letter coloring (correct spot, present, absent), keyboard feedback, standard invalid-word handling.

### Technical Approach

- Frontend-only, TypeScript everywhere.
- Likely stack: Vite + React (or Next static export) with lightweight state per puzzle; no backend.
- Single-page flow managing three target words in sequence; state can stay in-memory.
- Accessibility: focus management, aria-live for feedback, keyboard-first controls.

### Assets & Config

- Need target “reveal” image file (provided later) and any logo/emoji accent.
- Christmas palette tokens + minimal sound (optional, default mute).
- Word list (valid guesses) and solution list (just the three answers).

### Testing/Verification

- Desktop + mobile viewport checks.
- Keyboard and touch input.
- Color contrast against chosen palette.

## Working Protocol

- Before starting a task, skim prior implementation notes.
- After finishing a task, mark it complete and add implementation notes (what changed, tests run, open questions).
- Write tests as you build each feature; record them in the notes.

## Current Setup & Notes

- Stack: Vite + React + TypeScript; tests with Vitest + RTL; lint/format via ESLint + Prettier.
- Words: Standard Wordle allowed list vendored in `src/data/word-bank.ts`; solutions fixed to TERIS, HAPPY, BOARD.
- Flow: Three puzzles in sequence; manual “Continue” between puzzles. After puzzle 3, “Continue to reveal” shows a green summary of all answers then fades to the reveal image.
- UI: Mobile-first grid/keyboard; “ENT” action key; compact progress list shows question marks until solved; header logo from `public/sitelogo.jpg`.
- Assets: `public/finalrevealimage.png` for finale.
- Run: `npm install`, `npm run dev`; tests `npm run test:run`; lint `npm run lint`; format `npm run format`; build `npm run build` (static for Cloudflare Pages).

## Detailed To-Do (checklist + notes)

- [x] Scaffold app: Vite + React + TypeScript, Cloudflare-ready build output, add lint/format/test (ESLint/Prettier/Vitest + React Testing Library).
      Notes: Vite React TS scaffold in project root; added ESLint+Prettier, Vitest with jsdom and RTL setup (`src/setupTests.ts`), coverage config, prettier config, helper scripts (lint, lint:fix, test, coverage, format). Placeholder render test in `src/App.test.tsx`. Ran `npm run lint`, `npm run test:run`, and `npm run format` successfully. Build remains static-friendly for Cloudflare Pages.
- [x] Palette & typography: propose subtle Christmas palette and font stack; document tokens (CSS vars), confirm usage plan.
      Notes: Defined tokens in `src/index.css` with deep green background (`--bg` #0f1a14), warm surface (`--surface` #f6f2e8), muted surface (`--surface-muted`), accent green/red/gold, subtle border/shadow. Kept classic Wordle status colors for familiarity (`--tile-correct`, `--tile-present`, `--tile-absent`). Font stack uses Inter → system sans. Added light radial festive accents on the page background, sticky header, mobile-first spacing. Title updated in `index.html` and app shell tuned for mobile layout (max ~720px, thumb-friendly padding).
- [x] Word sources: import standard Wordle allowed guesses; set solution sequence to `TERIS`, `HAPPY`, `BOARD`; ensure uppercase normalization.
      Notes: Vendored the NYT Wordle word lists from `wordle-words` into `src/data/word-bank.ts` (uppercase). `SOLUTION_SEQUENCE` set to [`TERIS`, `HAPPY`, `BOARD`]. `isValidGuess` enforces 5-letter length and uppercase normalization, using a Set that combines allowed + answers + custom sequence. Tests in `src/data/words.test.ts` cover standard word, custom solutions, case/length guards.
- [x] State & routing flow: single-page sequential puzzle flow with in-memory state; transitions between puzzles; gating of final reveal.
      Notes: `usePuzzleManager` manages three puzzles; manual continues between puzzles; finale triggered by “Continue to reveal” after puzzle 3 (shows green summary then reveal image).
- [x] Core UI components: grid, tile, on-screen keyboard, header/footer; mirror NYT Wordle layout; include standard animations.
      Notes: Mobile-first grid and on-screen keyboard (staggered rows, widened ENT/backspace). Progress pill and compact progress list (question marks until solved).
- [x] Game logic: guess submission, validation, coloring rules, per-puzzle attempts (6), keyboard feedback; error messaging for invalid words.
      Notes: Core logic and tests landed: `evaluateGuess` for Wordle-style scoring (with duplicates handled), `mergeLetterState` for keyboard priority; `puzzleState` helpers for input/backspace/submit with validation and max-attempt handling. Tests in `src/game/evaluate.test.ts` and `src/game/puzzleState.test.ts`. Hooked into UI via `usePuzzleManager`, renders grid/keyboard, shows errors/toast.
- [ ] Accessibility: focus management, aria-live feedback, keyboard-only play, color contrast check; tests for focus/aria.
      Notes: \_
- [ ] Theming accents: apply Christmas palette subtly (background, highlights); ensure familiarity retained; responsive layout.
      Notes: \_
- [ ] Flow screens: intro instructions; inter-puzzle transitions; finale screen that displays provided image and short message placeholder.
      Notes: Finale implemented with green summary + reveal image; intro copy currently removed per feedback—optionally add a lightweight intro hint later.
- [ ] Testing & polish: unit/component tests (logic, UI), viewport checks (mobile/desktop), final smoke test; ready for Cloudflare deploy instructions.
      Notes: \_
- [ ] Header logo: center `sitelogo.jpg` at top; keep progress pill visible.
      Notes: Logo added to header (`public/sitelogo.jpg`); progress pill currently static placeholder.
- [x] Refine on-screen keyboard alignment (match Wordle sizing, staggered rows, wider enter/backspace)
      Notes: Keyboard staggered rows, widened ENT/backspace, responsive “ENT” label, disabled states when puzzle ends.

## Clarifying Questions

1. Tech choice: okay to scaffold with Vite + React + TypeScript (static deploy)? If not, preferred framework?
   a) that tech stack works
2. Hosting: any deployment target in mind (e.g., Netlify/Vercel/static hosting)?
   a) I will be deploying to cloudflare
3. Assets: will you provide the final reveal image and any specific fonts/logo/emoji? File format/size constraints?
   a) I provided the final reveal image - no specific fonts/logos/etc. The image is in this project.
4. Palette: do you have preferred Christmas colors or should I propose one?
   a) you can propose one
5. Animations: stick to standard Wordle animations only, or add subtle festive touches (e.g., soft confetti, glow)?
   a) keep the standard wordle animations only
6. Audio: should there be optional muted-by-default sound effects, or stay silent?
   a) no audio
7. Copy: any custom intro/finale message you want shown to Teri?
   a) not right now
8. Word list: okay to use the standard Wordle allowed guesses, or should I trim for simplicity?
   a) use the standard wordle allowed guesses
9. Privacy/analytics: should I avoid any tracking entirely?
   a) avoid anything here that complicates it. this is just a one time thing for fun - no need to add complexity around privacy or analytics
10. Timeline: any deadline for delivering the playable version?
    a) we can finish this today.
