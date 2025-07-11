// src/components/PlayerList.tsx
import { useGameStore } from '@/store/gameStore';

export function PlayerList() {
  const { players, activePlayerId } = useGameStore((state: any) => state.gameState);
  const myPlayerId = useGameStore((state: any) => state.playerId);

  // Get player avatar from their profile data
  const getPlayerAvatar = (player: any) => {
    return `/avatars/${player.avatar || 1}.jpeg`;
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
          const avatarSrc = getPlayerAvatar(player);

          return (
            <div
              key={player.id}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActivePlayer 
                  ? 'bg-gradient-to-b from-[var(--color-green-primary)]/20 to-[var(--color-blue-primary)]/20 border border-[var(--color-green-primary)]/30' 
                  : isMe
                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-500/20 border border-blue-400/50 shadow-md'
                    : 'bg-white/5 border border-white/10'
              } ${isMe ? 'ring-2 ring-blue-400/30' : ''}`}
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
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    isMe ? 'bg-blue-400/30 text-blue-200' : 'bg-white/20'
                  }`}>
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={`${player.name}'s avatar`}
                  className={`w-6 h-6 rounded-full border transition-all duration-200 ${
                    isMe ? 'border-blue-400 shadow-sm' : 'border-white/20'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
                  }}
                />
              </div>

              {/* Player Info */}
              <div className="text-center min-w-0">
                <div className={`text-xs font-medium truncate max-w-[50px] ${
                  isMe ? 'text-blue-200' : 'text-[var(--color-text-primary)]'
                }`}>
                  {player.name}
                  {isMe && <span className="text-blue-300">*</span>}
                </div>
                <div className={`text-xs font-bold ${
                  isMe ? 'text-blue-200' : 'text-[var(--color-text-primary)]'
                }`}>
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
