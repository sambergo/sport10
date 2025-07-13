import { useGameStore } from "@/store/gameStore"
import type { AnswerOption, Player } from "@/types/game"
import { socketService } from "@/services/socketService"
import { CheckCircle, XCircle } from "lucide-react"

export function AnswerOptions() {
  const { currentQuestion, status, activePlayerId, players } = useGameStore((state) => state.gameState)
  const myPlayerId = useGameStore((state) => state.playerId)

  if (!currentQuestion) return null

  const getMaxTextLength = () => {
    return Math.max(...currentQuestion.options.map(option => option.text.length))
  }

  const getDynamicSizing = () => {
    const maxLength = getMaxTextLength()

    // Base sizing for very short text (1-5 chars)
    if (maxLength <= 10) {
      return {
        fontSize: 'text-2xl sm:text-3xl lg:text-4xl',
        height: 'min-h-[80px] sm:min-h-[90px] lg:min-h-[100px]',
        padding: 'p-4'
      }
    }

    // Medium text (6-20 chars)
    if (maxLength <= 20) {
      return {
        fontSize: 'text-lg sm:text-xl lg:text-2xl',
        height: 'min-h-[70px] sm:min-h-[80px] lg:min-h-[90px]',
        padding: 'p-3'
      }
    }

    // Long text (21-50 chars)
    if (maxLength <= 50) {
      return {
        fontSize: 'text-base sm:text-lg',
        height: 'min-h-[60px] sm:min-h-[70px]',
        padding: 'p-3'
      }
    }

    // Very long text (50+ chars)
    return {
      fontSize: 'text-sm sm:text-base',
      height: 'min-h-[50px] sm:min-h-[60px]',
      padding: 'p-2'
    }
  }

  const dynamicSizing = getDynamicSizing()

  const handleSelectAnswer = (index: number) => {
    socketService.submitAnswer(index)
  }

  const isMyTurn = activePlayerId === myPlayerId
  const isAnsweringPhase = status === "Answering"
  const revealedCorrectAnswers = players.flatMap((p: Player) => p.roundAnswers)
  const revealedIncorrectAnswers = currentQuestion.revealedIncorrectAnswers || []

  const getPlayerWhoAnswered = (optionIndex: number) => {
    const playerId = currentQuestion.playerAnswers?.[optionIndex]
    return playerId ? players.find((p: Player) => p.id === playerId) : null
  }

  return (
    <div className="w-full h-full">
      {/* Grid that adapts to number of options */}
      <div
        className={`grid gap-3 h-full ${currentQuestion.options.length <= 4
          ? "grid-cols-1 sm:grid-cols-2"
          : currentQuestion.options.length <= 6
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          } animate-in fade-in duration-500`}
      >
        {currentQuestion.options.map((option: AnswerOption, index: number) => {
          const isRevealedCorrect = revealedCorrectAnswers.includes(index)
          const isRevealedIncorrect = revealedIncorrectAnswers.includes(index)
          const isRevealed = isRevealedCorrect || isRevealedIncorrect
          const isDisabled = !isAnsweringPhase || !isMyTurn || isRevealed
          const playerWhoAnswered = getPlayerWhoAnswered(index)

          const getButtonClass = () => {
            if (isRevealedCorrect) {
              return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/25"
            }
            if (isRevealedIncorrect) {
              return "bg-gradient-to-r from-red-500/50 to-pink-500/50 text-white border-red-400/50 opacity-60"
            }
            if (isDisabled) {
              return "bg-slate-700/50 text-slate-400 border-slate-600/50 opacity-50"
            }
            return "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-cyan-600 hover:to-purple-600 text-white border-slate-500 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]"
          }

          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={isDisabled}
              className={`${getButtonClass()} ${dynamicSizing.height} ${dynamicSizing.padding} rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center group`}
            >
              <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                {/* Answer letter and text */}
                <div className="flex items-start gap-2 w-full">
                  <span className={`flex-1 ${dynamicSizing.fontSize} font-medium leading-tight text-center break-words`}>{option.text}</span>
                </div>

                {/* Status indicators */}
                {isRevealedCorrect && playerWhoAnswered && (
                  <div className="flex items-center gap-1 text-green-300 mt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">{playerWhoAnswered.name}</span>
                  </div>
                )}

                {isRevealedIncorrect && playerWhoAnswered && (
                  <div className="flex items-center gap-1 text-red-300 mt-1">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">{playerWhoAnswered.name}</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
