export type LetterState = 'correct' | 'present' | 'absent' | 'empty'

export type LetterResult = {
  letter: string
  state: LetterState
}

export type GuessEvaluation = {
  letters: LetterResult[]
  isCorrect: boolean
}
