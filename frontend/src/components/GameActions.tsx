import { useGameStore } from "@/store/gameStore"
import type { Player } from "@/types/game"
import { socketService } from "@/services/socketService"
import { SkipForward, Clock, Trophy } from "lucide-react"

export function GameActions() {
  const { activePlayerId, status, players } = useGameStore((state) => state.gameState)
  const myPlayerId = useGameStore((state) => state.playerId)

  const handlePassTurn = () => {
    socketService.passTurn()
  }

  const isMyTurn = activePlayerId === myPlayerId
  const isAnsweringPhase = status === "Answering"

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const myRank = sortedPlayers.findIndex((p) => p.id === myPlayerId) + 1
  const myPlayer = sortedPlayers.find((p) => p.id === myPlayerId)
  const topPlayers = sortedPlayers.slice(0, Math.min(3, sortedPlayers.length))

  const getPlayerAvatar = (player: Player) => {
    return `/avatars/${player.avatar || 1}.jpeg`
  }

  if (!isAnsweringPhase) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 px-4 py-3 shadow-lg animate-in slide-in-from-bottom duration-300 h-20">
      <div className="flex items-center justify-between max-w-full mx-auto h-full">
        {/* Left: Top Players */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {topPlayers.slice(0, 3).map((player, index) => {
            const isMe = player.id === myPlayerId
            const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"

            return (
              <div key={player.id} className="flex items-center gap-1">
                <div className="flex items-center gap-1 bg-slate-800/50 px-1.5 py-1 rounded-full border border-slate-600/50">
                  <span className="text-xs">{rankIcon}</span>
                  <img
                    src={getPlayerAvatar(player) || "/placeholder.svg?height=20&width=20"}
                    alt={player.name}
                    className={`w-5 h-5 rounded-full border ${isMe ? "border-cyan-400" : "border-slate-500"}`}
                  />
                  <span className={`text-xs font-bold ${isMe ? "text-cyan-400" : "text-white"}`}>
                    {player.score}
                    {isMe && <span className="text-cyan-300">*</span>}
                  </span>
                </div>
                {index < 2 && <span className="text-slate-600 text-xs">•</span>}
              </div>
            )
          })}
        </div>

        {/* Center: Action Button */}
        <div className="flex-shrink-0 mx-2">
          {isMyTurn ? (
            <button
              onClick={handlePassTurn}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/25"
            >
              <SkipForward className="w-3 h-3" />
              <span className="text-sm">Pass</span>
            </button>
          ) : (
            <div className="bg-slate-700/50 text-slate-400 px-4 py-2 rounded-lg font-bold flex items-center gap-1 border border-slate-600/50">
              <Clock className="w-3 h-3" />
              <span className="text-sm">Wait</span>
            </div>
          )}
        </div>

        {/* Right: My Rank (if not in top 3) */}
        <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
          {myRank > 3 && myPlayer && (
            <div className="flex items-center gap-1 bg-slate-800/50 px-1.5 py-1 rounded-full border border-slate-600/50">
              <Trophy className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-bold">#{myRank}</span>
              <img
                src={getPlayerAvatar(myPlayer) || "/placeholder.svg?height=20&width=20"}
                alt="You"
                className="w-5 h-5 rounded-full border border-cyan-400"
              />
              <span className="text-xs font-bold text-cyan-400">{myPlayer.score}*</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
