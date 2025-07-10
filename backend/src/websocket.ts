import WebSocket from 'ws';
import { Server } from 'http';
import { gameState, updateGameState } from './game';
import { WebSocketMessage } from './types/messages';

let wss: WebSocket.Server;

/**
 * Initializes the WebSocket server.
 * @param server The HTTP server instance.
 */
export function initWebSocketServer(server: Server): void {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    // Send the current game state to the newly connected client
    ws.send(JSON.stringify({
      type: 'game_state_update',
      payload: gameState
    }));

    ws.on('message', (message: string) => {
      try {
        const parsedMessage: WebSocketMessage<any> = JSON.parse(message);
        handleMessage(ws, parsedMessage);
      } catch (error) {
        console.error('Failed to parse message or handle client message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format.' }
        }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Here we will add logic to handle player disconnection
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
  });
}

/**
 * Broadcasts the current game state to all connected clients.
 */
export function broadcastGameState(): void {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'game_state_update',
    payload: gameState
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  console.log('Broadcasted game state to all clients.');
}

/**
 * Handles incoming WebSocket messages from a client.
 * @param ws The WebSocket connection instance.
 * @param message The parsed message object.
 */
function handleMessage(ws: WebSocket, message: WebSocketMessage<any>): void {
  console.log(`Received message of type: ${message.type}`);

  switch (message.type) {
    // Add message handlers here in the next phase
    // e.g., case 'player_join':
    // handlePlayerJoin(ws, message.payload);
    // break;

    default:
      console.log(`Unknown message type: ${message.type}`);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: `Unknown message type: ${message.type}` }
      }));
  }
}
