import { WORDLE_ALLOWED, WORDLE_ANSWERS } from './word-bank'

export const SOLUTION_SEQUENCE = ['TERIS', 'HAPPY', 'BOARD'] as const

const toKey = (word: string) => word.trim().toUpperCase()

const allowedSet = new Set<string>([
  ...WORDLE_ALLOWED.map(toKey),
  ...WORDLE_ANSWERS.map(toKey),
  ...SOLUTION_SEQUENCE,
])

export const isValidGuess = (word: string) => {
  if (word.length !== 5) return false
  return allowedSet.has(toKey(word))
}

export const allowedGuesses = allowedSet
