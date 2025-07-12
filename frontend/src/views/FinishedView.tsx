import { useGameStore } from "@/store/gameStore"
import type { Player } from "@/types/game"
import { Button } from "@/components/ui/button"
import { socketService } from "@/services/socketService"
import { useState, useEffect } from "react"
import { Trophy, Crown, Medal, RefreshCw, Sparkles } from "lucide-react"

export function FinishedView() {
  const { players } = useGameStore((state) => state.gameState)
  const { playerId, config, fetchConfig } = useGameStore((state) => state)
  const winner = players.sort((a: Player, b: Player) => b.score - a.score)[0]
  const [timeLeft, setTimeLeft] = useState(60)
  const [hasJoined, setHasJoined] = useState(false)
  const currentPlayer = players.find((p: Player) => p.id === playerId)

  useEffect(() => {
    if (!config) {
      fetchConfig()
    }
  }, [config, fetchConfig])

  useEffect(() => {
    if (config) {
      const timer = config.gameRestartDelaySeconds * 2
      setTimeLeft(timer)
    }
  }, [config])

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
  }, [config])

  const handleAutoJoinNext = () => {
    if (currentPlayer && !hasJoined) {
      setHasJoined(true)
      socketService.joinGame({
        id: currentPlayer.id,
        name: currentPlayer.name,
        avatar: currentPlayer.avatar,
      })
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-12 pt-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
          GAME OVER!
        </h1>
        {winner && (
          <div className="max-w-lg mx-auto bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl border border-yellow-400/40 p-8 mb-8 shadow-2xl shadow-yellow-500/20">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="flex items-center gap-4 mb-4">
                <Crown className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Champion!</h2>
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
              
              <img
                src={`/avatars/${winner.avatar || 1}.png`}
                alt={`${winner.name}'s avatar`}
                className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-4 shadow-lg shadow-yellow-500/25"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/avatars/1.png"
                }}
              />
              
              <p className="text-yellow-400 font-bold text-xl">{winner.name}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-1">{winner.score}</div>
              <div className="text-sm text-yellow-400">Total Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Final Scoreboard */}
      <div className="flex-1 max-w-lg mx-auto w-full mb-8">
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-600/30 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Final Rankings</h2>
          </div>

          <div className="space-y-3">
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
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${index === 0
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/40 shadow-lg shadow-yellow-500/20"
                    : isMe
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/40 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-800/50 border-slate-600/30"
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
      <div className="max-w-lg mx-auto w-full mb-8">
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-600/30 p-6 shadow-2xl text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Next Game</h3>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-black text-white mb-2">{timeLeft}s</div>
            <div className="text-slate-400">Starting automatically</div>
          </div>

          <Button
            onClick={handleAutoJoinNext}
            disabled={!currentPlayer?.name || hasJoined}
            className={`w-full h-12 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl rounded-2xl ${
              hasJoined 
                ? "bg-green-600 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white hover:shadow-purple-500/30"
            }`}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {hasJoined ? "Joined!" : "Join Next Game"}
          </Button>
        </div>
      </div>
    </div>
  )
}
