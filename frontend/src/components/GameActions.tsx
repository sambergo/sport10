// src/components/GameActions.tsx
import { useGameStore } from '@/store/gameStore';
import { socketService } from '@/services/socketService';
import { Button } from './ui/button';

export function GameActions() {
  const { activePlayerId, status } = useGameStore((state) => state.gameState);
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
    <div className="mt-6 text-center">
      <Button onClick={handlePassTurn} disabled={!isMyTurn} variant="secondary">
        Pass Turn
      </Button>
    </div>
  );
}
