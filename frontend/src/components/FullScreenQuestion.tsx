import { useGameStore } from "@/store/gameStore"

export function FullScreenQuestion() {
  const question = useGameStore((state) => state.gameState.currentQuestion)

  if (!question) return null

  return (
    <div className="h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <p className="text-xl sm:text-2xl text-slate-400 mb-4">{question.category}</p>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
          {question.question}
        </h1>
        
        <div className="mt-12">
          <div className="inline-flex items-center gap-2 text-slate-400">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-lg">Preparing options...</span>
          </div>
        </div>
      </div>
    </div>
  )
}