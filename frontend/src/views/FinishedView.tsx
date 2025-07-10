// src/views/FinishedView.tsx
import { Scoreboard } from '@/components/Scoreboard';
import { useGameStore } from '@/store/gameStore';
import { AdminPanel } from '@/components/AdminPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FinishedView() {
  const { players } = useGameStore((state: any) => state.gameState);
  const winner = players.sort((a: any, b: any) => b.score - a.score)[0];

  return (
    <div className="container mx-auto p-4 max-w-2xl text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold">Game Over!</CardTitle>
        </CardHeader>
        <CardContent>
          {winner && (
            <p className="text-2xl mb-4">
              Congratulations, <span className="font-bold text-primary">{winner.name}</span>!
            </p>
          )}
          <Scoreboard />
          <div className="mt-8">
            <AdminPanel />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
