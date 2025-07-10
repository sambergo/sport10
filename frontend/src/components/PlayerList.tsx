// src/components/PlayerList.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function PlayerList() {
  const { players, activePlayerId } = useGameStore((state) => state.gameState);

  const getStatusLabel = (status: 'in_round' | 'passed' | 'out') => {
    switch (status) {
      case 'passed':
        return ' (Passed)';
      case 'out':
        return ' (Out)';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className={cn(
                'flex justify-between p-2 rounded-md',
                player.id === activePlayerId && 'bg-blue-100 dark:bg-blue-900'
              )}
            >
              <span>
                {player.name}
                <span className="text-sm text-gray-500">
                  {getStatusLabel(player.roundStatus)}
                </span>
              </span>
              <span className="font-bold">{player.score} pts</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
