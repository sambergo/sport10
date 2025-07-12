
import { useGameStore } from "@/store/gameStore"
import type { Player } from "@/types/game"
import { Crown, Zap, User } from "lucide-react"

export function PlayerList() {
  const { players, activePlayerId } = useGameStore((state) => state.gameState)
  const myPlayerId = useGameStore((state) => state.playerId)

  const getPlayerAvatar = (player: Player) => {
    return `/avatars/${player.avatar || 1}.jpeg`
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-3">
      {sortedPlayers.map((player, index) => {
        const isActivePlayer = player.id === activePlayerId
        const isMe = player.id === myPlayerId
        const avatarSrc = getPlayerAvatar(player)

        const getRankIcon = (index: number) => {
          if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />
          if (index === 1) return <span className="text-sm">🥈</span>
          if (index === 2) return <span className="text-sm">🥉</span>
          return <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
        }

        return (
          <div
            key={player.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
              isActivePlayer
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 shadow-lg shadow-green-500/25"
                : isMe
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/25"
                  : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 flex justify-center">{getRankIcon(index)}</div>

            {/* Avatar */}
            <div className="relative">
              <img
                src={avatarSrc || "/placeholder.svg"}
                alt={`${player.name}'s avatar`}
                className={`w-16 h-16 rounded-full border-2 transition-all duration-300 ${
                  isMe ? "border-cyan-400 shadow-md shadow-cyan-400/50" : "border-slate-500"
                }`}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/avatars/1.jpeg"
                }}
              />
              {isActivePlayer && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse">
                  <Zap className="w-2 h-2 text-slate-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold truncate ${isMe ? "text-cyan-400" : "text-white"}`}>{player.name}</h3>
                {isMe && (
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    You
                  </span>
                )}
              </div>
              {isActivePlayer && <p className="text-xs text-green-400 font-medium">Currently playing</p>}
            </div>

            {/* Score */}
            <div className="text-right">
              <div className={`text-xl font-bold ${isMe ? "text-cyan-400" : "text-white"}`}>{player.score}</div>
              <div className="text-xs text-slate-400">points</div>
            </div>
          </div>
        )
      })}

      {players.length === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No players yet</p>
          <p className="text-sm text-slate-500">Be the first to join!</p>
        </div>
      )}
    </div>
  )
}
