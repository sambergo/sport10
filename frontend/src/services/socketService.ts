// src/services/socketService.ts
import { GameState } from '@/common/types/game';
import { WebSocketMessage } from '@/common/types/messages';
import { useGameStore } from '../store/gameStore';

const WEBSOCKET_URL = 'ws://localhost:3000';

let socket: WebSocket | null = null;

function connect(): void {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket is already connected or connecting.');
    return;
  }

  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log('WebSocket connection established.');
  };

  socket.onmessage = (event) => {
    try {
      const message: WebSocketMessage<any> = JSON.parse(event.data);
      console.log('Received message:', message);

      if (message.type === 'game_state_update') {
        useGameStore.getState().setGameState(message.payload as GameState);
      } else if (message.type === 'error') {
        // Here you could update the store with an error state
        console.error('Server error:', message.payload.message);
      }
    } catch (error) {
      console.error('Failed to parse server message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Attempting to reconnect...');
    // Simple reconnect logic
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
  joinGame: (name: string) => {
    sendMessage('player_join', { name });
  },
  startGame: (password: string) => {
    sendMessage('admin_start_game', { password });
  },
  resetGame: (password: string) => {
    sendMessage('admin_reset_game', { password });
  },
  submitAnswer: (answerIndices: number[]) => {
    sendMessage('submit_answer', { answerIndices });
  },
};
