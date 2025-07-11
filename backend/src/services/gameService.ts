// src/services/gameService.ts
import { gameState, updateGameState, resetGame as resetGameState } from '../game';
import { Player, GameStatus, Question, QuestionTemplate } from '@/common/types/game';
import { broadcastGameState, broadcastPlayerUpdates } from '../websocket';
import { config } from '../config';
// import { dummyQuestions } from '../data/questions'; // Removed: No longer needed
import { getRandomQuestion } from '../database'; // New import
import { v4 as uuidv4 } from 'uuid';

let gameLoopTimeout: NodeJS.Timeout | null = null;
let turnTimer: NodeJS.Timeout | null = null;
let timerInterval: NodeJS.Timeout | null = null;

// Track players who want to rejoin the next game
let nextGamePlayers: string[] = [];

// --- Timer Management ---

function startTurnTimer() {
    clearTurnTimer();
    
    // Set timer to config value
    updateGameState({ timer: config.timeLimitSeconds });
    broadcastGameState();
    
    // Start countdown interval
    timerInterval = setInterval(() => {
        const newTimer = gameState.timer - 1;
        updateGameState({ timer: newTimer });
        broadcastGameState();
        
        if (newTimer <= 0) {
            handleTimeExpired();
        }
    }, 1000);
    
    // Set timeout for when time expires
    turnTimer = setTimeout(() => {
        handleTimeExpired();
    }, config.timeLimitSeconds * 1000);
}

function clearTurnTimer() {
    if (turnTimer) {
        clearTimeout(turnTimer);
        turnTimer = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleTimeExpired() {
    clearTurnTimer();
    
    if (gameState.status !== 'Answering' || !gameState.activePlayerId) {
        return;
    }
    
    const player = gameState.players.find(p => p.id === gameState.activePlayerId);
    if (!player) return;
    
    // Increment timeout count
    player.timeoutCount++;
    console.log(`Player ${player.name} timed out. Timeout count: ${player.timeoutCount}`);
    
    // If player has exceeded inactive timeout limit, mark them as out
    if (player.timeoutCount >= config.inactiveTimeout) {
        player.roundStatus = 'out';
        console.log(`Player ${player.name} marked as out due to inactivity.`);
    } else {
        player.roundStatus = 'passed';
        console.log(`Player ${player.name} passed due to timeout.`);
    }
    
    advanceTurn();
}

// --- Turn & Round Management ---

function advanceTurn() {
    const { players, activePlayerId } = gameState;
    const activeIndex = players.findIndex(p => p.id === activePlayerId);

    // Find the next player who is still in the round
    let nextPlayerIndex = (activeIndex + 1) % players.length;
    while (players[nextPlayerIndex].roundStatus !== 'in_round' && nextPlayerIndex !== activeIndex) {
        nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }

    // If we've looped back to the start, everyone is passed or out
    if (players[nextPlayerIndex].roundStatus !== 'in_round') {
        endRound();
    } else {
        updateGameState({ activePlayerId: players[nextPlayerIndex].id });
        startTurnTimer();
        broadcastGameState();
    }
}

function endRound() {
    if (gameState.status !== 'Answering') return;

    clearTurnTimer();
    console.log(`Round ${gameState.currentRound} ended. Calculating scores.`);
    const { players } = gameState;

    // Update main scores from round scores
    const updatedPlayers = players.map(player => ({
        ...player,
        score: player.score + player.roundScore,
    }));

    updateGameState({ status: 'Results', players: updatedPlayers, activePlayerId: null });
    broadcastGameState();

    // Check for a winner
    const winner = updatedPlayers.find(p => p.score >= config.winScore);
    if (winner) {
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        gameLoopTimeout = setTimeout(() => endGame(`${winner.name} wins!`), 5000);
    } else if (gameState.currentRound >= config.maxRounds) {
        // Game ends when max rounds reached
        const topScore = Math.max(...updatedPlayers.map(p => p.score));
        const winners = updatedPlayers.filter(p => p.score === topScore);
        const winnerMessage = winners.length === 1 
            ? `${winners[0].name} wins!` 
            : `Tie between ${winners.map(p => p.name).join(', ')}!`;
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        gameLoopTimeout = setTimeout(() => endGame(`Max rounds reached! ${winnerMessage}`), 5000);
    } else {
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        gameLoopTimeout = setTimeout(startNewRound, 5000); // 5s for results before next round
    }
}

async function startNewRound() { // Made async to await DB fetch
    const questionTemplate = await getRandomQuestion(); // Updated to fetch from DB
    if (!questionTemplate) {
        endGame('No more questions!');
        return;
    }

    // Add the dynamic state for the round to the question
    const question: Question = {
        ...questionTemplate,
        revealedIncorrectAnswers: [],
    };

    // Reset player round status and scores
    const resetPlayers = gameState.players.map(p => ({
        ...p,
        roundStatus: 'in_round' as const,
        roundScore: 0,
        roundAnswers: [],
        lastAnswerCorrect: null,
    }));

    const firstPlayerId = resetPlayers[0]?.id || null;
    console.log(`Setting active player to: ${firstPlayerId}, resetPlayers[0]: ${JSON.stringify(resetPlayers[0])}`);

    updateGameState({
        status: 'Answering',
        currentQuestion: question,
        currentRound: gameState.currentRound + 1,
        players: resetPlayers,
        activePlayerId: firstPlayerId,
    });

    console.log(`Round ${gameState.currentRound} started. Active player: ${gameState.activePlayerId}, Players: ${resetPlayers.map(p => p.name).join(', ')}`);
    console.log(`All player IDs: ${resetPlayers.map(p => `${p.name}:${p.id}`).join(', ')}`);

    if (resetPlayers[0]) {
        startTurnTimer();
    }
    broadcastGameState();
}

// --- Player Actions ---

export function handlePlayerJoin(name: string): Player | null {
    console.log(`Attempting to join: ${name}, current players: ${gameState.players.length}, limit: ${config.playerLimit}, status: ${gameState.status}`);
    
    // Check for duplicate names
    const existingPlayer = gameState.players.find(p => p.name === name);
    
    // Special handling for "Finished" status - allow queuing for next game
    if (gameState.status === 'Finished') {
        if (existingPlayer && !nextGamePlayers.includes(name)) {
            nextGamePlayers.push(name);
            console.log(`Player ${name} queued for next game. Queue: [${nextGamePlayers.join(', ')}]`);
            return existingPlayer;
        } else if (!existingPlayer) {
            // New player wanting to join next game
            nextGamePlayers.push(name);
            console.log(`New player ${name} queued for next game. Queue: [${nextGamePlayers.join(', ')}]`);
            // Create a temporary player object for the frontend
            const tempPlayer: Player = {
                id: uuidv4(),
                name,
                score: 0,
                roundStatus: 'in_round',
                lastAnswerCorrect: null,
                timeoutCount: 0,
                roundAnswers: [],
                roundScore: 0,
            };
            return tempPlayer;
        }
        return existingPlayer; // Already queued
    }
    
    if (gameState.players.length >= config.playerLimit) {
        console.log('Join failed: player limit reached');
        return null;
    }

    if (existingPlayer) {
        console.log(`Join failed: player with name ${name} already exists`);
        return null;
    }

    const newPlayer: Player = {
        id: uuidv4(),
        name,
        score: 0,
        roundStatus: gameState.status === 'Answering' ? 'in_round' : 'in_round',
        lastAnswerCorrect: null,
        timeoutCount: 0,
        roundAnswers: [],
        roundScore: 0,
    };

    updateGameState({ players: [...gameState.players, newPlayer] });
    broadcastGameState();
    console.log(`Player ${name} joined the game successfully. New player count: ${gameState.players.length}`);
    
    // Auto-start game if this is the first or second player and game is waiting
    if (gameState.status === 'Waiting' && gameState.players.length >= 1) {
        console.log('Auto-starting game...');
        setTimeout(() => autoStartGame(), 2000); // 2 second delay for more players to join
    }
    
    return newPlayer;
}

export function handleSubmitAnswer(playerId: string, answerIndex: number): boolean {
    if (gameState.status !== 'Answering' || gameState.activePlayerId !== playerId) {
        return false;
    }

    const player = gameState.players.find(p => p.id === playerId);
    const question = gameState.currentQuestion;
    if (!player || !question) return false;

    clearTurnTimer();

    const isCorrect = question.options[answerIndex]?.isCorrect === true;
    player.lastAnswerCorrect = isCorrect;

    if (isCorrect) {
        player.roundScore += 1;
        player.roundAnswers.push(answerIndex);
        console.log(`Player ${player.name} answered correctly.`);
    } else {
        player.roundScore = 0;
        player.roundStatus = 'out';
        question.revealedIncorrectAnswers.push(answerIndex);
        console.log(`Player ${player.name} answered incorrectly and is out of the round.`);
    }

    // --- Check for Round End Conditions ---
    const revealedCorrectAnswers = gameState.players.flatMap(p => p.roundAnswers);
    const totalRevealedAnswers = revealedCorrectAnswers.length + question.revealedIncorrectAnswers.length;
    const allOptionsRevealed = totalRevealedAnswers === question.options.length;

    if (allOptionsRevealed) {
        endRound();
    } else {
        advanceTurn();
    }

    return true;
}

export function handlePassTurn(playerId: string): boolean {
    if (gameState.status !== 'Answering' || gameState.activePlayerId !== playerId) {
        return false;
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return false;

    clearTurnTimer();

    player.roundStatus = 'passed';
    console.log(`Player ${player.name} passed their turn.`);
    advanceTurn();
    return true;
}


// --- Admin Actions ---

// Auto-start game functionality
function autoStartGame() {
    if (gameState.status === 'Waiting' && gameState.players.length >= 1) {
        console.log(`Auto-starting game with players: ${gameState.players.map(p => `${p.name}:${p.id}`).join(', ')}`);
        startNewRound();
        console.log('Game auto-started.');
    }
}

export function handleAdminStartGame(password: string): boolean {
    if (password !== config.adminPassword) {
        console.log('Admin action failed: Invalid password.');
        return false;
    }
    if (gameState.status !== 'Waiting' || gameState.players.length < 1) {
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
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    clearTurnTimer();
    nextGamePlayers = []; // Clear the queue on manual reset
    resetGameState();
    broadcastGameState();
    return true;
}

// --- Game Loop & Scoring ---

function endGame(reason: string) {
    console.log(`Game ended: ${reason}`);
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    clearTurnTimer();
    updateGameState({ status: 'Finished', activePlayerId: null });
    broadcastGameState();
    
    // Auto-restart after 1 minute
    gameLoopTimeout = setTimeout(() => {
        console.log('Auto-restarting game after 1 minute...');
        console.log(`Queued players for next game: [${nextGamePlayers.join(', ')}]`);
        
        resetGameState();
        
        // Add queued players to the new game
        const newPlayers: Player[] = nextGamePlayers.map(name => ({
            id: uuidv4(),
            name,
            score: 0,
            roundStatus: 'in_round' as const,
            lastAnswerCorrect: null,
            timeoutCount: 0,
            roundAnswers: [],
            roundScore: 0,
        }));
        
        if (newPlayers.length > 0) {
            updateGameState({ players: newPlayers });
            console.log(`Added ${newPlayers.length} queued players to new game`);
            console.log(`New player IDs: ${newPlayers.map(p => `${p.name}:${p.id}`).join(', ')}`);
            
            // Send updated player associations to all clients
            broadcastPlayerUpdates(newPlayers);
        }
        
        // Clear the queue
        nextGamePlayers = [];
        
        broadcastGameState();
        
        // If there are players, auto-start immediately
        if (gameState.players.length >= 1) {
            setTimeout(() => autoStartGame(), 2000);
        }
    }, 60000); // 60 seconds = 1 minute
}

// Removed selectNewQuestion: Now handled directly in startNewRound via getRandomQuestion
