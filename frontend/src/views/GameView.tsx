// src/views/GameView.tsx
import { Header } from '@/components/Header';
import { PlayerList } from '@/components/PlayerList';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { AnswerOptions } from '@/components/AnswerOptions';
import { GameActions } from '@/components/GameActions';

export function GameView() {
  return (
    <div className="mobile-content pb-32">
      <Header />
      <div className="flex flex-col gap-4">
        <QuestionDisplay />
        <AnswerOptions />
        <PlayerList />
      </div>
      <GameActions />
    </div>
  );
}
