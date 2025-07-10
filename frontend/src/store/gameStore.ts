// src/store/gameStore.ts
import { create } from 'zustand';
import { GameState } from '@/common/types/game';

interface GameStore {
  gameState: GameState;
  setGameState: (newState: GameState) => void;
}

const initialState: GameState = {
  status: 'Waiting',
  players: [],
  currentQuestion: null,
  currentRound: 0,
  timer: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialState,
  setGameState: (newState) => set({ gameState: newState }),
}));
