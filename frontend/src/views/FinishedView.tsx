import { useGameStore } from "@/store/gameStore"
import type { Player } from "@/types/game"
import { Button } from "@/components/ui/button"
import { socketService } from "@/services/socketService"
import { useState, useEffect } from "react"
import { Trophy, Crown, Medal, RefreshCw, Sparkles } from "lucide-react"

export function FinishedView() {
  const { players } = useGameStore((state) => state.gameState)
  const playerId = useGameStore((state) => state.playerId)
  const winner = players.sort((a: Player, b: Player) => b.score - a.score)[0]
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameRestartDelay, setGameRestartDelay] = useState(60)
  const currentPlayer = players.find((p: Player) => p.id === playerId)

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((config) => {
        const timer = config.gameRestartDelaySeconds + (config.autoStartDelayMs / 1000)
        setGameRestartDelay(timer)
        setTimeLeft(timer)
      })
      .catch((err) => {
        console.warn("Failed to fetch config, using default:", err)
        setGameRestartDelay(60)
        setTimeLeft(60)
      })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameRestartDelay])

  const handleAutoJoinNext = () => {
    if (currentPlayer) {
      socketService.joinGame({
        id: currentPlayer.id,
        name: currentPlayer.name,
        avatar: currentPlayer.avatar,
      })
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
          GAME OVER!
        </h1>
        {winner && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl border border-yellow-400/50 p-6 mb-6 shadow-xl shadow-yellow-500/25">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Champion!</h2>
                <p className="text-yellow-400 font-bold text-xl">{winner.name}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-1">{winner.score}</div>
              <div className="text-sm text-yellow-400">Total Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Final Scoreboard */}
      <div className="flex-1 max-w-4xl mx-auto w-full mb-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Medal className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Final Rankings</h2>
          </div>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const isMe = player.id === playerId
              const getRankIcon = () => {
                if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />
                if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
                if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />
                return <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
              }

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${index === 0
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/25"
                      : isMe
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/25"
                        : "bg-slate-700/30 border-slate-600/50"
                    }`}
                >
                  <div className="flex-shrink-0 w-10 flex justify-center">{getRankIcon()}</div>

                  <img
                    src={`/avatars/${player.avatar || 1}.png`}
                    alt={`${player.name}'s avatar`}
                    className={`w-12 h-12 rounded-full border-2 ${isMe ? "border-cyan-400" : index === 0 ? "border-yellow-400" : "border-slate-500"
                      }`}
                    onError={(e) => {
                      ; (e.target as HTMLImageElement).src = "/avatars/1.png"
                    }}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-bold ${isMe ? "text-cyan-400" : index === 0 ? "text-yellow-400" : "text-white"
                          }`}
                      >
                        {player.name}
                      </h3>
                      {isMe && (
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${isMe ? "text-cyan-400" : index === 0 ? "text-yellow-400" : "text-white"
                        }`}
                    >
                      {player.score}
                    </div>
                    <div className="text-xs text-slate-400">points</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Next Game Section */}
      <div className="max-w-md mx-auto w-full">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Next Game</h3>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-black text-white mb-2">{timeLeft}s</div>
            <div className="text-sm text-slate-400">Starting automatically</div>
          </div>

          <Button
            onClick={handleAutoJoinNext}
            disabled={!currentPlayer?.name}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Join Next Game
          </Button>
        </div>
      </div>
    </div>
  )
}
