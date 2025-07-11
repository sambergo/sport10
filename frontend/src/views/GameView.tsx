// src/views/GameView.tsx
import { Header } from '@/components/Header';
import { PlayerList } from '@/components/PlayerList';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { AnswerOptions } from '@/components/AnswerOptions';
import { GameActions } from '@/components/GameActions';
import { GameTopBar } from '@/components/GameTopBar';
import { useGameStore } from '@/store/gameStore';

export function GameView() {
  const { status } = useGameStore((state: any) => state.gameState);

  const isGameActive = status === 'Answering' || status === 'Revealing';

  // Always use focused layout when game is active
  if (isGameActive) {
    return (
      <div className="min-h-screen flex flex-col pt-1 pb-2">
        <GameTopBar />

        {/* Question section */}
        <div className="flex-shrink-0 px-4 pt-1 pb-2">
          <QuestionDisplay />
        </div>

        {/* Answer section */}
        <div className="flex-1 px-1">
          <AnswerOptions />
        </div>

        <GameActions />
      </div>
    );
  }

  // Fallback to default layout for lobby/waiting states
  return (
    <div className="mobile-content pb-20 min-h-screen flex flex-col gap-3">
      <Header />

      {/* Very compact question section */}
      <div className="flex-shrink-0">
        <QuestionDisplay />
      </div>

      {/* Large answer section - takes most of the remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnswerOptions />
      </div>

      {/* Player list */}
      <div className="flex-shrink-0">
        <PlayerList />
      </div>

      <GameActions />
    </div>
  );
}
