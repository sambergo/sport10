# Smart10 Backend WebSocket API

This document outlines how to communicate with the Smart10 game server.

## Connecting

Connect to the WebSocket server at the following endpoint:

```
ws://localhost:3000
```

## Communication Protocol

All communication is done via JSON objects. Every message, both from the client and the server, follows this structure:

```json
{
  "type": "message_type_string",
  "payload": { ... }
}
```

---

## Server-to-Client Messages

These are the messages the server will send to you.

### `game_state_update`

This is the primary message from the server. It is sent whenever the game's state changes (e.g., a player joins, a round starts, scores are updated). Your client should listen for this message and re-render its UI based on the new state provided in the payload.

**Payload:** The entire `GameState` object.

```ts
// The structure of the GameState payload
interface GameState {
  status: 'Waiting' | 'Answering' | 'Results' | 'Finished';
  players: {
    id: string;
    name: string;
    score: number;
    isInactive: boolean;
    // In the 'Results' phase, this shows the score gained in the last round.
    roundScore: number;
  }[];
  currentQuestion: {
    id: number;
    question: string;
    // IMPORTANT: For clients, the `isCorrect` property will always be `false`
    // during the 'Answering' phase to hide the answers.
    // The correct answers are revealed during the 'Results' phase.
    options: {
      text: string;
      isCorrect: boolean;
    }[];
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  } | null;
  currentRound: number;
  timer: number; // Countdown timer for the 'Answering' phase
}
```

### `error`

Sent when the client sends an invalid message or performs an invalid action.

**Payload:**

```json
{
  "message": "A description of what went wrong."
}
```

---

## Client-to-Server Messages

These are the messages you can send to the server.

### `player_join`

Used to join the game before it has started.

**Payload:**

```json
{
  "type": "player_join",
  "payload": {
    "name": "YourPlayerName"
  }
}
```

### `admin_start_game`

Starts the game. Requires the admin password. Can only be called when the game `status` is `Waiting` and there are at least 2 players.

**Payload:**

```json
{
  "type": "admin_start_game",
  "payload": {
    "password": "smart10-password"
  }
}
```

### `admin_reset_game`

Resets the entire game state back to `Waiting`. Requires the admin password.

**Payload:**

```json
{
  "type": "admin_reset_game",
  "payload": {
    "password": "smart10-password"
  }
}
```

### `submit_answer`

Submits the player's answers for the current round. Can only be sent when the game `status` is `Answering`.

**Payload:**

```json
{
  "type": "submit_answer",
  "payload": {
    "answerIndices": [1, 4, 8] // Array of indices of the selected options
  }
}
```

## Typical Game Flow

1.  **Connect:** Client establishes a WebSocket connection.
2.  **Receive Initial State:** Server immediately sends a `game_state_update` with the current game state (likely `status: 'Waiting'`).
3.  **Join Game:** Client sends a `player_join` message.
4.  **Wait for Start:** All clients receive a new `game_state_update` showing the new player in the list. Players wait until an admin starts the game.
5.  **Game Starts:** An admin sends `admin_start_game`. The server broadcasts a `game_state_update` to all clients:
    *   `status` is now `'Answering'`.
    *   `currentQuestion` is populated.
    *   `timer` is set.
6.  **Submit Answers:** During the `'Answering'` phase, each client sends a `submit_answer` message.
7.  **Round Ends:** When the timer expires, the server calculates scores and sends a `game_state_update`:
    *   `status` is now `'Results'`.
    *   The `isCorrect` property on the `currentQuestion` options is now correctly populated, revealing the answers.
    *   Each player's `roundScore` is updated.
    *   Each player's total `score` is updated.
8.  **Next Round:** After a few seconds, the server automatically starts the next round by sending a new `game_state_update` with `status: 'Answering'` and a new question.
9.  **Game Finishes:** The loop continues until a player's score reaches the win condition. The server sends a final `game_state_update` with `status: 'Finished'`.
