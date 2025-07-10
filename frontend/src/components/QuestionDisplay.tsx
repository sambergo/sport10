// src/components/QuestionDisplay.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function QuestionDisplay() {
  const question = useGameStore((state) => state.gameState.currentQuestion);

  if (!question) {
    return <div className="text-center text-xl">Waiting for the game to start...</div>;
  }

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-2xl">{question.question}</CardTitle>
        <CardDescription>
          Category: {question.category} | Difficulty: {question.difficulty}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
