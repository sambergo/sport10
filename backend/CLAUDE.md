# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `pnpm install`
- **Development server**: `pnpm dev` (runs with nodemon + ts-node on port 3001)
- **Production build**: `pnpm build` (compiles TypeScript to dist/)
- **Start production**: `pnpm start` (runs ts-node directly)

## Architecture Overview

This is a real-time multiplayer trivia game backend built with Node.js, TypeScript, Express, and WebSockets.

### Core Components

- **`src/index.ts`** - Entry point, sets up Express server and WebSocket server
- **`src/game.ts`** - Central game state management (singleton pattern)
- **`src/websocket.ts`** - WebSocket connection handling and message routing
- **`src/services/gameService.ts`** - Core game logic, turn management, and player actions
- **`src/config.ts`** - Game configuration (admin password, scoring, limits)
- **`src/data/questions.ts`** - Question bank for trivia questions

### Game Flow

1. Players connect via WebSocket and join during 'Waiting' state
2. Admin starts game with password, transitions to 'Answering' state
3. Turn-based gameplay where active player submits answers or passes
4. Round ends when all options revealed or all players out/passed
5. Scoring calculated, game transitions to 'Results' state
6. New rounds start automatically until win condition (5 points) reached

### Key State Management

- **Game State**: Singleton object in `game.ts` tracks current game status
- **Player State**: Each player has round-specific and overall scoring
- **Turn Management**: Sequential turn passing with skip logic for inactive players
- **WebSocket Broadcasting**: All clients receive game state updates on changes

### Message Protocol

All WebSocket messages follow `{type: string, payload: object}` format. See API.md for complete message specifications.

### Configuration

Admin password and game settings are in `src/config.ts`. Default admin password is 'pw'.