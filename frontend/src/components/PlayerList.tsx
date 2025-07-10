// src/components/PlayerList.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PlayerList() {
  const players = useGameStore((state) => state.gameState.players);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {players.map((player) => (
            <li key={player.id} className="flex justify-between">
              <span>{player.name}</span>
              <span className="font-bold">{player.score} pts</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
