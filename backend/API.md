# Smart 10 - WebSocket API

This document outlines the WebSocket communication protocol for the Smart 10 game.

## Connection

Clients connect to the server via a WebSocket connection. Upon successful connection, the server immediately sends a `game_state_update` message.

## Message Format

All messages exchanged between client and server are JSON objects with two properties:
- `type`: A string identifying the message type (e.g., `'player_join'`).
- `payload`: An object containing the data for that message type.

```json
{
  "type": "message_type",
  "payload": {
    "key": "value"
  }
}
```

---

## Client-to-Server Messages (Actions)

### `player_join`
- **Direction**: Client -> Server
- **Description**: A player requests to join the game.
- **Payload**:
  ```json
  {
    "name": "PlayerName"
  }
  ```

### `submit_answer`
- **Direction**: Client -> Server
- **Description**: The active player submits a single answer for the current question.
- **Payload**:
  ```json
  {
    "answerIndex": 2
  }
  ```

### `pass_turn`
- **Direction**: Client -> Server
- **Description**: The active player chooses to pass their turn for the current round.
- **Payload**: `{}` (Empty)

### `admin_start_game`
- **Direction**: Client -> Server
- **Description**: An admin requests to start the game. Requires the correct password.
- **Payload**:
  ```json
  {
    "password": "your_admin_password"
  }
  ```

### `admin_reset_game`
- **Direction**: Client -> Server
- **Description**: An admin requests to reset the entire game state. Requires the correct password.
- **Payload**:
  ```json
  {
    "password": "your_admin_password"
  }
  ```

---

## Server-to-Client Messages (Events)

### `game_state_update`
- **Direction**: Server -> Client
- **Description**: The primary message for synchronizing the game state. Sent whenever any change occurs (player joins, round starts, scores update, etc.).
- **Payload**: The entire `GameState` object.

#### `GameState` Object
```typescript
interface GameState {
  status: 'Waiting' | 'Answering' | 'Results' | 'Finished';
  players: Player[];
  currentQuestion: Question | null;
  currentRound: number;
  timer: number; // Note: May be deprecated or repurposed in turn-based model
  activePlayerId: string | null; // ID of the player whose turn it is
}
```

#### `Player` Object
```typescript
interface Player {
  id: string;
  name: string;
  score: number;
  roundStatus: 'in_round' | 'passed' | 'out'; // Player's status in the current round
  lastAnswerCorrect: boolean | null; // Feedback on the last submitted answer
  timeoutCount: number;
  roundAnswers: number[]; // Indices of correct answers given this round
  roundScore: number;
}
```

#### `Question` Object
```typescript
interface Question {
  id: number;
  question: string;
  options: AnswerOption[];
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
```

#### `AnswerOption` Object
```typescript
interface AnswerOption {
  text: string;
  isCorrect: boolean; // This is hidden from clients during the 'Answering' phase
}
```

### `error`
- **Direction**: Server -> Client
- **Description**: Sent when a client action results in an error.
- **Payload**:
  ```json
  {
    "message": "A descriptive error message."
  }
  ```
