// src/views/LobbyView.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerList } from '@/components/PlayerList';
import { AdminPanel } from '@/components/AdminPanel';
import { socketService } from '@/services/socketService';
import { useGameStore } from '@/store/gameStore';

export function LobbyView() {
  const [playerName, setPlayerName] = useState('');
  const { players } = useGameStore((state) => state.gameState);
  const myPlayer = players.find(p => p.name === playerName && p.id); // A simple way to check if we have joined

  const handleJoinGame = () => {
    if (playerName.trim()) {
      socketService.joinGame(playerName.trim());
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">Waiting for Game to Start</h1>
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
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={!!myPlayer}
              />
              <Button onClick={handleJoinGame} className="w-full" disabled={!!myPlayer || !playerName.trim()}>
                {myPlayer ? 'Joined!' : 'Join Game'}
              </Button>
            </CardContent>
          </Card>
          <AdminPanel />
        </div>
        <div>
          <PlayerList />
        </div>
      </div>
    </div>
  );
}
