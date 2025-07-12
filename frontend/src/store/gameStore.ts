import { create } from "zustand"
import type { GameState } from "@/types/game"

interface GameConfig {
  gameRestartDelaySeconds: number
  autoStartDelayMs: number
}

interface GameStore {
  gameState: GameState
  playerId: string | null
  config: GameConfig | null
  setGameState: (newState: GameState) => void
  setPlayerId: (id: string) => void
  fetchConfig: () => Promise<void>
}

const initialState: GameState = {
  status: "Waiting",
  players: [],
  currentQuestion: null,
  currentRound: 0,
  timer: 0,
  activePlayerId: null,
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialState,
  playerId: null,
  setGameState: (newState) => set({ gameState: newState }),
  setPlayerId: (id) => set({ playerId: id }),
}))
