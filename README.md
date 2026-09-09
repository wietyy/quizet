# quizet

A free, local-first flashcard study app. Paste a deck as CSV and drill it in learn mode until you know every card — no accounts, no subscriptions, no setup.

## Features

- **Paste-to-study** — paste a CSV deck straight into the app and start learning immediately
- **Learn mode** — type-in answer checking with forgiving matching (case- and whitespace-insensitive)
- **Rounds** — missed cards are shuffled into the next round; keep going until a round is flawless
- **Skip / Show answer** — escape hatches when you're stuck (both send the card to the next round)
- **Override** — misspelled an answer you actually knew? Count it as correct instead of re-drilling it
- **Zero dependencies on services** — no backend, no API keys, no accounts. Runs entirely in the browser.
- **Dark theme** — JetBrains Mono, bundled locally via `@fontsource` (no CDN)

## Quick start

```bash
npm install
npm run dev
```

## CSV format

Each row has two columns. The first is **A** (what you're asked), the second is **B** (the answer you type). The format is deliberately generic — A/B can be terms and definitions, practice problems, vocabulary pairs, or anything else.

```
term,definition
2+2,4
capital of france,paris
```

Quoted fields are supported, including commas and newlines inside quotes:

```
"What's the derivative of x²?","2x"
"a,b","letter a, then b"
```

Rows where both columns are blank are ignored, as is anything past the second column.

## AI-generated decks

Skip the typing — have an AI chatbot build your deck for you:

1. Open `AINSTRUCTIONS.md` and copy its entire contents.
2. Paste it into any AI chatbot (ChatGPT, Claude, Gemini, etc.), replacing the bracketed placeholders — topic, number of cards, difficulty.
3. Paste the AI's output straight into quizet's "Paste a deck" dialog.

The instructions enforce quizet's CSV rules (two columns, quoting, no extra commentary), so the AI's output should land clean. If the app ever rejects a paste, it usually means the AI added markdown fences or blank lines — ask it to output raw CSV only.

## Learn mode

1. A card shows its A side; type the B side and hit Check (or Enter).
2. A correct answer flashes green and advances to the next card.
3. A wrong answer shows your attempt alongside the correct one; hit Continue to move on — or **Override** if you just misspelled it, which counts the card as correct and removes it from the next round.
4. At the end of a round, every missed card is shuffled into the next round.
5. A round with zero misses completes the deck, with your total round count.

## Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Typecheck (`tsc -b`) + build         |
| `npm run lint`    | ESLint                               |
| `npm run preview` | Preview the production build         |

## Stack

Vite · React 19 · TypeScript · plain CSS · `@fontsource/jetbrains-mono`

## Roadmap

The app currently has no persistence — decks live for the duration of the session. Local storage persistence is the most natural next step. See `AGENTS.md` for the design decisions this project is built around.