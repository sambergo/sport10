import { GameState, GameStatus, Player } from './types/game';

// The single, in-memory game state object (Singleton)
export let gameState: GameState = {
  status: 'Waiting',
  players: [],
  currentQuestion: null,
  currentRound: 0,
  timer: 0,
};

// --- State Machine Functions ---

/**
 * Resets the game state to its initial waiting state.
 */
export function resetGame(): void {
  gameState = {
    status: 'Waiting',
    players: [],
    currentQuestion: null,
    currentRound: 0,
    timer: 0,
  };
  console.log('Game has been reset');
}

/**
 * Starts the game, changing the status from Waiting.
 */
export function startGame(): void {
  if (gameState.status === 'Waiting') {
    gameState.status = 'Answering'; // Or a 'Starting' state if needed
    gameState.currentRound = 1;
    console.log('Game has started');
    // Logic to select the first question will be added here
  }
}

/**
 * Updates the game state with new data.
 * A simple way to ensure we're always working with the same object reference.
 * @param newState Partial<GameState>
 */
export function updateGameState(newState: Partial<GameState>): void {
    gameState = { ...gameState, ...newState };
}
