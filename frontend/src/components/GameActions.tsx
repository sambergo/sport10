// src/components/GameActions.tsx
import { useGameStore } from '@/store/gameStore';
import { socketService } from '@/services/socketService';

export function GameActions() {
  const { activePlayerId, status, players } = useGameStore((state: any) => state.gameState);
  const myPlayerId = useGameStore((state: any) => state.playerId);

  const handlePassTurn = () => {
    socketService.passTurn();
  };

  const isMyTurn = activePlayerId === myPlayerId;
  const isAnsweringPhase = status === 'Answering';

  // Get top 3 players and user's rank
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex(p => p.id === myPlayerId) + 1;
  const myPlayer = sortedPlayers.find(p => p.id === myPlayerId);
  
  // Get top 3 or fewer if less than 3 players
  const topPlayers = sortedPlayers.slice(0, Math.min(3, sortedPlayers.length));
  
  // Auto-assign avatars based on player ID or index
  const getPlayerAvatar = (playerId: string, index: number) => {
    const avatarIndex = ((playerId.charCodeAt(0) + index) % 21) + 1;
    return `/avatars/${avatarIndex}.jpeg`;
  };

  if (!isAnsweringPhase) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glassmorphism border-t border-white/10 p-3 animate-slide-up">
      <div className="flex items-center justify-between max-w-full mx-auto px-2">
        {/* Compact Scoreboard - Top 3 Players */}
        <div className="flex items-center gap-2 flex-1">
          {topPlayers.slice(0, 3).map((player, index) => (
            <div key={player.id} className="flex items-center gap-1">
              <img 
                src={getPlayerAvatar(player.id, index)}
                alt={player.name}
                className="w-6 h-6 rounded-full border border-white/20"
              />
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                {player.score}
              </span>
              {index < 2 && <span className="text-[var(--color-text-secondary)]">•</span>}
            </div>
          ))}
        </div>

        {/* Main Action Button */}
        {isMyTurn ? (
          <button 
            onClick={handlePassTurn}
            className="game-button-secondary flex items-center gap-1 px-4 py-2"
          >
            <span>⏭️</span>
            <span className="text-sm">Pass</span>
          </button>
        ) : (
          <div className="game-button-ghost flex items-center gap-1 px-4 py-2 opacity-50">
            <span>⏳</span>
            <span className="text-sm">Wait</span>
          </div>
        )}

        {/* User's Rank (if not in top 3) */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          {myRank > 3 && myPlayer && (
            <>
              <span className="text-xs text-[var(--color-text-secondary)]">#{myRank}</span>
              <img 
                src={getPlayerAvatar(myPlayer.id, myRank - 1)}
                alt="You"
                className="w-6 h-6 rounded-full border border-white/20"
              />
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                {myPlayer.score}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
