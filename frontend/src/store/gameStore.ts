import { create } from "zustand"
import type { GameState } from "@/types/game"

interface GameConfig {
  gameRestartDelaySeconds: number
  autoStartDelayMs: number
  playerLimit: number
}

interface GameStore {
  gameState: GameState
  playerId: string | null
  config: GameConfig | null
  setGameState: (newState: GameState) => void
  setPlayerId: (id: string | null) => void
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
  playerId: (() => {
    try {
      return localStorage.getItem('fart10_player_id')
    } catch {
      return null
    }
  })(),
  config: null,
  setGameState: (newState) => set({ gameState: newState }),
  setPlayerId: (id) => {
    set({ playerId: id })
    // Also persist in localStorage for consistency
    if (id) {
      localStorage.setItem('fart10_player_id', id)
    } else {
      localStorage.removeItem('fart10_player_id')
    }
  },
  fetchConfig: async () => {
    try {
      const response = await fetch("/api/config")
      const config = await response.json()
      set({ config })
    } catch (err) {
      console.warn("Failed to fetch config, using defaults:", err)
      set({ 
        config: { 
          gameRestartDelaySeconds: 60, 
          autoStartDelayMs: 0,
          playerLimit: 8
        } 
      })
    }
  },
}))
