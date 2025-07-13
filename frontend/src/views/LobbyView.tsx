
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { PlayerList } from "@/components/PlayerList"
import { Profile, type ProfileData } from "@/components/Profile"
import { socketService } from "@/services/socketService"
import { useGameStore } from "@/store/gameStore"
import type { Player } from "@/types/game"
import { Sparkles, Users } from "lucide-react"

export function LobbyView() {
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null)
  const [timer, setTimer] = useState<number>(0)
  const { players, status } = useGameStore((state) => state.gameState)
  const { playerId, config, fetchConfig } = useGameStore((state) => state)
  const myPlayer = players.find((p: Player) => p.id === playerId)
  
  // Debug logging
  console.log('Debug - playerId:', playerId, 'players:', players, 'myPlayer:', myPlayer)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const prevStatusRef = useRef<string>(status)

  const handleProfileComplete = (profile: ProfileData) => {
    setUserProfile(profile)
  }

  const handleJoinGame = () => {
    if (userProfile) {
      socketService.joinGame(userProfile)
    }
  }

  useEffect(() => {
    if (!config) {
      fetchConfig()
    }
  }, [config, fetchConfig])

  useEffect(() => {
    if (prevStatusRef.current === "Waiting" && status === "Starting") {
      const startingDelay = config ? config.gameRestartDelaySeconds : 10
      setTimer(startingDelay)
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    if (status !== "Starting" && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    prevStatusRef.current = status

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [status, config])

  const getTitle = () => {
    if (status === "Waiting") {
      return "Waiting for Game to Start"
    }
    if (status === "Starting") {
      return `Game Starting... ${timer}s`
    }
    return myPlayer ? "You can join the current game!" : "Game in Progress - Join Now!"
  }

  return (
    <div
      className="min-h-screen p-4 flex flex-col relative"
      style={{
        backgroundImage: 'url(/background/6.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-slate-900/95 pointer-events-none"></div>
      <div className="relative z-10 min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sport10
            </h1>
          </div>
          <p className="text-slate-400 text-lg font-medium">{getTitle()}</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Profile Section */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white">Profile</h2>
                </div>
                <Profile onProfileComplete={handleProfileComplete} disabled={!!myPlayer} editDisabled={!!myPlayer} />
              </div>

              {userProfile && (
                <Button
                  onClick={handleJoinGame}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={!!myPlayer || (config ? players.length >= config.playerLimit : false)}
                >
                  {myPlayer ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Joined Game!
                    </span>
                  ) : status === "Waiting" || status === "Starting" ? (
                    "Join Game"
                  ) : (
                    "Join Current Game"
                  )}
                </Button>
              )}
            </div>

            {/* Players Section */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Players ({players.length})</h2>
              </div>
              <PlayerList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
