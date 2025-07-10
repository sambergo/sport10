export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

// Represents the static data for a question
export interface QuestionTemplate {
  id: number;
  question: string;
  options: AnswerOption[];
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Represents a question being played in a round
export interface Question extends QuestionTemplate {
  revealedIncorrectAnswers: number[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  roundStatus: 'in_round' | 'passed' | 'out';
  lastAnswerCorrect: boolean | null;
  timeoutCount: number;
  // Data for the current round
  roundAnswers: number[]; // Will store indices of answers given by player
  roundScore: number;
}

export type GameStatus = 'Waiting' | 'Answering' | 'Results' | 'Finished';

export interface GameState {
  status: GameStatus;
  players: Player[];
  currentQuestion: Question | null;
  currentRound: number;
  timer: number;
  activePlayerId: string | null;
}