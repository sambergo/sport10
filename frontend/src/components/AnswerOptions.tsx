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

  const revealedAnswers = players.flatMap(p => p.roundAnswers);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => {
          const isRevealed = revealedAnswers.includes(index);
          return (
            <Button
              key={index}
              variant={isRevealed ? 'success' : 'outline'}
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
