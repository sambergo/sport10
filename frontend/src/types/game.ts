export interface Player {
  id: string
  name: string
  score: number
  avatar: number
  roundAnswers: number[]
}

export interface AnswerOption {
  text: string
  isCorrect: boolean
}

export interface Question {
  question: string
  category: string
  options: AnswerOption[]
  revealedIncorrectAnswers?: number[]
}

export interface GameState {
  status: "Waiting" | "Answering" | "Results" | "Finished"
  players: Player[]
  currentQuestion: Question | null
  currentRound: number
  timer: number
  activePlayerId: string | null
}
