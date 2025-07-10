// src/components/AnswerOptions.tsx
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socketService';

export function AnswerOptions() {
  const { currentQuestion, status } = useGameStore((state) => state.gameState);
  const [selectedAnswers, setSelectedAnswers] = React.useState<number[]>([]);

  if (!currentQuestion) return null;

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswers((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = () => {
    socketService.submitAnswer(selectedAnswers);
  };

  const isAnsweringPhase = status === 'Answering';

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswers.includes(index) ? 'default' : 'outline'}
            onClick={() => handleSelectAnswer(index)}
            disabled={!isAnsweringPhase}
            className="h-full py-4"
          >
            {option.text}
          </Button>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button onClick={handleSubmit} disabled={!isAnsweringPhase || selectedAnswers.length === 0}>
          Submit Answers
        </Button>
      </div>
    </div>
  );
}
