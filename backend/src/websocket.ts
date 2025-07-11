import WebSocket from 'ws';
import { Server } from 'http';
import { gameState } from './game';
import { WebSocketMessage, PlayerJoinPayload, AdminActionPayload, SubmitAnswerPayload } from '@/common/types/messages';
import { handlePlayerJoin, handleAdminStartGame, handleAdminResetGame, handleSubmitAnswer, handlePassTurn } from './services/gameService';

// Extend the WebSocket type to hold our player info
interface PlayerWebSocket extends WebSocket {
  playerId?: string;
  playerName?: string;
}

let wss: WebSocket.Server;

export function initWebSocketServer(server: Server): void {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: PlayerWebSocket) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'game_state_update', payload: gameState }));

    ws.on('message', (message: string) => {
      try {
        const parsedMessage: WebSocketMessage<any> = JSON.parse(message);
        handleMessage(ws, parsedMessage);
      } catch (error) {
        console.error('Failed to parse or handle message:', error);
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format.' } }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Add disconnection logic here
    });

    ws.on('error', (error) => console.error('WebSocket error:', error));
  });
}

export function broadcastGameState(): void {
  if (!wss) return;
  const message = JSON.stringify({ type: 'game_state_update', payload: gameState });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
  console.log('Broadcasted game state to all clients.');
}

export function broadcastPlayerUpdates(newPlayers: any[]): void {
  if (!wss) return;
  
  wss.clients.forEach((client: PlayerWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.playerName) {
      // Find the new player object that matches this client's player name
      const matchingNewPlayer = newPlayers.find(p => p.name === client.playerName);
      
      if (matchingNewPlayer) {
        const oldPlayerId = client.playerId;
        // Update the WebSocket's player ID association
        client.playerId = matchingNewPlayer.id;
        // Send the updated player info to this client
        client.send(JSON.stringify({ 
          type: 'player_joined', 
          payload: matchingNewPlayer 
        }));
        console.log(`Updated client connection: ${matchingNewPlayer.name} from ${oldPlayerId} to ${matchingNewPlayer.id}`);
      }
    }
  });
}

function handleMessage(ws: PlayerWebSocket, message: WebSocketMessage<any>): void {
  console.log(`Received message of type: ${message.type}`);

  // Ensure player is associated for player-specific actions
  const playerId = ws.playerId;
  if (!playerId && (message.type === 'submit_answer' || message.type === 'pass_turn')) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'You have not joined the game.' } }));
    return;
  }

  switch (message.type) {
    case 'player_join':
      const { id, name, avatar } = message.payload as PlayerJoinPayload;
      const player = handlePlayerJoin({ id, name, avatar });
      if (player) {
        ws.playerId = player.id; // Associate player ID with this connection
        ws.playerName = player.name; // Also store the player name
        // Send a confirmation back to the joining player with their details
        ws.send(JSON.stringify({ type: 'player_joined', payload: player }));
      } else {
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Failed to join game. Game may be full or name already taken.' } }));
      }
      break;

    case 'admin_start_game':
      const { password: startPassword } = message.payload as AdminActionPayload;
      if (!handleAdminStartGame(startPassword)) {
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid password or game state.' } }));
      }
      break;

    case 'admin_reset_game':
        const { password: resetPassword } = message.payload as AdminActionPayload;
        if (!handleAdminResetGame(resetPassword)) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid password.' } }));
        }
        break;

    case 'submit_answer':
      const { answerIndex } = message.payload as SubmitAnswerPayload;
      handleSubmitAnswer(playerId!, answerIndex);
      break;

    case 'pass_turn':
      handlePassTurn(playerId!);
      break;

    default:
      console.log(`Unknown message type: ${message.type}`);
      ws.send(JSON.stringify({ type: 'error', payload: { message: `Unknown message type: ${message.type}` } }));
  }
}
