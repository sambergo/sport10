
import { GameTopBar } from "@/components/GameTopBar"
import { PlayerList } from "@/components/PlayerList"
import { QuestionDisplay } from "@/components/QuestionDisplay"
import { useGameStore } from "@/store/gameStore"
import type { AnswerOption } from "@/types/game"
import { CheckCircle, XCircle } from "lucide-react"

export function ResultsView() {
  const { currentQuestion, players } = useGameStore((state) => state.gameState)

  const getPlayerWhoAnswered = (optionIndex: number) => {
    const playerId = currentQuestion?.playerAnswers?.[optionIndex]
    return playerId ? players.find((p) => p.id === playerId) : null
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Top Bar */}
      <GameTopBar />

      {/* Main Content Area - scrollable if needed */}
      <div className="flex-1 flex flex-col pt-16 pb-4 overflow-auto">
        {/* Scoreboard section */}
        <div className="flex-shrink-0 px-4 py-3">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Round Results</h2>
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
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 text-center">Answer Breakdown</h3>
              <div
                className={`grid gap-4 ${currentQuestion.options.length <= 4
                  ? "grid-cols-1 sm:grid-cols-2"
                  : currentQuestion.options.length <= 6
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  }`}
              >
                {currentQuestion.options.map((option: AnswerOption, index: number) => {
                  const playerWhoAnswered = getPlayerWhoAnswered(index)

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] flex flex-col justify-center items-center text-center transition-all duration-300 rounded-xl p-4 border-2 ${option.isCorrect
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 shadow-lg shadow-green-500/25 animate-in scale-in-95 duration-500"
                        : "bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-slate-600/50 opacity-70"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-3 w-full">
                        <div className="flex items-start gap-3 w-full">
                          <span className="flex-1 text-sm font-medium leading-tight text-left text-white break-words">
                            {option.text}
                          </span>
                        </div>

                        {/* Player who answered indicator */}
                        {playerWhoAnswered && (
                          <div className={`flex items-center gap-1 mt-2 ${option.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
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
  )
}
