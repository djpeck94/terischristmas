import { describe, expect, it } from 'vitest'
import { MAX_ATTEMPTS } from './constants'
import {
  backspace,
  createPuzzleState,
  inputChar,
  submitGuess,
  type PuzzleStatus,
} from './puzzleState'

describe('puzzleState', () => {
  it('builds a guess with letter input and backspace', () => {
    let state = createPuzzleState('BOARD')
    state = inputChar(state, 'b')
    state = inputChar(state, 'o')
    state = inputChar(state, '1') // ignored
    state = backspace(state)
    state = inputChar(state, 'A')
    expect(state.currentGuess).toBe('BA')
  })

  it('rejects submit when guess length is short', () => {
    let state = createPuzzleState('BOARD')
    state = inputChar(state, 'B')
    state = submitGuess(state)
    expect(state.error).toBe('Not enough letters')
    expect(state.guesses.length).toBe(0)
  })

  it('marks win when guess matches answer', () => {
    let state = createPuzzleState('BOARD')
    'BOARD'.split('').forEach((ch) => (state = inputChar(state, ch)))
    state = submitGuess(state)
    expect(state.status).toBe<PuzzleStatus>('won')
    expect(state.guesses[0]?.isCorrect).toBe(true)
    expect(state.currentGuess).toBe('')
  })

  it('marks loss after max attempts', () => {
    let state = createPuzzleState('BOARD')
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      'CLOUD'.split('').forEach((ch) => (state = inputChar(state, ch)))
      state = submitGuess(state)
    }
    expect(state.status).toBe<PuzzleStatus>('lost')
    expect(state.guesses).toHaveLength(MAX_ATTEMPTS)
  })

  it('updates keyboard states with priority', () => {
    let state = createPuzzleState('BOARD')
    'BRING'.split('').forEach((ch) => (state = inputChar(state, ch)))
    state = submitGuess(state) // B correct, R present, I/G absent
    expect(state.keyboard['B']).toBe('correct')
    expect(state.keyboard['R']).toBe('present')
    expect(state.keyboard['I']).toBe('absent')

    // Later guess upgrades R to correct
    'CROWD'.split('').forEach((ch) => (state = inputChar(state, ch)))
    state = submitGuess(state)
    expect(state.keyboard['R']).toBe('present')
  })
})
