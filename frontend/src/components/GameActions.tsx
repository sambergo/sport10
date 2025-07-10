// src/components/GameActions.tsx
import { useGameStore } from '@/store/gameStore';
import { socketService } from '@/services/socketService';

export function GameActions() {
  const { activePlayerId, status, players } = useGameStore((state) => state.gameState);
  const myPlayerId = useGameStore((state) => state.playerId);

  const handlePassTurn = () => {
    socketService.passTurn();
  };

  const isMyTurn = activePlayerId === myPlayerId;
  const isAnsweringPhase = status === 'Answering';

  if (!isAnsweringPhase) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glassmorphism border-t border-white/10 p-4 animate-slide-up">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Help/Info Button */}
        <button className="game-button-ghost flex items-center gap-2 px-4 py-2">
          <span>💡</span>
          <span className="text-sm">Hint</span>
        </button>

        {/* Main Action Button */}
        {isMyTurn ? (
          <button 
            onClick={handlePassTurn}
            className="game-button-secondary flex items-center gap-2 px-6 py-3"
          >
            <span>⏭️</span>
            <span>Pass Turn</span>
          </button>
        ) : (
          <div className="game-button-ghost flex items-center gap-2 px-6 py-3 opacity-50">
            <span>⏳</span>
            <span>Waiting...</span>
          </div>
        )}

        {/* Settings Button */}
        <button className="game-button-ghost flex items-center gap-2 px-4 py-2">
          <span>⚙️</span>
          <span className="text-sm">Menu</span>
        </button>
      </div>

      {/* Action Status */}
      <div className="text-center mt-3">
        {isMyTurn ? (
          <p className="text-small text-[var(--color-green-primary)]">
            🟢 Your turn - Select answers or pass
          </p>
        ) : (
          <p className="text-small text-[var(--color-text-secondary)]">
            Waiting for {players.find(p => p.id === activePlayerId)?.name || 'other player'}
          </p>
        )}
      </div>
    </div>
  );
}
