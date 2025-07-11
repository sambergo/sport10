// src/App.tsx
import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socketService';
import { LobbyView } from './views/LobbyView';
import { GameView } from './views/GameView';
import { ResultsView } from './views/ResultsView';
import { FinishedView } from './views/FinishedView';
import './App.css';

function App() {
  const { status } = useGameStore((state) => state.gameState);
  const { playerId } = useGameStore((state) => state);

  useEffect(() => {
    socketService.connect();
  }, []);

  const renderView = () => {
    // If user hasn't joined yet, always show lobby
    if (!playerId) {
      return <LobbyView />;
    }

    switch (status) {
      case 'Waiting':
        return <LobbyView />;
      case 'Answering':
        return <GameView />;
      case 'Results':
        return <ResultsView />;
      case 'Finished':
        return <FinishedView />;
      default:
        return <div>Connecting to server...</div>;
    }
  };

  return (
    <div className="mobile-screen">
      <main className="animate-fade-in">{renderView()}</main>
    </div>
  );
}

export default App;