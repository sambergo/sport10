// src/components/Header.tsx
import { useGameStore } from '@/store/gameStore';

export function Header() {
  const { status, currentRound, timer, questions } = useGameStore((state: any) => state.gameState);
  const currentQuestion = questions && currentRound <= questions.length ? questions[currentRound - 1] : null;
  
  // Determine timer color based on time remaining
  const getTimerColor = (time: number) => {
    if (time > 10) return 'text-[var(--color-green-primary)]';
    if (time > 5) return 'text-[var(--color-orange-primary)]';
    return 'text-[var(--color-status-error)]';
  };

  // Determine difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-primary';
      case 'hard': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="game-card mb-6 animate-scale-in">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="badge badge-primary">🔄 Round {currentRound}</span>
          {currentQuestion && (
            <span className={`badge ${getDifficultyColor(currentQuestion.difficulty)}`}>
              🎯 {currentQuestion.difficulty || 'Unknown'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-small text-[var(--color-text-secondary)]">
            🧑‍🤝‍🧑 Question {currentRound}/{questions?.length || 0}
          </span>
        </div>
      </div>

      {/* Game Title */}
      <div className="text-center mb-4">
        <h1 className="text-hero bg-gradient-to-r from-[var(--color-blue-primary)] to-[var(--color-purple-primary)] bg-clip-text text-transparent">
          🎮 Smart10
        </h1>
        <p className="text-caption text-[var(--color-text-secondary)] mt-1">
          {status === 'Answering' ? 'Select all correct answers!' : status}
        </p>
      </div>

      {/* Timer and Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-small text-[var(--color-text-secondary)]">⏳</span>
          <span className={`text-subtitle font-bold ${getTimerColor(timer)}`}>
            {timer}s remaining
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-small text-[var(--color-text-secondary)]">Progress</span>
          <div className="progress-bar w-20">
            <div 
              className="progress-fill progress-primary" 
              style={{ width: `${questions?.length ? (currentRound / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
