import { useEffect, useRef, useState } from 'react'
import { normalizeAnswer, parseCsv, type Card } from './csv'
import './App.css'

type Phase = 'idle' | 'learning' | 'done'

interface RoundState {
  round: number
  cards: Card[]
  index: number
  missed: Card[]
}

type Feedback =
  | { kind: 'correct' }
  | { kind: 'wrong'; userAnswer: string }
  | null

const CSV_HINT =
  'Paste your deck as CSV — two columns, A and B:\n\n' +
  'term,definition\n2+2,4\n\n' +
  'A is what you get asked, B is the answer you type.'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [deck, setDeck] = useState<Card[]>([])
  const [rs, setRs] = useState<RoundState>({ round: 1, cards: [], index: 0, missed: [] })
  const [completedRounds, setCompletedRounds] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const generationRef = useRef(0)

  const current = rs.cards[rs.index]

  // Keep the input focused whenever the card changes.
  useEffect(() => {
    if (phase === 'learning' && feedback === null) inputRef.current?.focus()
  }, [rs, phase, feedback])

  // Clean up any pending auto-advance timer.
  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function loadDeck(cards: Card[]) {
    generationRef.current++
    window.clearTimeout(timerRef.current)
    setDeck(cards)
    setCompletedRounds(0)
    setRs({ round: 1, cards: shuffle(cards), index: 0, missed: [] })
    setInput('')
    setFeedback(null)
    setPhase('learning')
  }

  function promptForDeck() {
    const text = window.prompt(CSV_HINT)
    if (text === null) return // cancelled
    const cards = parseCsv(text)
    if (cards.length === 0) {
      window.alert('No cards found — make sure each row has an A and a B column.')
      return
    }
    loadDeck(cards)
  }

  function advance() {
    window.clearTimeout(timerRef.current)
    setFeedback(null)
    setInput('')
    const nextIndex = rs.index + 1
    if (nextIndex < rs.cards.length) {
      setRs({ ...rs, index: nextIndex })
      return
    }
    // Round finished.
    setCompletedRounds(rs.round)
    if (rs.missed.length === 0) {
      setPhase('done')
    } else {
      setRs({ round: rs.round + 1, cards: shuffle(rs.missed), index: 0, missed: [] })
    }
  }

  function check() {
    if (!current || feedback !== null) return
    if (normalizeAnswer(input) === normalizeAnswer(current.b)) {
      setFeedback({ kind: 'correct' })
      const gen = generationRef.current
      timerRef.current = window.setTimeout(() => {
        if (gen === generationRef.current) advance()
      }, 700)
    } else {
      setFeedback({ kind: 'wrong', userAnswer: input })
      setRs({ ...rs, missed: [...rs.missed, current] })
    }
  }

  function showAnswer() {
    if (!current || feedback !== null) return
    setFeedback({ kind: 'wrong', userAnswer: '' })
    setRs({ ...rs, missed: [...rs.missed, current] })
  }

  function skip() {
    if (!current || feedback !== null) return
    setRs({ ...rs, missed: [...rs.missed, current] })
    advance()
  }

  function restart() {
    if (deck.length === 0) {
      promptForDeck()
      return
    }
    loadDeck(deck)
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">quizet</span>
        <nav className="topbar-actions">
          <button onClick={promptForDeck}>New deck</button>
          <button onClick={restart} disabled={phase === 'idle'}>Restart</button>
          <button onClick={skip} disabled={phase !== 'learning' || feedback !== null}>Skip</button>
          <button onClick={showAnswer} disabled={phase !== 'learning' || feedback !== null}>Show answer</button>
        </nav>
      </header>

      {phase === 'idle' && (
        <main className="screen">
          <div className="panel idle-panel">
            <h1 className="brand-big">quizet</h1>
            <p className="tagline">Free flashcards. Paste CSV, learn, repeat.</p>
            <button className="primary" onClick={promptForDeck}>Paste a deck</button>
            <p className="hint">Rows of <code>A,B</code> — terms, definitions, problems, whatever.</p>
          </div>
        </main>
      )}

      {phase === 'learning' && current && (
        <main className="screen">
          <div className="learning-col">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(rs.index / rs.cards.length) * 100}%` }}
              />
            </div>
            <div className="round-meta">
              Round {rs.round} · Card {rs.index + 1} of {rs.cards.length}
              {rs.missed.length > 0 && <> · missed this round: {rs.missed.length}</>}
            </div>

            <div className="panel card-panel">
              <div className="card-label">A</div>
              <div className="card-text">{current.a}</div>
            </div>

            <form
              className="answer-row"
              onSubmit={(e) => {
                e.preventDefault()
                check()
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type B…"
                disabled={feedback !== null}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button type="submit" className="primary" disabled={feedback !== null}>Check</button>
            </form>

            {feedback?.kind === 'correct' && (
              <div className="feedback correct">✓ Correct</div>
            )}

            {feedback?.kind === 'wrong' && (
              <div className="feedback wrong">
                <div>
                  {feedback.userAnswer === ''
                    ? 'Answer revealed.'
                    : <>Not quite — you typed “{feedback.userAnswer}”.</>}
                </div>
                <div className="reveal">Correct answer: <strong>{current.b}</strong></div>
                <button className="primary continue-btn" onClick={advance}>Continue</button>
              </div>
            )}
          </div>
        </main>
      )}

      {phase === 'done' && (
        <main className="screen">
          <div className="panel done-panel">
            <h1 className="brand-big">Deck complete 🎉</h1>
            <p className="tagline">
              {deck.length} card{deck.length === 1 ? '' : 's'} · {completedRounds} round
              {completedRounds === 1 ? '' : 's'}
            </p>
            <div className="done-actions">
              <button className="primary" onClick={restart}>Restart</button>
              <button onClick={promptForDeck}>New deck</button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}