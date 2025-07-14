import { useGameStore } from "@/store/gameStore"
import { Sparkles } from "lucide-react"

export function QuestionDisplay() {
  const question = useGameStore((state) => state.gameState.currentQuestion)

  if (!question) {
    return (
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-xl border border-slate-600/50 p-4 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-300">Preparing next question...</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-xl border border-slate-600/50 p-4 shadow-xl animate-in slide-in-from-top duration-500">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white leading-tight mb-1">{question.question}</h2>
          <p className="text-xs text-slate-400">{question.category}</p>
        </div>
      </div>
    </div>
  )
}
