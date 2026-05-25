import { storageAdapter } from './storage';

export interface Profile {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  createdAt: string;
}

export const AVATAR_EMOJIS = ['🦊', '🐸', '🦋', '🐙', '🦁', '🐨', '🦄', '🐢', '🦖', '🐳', '🦜', '🐝'];

export const AVATAR_COLORS = [
  { label: 'Coral',    value: '#FFAB91' },
  { label: 'Sky',      value: '#81D4FA' },
  { label: 'Mint',     value: '#A5D6A7' },
  { label: 'Lavender', value: '#CE93D8' },
  { label: 'Peach',    value: '#FFE082' },
  { label: 'Aqua',     value: '#80DEEA' },
  { label: 'Pink',     value: '#F48FB1' },
  { label: 'Lime',     value: '#C5E1A5' },
];

// Session management — sessionStorage clears when the tab/browser closes
const SESSION_KEY = 'phonics_active_profile_id';

export function getActiveProfileId(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function setActiveProfileId(id: string): void {
  sessionStorage.setItem(SESSION_KEY, id);
}

export function clearActiveProfileId(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getProfiles(): Promise<Profile[]> {
  return storageAdapter.getProfiles();
}

export async function createProfile(name: string, avatarEmoji: string, avatarColor: string): Promise<Profile> {
  const profile: Profile = {
    id: generateId(),
    name: name.trim(),
    avatarEmoji,
    avatarColor,
    createdAt: new Date().toISOString(),
  };
  await storageAdapter.saveProfile(profile);
  return profile;
}

export async function deleteProfile(profileId: string): Promise<void> {
  return storageAdapter.deleteProfile(profileId);
}
