# AGENTS.md

Guide for AI agents and humans picking up this repo.

## What this is

**quizet** — a free, local-only Quizlet-style study app. You paste a deck of flashcards as CSV text, and it drills you in "learn mode": type the answer, miss it, and it reappears in the next round until you get every card right.

No backend, no accounts, no API keys, no persistence (yet). Everything runs in the browser.

## Quick commands

```bash
npm run dev       # start Vite dev server
npm run build     # typecheck (tsc -b) + production build
npm run lint      # eslint
```

Verify changes with `npm run build` and `npm run lint` before finishing. There are no tests.

## Stack

- Vite + React 19 + TypeScript (strict)
- Plain CSS, no UI libraries
- Font: `@fontsource/jetbrains-mono` (bundled locally, **do not** switch to a CDN link)

## File map

- `src/App.tsx` — all app state and the learn-mode flow (rounds, feedback, buttons)
- `src/csv.ts` — CSV parsing (`parseCsv`) and answer normalization (`normalizeAnswer`); pure functions, no React
- `src/App.css` / `src/index.css` — all styling; theme variables live in `index.css`
- `src/main.tsx` — entry point, imports the font

## Design decisions (user-specified — keep them)

- **Cards are A/B pairs, not term/definition.** The two CSV columns are labeled A (what you're asked) and B (the answer you type). They can be terms, definitions, practice problems, anything. Extra columns beyond the second are ignored.
- **`prompt()` for everything.** All data entry (pasting a deck) uses the browser `prompt()` dialog. This is deliberate — it's easy to maintain. Don't build a fancy sidebar/form UI unless asked.
- **Learn mode only.** Type-in checking: A is shown, user types B, answer is compared with case/whitespace-insensitive normalization. Correct answers auto-advance (~700ms); wrong answers show the correct one and need a manual Continue. Missed cards are shuffled into the next round; rounds repeat until a round has zero misses.
- **Override** — when an answer is marked wrong, an Override button (shown only if the user typed something, never after Show answer) counts the card as correct: it's removed from the missed list and the round advances as if correct.
- **Top button bar** with New deck / Restart / Skip / Show answer. Skip and Show answer both count the card as missed.
- **Dark theme only.** No light theme. JetBrains Mono, rounded corners, purple accent. Theme tokens are CSS variables in `src/index.css`.
- **No localStorage / no backend.** Deliberate for the base setup.

## Gotchas

- `advance()` in `App.tsx` reads round state from the render closure; a `generationRef` guard prevents stale auto-advance timers from firing after a deck is replaced. Preserve this pattern if you touch timing.
- State is intentionally kept in one component (`App.tsx`) — don't prematurely extract stores or contexts.