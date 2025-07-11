// src/views/LobbyView.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerList } from '@/components/PlayerList';
import { AdminPanel } from '@/components/AdminPanel';
import { socketService } from '@/services/socketService';
import { useGameStore } from '@/store/gameStore';

export function LobbyView() {
  const [playerName, setPlayerName] = useState('');
  const { players, status } = useGameStore((state: any) => state.gameState);
  const { playerId } = useGameStore((state) => state);
  const myPlayer = players.find((p: any) => p.id === playerId);

  const handleJoinGame = () => {
    if (playerName.trim()) {
      socketService.joinGame(playerName.trim());
    }
  };

  const getTitle = () => {
    if (status === 'Waiting') {
      return 'Waiting for Game to Start';
    }
    return myPlayer ? 'You can join the current game!' : 'Game in Progress - Join Now!';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">{getTitle()}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Join the Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e: any) => setPlayerName(e.target.value)}
                disabled={!!myPlayer}
              />
              <Button onClick={handleJoinGame} className="w-full" disabled={!!myPlayer || !playerName.trim()}>
                {myPlayer ? 'Joined!' : status === 'Waiting' ? 'Join Game' : 'Join Current Game'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <PlayerList />
        </div>
      </div>
    </div>
  );
}
