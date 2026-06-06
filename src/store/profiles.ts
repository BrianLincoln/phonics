import { storageAdapter } from './storage';

export type CompanionAnimalId = 'crow' | 'cat' | 'frog' | 'penguin';

export const COMPANION_ANIMALS: ReadonlyArray<{ id: CompanionAnimalId; label: string }> = [
  { id: 'crow',    label: 'Crow'    },
  { id: 'cat',     label: 'Cat'     },
  { id: 'frog',    label: 'Frog'    },
  { id: 'penguin', label: 'Penguin' },
];

export type LandscapeId = 'mountain' | 'forest';

export const LANDSCAPES: ReadonlyArray<{ id: LandscapeId; label: string }> = [
  { id: 'mountain', label: 'Mountain' },
  { id: 'forest',   label: 'Forest'   },
];

export interface Profile {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  companionAnimal?: CompanionAnimalId;
  landscape?: LandscapeId;
  createdAt: string;
}

export const AVATAR_EMOJIS = [
  // Animals
  '🦊', '🐸', '🦋', '🐙', '🦁', '🐨',
  '🦄', '🐢', '🦖', '🐳', '🦜', '🐝',
  // More animals
  '🐼', '🐧', '🦝', '🐺', '🦔', '🦩',
  // Fun / fantasy
  '🤖', '🐉', '👾', '🧸', '🐠', '🦦',
];

export const AVATAR_COLORS = [
  // Pastels
  { label: 'Coral',    value: '#FFAB91' },
  { label: 'Sky',      value: '#81D4FA' },
  { label: 'Mint',     value: '#A5D6A7' },
  { label: 'Lavender', value: '#CE93D8' },
  { label: 'Peach',    value: '#FFE082' },
  { label: 'Aqua',     value: '#80DEEA' },
  { label: 'Pink',     value: '#F48FB1' },
  { label: 'Lime',     value: '#C5E1A5' },
  // Vibrant (order matches soft row: red, blue, green, purple, yellow, cyan, pink, teal)
  { label: 'Flame',    value: '#FF3D00' },
  { label: 'Electric', value: '#2979FF' },
  { label: 'Emerald',  value: '#00C853' },
  { label: 'Violet',   value: '#AA00FF' },
  { label: 'Sunflower',value: '#FFD600' },
  { label: 'Ocean',    value: '#00B0FF' },
  { label: 'Hot Pink', value: '#F50057' },
  { label: 'Jade',     value: '#00BFA5' },
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

export async function createProfile(
  name: string,
  avatarEmoji: string,
  avatarColor: string,
  companionAnimal: CompanionAnimalId = 'crow',
  landscape: LandscapeId = 'mountain'
): Promise<Profile> {
  const profile: Profile = {
    id: generateId(),
    name: name.trim(),
    avatarEmoji,
    avatarColor,
    companionAnimal,
    landscape,
    createdAt: new Date().toISOString(),
  };
  await storageAdapter.saveProfile(profile);
  return profile;
}

export async function updateProfile(
  profileId: string,
  updates: Partial<Pick<Profile, 'name' | 'avatarEmoji' | 'avatarColor' | 'companionAnimal' | 'landscape'>>
): Promise<Profile> {
  const profiles = await storageAdapter.getProfiles();
  const existing = profiles.find(p => p.id === profileId);
  if (!existing) throw new Error(`Profile ${profileId} not found`);
  const updated: Profile = { ...existing, ...updates };
  await storageAdapter.saveProfile(updated);
  return updated;
}

export async function deleteProfile(profileId: string): Promise<void> {
  return storageAdapter.deleteProfile(profileId);
}
