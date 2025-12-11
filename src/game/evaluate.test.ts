import { describe, expect, it } from 'vitest'
import { evaluateGuess, mergeLetterState } from './evaluate'

describe('evaluateGuess', () => {
  it('rejects non-5-letter inputs', () => {
    expect(() => evaluateGuess('SHORT', 'CAR')).toThrow()
    expect(() => evaluateGuess('SHORT', 'LONGER')).toThrow()
  })

  it('marks all correct when guess matches answer', () => {
    const { letters, isCorrect } = evaluateGuess('HAPPY', 'HAPPY')
    expect(isCorrect).toBe(true)
    expect(letters.every((l) => l.state === 'correct')).toBe(true)
  })

  it('handles absent and present letters properly', () => {
    const { letters, isCorrect } = evaluateGuess('BOARD', 'CLOUD')
    expect(isCorrect).toBe(false)
    expect(letters.map((l) => l.state)).toEqual(['absent', 'absent', 'present', 'absent', 'correct'])
  })

  it('handles duplicate letters like Wordle', () => {
    // Answer has one A; guess has two As. Only one should be present/correct.
    const { letters } = evaluateGuess('GRACE', 'ALARM')
    expect(letters.map((l) => l.state)).toEqual(['absent', 'absent', 'correct', 'present', 'absent'])
  })
})

describe('mergeLetterState', () => {
  it('prefers higher priority states', () => {
    expect(mergeLetterState('absent', 'present')).toBe('present')
    expect(mergeLetterState('present', 'correct')).toBe('correct')
    expect(mergeLetterState('correct', 'present')).toBe('correct')
  })

  it('treats empty as lowest rank', () => {
    expect(mergeLetterState('empty', 'absent')).toBe('absent')
  })
})
