// src/services/gameService.ts
import { gameState, updateGameState, resetGame as resetGameState } from '../game';
import { Player, GameStatus, Question, QuestionTemplate } from '@/common/types/game';
import { broadcastGameState } from '../websocket';
import { config } from '../config';
// import { dummyQuestions } from '../data/questions'; // Removed: No longer needed
import { getRandomQuestion } from '../database'; // New import
import { v4 as uuidv4 } from 'uuid';

let gameLoopTimeout: NodeJS.Timeout | null = null;

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
        broadcastGameState();
    }
}

function endRound() {
    if (gameState.status !== 'Answering') return;

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

    updateGameState({
        status: 'Answering',
        currentQuestion: question,
        currentRound: gameState.currentRound + 1,
        players: resetPlayers,
        activePlayerId: resetPlayers[0]?.id || null, // Start with the first player
    });

    broadcastGameState();
}

// --- Player Actions ---

export function handlePlayerJoin(name: string): Player | null {
    if (gameState.status !== 'Waiting' || gameState.players.length >= config.playerLimit) {
        return null;
    }

    const newPlayer: Player = {
        id: uuidv4(),
        name,
        score: 0,
        roundStatus: 'in_round',
        lastAnswerCorrect: null,
        timeoutCount: 0,
        roundAnswers: [],
        roundScore: 0,
    };

    updateGameState({ players: [...gameState.players, newPlayer] });
    broadcastGameState();
    console.log(`Player ${name} joined the game.`);
    return newPlayer;
}

export function handleSubmitAnswer(playerId: string, answerIndex: number): boolean {
    if (gameState.status !== 'Answering' || gameState.activePlayerId !== playerId) {
        return false;
    }

    const player = gameState.players.find(p => p.id === playerId);
    const question = gameState.currentQuestion;
    if (!player || !question) return false;

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

    player.roundStatus = 'passed';
    console.log(`Player ${player.name} passed their turn.`);
    advanceTurn();
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
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    resetGameState();
    broadcastGameState();
    return true;
}

// --- Game Loop & Scoring ---

function endGame(reason: string) {
    console.log(`Game ended: ${reason}`);
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    updateGameState({ status: 'Finished', activePlayerId: null });
    broadcastGameState();
}

// Removed selectNewQuestion: Now handled directly in startNewRound via getRandomQuestion
