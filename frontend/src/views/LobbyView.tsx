// src/views/LobbyView.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerList } from '@/components/PlayerList';
import { Profile, type ProfileData } from '@/components/Profile';
import { socketService } from '@/services/socketService';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '../../../common/types/game';

export function LobbyView() {
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const { players, status } = useGameStore((state) => state.gameState);
  const { playerId } = useGameStore((state) => state);
  const myPlayer = players.find((p: Player) => p.id === playerId);

  const handleProfileComplete = (profile: ProfileData) => {
    setUserProfile(profile);
  };

  const handleJoinGame = () => {
    if (userProfile) {
      socketService.joinGame(userProfile);
    }
  };

  const getTitle = () => {
    if (status === 'Waiting') {
      return 'Waiting for Game to Start';
    }
    return myPlayer ? 'You can join the current game!' : 'Game in Progress - Join Now!';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">{getTitle()}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Profile 
            onProfileComplete={handleProfileComplete}
            disabled={!!myPlayer}
          />
          {userProfile && (
            <Button 
              onClick={handleJoinGame} 
              className="w-full" 
              disabled={!!myPlayer}
            >
              {myPlayer ? 'Joined!' : status === 'Waiting' ? 'Join Game' : 'Join Current Game'}
            </Button>
          )}
        </div>
        <div>
          <PlayerList />
        </div>
      </div>
    </div>
  );
}
