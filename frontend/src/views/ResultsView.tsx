
import { GameTopBar } from "@/components/GameTopBar"
import { PlayerList } from "@/components/PlayerList"
import { QuestionDisplay } from "@/components/QuestionDisplay"
import { useGameStore } from "@/store/gameStore"
import type { AnswerOption } from "@/types/game"
import { CheckCircle, XCircle } from "lucide-react"
import { getDynamicSizing } from "@/utils/answerOptionSizing"

export function ResultsView() {
  const { currentQuestion, players } = useGameStore((state) => state.gameState)

  const getPlayerWhoAnswered = (optionIndex: number) => {
    const playerId = currentQuestion?.playerAnswers?.[optionIndex]
    return playerId ? players.find((p) => p.id === playerId) : null
  }

  return (
    <div 
      className="h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(/background/6.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-slate-900/95 pointer-events-none"></div>
      <div className="relative z-10 h-screen flex flex-col">
        {/* Fixed Top Bar */}
        <GameTopBar />

        {/* Main Content Area - scrollable if needed */}
        <div className="flex-1 flex flex-col pt-16 pb-4 overflow-auto">
          {/* Scoreboard section */}
          <div className="flex-shrink-0 px-4 py-3">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 text-center">Score</h2>
              <PlayerList />
            </div>
          </div>

          {/* Question section */}
          <div className="flex-shrink-0 px-4 py-3">
            <QuestionDisplay />
          </div>

          {/* Results content */}
          <div className="flex-1 px-4 pb-6">
            {currentQuestion && (
              <div className="w-full h-full">
                <div
                  className={`grid gap-3 h-full ${currentQuestion.options.length <= 4
                    ? "grid-cols-1 sm:grid-cols-2"
                    : currentQuestion.options.length <= 6
                      ? "grid-cols-2 sm:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    } animate-in fade-in duration-500`}
                >
                  {currentQuestion.options.map((option: AnswerOption, index: number) => {
                    const playerWhoAnswered = getPlayerWhoAnswered(index)
                    const dynamicSizing = getDynamicSizing(currentQuestion.options)

                    const getButtonClass = () => {
                      if (option.isCorrect) {
                        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/25"
                      }
                      return "bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-white border-slate-600/50 opacity-70"
                    }

                    return (
                      <div
                        key={index}
                        className={`${getButtonClass()} ${dynamicSizing.height} ${dynamicSizing.padding} rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center`}
                      >
                        <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                          {/* Answer text */}
                          <div className="flex items-start gap-2 w-full">
                            <span className={`flex-1 ${dynamicSizing.fontSize} font-medium leading-tight text-center break-words`}>{option.text}</span>
                          </div>

                          {/* Player who answered indicator */}
                          {playerWhoAnswered && (
                            <div className={`flex items-center gap-1 mt-1 ${option.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                              {option.isCorrect ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span className="text-xs font-bold">{playerWhoAnswered.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
