# Turn-Based Gameplay Refactor Plan

This document outlines the necessary changes to transition the game from a simultaneous-answer model to a turn-based system, as per the core "Smart 10" rules.

## Backend Overhaul

### 1. Update Shared Types (`common/types/game.ts`)
- [ ] Add `activePlayerId: string | null` to the `GameState` interface to track whose turn it is.
- [ ] Add a `roundStatus: 'in_round' | 'passed' | 'out'` field to the `Player` interface. This will replace the `isInactive` flag.
- [ ] Add a `lastAnswerCorrect: boolean | null` to the `Player` interface to give feedback on the last action.

### 2. Refactor Backend Game Logic (`backend/src/services/gameService.ts`)
- [ ] **Turn Management:**
    - [ ] Implement a function to advance `activePlayerId` to the next player who is still `'in_round'`.
    - [ ] This function should be called after a correct answer, an incorrect answer, or a pass.
- [ ] **New `pass_turn` Action:**
    - [ ] Create a new handler for a `pass_turn` message from a client.
    - [ ] It should only be processed if it's from the `activePlayerId`.
    - [ ] The player's `roundStatus` will be set to `'passed'`.
    - [ ] The turn will then advance to the next player.
- [ ] **Rework `submit_answer` Action:**
    - [ ] Modify the handler to accept a single `answerIndex` instead of an array.
    - [ ] It should only be processed if it's from the `activePlayerId`.
    - [ ] **On Correct Answer:**
        - [ ] Increment the player's `roundScore`.
        - [ ] The turn remains with the current player, allowing them to answer again.
    - [ ] **On Incorrect Answer:**
        - [ ] Reset the player's `roundScore` to 0.
        - [ ] Set the player's `roundStatus` to `'out'`.
        - [ ] The turn advances to the next player.
- [ ] **Round Lifecycle:**
    - [ ] The round should end when all players are either `'passed'` or `'out'`, or when all correct answers have been revealed.
    - [ ] At the end of the round, update the main `score` for each player based on their `roundScore`.
    - [ ] Reset `roundStatus` for all players to `'in_round'` for the next round.

### 3. Update Backend API (`backend/src/websocket.ts` and `API.md`)
- [ ] Add a new message handler in `websocket.ts` for the `pass_turn` action.
- [ ] Modify the `submit_answer` message payload to accept `{ answerIndex: number }`.
- [ ] Update `API.md` to document the new `pass_turn` message, the updated `submit_answer` payload, and the changes to the `GameState` object.

## Frontend Overhaul

### 1. Update UI Components
- [ ] **`AnswerOptions.tsx`:**
    - [ ] Modify the component to only allow the `activePlayerId` to click on answer buttons.
    - [ ] The submit logic will now send a single answer index.
- [ ] **Create `GameActions.tsx` component:**
    - [ ] Create a new component to hold game action buttons.
    - [ ] Add a "Pass Turn" button. This button should only be visible and enabled for the `activePlayerId`.
    - [ ] This component will be rendered in `GameView.tsx`.
- [ ] **`PlayerList.tsx`:**
    - [ ] Update the player list to visually indicate the `activePlayerId` (e.g., with a highlight or icon).
    - [ ] Display the `roundStatus` for each player (e.g., 'Passed', 'Out').

### 2. Update State and Services
- [ ] **`gameStore.ts`:**
    - [ ] Ensure the store correctly handles the new `activePlayerId` and `roundStatus` fields from the `game_state_update` message.
- [ ] **`socketService.ts`:**
    - [ ] Add a `passTurn()` method to send the `pass_turn` message.
    - [ ] Update the `submitAnswer()` method to send the new single-index payload.

### 3. Update Views
- [ ] **`GameView.tsx`:**
    - [ ] Integrate the new `GameActions.tsx` component.
    - [ ] Ensure the view correctly reflects the turn-based state, disabling/enabling UI elements based on whether it is the current user's turn.
