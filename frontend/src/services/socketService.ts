// src/services/socketService.ts
import type { GameState, Player } from '../../../common/types/game';
import type { WebSocketMessage } from '../../../common/types/messages';
import { useGameStore } from '../store/gameStore';

const WEBSOCKET_URL = 'ws://localhost:3001';

let socket: WebSocket | null = null;
let playerId: string | null = null; // Store player ID locally in the service

function connect(): void {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket is already connected or connecting.');
    return;
  }

  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log('WebSocket connection established.');
    // If we have a player ID, maybe we need to re-identify? For now, we don't.
  };

  socket.onmessage = (event) => {
    try {
      const message: WebSocketMessage<any> = JSON.parse(event.data);
      console.log('Received message:', message);

      switch (message.type) {
        case 'game_state_update':
          useGameStore.getState().setGameState(message.payload as GameState);
          break;
        case 'player_joined': // Assuming backend sends this custom message
          const player = message.payload as Player;
          playerId = player.id;
          useGameStore.getState().setPlayerId(player.id);
          break;
        case 'error':
          console.error('Server error:', message.payload.message);
          break;
        default:
          console.warn('Unhandled message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse server message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Attempting to reconnect...');
    setTimeout(connect, 3000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    socket?.close();
  };
}

function sendMessage<T>(type: string, payload: T): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected.');
    return;
  }
  const message: WebSocketMessage<T> = { type, payload };
  socket.send(JSON.stringify(message));
}

// --- Public API for the service ---

export const socketService = {
  connect,
  getPlayerId: () => playerId,
  joinGame: (name: string) => {
    // We don't have the ID yet, backend will send it.
    sendMessage('player_join', { name });
  },
  startGame: (password: string) => {
    sendMessage('admin_start_game', { password });
  },
  resetGame: (password: string) => {
    sendMessage('admin_reset_game', { password });
  },
  submitAnswer: (answerIndex: number) => {
    sendMessage('submit_answer', { answerIndex });
  },
  passTurn: () => {
    sendMessage('pass_turn', {});
  },
};
