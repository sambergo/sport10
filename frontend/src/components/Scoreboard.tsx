// src/components/Scoreboard.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Scoreboard() {
  const players = useGameStore((state: any) => state.gameState.players);

  // Auto-assign avatars based on player ID or index
  const getPlayerAvatar = (playerId: string, index: number) => {
    // Use a simple hash of the player ID to consistently assign avatars
    const avatarIndex = ((playerId.charCodeAt(0) + index) % 21) + 1;
    return `/avatars/${avatarIndex}.jpeg`;
  };

  // Sort players by score for the leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sortedPlayers.map((player, index) => {
            const avatarSrc = getPlayerAvatar(player.id, index);
            return (
              <li key={player.id} className="flex items-center justify-between p-2 rounded-md">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold min-w-[20px]">{index + 1}.</span>
                  <img
                    src={avatarSrc}
                    alt={`${player.name}'s avatar`}
                    className="w-8 h-8 rounded-full border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
                    }}
                  />
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="font-bold">{player.score} pts</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
