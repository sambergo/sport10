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

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('music')) return '🎵';
    if (categoryLower.includes('sport')) return '⚽';
    if (categoryLower.includes('science')) return '🔬';
    if (categoryLower.includes('history')) return '📚';
    if (categoryLower.includes('geography')) return '🌍';
    if (categoryLower.includes('movie') || categoryLower.includes('film')) return '🎬';
    if (categoryLower.includes('food')) return '🍕';
    if (categoryLower.includes('nature')) return '🌿';
    if (categoryLower.includes('technology')) return '💻';
    if (categoryLower.includes('art')) return '🎨';
    return '🎯';
  };

  return (
    <div className="game-card animate-fade-in">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(question.category)}</span>
          <div>
            <h3 className="text-subtitle text-[var(--color-text-primary)]">
              {question.category}
            </h3>
            <p className="text-small text-[var(--color-text-secondary)]">
              Difficulty: {question.difficulty}
            </p>
          </div>
        </div>
        <div className="badge badge-secondary">
          🎤 Question
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-gradient-to-br from-[var(--color-background-accent)] to-[var(--color-background-secondary)] rounded-lg p-4 border border-white/5">
        <h2 className="text-title text-[var(--color-text-primary)] leading-tight">
          {question.question}
        </h2>
      </div>

      {/* Instruction */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-[var(--color-blue-primary)]/20">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-blue-primary)]">💡</span>
          <p className="text-caption text-[var(--color-text-secondary)]">
            Select all correct answers from the options below
          </p>
        </div>
      </div>
    </div>
  );
}
