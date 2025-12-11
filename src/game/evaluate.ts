import { WORD_LENGTH } from './constants'
import type { GuessEvaluation, LetterState } from './types'

const normalize = (value: string) => value.trim().toUpperCase()

const stateRank: Record<LetterState, number> = {
  empty: 0,
  absent: 1,
  present: 2,
  correct: 3,
}

export const evaluateGuess = (answer: string, guess: string): GuessEvaluation => {
  const normalizedAnswer = normalize(answer)
  const normalizedGuess = normalize(guess)

  if (normalizedAnswer.length !== WORD_LENGTH || normalizedGuess.length !== WORD_LENGTH) {
    throw new Error(`Both answer and guess must be ${WORD_LENGTH} letters`)
  }

  const result: LetterState[] = Array(WORD_LENGTH).fill('absent')
  const remainingCounts = new Map<string, number>()

  // First pass: mark correct letters and build frequency map of the remaining answer letters
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const answerChar = normalizedAnswer[i]
    const guessChar = normalizedGuess[i]
    if (guessChar === answerChar) {
      result[i] = 'correct'
    } else {
      remainingCounts.set(answerChar, (remainingCounts.get(answerChar) ?? 0) + 1)
    }
  }

  // Second pass: mark present letters using remaining counts
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === 'correct') continue
    const guessChar = normalizedGuess[i]
    const remaining = remainingCounts.get(guessChar) ?? 0
    if (remaining > 0) {
      result[i] = 'present'
      remainingCounts.set(guessChar, remaining - 1)
    }
  }

  return {
    letters: normalizedGuess.split('').map((letter, idx) => ({
      letter,
      state: result[idx],
    })),
    isCorrect: result.every((state) => state === 'correct'),
  }
}

export const mergeLetterState = (existing: LetterState, incoming: LetterState): LetterState => {
  return stateRank[incoming] > stateRank[existing] ? incoming : existing
}
