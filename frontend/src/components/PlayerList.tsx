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

  const getStatusIcon = (status: 'in_round' | 'passed' | 'out') => {
    switch (status) {
      case 'passed': return '⏭️';
      case 'out': return '🚫';
      default: return '🎮';
    }
  };

  const getStatusBadge = (status: 'in_round' | 'passed' | 'out') => {
    switch (status) {
      case 'passed': return 'badge-secondary';
      case 'out': return 'bg-gradient-to-r from-[var(--color-status-error)] to-[var(--color-pink-primary)] text-white';
      default: return 'badge-primary';
    }
  };

  const getStatusText = (status: 'in_round' | 'passed' | 'out') => {
    switch (status) {
      case 'passed': return 'Passed';
      case 'out': return 'Out';
      default: return 'Playing';
    }
  };

  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="game-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-subtitle text-[var(--color-text-primary)] flex items-center gap-2">
          🧑‍🤝‍🧑 Players
          <span className="badge badge-secondary">{players.length}</span>
        </h3>
        <span className="text-small text-[var(--color-text-secondary)]">
          Leaderboard
        </span>
      </div>

      {/* Player List */}
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const isActivePlayer = player.id === activePlayerId;
          const isMe = player.id === myPlayerId;
          const avatarSrc = getPlayerAvatar(player.id, index);

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActivePlayer 
                  ? 'bg-gradient-to-r from-[var(--color-green-primary)]/20 to-[var(--color-blue-primary)]/20 border border-[var(--color-green-primary)]/30 animate-glow' 
                  : 'bg-white/5 border border-white/10'
              } ${isMe ? 'ring-2 ring-[var(--color-blue-primary)]/50' : ''}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {index === 0 ? (
                  <span className="text-xl">🥇</span>
                ) : index === 1 ? (
                  <span className="text-xl">🥈</span>
                ) : index === 2 ? (
                  <span className="text-xl">🥉</span>
                ) : (
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={avatarSrc}
                  alt={`${player.name}'s avatar`}
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                  onError={(e) => {
                    // Fallback to a default avatar if the image fails to load
                    (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
                  }}
                />
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-body text-[var(--color-text-primary)] font-medium truncate">
                    {player.name}
                    {isMe && <span className="text-[var(--color-blue-primary)]"> (You)</span>}
                  </span>
                  {isActivePlayer && (
                    <span className="w-2 h-2 bg-[var(--color-green-primary)] rounded-full animate-pulse"></span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getStatusBadge(player.roundStatus)} text-xs`}>
                    {getStatusIcon(player.roundStatus)} {getStatusText(player.roundStatus)}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <div className="text-subtitle font-bold text-[var(--color-text-primary)]">
                  {player.score}
                </div>
                <div className="text-small text-[var(--color-text-secondary)]">
                  points
                </div>
                {player.roundScore > 0 && (
                  <div className="text-small text-[var(--color-green-primary)] font-medium">
                    +{player.roundScore}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-subtitle font-bold text-[var(--color-blue-primary)]">
              {players.filter((p: any) => p.roundStatus === 'in_round').length}
            </div>
            <div className="text-small text-[var(--color-text-secondary)]">Active</div>
          </div>
          <div>
            <div className="text-subtitle font-bold text-[var(--color-orange-primary)]">
              {players.filter((p: any) => p.roundStatus === 'passed').length}
            </div>
            <div className="text-small text-[var(--color-text-secondary)]">Passed</div>
          </div>
          <div>
            <div className="text-subtitle font-bold text-[var(--color-status-error)]">
              {players.filter((p: any) => p.roundStatus === 'out').length}
            </div>
            <div className="text-small text-[var(--color-text-secondary)]">Out</div>
          </div>
        </div>
      </div>
    </div>
  );
}
