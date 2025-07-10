# Smart10 Game - Development Instructions

## Game Overview

Build a Smart10 trivia game webapp where 2-8 players compete to find correct answers from a list of 10 options. Only one game runs on the server at a time, with admin password protection for game management.

## Core Game Mechanics

### Smart10 Rules

- Each question presents 10 possible answers
- Multiple answers are correct (typically 3-7 out of 10)
- Players take turns selecting answers they think are correct
- **Scoring**: +1 point for each correct answer
- **Risk/Reward**: Wrong answer = lose ALL points earned in that round (previous rounds' points remain safe)
- **Strategy**: Players must decide when to pass vs. continue answering (high risk, high reward)
- **Winning**: First player to reach 30 points wins
- **Alternative Mode**: Play for set time, highest score wins

### Game Flow

1. **Admin Setup**: Admin enters password to start/manage game
2. **Player Join**: 2-8 players join with their names
3. **Question Phase**: Display question with 10 answer options
4. **Answer Phase**: Players select answers (30-60 second timer)
5. **Results Phase**: Reveal correct answers, show individual scores
6. **Leaderboard**: Display current standings and progress toward 30 points
7. **Next Round**: Continue until a player reaches 30 points
8. **Final Results**: Show winner and final scores

## Required Features

### Game Management

- **Single Game Instance**: Only one game runs at a time on server
- **Admin Password**: Required to start/reset/manage games
- **Game States**: Waiting → Starting → Question → Answering → Results → Final
- **Auto-progression**: Game automatically moves through phases

### Player Management

- **Join System**: Players enter name to join active game
- **Player Limit**: 2-8 players maximum
- **Connection Status**: Track if players are connected/disconnected
- **Reconnection**: Players can rejoin if disconnected
- **Timeout Tracking**: Track consecutive timeouts per player
- **Inactive Handling**: Mark players inactive after 2 consecutive timeouts
- **Turn Skipping**: Skip turns for inactive players to keep game flowing
- **Reactivation**: Players can rejoin by submitting answers when they return

### Question System

- **Question Database**: Store questions with 10 options + correct answers
- **Categories**: Group questions by topic (History, Science, Sports, etc.)
- **Difficulty Levels**: Easy, Medium, Hard questions
- **Random Selection**: Pull questions randomly from database
- **Answer Validation**: Server-side validation of correct answers

### Real-time Features

- **Live Updates**: All players see game state changes instantly
- **Timer Sync**: Synchronized countdown timer for all players
- **Live Scoring**: Scores update in real-time
- **Player Actions**: See when players submit answers

### UI/UX Requirements

- **Responsive Design**: Works on desktop, tablet, mobile
- **Clear Question Display**: Easy to read question and options
- **Answer Selection**: Intuitive interface for selecting multiple answers
- **Timer Display**: Prominent countdown timer
- **Score Display**: Current scores and leaderboard
- **Game Status**: Clear indication of current game phase

## Technical Requirements

### Frontend Components Needed

- **Landing Page**: Game join interface
- **Admin Panel**: Game management with password protection
- **Game Board**: Main game interface with question/answers
- **Player List**: Show all players and their status
- **Score Board**: Current standings and final results
- **Timer Component**: Visual countdown timer

### Backend API Endpoints

- **Game State**: Get current game status
- **Start Game**: Admin starts new game
- **Join Game**: Player joins active game
- **Submit Answers**: Player submits their answer choices
- **Reset Game**: Admin resets game state
- **Get Questions**: Fetch questions from database

### Data Storage

- **Database**: SQLite (perfect for single Docker container deployment)
- **Game State**: Current game status, timer, question index, win condition
- **Player Data**: Names, scores, connection status, answers, timeout count
- **Question Bank**: Questions with options and correct answers
- **Game History**: Optional logging of completed games

### Real-time Communication

- **WebSocket Connection**: Real-time updates for all players
- **Game State Broadcasting**: Push updates to all connected clients
- **Player Status Updates**: Handle connections/disconnections
- **Timer Synchronization**: Keep all clients in sync

## Game Configuration Options

### Admin Settings

- **Win Condition**: Score-based (30 points) or time-based mode
- **Winning Score**: Points needed to win (default: 30)
- **Time Limit**: Seconds per question (default: 45)
- **Player Limit**: Maximum players (default: 8)
- **Timeout Limit**: Consecutive timeouts before marking inactive (default: 2)
- **Category Selection**: Which question categories to include

### Question Management

- **Import Questions**: Ability to add new questions
- **Question Categories**: Organize by topic
- **Difficulty Balance**: Mix of easy/medium/hard questions
- **Answer Distribution**: Ensure variety in number of correct answers

## Edge Cases to Handle

### Connection Issues

- **Player Disconnection**: Handle mid-game disconnects
- **Reconnection**: Allow players to rejoin active games
- **Admin Disconnection**: Graceful handling of admin leaving
- **Timeout Management**: Track consecutive timeouts and mark inactive players
- **Inactive Player Handling**: Skip turns for inactive players, allow reactivation

### Game State Issues

- **Timer Expiry**: Auto-advance when time runs out
- **All Players Left**: Handle empty game scenarios
- **Duplicate Names**: Prevent or handle duplicate player names
- **Game Interruption**: Recovery from server restarts

### Answer Submission

- **Late Submissions**: Handle answers after timer expires
- **No Answers**: Handle players who don't submit answers
- **Invalid Answers**: Validate answer selections server-side

## Success Criteria

- ✅ 2-8 players can join and play simultaneously
- ✅ Real-time updates work smoothly for all players
- ✅ Admin can control game flow with password
- ✅ Scoring system works correctly
- ✅ Game handles disconnections gracefully
- ✅ Questions display properly on all devices
- ✅ Timer synchronization across all clients
- ✅ Final scores and winner determination work correctly
