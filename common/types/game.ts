export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  question: string;
  options: AnswerOption[];
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
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