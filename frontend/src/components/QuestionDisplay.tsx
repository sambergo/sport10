// src/components/QuestionDisplay.tsx
import { useGameStore } from '@/store/gameStore';

export function QuestionDisplay() {
  const question = useGameStore((state: any) => state.gameState.currentQuestion);

  if (!question) {
    return (
      <div className="game-card text-center animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🎮</span>
          <span className="text-subtitle text-[var(--color-text-secondary)]">
            Waiting for the game to start...
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill progress-primary animate-glow" style={{ width: '50%' }} />
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gradient-to-br from-[var(--color-background-accent)] to-[var(--color-background-secondary)] rounded-lg p-3 border border-white/5 animate-fade-in">
      {/* Very compact question text only */}
      <h2 className="text-sm font-medium text-[var(--color-text-primary)] leading-tight text-center">
        {question.question}
      </h2>
    </div>
  );
}
