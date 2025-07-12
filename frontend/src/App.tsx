import { useEffect } from "react"
import { useGameStore } from "@/store/gameStore"
import { socketService } from "@/services/socketService"
import { LobbyView } from "@/views/LobbyView"
import { GameView } from "@/views/GameView"
import { ResultsView } from "@/views/ResultsView"
import { FinishedView } from "@/views/FinishedView"

export default function App() {
  const { status } = useGameStore((state) => state.gameState)
  const { playerId } = useGameStore((state) => state)

  useEffect(() => {
    socketService.connect()
  }, [])

  const renderView = () => {
    if (!playerId) {
      return <LobbyView />
    }

    switch (status) {
      case "Waiting":
        return <LobbyView />
      case "Starting":
        return <LobbyView />
      case "Answering":
        return <GameView />
      case "Results":
        return <ResultsView />
      case "Finished":
        return <FinishedView />
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-cyan-400 font-medium">Connecting to game server...</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Simple dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <main className="relative z-10 animate-in fade-in duration-500">{renderView()}</main>
    </div>
  )
}
