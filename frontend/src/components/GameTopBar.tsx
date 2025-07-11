// src/components/GameTopBar.tsx
import { useGameStore } from '@/store/gameStore';

export function GameTopBar() {
  const { currentQuestion, activePlayerId, players, currentRound, timer } = useGameStore((state: any) => state.gameState);
  const myPlayerId = useGameStore((state: any) => state.playerId);

  const isMyTurn = activePlayerId === myPlayerId;
  const activePlayer = players.find((p: any) => p.id === activePlayerId);

  // Timer color based on time remaining
  const getTimerColor = (time: number) => {
    if (time > 10) return 'text-[var(--color-green-primary)]';
    if (time > 5) return 'text-[var(--color-orange-primary)]';
    return 'text-[var(--color-status-error)]';
  };

  if (!currentQuestion) return null;

  return (
    <div className="fixed top-0 left-0 right-0 glassmorphism border-b border-white/10 p-3 animate-slide-down z-50">
      <div className="flex items-center justify-between max-w-full mx-auto">
        {/* Left: Round info */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--color-blue-primary)] font-medium">R{currentRound}</span>
          <span className="text-[var(--color-text-secondary)]">•</span>
          <span className="text-[var(--color-text-secondary)]">{currentQuestion.category}</span>
        </div>

        {/* Center: Turn indicator */}
        <div className="flex items-center gap-2">
          {isMyTurn ? (
            <>
              <span className="w-2 h-2 bg-[var(--color-green-primary)] rounded-full animate-pulse"></span>
              <span className="text-sm text-[var(--color-green-primary)]">Your Turn</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-[var(--color-text-accent)] rounded-full"></span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {activePlayer?.name || 'Waiting...'}
              </span>
            </>
          )}
        </div>

        {/* Right: Timer */}
        <div className="flex items-center gap-1">
          <span className="text-xs">⏱️</span>
          <span className={`text-xs font-bold ${getTimerColor(timer)}`}>
            {timer}s
          </span>
        </div>
      </div>
    </div>
  );
}
