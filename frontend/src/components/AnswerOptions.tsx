// src/components/AnswerOptions.tsx
import { useGameStore } from '@/store/gameStore';
import type { AnswerOption, Player } from '../../../common/types/game';
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

  const revealedCorrectAnswers = players.flatMap((p: Player) => p.roundAnswers);
  const revealedIncorrectAnswers = currentQuestion.revealedIncorrectAnswers || [];

  // Letter mapping for answer options
  const getAnswerLetter = (index: number) => String.fromCharCode(65 + index); // A, B, C, D...

  return (
    <div className="animate-scale-in flex-1 flex flex-col min-h-0">
      {/* 2-Column Answer Grid for Mobile */}
      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {currentQuestion.options.map((option: AnswerOption, index: number) => {
          const isRevealedCorrect = revealedCorrectAnswers.includes(index);
          const isRevealedIncorrect = revealedIncorrectAnswers.includes(index);
          const isRevealed = isRevealedCorrect || isRevealedIncorrect;
          const isDisabled = !isAnsweringPhase || !isMyTurn || isRevealed;

          const getButtonClass = () => {
            if (isRevealedCorrect) return 'game-button-success';
            if (isRevealedIncorrect) return 'bg-gradient-to-r from-[var(--color-status-error)] to-[var(--color-pink-primary)] text-white font-medium rounded-xl px-3 py-4 opacity-50';
            if (isDisabled) return 'game-button-ghost opacity-50';
            return 'game-button-primary hover:scale-[1.02]';
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
              className={`${getButtonClass()} min-h-[80px] flex flex-col justify-center items-center text-center transition-all duration-200 ${!isDisabled ? 'active:scale-95' : ''}`}
            >
              <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  {getAnswerLetter(index)}
                </span>
                <span className="flex-1 text-sm font-medium leading-tight px-2 flex items-center">
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

    </div>
  );
}
