import type { GameState, Player } from "@/types/game"
import type { WebSocketMessage } from "@/types/messages"
import { useGameStore } from "@/store/gameStore"

const WEBSOCKET_URL =
  process.env.NODE_ENV === "development" ? "ws://localhost:3001" : window.location.origin.replace(/^http/, "ws")

let socket: WebSocket | null = null
let playerId: string | null = (() => {
  try {
    return localStorage.getItem('fart10_player_id')
  } catch {
    return null
  }
})()
let isRejoining = false
let rejoinTimeout: NodeJS.Timeout | null = null

// Player profile persistence
const PLAYER_PROFILE_KEY = 'fart10_player_profile'

interface PlayerProfile {
  id: string
  name: string
  avatar: number
}

function savePlayerProfile(profile: PlayerProfile): void {
  localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile))
}

function loadPlayerProfile(): PlayerProfile | null {
  try {
    const saved = localStorage.getItem(PLAYER_PROFILE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function clearPlayerProfile(): void {
  localStorage.removeItem(PLAYER_PROFILE_KEY)
}

function connect(): void {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log("WebSocket is already connected or connecting.")
    return
  }

  socket = new WebSocket(WEBSOCKET_URL)

  socket.onopen = () => {
    console.log("WebSocket connection established.")
    
    // Try to auto-rejoin with saved profile if available
    const savedProfile = loadPlayerProfile()
    if (savedProfile && playerId) {
      console.log("Auto-rejoining with saved profile:", savedProfile)
      isRejoining = true
      socketService.joinGame(savedProfile)
      
      // Set timeout to clear rejoining state if it takes too long
      rejoinTimeout = setTimeout(() => {
        console.log("Rejoin timeout - clearing rejoining state")
        isRejoining = false
        if (rejoinTimeout) {
          clearTimeout(rejoinTimeout)
          rejoinTimeout = null
        }
      }, 5000) // 5 second timeout
    }
  }

  socket.onmessage = (event) => {
    try {
      const message: WebSocketMessage<unknown> = JSON.parse(event.data)
      console.log("Received message:", message)

      switch (message.type) {
        case "game_state_update":
          useGameStore.getState().setGameState(message.payload as GameState)
          break
        case "player_joined": {
          const player = message.payload as Player
          playerId = player.id
          useGameStore.getState().setPlayerId(player.id)
          // Update saved profile with confirmed player data
          savePlayerProfile({ id: player.id, name: player.name, avatar: player.avatar })
          // Clear rejoining flag when successfully joined
          isRejoining = false
          if (rejoinTimeout) {
            clearTimeout(rejoinTimeout)
            rejoinTimeout = null
          }
          break
        }
        case "error":
          console.error("Server error:", (message.payload as { message: string }).message)
          // Clear rejoining flag on error
          isRejoining = false
          if (rejoinTimeout) {
            clearTimeout(rejoinTimeout)
            rejoinTimeout = null
          }
          break
        default:
          console.warn("Unhandled message type:", message.type)
      }
    } catch (error) {
      console.error("Failed to parse server message:", error)
    }
  }

  socket.onclose = () => {
    console.log("WebSocket connection closed. Attempting to reconnect...")
    setTimeout(connect, 3000)
  }

  socket.onerror = (error) => {
    console.error("WebSocket error:", error)
    socket?.close()
  }
}

function sendMessage<T>(type: string, payload: T): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected.")
    return
  }

  const message: WebSocketMessage<T> = { type, payload }
  socket.send(JSON.stringify(message))
}

export const socketService = {
  connect,
  getPlayerId: () => playerId,
  getSavedProfile: loadPlayerProfile,
  clearSavedProfile: clearPlayerProfile,
  isRejoining: () => isRejoining,
  joinGame: (profileData: { id: string; name: string; avatar: number }) => {
    savePlayerProfile(profileData)
    sendMessage("player_join", profileData)
  },
  startGame: (password: string) => {
    sendMessage("admin_start_game", { password })
  },
  resetGame: (password: string) => {
    sendMessage("admin_reset_game", { password })
  },
  submitAnswer: (answerIndex: number) => {
    sendMessage("submit_answer", { answerIndex })
  },
  passTurn: () => {
    sendMessage("pass_turn", {})
  },
}
