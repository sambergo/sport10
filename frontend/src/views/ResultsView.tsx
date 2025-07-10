// src/views/ResultsView.tsx
import { Header } from '@/components/Header';
import { Scoreboard } from '@/components/Scoreboard';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';

export function ResultsView() {
  const { currentQuestion } = useGameStore((state: any) => state.gameState);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Header />
      <h2 className="text-2xl font-bold text-center my-4">Round Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <QuestionDisplay />
          {currentQuestion && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Correct Answers:</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option: any, index: number) => (
                  <Button
                    key={index}
                    variant={option.isCorrect ? 'default' : 'outline'}
                    className={`h-full py-4 ${option.isCorrect ? 'bg-green-500' : ''}`}
                    disabled
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <Scoreboard />
        </div>
      </div>
    </div>
  );
}
