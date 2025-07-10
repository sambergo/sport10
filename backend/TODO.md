# Backend Development Plan

Here is a proposed to-do list for building the Smart10 game backend:

**Phase 1: Core Game Logic & State Management (In-Memory)**

- [x] **Define Core Data Structures:** Create TypeScript interfaces for `GameState`, `Player`, and `Question`.
- [x] **Game Singleton:** Implement a single, in-memory `GameState` object that holds all current game data (players, scores, current question, etc.).
- [x] **State Machine:** Create a simple state machine to manage the game's flow: `Waiting` -> `Answering` -> `Results` -> `Finished`.
- [x] **Dummy Data:** Create a mock `questions.ts` file with an array of sample questions to use for initial development.

**Phase 2: WebSocket Implementation**

- [x] **Define Message Contracts:** Create TypeScript interfaces for all WebSocket message types (e.g., `PlayerJoin`, `SubmitAnswer`, `AdminStartGame`).
- [x] **Central Message Handler:** Implement a router that processes incoming WebSocket messages and calls the appropriate game logic function based on the message type.
- [x] **Broadcast Function:** Create a utility function to broadcast the updated `GameState` to all connected clients whenever a change occurs.

**Phase 3: Player & Admin Actions**

- [x] **Player Joins:** Implement the logic for a new player to join the game.
- [x] **Admin Starts Game:** Implement the `startGame` function, protected by a simple hardcoded password for now.
- [x] **Submit Answers:** Allow players to submit their answers for the current round.
- [x] **Round & Scoring Logic:** Implement the core game loop:
  - Start a round with a new question.
  - Set a timer for the answering phase.
  - When the timer ends, calculate scores for the round.
  - Update the leaderboard and check for a winner.

**Phase 4: Database Integration with SQLite**

- [ ] **Setup SQLite:** Add and configure `sqlite3` and `sqlite` packages.
- [ ] **Database Service:** Create a `database.ts` module to handle all database connections and queries.
- [ ] **Define Schema:** Create the necessary tables: `questions`, `categories`, etc.
- [ ] **Seed Database:** Write a script to populate the database with initial question data.
- [ ] **Integrate Questions:** Modify the game logic to fetch random questions from the database instead of the mock file.

**Phase 5: Refinement & Edge Cases**

- [ ] **Configuration File:** Move settings like win score, timers, and the admin password to a `config.ts` file.
- [ ] **Connection Handling:** Implement logic to gracefully handle player disconnections and reconnections.
- [ ] **Inactive Player Logic:** Add the mechanism to track and skip inactive players after consecutive timeouts.
- [ ] **REST Endpoints:** Create the supporting HTTP endpoints (`GET /game`, `POST /reset`) as specified in the plan.
