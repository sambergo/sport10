// src/components/AdminPanel.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { socketService } from '@/services/socketService';

export function AdminPanel() {
  const [password, setPassword] = React.useState('');

  const handleStart = () => {
    socketService.startGame(password);
  };

  const handleReset = () => {
    socketService.resetGame(password);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Admin Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <div className="flex flex-col space-y-4">
          <Button onClick={handleStart} className="w-full">Start Game</Button>
          <Button onClick={handleReset} variant="destructive" className="w-full">Reset Game</Button>
        </div>
      </CardContent>
    </Card>
  );
}
