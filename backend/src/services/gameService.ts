/**
 * Game Service - Core game logic and state management
 * Handles player actions, game flow, and round management
 */

import { gameState, updateGameState, resetGame as resetGameState } from '../game';
import { Player, Question } from '@/common/types/game';
import { broadcastGameState, broadcastPlayerUpdates } from '../websocket';
import { config } from '../config';
import { getRandomQuestion } from '../database';
import { shuffleArray, createIndexMapping } from '../utils/arrayUtils';

// ============================================================================
// GAME STATE VARIABLES
// ============================================================================

let gameLoopTimeout: NodeJS.Timeout | null = null;
let turnTimer: NodeJS.Timeout | null = null;
let timerInterval: NodeJS.Timeout | null = null;

// Track players who want to rejoin the next game
let nextGamePlayers: { id: string; name: string; avatar: number }[] = [];

// ============================================================================
// TIMER MANAGEMENT
// ============================================================================

/**
 * Starts the turn timer for the active player
 * Sets up both a countdown interval and timeout handler
 */
function startTurnTimer(): void {
    clearTurnTimer();

    // Initialize timer to config value
    updateGameState({ timer: config.timeLimitSeconds });
    broadcastGameState();

    // Start countdown interval (updates every second)
    timerInterval = setInterval(() => {
        const remainingTime = gameState.timer - 1;
        updateGameState({ timer: remainingTime });
        broadcastGameState();

        if (remainingTime <= 0) {
            handleTimeExpired();
        }
    }, 1000);

    // Set timeout for when time expires
    turnTimer = setTimeout(() => {
        handleTimeExpired();
    }, config.timeLimitSeconds * 1000);
}

/**
 * Clears all active timers (turn timeout and countdown interval)
 */
function clearTurnTimer(): void {
    if (turnTimer) {
        clearTimeout(turnTimer);
        turnTimer = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Handles when a player's turn timer expires
 * Increments timeout count and may mark player as out if they exceed the limit
 */
function handleTimeExpired(): void {
    clearTurnTimer();

    if (gameState.status !== 'Answering' || !gameState.activePlayerId) {
        return;
    }

    const activePlayer = gameState.players.find(p => p.id === gameState.activePlayerId);
    if (!activePlayer) return;

    // Increment timeout count for tracking inactivity
    activePlayer.timeoutCount++;
    console.log(`Player ${activePlayer.name} timed out. Timeout count: ${activePlayer.timeoutCount}`);

    // Check if player has exceeded inactive timeout limit
    if (activePlayer.timeoutCount >= config.inactiveTimeout) {
        activePlayer.roundStatus = 'out';
        console.log(`Player ${activePlayer.name} marked as out due to inactivity.`);
    } else {
        activePlayer.roundStatus = 'passed';
        console.log(`Player ${activePlayer.name} passed due to timeout.`);
    }

    advanceTurn();
}

// ============================================================================
// TURN & ROUND MANAGEMENT
// ============================================================================

/**
 * Advances to the next player's turn
 * Finds the next player still in the round, or ends the round if none remain
 */
function advanceTurn(): void {
    const { players, activePlayerId } = gameState;
    const currentPlayerIndex = players.findIndex(p => p.id === activePlayerId);

    // Find the next player who is still active in the round
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    while (players[nextPlayerIndex].roundStatus !== 'in_round' && nextPlayerIndex !== currentPlayerIndex) {
        nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }

    // If we've cycled through all players and none are active, end the round
    if (players[nextPlayerIndex].roundStatus !== 'in_round') {
        endRound();
    } else {
        updateGameState({ activePlayerId: players[nextPlayerIndex].id });
        startTurnTimer();
        broadcastGameState();
    }
}

/**
 * Ends the current round and transitions to results or next round
 * Calculates final scores and checks for game-ending conditions
 */
function endRound(): void {
    if (gameState.status !== 'Answering') return;

    clearTurnTimer();
    console.log(`Round ${gameState.currentRound} ended. Calculating scores.`);
    const { players } = gameState;

    // Add round scores to main scores
    const playersWithUpdatedScores = players.map(player => ({
        ...player,
        score: player.score + player.roundScore,
    }));

    updateGameState({ status: 'Results', players: playersWithUpdatedScores, activePlayerId: null });
    broadcastGameState();

    // Check for game-ending conditions
    const winner = playersWithUpdatedScores.find(p => p.score >= config.winScore);
    if (winner) {
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        gameLoopTimeout = setTimeout(() => endGame(`${winner.name} wins!`), 5000);
    } else if (gameState.currentRound >= config.maxRounds) {
        // Handle max rounds reached
        const topScore = Math.max(...playersWithUpdatedScores.map(p => p.score));
        const topPlayers = playersWithUpdatedScores.filter(p => p.score === topScore);
        const winnerMessage = topPlayers.length === 1
            ? `${topPlayers[0].name} wins!`
            : `Tie between ${topPlayers.map(p => p.name).join(', ')}!`;
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        gameLoopTimeout = setTimeout(() => endGame(`Max rounds reached! ${winnerMessage}`), 5000);
    } else {
        // Continue to next round
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        gameLoopTimeout = setTimeout(startNewRound, 5000);
    }
}

/**
 * Starts a new round with a fresh question from the database
 * Shuffles answer options and resets player states
 */
async function startNewRound(): Promise<void> {
    const questionTemplate = await getRandomQuestion();
    if (!questionTemplate) {
        endGame('No more questions!');
        return;
    }

    // Shuffle the answer options
    const originalOptions = questionTemplate.options;
    const shuffledOptions = shuffleArray(originalOptions);

    // Create mapping from original indices to shuffled indices for answer validation
    const indexMapping = createIndexMapping(originalOptions.length, shuffledOptions, originalOptions);

    // Add the dynamic state for the round to the question
    const question: Question = {
        ...questionTemplate,
        options: shuffledOptions,
        revealedIncorrectAnswers: [],
        originalToShuffledMapping: indexMapping,
        playerAnswers: {},
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

// ============================================================================
// PLAYER ACTIONS
// ============================================================================

/**
 * Handles a player attempting to join the game
 * Validates player data and manages game state transitions
 * @param profileData - Player profile information
 * @returns The created Player object or null if join failed
 */
export function handlePlayerJoin(profileData: { id: string; name: string; avatar: number }): Player | null {
    console.log(`Attempting to join: ${profileData.name} (ID: ${profileData.id}), current players: ${gameState.players.length}, limit: ${config.playerLimit}, status: ${gameState.status}`);

    // Validate required profile data
    if (!profileData.id || !profileData.name || profileData.avatar === undefined) {
        console.log('Join failed: Invalid profile data - missing id, name, or avatar');
        return null;
    }

    // Check for duplicate names or IDs
    const existingPlayer = gameState.players.find(p => p.name === profileData.name || p.id === profileData.id);

    // Special handling for "Finished" status - allow queuing for next game
    if (gameState.status === 'Finished') {
        // Check if player is already queued
        const alreadyQueued = nextGamePlayers.find(p => p.name === profileData.name || p.id === profileData.id);

        if (alreadyQueued) {
            console.log(`Player ${profileData.name} already queued for next game`);
            if (existingPlayer) {
                return existingPlayer;
            } else {
                // Convert queued profile to Player object
                const tempPlayer: Player = {
                    id: alreadyQueued.id,
                    name: alreadyQueued.name,
                    avatar: alreadyQueued.avatar,
                    score: 0,
                    roundStatus: 'in_round',
                    lastAnswerCorrect: null,
                    timeoutCount: 0,
                    roundAnswers: [],
                    roundScore: 0,
                };
                return tempPlayer;
            }
        }

        // Add to queue
        nextGamePlayers.push(profileData);
        console.log(`Player ${profileData.name} queued for next game. Queue: [${nextGamePlayers.map(p => p.name).join(', ')}]`);

        if (existingPlayer) {
            return existingPlayer;
        } else {
            // Create a temporary player object for new players
            const tempPlayer: Player = {
                id: profileData.id,
                name: profileData.name,
                avatar: profileData.avatar,
                score: 0,
                roundStatus: 'in_round',
                lastAnswerCorrect: null,
                timeoutCount: 0,
                roundAnswers: [],
                roundScore: 0,
            };
            return tempPlayer;
        }
    }

    if (gameState.players.length >= config.playerLimit) {
        console.log('Join failed: player limit reached');
        return null;
    }

    if (existingPlayer) {
        console.log(`Join failed: player with name ${profileData.name} or ID ${profileData.id} already exists`);
        return null;
    }

    const newPlayer: Player = {
        id: profileData.id,
        name: profileData.name,
        avatar: profileData.avatar,
        score: 0,
        roundStatus: gameState.status === 'Answering' ? 'in_round' : 'in_round',
        lastAnswerCorrect: null,
        timeoutCount: 0,
        roundAnswers: [],
        roundScore: 0,
    };

    updateGameState({ players: [...gameState.players, newPlayer] });
    broadcastGameState();
    console.log(`Player ${profileData.name} joined the game successfully. New player count: ${gameState.players.length}`);

    // Auto-start game if this is the first or second player and game is waiting
    if (gameState.status === 'Waiting' && gameState.players.length >= 1) {
        console.log('Auto-starting game...');
        setTimeout(() => autoStartGame(), 2000); // 2 second delay for more players to join
    }

    return newPlayer;
}

/**
 * Handles a player submitting an answer
 * Validates the answer and updates game state accordingly
 * @param playerId - ID of the player submitting the answer
 * @param answerIndex - Index of the selected answer option
 * @returns true if answer was processed successfully
 */
export function handleSubmitAnswer(playerId: string, answerIndex: number): boolean {
    if (gameState.status !== 'Answering' || gameState.activePlayerId !== playerId) {
        return false;
    }

    const player = gameState.players.find(p => p.id === playerId);
    const currentQuestion = gameState.currentQuestion;
    if (!player || !currentQuestion) return false;

    clearTurnTimer();

    const isCorrect = currentQuestion.options[answerIndex]?.isCorrect === true;
    player.lastAnswerCorrect = isCorrect;
    
    // Store which player answered this option
    currentQuestion.playerAnswers[answerIndex] = playerId;

    if (isCorrect) {
        player.roundScore += 1;
        player.roundAnswers.push(answerIndex);
        console.log(`Player ${player.name} answered correctly.`);
    } else {
        player.roundScore = 0;
        player.roundStatus = 'out';
        currentQuestion.revealedIncorrectAnswers.push(answerIndex);
        console.log(`Player ${player.name} answered incorrectly and is out of the round.`);
    }

    // Check if all answer options have been revealed
    const revealedCorrectAnswers = gameState.players.flatMap(p => p.roundAnswers);
    const totalRevealedAnswers = revealedCorrectAnswers.length + currentQuestion.revealedIncorrectAnswers.length;
    const allOptionsRevealed = totalRevealedAnswers === currentQuestion.options.length;

    // End round if all options revealed, otherwise continue to next player
    if (allOptionsRevealed) {
        endRound();
    } else {
        advanceTurn();
    }

    return true;
}

/**
 * Handles a player choosing to pass their turn
 * @param playerId - ID of the player passing their turn
 * @returns true if pass was processed successfully
 */
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


// ============================================================================
// GAME AUTO-MANAGEMENT
// ============================================================================

/**
 * Automatically starts the game when conditions are met
 * Called when players join and game is in waiting state
 */
function autoStartGame(): void {
    if (gameState.status === 'Waiting' && gameState.players.length >= 1) {
        console.log(`Auto-starting game with players: ${gameState.players.map(p => `${p.name}:${p.id}`).join(', ')}`);
        startNewRound();
        console.log('Game auto-started.');
    }
}

// ============================================================================
// GAME LIFECYCLE
// ============================================================================

/**
 * Ends the current game and prepares for the next one
 * @param reason - The reason the game ended (winner message, etc.)
 */
function endGame(reason: string): void {
    console.log(`Game ended: ${reason}`);
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    clearTurnTimer();
    updateGameState({ status: 'Finished', activePlayerId: null });
    broadcastGameState();

    // Auto-restart 
    gameLoopTimeout = setTimeout(() => {
        console.log(`Queued players for next game: [${nextGamePlayers.map(p => p.name).join(', ')}]`);

        resetGameState();

        // Add queued players to the new game
        const newPlayers: Player[] = nextGamePlayers.map(profile => ({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
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
    }, config.gameRestartDelaySeconds * 1000);
}
