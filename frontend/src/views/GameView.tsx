// src/views/GameView.tsx
import { Header } from '@/components/Header';
import { PlayerList } from '@/components/PlayerList';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { AnswerOptions } from '@/components/AnswerOptions';
import { GameActions } from '@/components/GameActions';

export function GameView() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <QuestionDisplay />
          <AnswerOptions />
          <GameActions />
        </div>
        <div>
          <PlayerList />
        </div>
      </div>
    </div>
  );
}
