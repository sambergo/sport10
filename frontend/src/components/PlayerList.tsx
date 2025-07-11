// src/components/PlayerList.tsx
import { useGameStore } from '@/store/gameStore';

export function PlayerList() {
  const { players, activePlayerId } = useGameStore((state: any) => state.gameState);
  const myPlayerId = useGameStore((state: any) => state.playerId);

  // Auto-assign avatars based on player ID or index
  const getPlayerAvatar = (playerId: string, index: number) => {
    // Use a simple hash of the player ID to consistently assign avatars
    const avatarIndex = ((playerId.charCodeAt(0) + index) % 21) + 1;
    return `/avatars/${avatarIndex}.jpeg`;
  };


  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white/5 rounded-lg p-2 animate-fade-in">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1">
          🧑‍🤝‍🧑 Players ({players.length})
        </h3>
      </div>

      {/* Horizontal Player List */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sortedPlayers.map((player, index) => {
          const isActivePlayer = player.id === activePlayerId;
          const isMe = player.id === myPlayerId;
          const avatarSrc = getPlayerAvatar(player.id, index);

          return (
            <div
              key={player.id}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActivePlayer 
                  ? 'bg-gradient-to-b from-[var(--color-green-primary)]/20 to-[var(--color-blue-primary)]/20 border border-[var(--color-green-primary)]/30' 
                  : 'bg-white/5 border border-white/10'
              } ${isMe ? 'ring-1 ring-[var(--color-blue-primary)]/50' : ''}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {index === 0 ? (
                  <span className="text-sm">🥇</span>
                ) : index === 1 ? (
                  <span className="text-sm">🥈</span>
                ) : index === 2 ? (
                  <span className="text-sm">🥉</span>
                ) : (
                  <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={`${player.name}'s avatar`}
                  className="w-6 h-6 rounded-full border border-white/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
                  }}
                />
              </div>

              {/* Player Info */}
              <div className="text-center min-w-0">
                <div className="text-xs text-[var(--color-text-primary)] font-medium truncate max-w-[50px]">
                  {player.name}
                  {isMe && <span className="text-[var(--color-blue-primary)]">*</span>}
                </div>
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  {player.score}
                </div>
                {isActivePlayer && (
                  <span className="w-1 h-1 bg-[var(--color-green-primary)] rounded-full animate-pulse inline-block"></span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
