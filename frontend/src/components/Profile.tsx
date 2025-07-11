// src/components/Profile.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ProfileData {
  id: string;
  name: string;
  avatar: number;
}

interface ProfileProps {
  onProfileComplete: (profile: ProfileData) => void;
  disabled?: boolean;
}

export function Profile({ onProfileComplete, disabled = false }: ProfileProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setName(parsedProfile.name);
        setSelectedAvatar(parsedProfile.avatar);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const saveProfile = () => {
    if (!name.trim()) return;

    const newProfile: ProfileData = {
      id: profile?.id || generateId(),
      name: name.trim(),
      avatar: selectedAvatar,
    };

    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
    onProfileComplete(newProfile);
  };

  const editProfile = () => {
    setProfile(null);
  };

  const avatarNumbers = Array.from({ length: 21 }, (_, i) => i + 1);

  if (profile && !disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={`/avatars/${profile.avatar}.jpeg`}
              alt="Your avatar"
              className="w-16 h-16 rounded-full border-2 border-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
              }}
            />
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
            </div>
          </div>
          <Button onClick={editProfile} variant="outline" className="w-full">
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Choose Avatar</label>
          <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto">
            {avatarNumbers.map((avatarNum) => (
              <button
                key={avatarNum}
                onClick={() => setSelectedAvatar(avatarNum)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedAvatar === avatarNum
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-white/20 hover:border-white/40'
                }`}
                disabled={disabled}
              >
                <img
                  src={`/avatars/${avatarNum}.jpeg`}
                  alt={`Avatar ${avatarNum}`}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/1.jpeg';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={saveProfile} 
          className="w-full" 
          disabled={disabled || !name.trim()}
        >
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}