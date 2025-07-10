# Frontend Development Plan

This plan outlines the steps to build the React frontend for the Smart10 game, consuming the WebSocket API from the backend.

**Phase 1: Project Setup & Core Services**
*   [x] **Use Shared Types:** Import and use the shared TypeScript interfaces (`GameState`, `Player`, etc.) from the `@/common/types` directory. This avoids duplication and ensures consistency between the frontend and backend.
*   [x] **WebSocket Service:** Create a `src/services/socketService.ts` module. This service will be responsible for:
    *   Establishing and maintaining the WebSocket connection.
    *   Sending messages to the server.
    *   Receiving messages from the server.
*   [x] **Global State Management (Zustand):** Set up Zustand to create a global store for the `GameState` received from the server. This will allow any component in the app to react to real-time updates.
    *   The WebSocket service will update this global store upon receiving a `game_state_update` message.

**Phase 2: Component Scaffolding (with shadcn/ui)**
*   [x] **Create Component Files:** Based on the `PLAN.md`, create the following presentational components in `src/components`. Utilize `shadcn/ui` components (e.g., Button, Input, Card) where appropriate.
    *   `Header.tsx`: To display game status, round number, and the timer.
    *   `PlayerList.tsx`: To display the list of players and their scores.
    *   `QuestionDisplay.tsx`: To show the current question and its category/difficulty.
    *   `AnswerOptions.tsx`: To display the 10 answer options as a clickable list/grid.
    *   `AdminPanel.tsx`: A component with a password input and buttons for "Start Game" and "Reset Game".
    *   `Scoreboard.tsx`: To show the main leaderboard.

**Phase 3: Page Views & State-Driven Rendering**
*   [ ] **Create Page Components:** Create higher-level components in a `src/pages` or `src/views` directory that compose the smaller components.
    *   `LobbyView.tsx`: Shown when `gameState.status === 'Waiting'`. Will include a form for the player to join and the `AdminPanel`.
    *   `GameView.tsx`: Shown when `gameState.status === 'Answering'`. Will include the `Header`, `QuestionDisplay`, and `AnswerOptions`.
    *   `ResultsView.tsx`: Shown when `gameState.status === 'Results'`. Will show the results of the round, highlighting correct answers and displaying `roundScore`.
    *   `FinishedView.tsx`: Shown when `gameState.status === 'Finished'`. Displays the final winner and scores.
*   [ ] **Implement Conditional Rendering:** In `App.tsx`, read the `gameState.status` from the global store and render the appropriate page view (`LobbyView`, `GameView`, etc.).

**Phase 4: Interactivity & API Integration**
*   [ ] **Implement Player Actions:**
    *   Wire up the "Join Game" form in `LobbyView` to call the `socketService` to send a `player_join` message.
    *   In `GameView`, manage the state of selected answers and wire up the "Submit" button to send a `submit_answer` message.
*   [ ] **Implement Admin Actions:**
    *   Wire up the buttons in `AdminPanel` to send `admin_start_game` and `admin_reset_game` messages.
*   [ ] **Implement Timer:** In the `Header` component, create a visual countdown timer that syncs with the `gameState.timer` value.

**Phase 5: Styling & UX Refinements**
*   [ ] **Apply Styling (with shadcn/ui & Tailwind CSS):** Style all components using Tailwind CSS and `shadcn/ui` to ensure the UI is clear, responsive, and visually appealing.
*   [ ] **Visual Feedback:** Add visual cues for user actions, such as:
    *   Disabling the "Submit" button after answers have been sent.
    *   Highlighting selected answers.
    *   Showing loading/connecting states.
*   [ ] **Responsive Design:** Ensure the layout works well on mobile, tablet, and desktop screens.
