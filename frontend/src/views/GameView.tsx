
import { QuestionDisplay } from "@/components/QuestionDisplay"
import { AnswerOptions } from "@/components/AnswerOptions"
import { GameActions } from "@/components/GameActions"
import { GameTopBar } from "@/components/GameTopBar"
import { useGameStore } from "@/store/gameStore"

export function GameView() {
  const { status } = useGameStore((state) => state.gameState)
  const isGameActive = status === "Answering" || status === "Results"

  if (isGameActive) {
    return (
      <div className="h-screen flex flex-col">
        {/* Fixed Top Bar */}
        <GameTopBar />

        {/* Main Content Area - scrollable if needed */}
        <div className="flex-1 flex flex-col pt-16 pb-20 overflow-auto">
          {/* Question Section */}
          <div className="flex-shrink-0 px-4 py-3">
            <QuestionDisplay />
          </div>

          {/* Answer Section - takes remaining space */}
          <div className="flex-1 px-4 pb-3">
            <AnswerOptions />
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <GameActions />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col gap-4 p-4 pb-24">
      <div className="pt-8 flex-shrink-0">
        <QuestionDisplay />
      </div>

      <div className="flex-1 flex flex-col">
        <AnswerOptions />
      </div>

      <GameActions />
    </div>
  )
}
