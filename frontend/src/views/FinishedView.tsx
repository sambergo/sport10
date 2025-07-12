// src/views/FinishedView.tsx
import { Scoreboard } from '@/components/Scoreboard';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socketService';

export function FinishedView() {
  const { players } = useGameStore((state: any) => state.gameState);
  const playerId = useGameStore((state) => state.playerId);
  const winner = players.sort((a: any, b: any) => b.score - a.score)[0];

  const currentPlayer = players.find((p: any) => p.id === playerId);

  const handleAutoJoinNext = () => {
    if (currentPlayer) {
      socketService.joinGame({
        id: currentPlayer.id,
        name: currentPlayer.name,
        avatar: currentPlayer.avatar
      });
    }
  };

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
          <div className="mt-6">
            <Button
              onClick={handleAutoJoinNext}
              disabled={!currentPlayer?.name}
              className="w-full"
            >
              Join Next Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
