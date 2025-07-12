// src/views/FinishedView.tsx
import { Scoreboard } from '@/components/Scoreboard';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '../../../common/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socketService';
import { useState, useEffect } from 'react';

export function FinishedView() {
  const { players } = useGameStore((state) => state.gameState);
  const playerId = useGameStore((state) => state.playerId);
  const winner = players.sort((a: Player, b: Player) => b.score - a.score)[0];
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameRestartDelay, setGameRestartDelay] = useState(60);

  const currentPlayer = players.find((p: Player) => p.id === playerId);

  useEffect(() => {
    // Fetch config from backend
    fetch('/api/config')
      .then(res => res.json())
      .then(config => {
        setGameRestartDelay(config.gameRestartDelaySeconds);
        setTimeLeft(config.gameRestartDelaySeconds);
      })
      .catch(err => {
        console.warn('Failed to fetch config, using default:', err);
        setGameRestartDelay(60);
        setTimeLeft(60);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameRestartDelay]);

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
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-lg font-medium">Next game starts in:</p>
              <p className="text-3xl font-bold text-primary">{timeLeft}s</p>
            </div>
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
