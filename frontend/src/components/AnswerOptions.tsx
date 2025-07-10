// src/components/AnswerOptions.tsx
import { useGameStore } from '@/store/gameStore';
import { socketService } from '@/services/socketService';

export function AnswerOptions() {
  const { currentQuestion, status, activePlayerId, players } = useGameStore((state: any) => state.gameState);
  const myPlayerId = useGameStore((state: any) => state.playerId);

  if (!currentQuestion) return null;

  const handleSelectAnswer = (index: number) => {
    socketService.submitAnswer(index);
  };

  const isMyTurn = activePlayerId === myPlayerId;
  const isAnsweringPhase = status === 'Answering';

  const revealedCorrectAnswers = players.flatMap((p: any) => p.roundAnswers);
  const revealedIncorrectAnswers = currentQuestion.revealedIncorrectAnswers || [];

  // Letter mapping for answer options
  const getAnswerLetter = (index: number) => String.fromCharCode(65 + index); // A, B, C, D...

  return (
    <div className="animate-scale-in">
      {/* Answer Grid */}
      <div className="grid grid-cols-2 gap-3">
        {currentQuestion.options.map((option: any, index: number) => {
          const isRevealedCorrect = revealedCorrectAnswers.includes(index);
          const isRevealedIncorrect = revealedIncorrectAnswers.includes(index);
          const isRevealed = isRevealedCorrect || isRevealedIncorrect;
          const isDisabled = !isAnsweringPhase || !isMyTurn || isRevealed;

          const getButtonClass = () => {
            if (isRevealedCorrect) return 'game-button-success';
            if (isRevealedIncorrect) return 'bg-gradient-to-r from-[var(--color-status-error)] to-[var(--color-pink-primary)] text-white font-medium rounded-xl px-6 py-3 opacity-50';
            if (isDisabled) return 'game-button-ghost opacity-50';
            return 'game-button-primary hover:scale-105';
          };

          const getIcon = () => {
            if (isRevealedCorrect) return '✅';
            if (isRevealedIncorrect) return '❌';
            return '';
          };

          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={isDisabled}
              className={`${getButtonClass()} min-h-[64px] flex flex-col justify-center items-center text-left transition-all duration-200 ${!isDisabled ? 'active:scale-95' : ''}`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {getAnswerLetter(index)}
                </span>
                <span className="flex-1 text-sm font-medium leading-tight">
                  {option.text}
                </span>
                {getIcon() && (
                  <span className="flex-shrink-0 text-lg">{getIcon()}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Turn Indicator */}
      <div className="mt-4 p-3 game-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMyTurn ? (
              <>
                <span className="w-3 h-3 bg-[var(--color-green-primary)] rounded-full animate-pulse"></span>
                <span className="text-subtitle text-[var(--color-green-primary)]">🟢 Your Turn!</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 bg-[var(--color-text-accent)] rounded-full"></span>
                <span className="text-caption text-[var(--color-text-secondary)]">
                  Waiting for {players.find((p: any) => p.id === activePlayerId)?.name || 'other player'}...
                </span>
              </>
            )}
          </div>
          {isAnsweringPhase && (
            <div className="flex items-center gap-2">
              <span className="text-small text-[var(--color-text-secondary)]">
                {revealedCorrectAnswers.length} correct found
              </span>
              <div className="progress-bar w-16">
                <div 
                  className="progress-fill progress-success" 
                  style={{ width: `${(revealedCorrectAnswers.length / (currentQuestion.correctAnswers?.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
