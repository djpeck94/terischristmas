import { isValidGuess } from '../data/words'
import { MAX_ATTEMPTS, WORD_LENGTH } from './constants'
import { evaluateGuess, mergeLetterState } from './evaluate'
import type { GuessEvaluation, LetterState } from './types'

export type PuzzleStatus = 'playing' | 'won' | 'lost'

export type PuzzleState = {
  answer: string
  guesses: GuessEvaluation[]
  currentGuess: string
  status: PuzzleStatus
  error: string | null
  keyboard: Record<string, LetterState>
}

export const createPuzzleState = (answer: string): PuzzleState => ({
  answer: answer.toUpperCase(),
  guesses: [],
  currentGuess: '',
  status: 'playing',
  error: null,
  keyboard: {},
})

const isAlphabetic = (char: string) => /^[A-Z]$/.test(char)

export const inputChar = (state: PuzzleState, char: string): PuzzleState => {
  if (state.status !== 'playing') return state
  const letter = char.toUpperCase()
  if (!isAlphabetic(letter)) return state
  if (state.currentGuess.length >= WORD_LENGTH) return state
  return { ...state, currentGuess: state.currentGuess + letter, error: null }
}

export const backspace = (state: PuzzleState): PuzzleState => {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length === 0) return state
  return { ...state, currentGuess: state.currentGuess.slice(0, -1), error: null }
}

const updateKeyboard = (
  keyboard: Record<string, LetterState>,
  evaluation: GuessEvaluation,
): Record<string, LetterState> => {
  const next = { ...keyboard }
  evaluation.letters.forEach(({ letter, state }) => {
    const existing = next[letter] ?? 'empty'
    next[letter] = mergeLetterState(existing, state)
  })
  return next
}

export const submitGuess = (state: PuzzleState): PuzzleState => {
  if (state.status !== 'playing') return state
  if (state.currentGuess.length !== WORD_LENGTH) {
    return { ...state, error: `Not enough letters` }
  }

  if (!isValidGuess(state.currentGuess)) {
    return { ...state, error: `Not in word list` }
  }

  const evaluation = evaluateGuess(state.answer, state.currentGuess)
  const guesses = [...state.guesses, evaluation]
  const status: PuzzleStatus = evaluation.isCorrect
    ? 'won'
    : guesses.length >= MAX_ATTEMPTS
      ? 'lost'
      : 'playing'

  return {
    ...state,
    guesses,
    currentGuess: '',
    status,
    error: null,
    keyboard: updateKeyboard(state.keyboard, evaluation),
  }
}
