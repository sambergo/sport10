// src/views/ResultsView.tsx
import { GameTopBar } from '@/components/GameTopBar';
import { Scoreboard } from '@/components/Scoreboard';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { useGameStore } from '@/store/gameStore';
import type { AnswerOption } from '../../../common/types/game';

export function ResultsView() {
  const { currentQuestion } = useGameStore((state) => state.gameState);

  // Letter mapping for answer options
  const getAnswerLetter = (index: number) => String.fromCharCode(65 + index); // A, B, C, D...

  return (
    <div className="min-h-screen flex flex-col pt-1 pb-2">
      <GameTopBar />

      {/* Scoreboard section */}
      <div className="px-4 flex-1">
        <Scoreboard />
      </div>
      {/* Question section */}
      <div className="flex-shrink-0 px-4 pt-1 pb-2">
        <QuestionDisplay />
      </div>

      {/* Results content */}
      <div className="flex-1 px-1 flex flex-col gap-4">
        {/* Correct answers section */}
        {currentQuestion && (
          <div className="px-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 text-center">
              Correct Answers
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option: AnswerOption, index: number) => (
                <div
                  key={index}
                  className={`min-h-[80px] flex flex-col justify-center items-center text-center transition-all duration-200 rounded-xl px-3 py-4 border ${option.isCorrect
                      ? 'game-button-success'
                      : 'bg-gradient-to-r from-[var(--color-background-accent)] to-[var(--color-background-secondary)] border-white/10 opacity-50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                    <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                      {getAnswerLetter(index)}
                    </span>
                    <span className="flex-1 text-sm font-medium leading-tight px-2 flex items-center">
                      {option.text}
                    </span>
                    {option.isCorrect && (
                      <span className="flex-shrink-0 text-lg">✅</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
