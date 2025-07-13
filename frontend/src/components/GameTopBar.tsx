
import { useGameStore } from "@/store/gameStore"
import type { Player } from "@/types/game"
import { Clock, Target, LogOut } from "lucide-react"
import { socketService } from "@/services/socketService"
import { useState } from "react"

export function GameTopBar() {
  const { currentQuestion, activePlayerId, players, currentRound, timer } = useGameStore((state) => state.gameState)
  const myPlayerId = useGameStore((state) => state.playerId)
  const isMyTurn = activePlayerId === myPlayerId
  const activePlayer = players.find((p: Player) => p.id === activePlayerId)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const getTimerColor = (time: number) => {
    if (time > 10) return "text-green-400"
    if (time > 5) return "text-yellow-400"
    return "text-red-400"
  }

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true)
  }

  const handleLeaveConfirm = () => {
    socketService.leaveGame()
    setShowLeaveConfirm(false)
  }

  const handleLeaveCancel = () => {
    setShowLeaveConfirm(false)
  }

  if (!currentQuestion) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 z-50 shadow-lg h-16">
      <div className="flex items-center justify-between max-w-full mx-auto h-full">
        {/* Left: Round & Category */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full border border-purple-500/30 flex-shrink-0">
            <Target className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">R{currentRound}</span>
          </div>
          <span className="text-xs text-slate-400 truncate hidden sm:block">{currentQuestion.category}</span>
        </div>

        {/* Center: Turn Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMyTurn ? (
            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-400">Your Turn</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full border border-slate-600/50">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-slate-400 truncate max-w-[80px]">{activePlayer?.name || "Waiting..."}</span>
            </div>
          )}
        </div>

        {/* Right: Timer & Leave Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-600/50">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className={`text-xs font-bold ${getTimerColor(timer)}`}>{timer}s</span>
          </div>
          <button
            onClick={handleLeaveClick}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-full transition-colors"
            title="Leave Game"
          >
            <LogOut className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {/* Leave Game Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Leave Game?</h3>
            <p className="text-slate-300 text-sm mb-4">
              Are you sure you want to leave the game?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleLeaveCancel}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveConfirm}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
