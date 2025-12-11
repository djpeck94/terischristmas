import { describe, expect, it } from 'vitest'
import { SOLUTION_SEQUENCE, isValidGuess } from './words'

describe('words data', () => {
  it('accepts standard Wordle allowed guess', () => {
    expect(isValidGuess('cigar')).toBe(true)
  })

  it('accepts custom solution words (sequence)', () => {
    SOLUTION_SEQUENCE.forEach((word) => {
      expect(isValidGuess(word)).toBe(true)
    })
  })

  it('is case-insensitive and enforces length', () => {
    expect(isValidGuess('Happy')).toBe(true)
    expect(isValidGuess('toolong')).toBe(false)
    expect(isValidGuess('')).toBe(false)
  })
})
