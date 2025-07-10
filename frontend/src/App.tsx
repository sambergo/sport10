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

  useEffect(() => {
    socketService.connect();
  }, []);

  const renderView = () => {
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
    <div className="min-h-screen bg-background text-foreground">
      <main>{renderView()}</main>
    </div>
  );
}

export default App;