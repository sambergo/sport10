// src/components/Scoreboard.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Scoreboard() {
  const players = useGameStore((state) => state.gameState.players);

  // Sort players by score for the leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <li key={player.id} className="flex justify-between p-2 rounded-md">
              <span>{index + 1}. {player.name}</span>
              <span className="font-bold">{player.score} pts</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
