// src/components/Scoreboard.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Scoreboard() {
  const players = useGameStore((state: any) => state.gameState.players);
  const currentPlayerId = useGameStore((state: any) => state.playerId);

  // Get player avatar from their profile data
  const getPlayerAvatar = (player: any) => {
    return `/avatars/${player.avatar || 1}.jpeg`;
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
            const avatarSrc = getPlayerAvatar(player);
            const isCurrentUser = player.id === currentPlayerId;
            return (
              <li 
                key={player.id} 
                className={`flex items-center justify-between p-2 rounded-md transition-all duration-200 ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 shadow-lg' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold min-w-[20px] ${isCurrentUser ? 'text-blue-300' : ''}`}>
                    {index + 1}.
                  </span>
                  <img
                    src={avatarSrc}
                    alt={`${player.name}'s avatar`}
                    className={`w-8 h-8 rounded-full border transition-all duration-200 ${
                      isCurrentUser 
                        ? 'border-blue-400 shadow-md ring-2 ring-blue-400/30' 
                        : 'border-white/20'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
                    }}
                  />
                  <span className={`font-medium ${isCurrentUser ? 'text-blue-100 font-semibold' : ''}`}>
                    {player.name}
                    {isCurrentUser && <span className="ml-2 text-xs text-blue-300">(You)</span>}
                  </span>
                </div>
                <span className={`font-bold ${isCurrentUser ? 'text-blue-200' : ''}`}>
                  {player.score} pts
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
