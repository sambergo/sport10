// src/components/Header.tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Header() {
  const { status, currentRound, timer } = useGameStore((state) => state.gameState);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-center">Smart10</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-lg">
          <div>Round: {currentRound}</div>
          <div>Status: <span className="font-semibold">{status}</span></div>
          <div>Time: {timer}s</div>
        </div>
      </CardContent>
    </Card>
  );
}
