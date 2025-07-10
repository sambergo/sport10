// src/components/AnswerOptions.tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socketService';

export function AnswerOptions() {
  const { currentQuestion, status, activePlayerId, players } = useGameStore((state) => state.gameState);
  const myPlayerId = useGameStore((state) => state.playerId);

  if (!currentQuestion) return null;

  const handleSelectAnswer = (index: number) => {
    socketService.submitAnswer(index);
  };

  const isMyTurn = activePlayerId === myPlayerId;
  const isAnsweringPhase = status === 'Answering';

  const revealedCorrectAnswers = players.flatMap(p => p.roundAnswers);
  const revealedIncorrectAnswers = currentQuestion.revealedIncorrectAnswers || [];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => {
          const isRevealedCorrect = revealedCorrectAnswers.includes(index);
          const isRevealedIncorrect = revealedIncorrectAnswers.includes(index);
          const isRevealed = isRevealedCorrect || isRevealedIncorrect;

          const getVariant = () => {
            if (isRevealedCorrect) return 'success';
            if (isRevealedIncorrect) return 'destructive';
            return 'outline';
          };

          return (
            <Button
              key={index}
              variant={getVariant()}
              onClick={() => handleSelectAnswer(index)}
              disabled={!isAnsweringPhase || !isMyTurn || isRevealed}
              className="h-full py-4"
            >
              {option.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
