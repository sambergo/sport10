import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Edit3, Save } from "lucide-react"

export interface ProfileData {
  id: string
  name: string
  avatar: number
}

interface ProfileProps {
  onProfileComplete: (profile: ProfileData) => void
  disabled?: boolean
}

export function Profile({ onProfileComplete, disabled = false }: ProfileProps) {
  const [name, setName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const onProfileCompleteRef = useRef(onProfileComplete)

  useEffect(() => {
    onProfileCompleteRef.current = onProfileComplete
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
        setName(parsedProfile.name)
        setSelectedAvatar(parsedProfile.avatar)
        onProfileCompleteRef.current(parsedProfile)
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
  }, [])

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  const saveProfile = () => {
    if (!name.trim()) return

    const newProfile: ProfileData = {
      id: profile?.id || generateId(),
      name: name.trim(),
      avatar: selectedAvatar,
    }

    localStorage.setItem("userProfile", JSON.stringify(newProfile))
    setProfile(newProfile)
    onProfileComplete(newProfile)
  }

  const editProfile = () => {
    setProfile(null)
  }

  const avatarNumbers = Array.from({ length: 48 }, (_, i) => i + 1)

  if (profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <div className="relative">
            <img
              src={`/avatars/${profile.avatar}.png`}
              alt="Your avatar"
              className="w-20 h-20 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-400/25"
              onError={(e) => {
                ; (e.target as HTMLImageElement).src = "/avatars/1.png"
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-900" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-white">{profile.name}</h3>
            <p className="text-sm text-slate-400">Ready to play!</p>
          </div>
        </div>

        <Button
          onClick={editProfile}
          variant="outline"
          className="w-full h-12 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 hover:border-slate-500"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Player Name</label>
        <Input
          placeholder="Enter your gaming name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Choose Your Avatar</label>
        <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 bg-slate-800/30 rounded-xl border border-slate-700/50">
          {avatarNumbers.map((avatarNum) => (
            <button
              key={avatarNum}
              onClick={() => setSelectedAvatar(avatarNum)}
              className={`w-14 h-14 rounded-full border-2 transition-all duration-300 hover:scale-110 ${selectedAvatar === avatarNum
                ? "border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-400/25"
                : "border-slate-500 hover:border-slate-400"
                }`}
              disabled={disabled}
            >
              <img
                src={`/avatars/${avatarNum}.png`}
                alt={`Avatar ${avatarNum}`}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  ; (e.target as HTMLImageElement).src = "/avatars/1.png"
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={saveProfile}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/25"
        disabled={disabled || !name.trim()}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Profile
      </Button>
    </div>
  )
}
