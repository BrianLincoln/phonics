import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type Profile,
  type CompanionAnimalId,
  getProfiles,
  createProfile,
  updateProfile as updateProfileInStore,
  deleteProfile as deleteProfileFromStore,
  getActiveProfileId,
  setActiveProfileId,
  clearActiveProfileId,
} from '../store/profiles';

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  selectProfile: (profile: Profile) => void;
  switchLearner: () => void;
  addProfile: (name: string, emoji: string, color: string, companionAnimal?: CompanionAnimalId) => Promise<Profile>;
  updateProfile: (profileId: string, updates: Partial<Pick<Profile, 'name' | 'avatarEmoji' | 'avatarColor' | 'companionAnimal'>>) => Promise<Profile>;
  removeProfile: (profileId: string) => Promise<void>;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getProfiles().then(loaded => {
      setProfiles(loaded);
      const activeId = getActiveProfileId();
      if (activeId) {
        const found = loaded.find(p => p.id === activeId) ?? null;
        setActiveProfile(found);
      }
      setIsLoaded(true);
    });
  }, []);

  function selectProfile(profile: Profile) {
    setActiveProfileId(profile.id);
    setActiveProfile(profile);
  }

  function switchLearner() {
    clearActiveProfileId();
    setActiveProfile(null);
  }

  async function addProfile(name: string, emoji: string, color: string, companionAnimal?: CompanionAnimalId): Promise<Profile> {
    const profile = await createProfile(name, emoji, color, companionAnimal);
    setProfiles(prev => [...prev, profile]);
    return profile;
  }

  async function updateProfile(
    profileId: string,
    updates: Partial<Pick<Profile, 'name' | 'avatarEmoji' | 'avatarColor' | 'companionAnimal'>>
  ): Promise<Profile> {
    const updated = await updateProfileInStore(profileId, updates);
    setProfiles(prev => prev.map(p => p.id === profileId ? updated : p));
    if (activeProfile?.id === profileId) setActiveProfile(updated);
    return updated;
  }

  async function removeProfile(profileId: string): Promise<void> {
    await deleteProfileFromStore(profileId);
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (activeProfile?.id === profileId) {
      switchLearner();
    }
  }

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, selectProfile, switchLearner, addProfile, updateProfile, removeProfile, isLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
