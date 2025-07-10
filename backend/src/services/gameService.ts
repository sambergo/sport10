// src/services/gameService.ts
import { gameState, updateGameState, resetGame as resetGameState } from '../game';
import { Player, GameStatus, Question } from '@/common/types/game';
import { broadcastGameState } from '../websocket';
import { config } from '../config';
import { dummyQuestions } from '../data/questions';
import { v4 as uuidv4 } from 'uuid';

let gameTimer: NodeJS.Timeout | null = null;

// --- Player Actions ---

export function handlePlayerJoin(name: string): Player | null {
  if (gameState.status !== 'Waiting' || gameState.players.length >= config.playerLimit) {
    return null; // Game in progress or full
  }

  const newPlayer: Player = {
    id: uuidv4(),
    name,
    score: 0,
    isInactive: false,
    timeoutCount: 0,
    roundAnswers: [],
    roundScore: 0,
  };

  updateGameState({ players: [...gameState.players, newPlayer] });
  broadcastGameState();
  console.log(`Player ${name} joined the game.`);
  return newPlayer;
}

export function handleSubmitAnswer(playerId: string, answerIndices: number[]): boolean {
    if (gameState.status !== 'Answering') return false;

    const player = gameState.players.find(p => p.id === playerId);
    if (!player || player.roundAnswers.length > 0) { // Prevent answering twice
        return false;
    }

    player.roundAnswers = answerIndices;
    // Optional: Broadcast that a player has answered, but for now we wait for the round end.
    console.log(`Player ${player.name} submitted ${answerIndices.length} answers.`);
    // A full broadcast will happen when the round ends.
    return true;
}


// --- Admin Actions ---

export function handleAdminStartGame(password: string): boolean {
  if (password !== config.adminPassword) {
    console.log('Admin action failed: Invalid password.');
    return false;
  }
  if (gameState.status !== 'Waiting' || gameState.players.length < 2) {
    console.log('Admin action failed: Game already in progress or not enough players.');
    return false;
  }

  startNewRound();
  console.log('Admin started the game.');
  return true;
}

export function handleAdminResetGame(password: string): boolean {
    if (password !== config.adminPassword) {
      console.log('Admin action failed: Invalid password.');
      return false;
    }
    if (gameTimer) clearTimeout(gameTimer);
    resetGameState();
    broadcastGameState();
    return true;
}

// --- Game Loop & Scoring ---

function startNewRound() {
    // Select a random question that hasn't been played yet
    const question = selectNewQuestion();
    if (!question) {
        endGame('No more questions!');
        return;
    }

    updateGameState({
        status: 'Answering',
        currentQuestion: question,
        currentRound: gameState.currentRound + 1,
        timer: config.timeLimitSeconds,
        players: gameState.players.map(p => ({ ...p, roundAnswers: [], roundScore: 0 })) // Reset round data
    });

    broadcastGameState();

    // Start the timer
    if (gameTimer) clearTimeout(gameTimer);
    gameTimer = setTimeout(endRound, config.timeLimitSeconds * 1000);
}

function endRound() {
    if (gameState.status !== 'Answering') return;

    console.log(`Round ${gameState.currentRound} ended. Calculating scores.`);
    const { players, currentQuestion } = gameState;

    if (!currentQuestion) {
        endGame("Critical error: Question missing.");
        return;
    }

    // Calculate scores
    const updatedPlayers = players.map(player => {
        let roundScore = 0;
        let correctStreak = true;
        for (const answerIndex of player.roundAnswers) {
            if (!currentQuestion.options[answerIndex]?.isCorrect) {
                correctStreak = false;
                break;
            }
        }

        if (correctStreak) {
            roundScore = player.roundAnswers.length;
        }

        return {
            ...player,
            roundScore,
            score: player.score + roundScore,
        };
    });

    updateGameState({ status: 'Results', players: updatedPlayers });
    broadcastGameState();

    // Check for a winner
    const winner = updatedPlayers.find(p => p.score >= config.winScore);
    if (winner) {
        setTimeout(() => endGame(`${winner.name} wins!`), 5000); // 5s for results
    } else {
        setTimeout(startNewRound, 5000); // 5s for results before next round
    }
}

function endGame(reason: string) {
    console.log(`Game ended: ${reason}`);
    if (gameTimer) clearTimeout(gameTimer);
    updateGameState({ status: 'Finished' });
    broadcastGameState();
}

function selectNewQuestion(): Question | null {
    // For now, just pick a random one. A real implementation would avoid repeats.
    const questionIndex = Math.floor(Math.random() * dummyQuestions.length);
    return dummyQuestions[questionIndex];
}
