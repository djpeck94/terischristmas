import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { SOLUTION_SEQUENCE } from './data/words'
import { MAX_ATTEMPTS, WORD_LENGTH } from './game/constants'
import {
  backspace,
  createPuzzleState,
  inputChar,
  submitGuess,
  type PuzzleState,
} from './game/puzzleState'

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL'] as const
const BOTTOM_ROW = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'] as const

const usePuzzleManager = () => {
  const [puzzles, setPuzzles] = useState<PuzzleState[]>(() =>
    SOLUTION_SEQUENCE.map((answer) => createPuzzleState(answer)),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const current = puzzles[currentIndex]
  const isFinal = currentIndex === SOLUTION_SEQUENCE.length - 1

  const updateCurrent = (updater: (p: PuzzleState) => PuzzleState) => {
    setPuzzles((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentIndex) return p
        return updater(p)
      }),
    )
  }

  const advance = () => {
    setToast(null)
    setCurrentIndex((prev) => Math.min(prev + 1, SOLUTION_SEQUENCE.length - 1))
  }

  const handleSubmit = () => {
    let nextState: PuzzleState | undefined
    updateCurrent((p) => {
      nextState = submitGuess(p)
      return nextState
    })

    if (!nextState) return

    if (nextState.status !== 'playing') {
      const message =
        nextState.status === 'won'
          ? isFinal
            ? 'You solved it!'
            : 'Great! Tap continue to play the next puzzle.'
          : isFinal
            ? 'Out of tries.'
            : 'Out of tries. Tap continue to move on.'
      setToast(message)

      // For final puzzle, finale start is user-triggered via button.
    }
  }

  const handlers = {
    onChar: (char: string) => updateCurrent((p) => inputChar(p, char)),
    onBackspace: () => updateCurrent((p) => backspace(p)),
    onSubmit: handleSubmit,
  }

  return { puzzles, current, currentIndex, isFinal, toast, advance, handlers }
}

function App() {
  const [finalePhase, setFinalePhase] = useState<'none' | 'summary' | 'reveal'>('none')
  const finaleTimerRef = useRef<number | null>(null)

  const startFinale = useCallback(() => {
    if (finaleTimerRef.current) {
      window.clearTimeout(finaleTimerRef.current)
      finaleTimerRef.current = null
    }
    setFinalePhase('summary')
    finaleTimerRef.current = window.setTimeout(() => {
      setFinalePhase('reveal')
    }, 1800)
  }, [])

  const { puzzles, current, currentIndex, isFinal, toast, advance, handlers } = usePuzzleManager()
  const inputLocked = current.status !== 'playing'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (inputLocked) return
      const key = event.key
      if (key === 'Enter') {
        event.preventDefault()
        handlers.onSubmit()
        return
      }
      if (key === 'Backspace') {
        event.preventDefault()
        handlers.onBackspace()
        return
      }
      if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault()
        handlers.onChar(key.toUpperCase())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers, inputLocked])

  useEffect(() => {
    return () => {
      if (finaleTimerRef.current) {
        window.clearTimeout(finaleTimerRef.current)
      }
    }
  }, [])

  const progressLabel = useMemo(
    () => `Puzzle ${currentIndex + 1} of ${SOLUTION_SEQUENCE.length}`,
    [currentIndex],
  )

  const showReveal = finalePhase === 'reveal'

  const renderFinaleSummary = () => (
    <div className="summary-board" aria-live="polite">
      <p className="summary-title">All words solved</p>
      {SOLUTION_SEQUENCE.map((word) => (
        <div className="summary-row" key={word}>
          {word.split('').map((letter, idx) => (
            <div className="tile tile-correct" key={`${word}-${idx}`}>
              <span>{letter}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  const progressItems = SOLUTION_SEQUENCE.map((word, idx) => {
    const puzzle = puzzles[idx]
    const status = puzzle?.status
    const isDone = status === 'won'
    return {
      word,
      icon: isDone ? '✓' : '?',
      displayWord: isDone ? word : '',
    }
  })

  const renderTile = (letter: string, state: string, idx: number) => (
    <div key={`${letter}-${idx}`} className={`tile tile-${state}`}>
      <span>{letter}</span>
    </div>
  )

  const renderRows = () => {
    const rows = []
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const evaluation = current.guesses[i]
      const isCurrentRow = i === current.guesses.length && current.status === 'playing'
      const letters: string[] = Array(WORD_LENGTH).fill('')
      const states: string[] = Array(WORD_LENGTH).fill('empty')

      if (evaluation) {
        evaluation.letters.forEach((l, idx) => {
          letters[idx] = l.letter
          states[idx] = l.state
        })
      } else if (isCurrentRow) {
        current.currentGuess.split('').forEach((ch, idx) => {
          letters[idx] = ch
          states[idx] = 'pending'
        })
      }

      rows.push(
        <div key={`row-${i}`} className={`row ${isCurrentRow ? 'row-active' : ''}`}>
          {letters.map((letter, idx) => renderTile(letter, states[idx], idx))}
        </div>,
      )
    }
    return rows
  }

  const renderKeyboard = () => (
    <div className="keyboard">
      {KEY_ROWS.map((row, idx) => (
        <div key={row} className={`key-row key-row-${idx + 1}`}>
          {row.split('').map((key) => {
            const state = current.keyboard[key] ?? 'empty'
            return (
              <button
                key={key}
                type="button"
                className={`key key-${state}`}
                onClick={() => handlers.onChar(key)}
                aria-label={key}
                aria-pressed={false}
                tabIndex={0}
                disabled={inputLocked}
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}

      <div className="key-row key-row-bottom">
        <button
          type="button"
          className="key key-action key-enter"
          onClick={handlers.onSubmit}
          aria-label="Enter"
          disabled={inputLocked}
        >
          ENT
        </button>
        {BOTTOM_ROW.map((key) => {
          const state = current.keyboard[key] ?? 'empty'
          return (
            <button
              key={key}
              type="button"
              className={`key key-${state}`}
              onClick={() => handlers.onChar(key)}
              aria-label={key}
              aria-pressed={false}
              tabIndex={0}
              disabled={inputLocked}
            >
              {key}
            </button>
          )
        })}
        <button
          type="button"
          className="key key-action key-backspace"
          onClick={handlers.onBackspace}
          aria-label="Backspace"
          disabled={inputLocked}
        >
          ⌫
        </button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <header className="top-bar">
        <img
          src="/sitelogo.jpg"
          alt="Teri's Christmas Present logo"
          className="site-logo"
          loading="lazy"
        />
        <div className="progress-pill" aria-label="Puzzle progress">
          {progressLabel}
        </div>
      </header>

      <main className="main">
        <div className="sr-only" aria-live="polite">
          {toast || current.error || progressLabel}
        </div>
        {!showReveal && (
          <section className="card game-area" aria-live="polite">
            <div className="game-header compact">
              <div className="attempts">{progressLabel}</div>
              <div className="progress-list" aria-label="Puzzle progress">
                {progressItems.map((item) => (
                  <div key={item.word} className="progress-row">
                    <span className="progress-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="progress-word">{item.displayWord}</span>
                  </div>
                ))}
              </div>
            </div>

            {finalePhase === 'summary' ? (
              renderFinaleSummary()
            ) : (
              <>
                <div className="grid" role="presentation" aria-label="Word grid">
                  {renderRows()}
                </div>

                {current.error && (
                  <div className="error-banner" role="alert" aria-live="assertive">
                    {current.error}
                  </div>
                )}
                {toast && (
                  <div className="toast" aria-live="polite">
                    {toast}
                  </div>
                )}

                {renderKeyboard()}

                {current.status !== 'playing' && !isFinal && (
                  <button type="button" className="continue-button" onClick={advance}>
                    Continue to next puzzle
                  </button>
                )}
                {current.status !== 'playing' && isFinal && finalePhase === 'none' && (
                  <button type="button" className="continue-button" onClick={startFinale}>
                    Continue to reveal
                  </button>
                )}
              </>
            )}
          </section>
        )}

        {showReveal && (
          <section className="card finale reveal-card" aria-live="polite">
            <h2>Surprise reveal</h2>
            <p className="placeholder-copy">Thanks for playing! Here’s your present.</p>
            <img
              src="/finalrevealimage.png"
              alt="Christmas present reveal"
              className="reveal-image"
              loading="lazy"
            />
          </section>
        )}
      </main>

      <footer className="footer">
        <span className="footer-text">Made for Mom - TerisChristmas.com</span>
      </footer>
    </div>
  )
}

export default App
