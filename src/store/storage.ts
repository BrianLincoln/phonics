import type { Profile } from './profiles';
import type { PhonicsProgress } from '../helpers/quizProgress';
import type { MapProgress } from './mapProgress';
import { supabase } from './supabaseClient';
import { SupabaseAdapter } from './supabaseAdapter';

export interface StorageAdapter {
  getProfiles(): Promise<Profile[]>;
  saveProfile(profile: Profile): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  getProgress(profileId: string): Promise<PhonicsProgress>;
  saveProgress(profileId: string, progress: PhonicsProgress): Promise<void>;
  getMapProgress(profileId: string): Promise<MapProgress>;
  saveMapProgress(profileId: string, progress: MapProgress): Promise<void>;
}

let _adapter: StorageAdapter | null = null;

export function getAdapter(): StorageAdapter {
  if (!_adapter) throw new Error('Storage adapter not initialized — call initStorageAdapter() first');
  return _adapter;
}

export const storageAdapter: StorageAdapter = {
  getProfiles: (...args) => getAdapter().getProfiles(...args),
  saveProfile: (...args) => getAdapter().saveProfile(...args),
  deleteProfile: (...args) => getAdapter().deleteProfile(...args),
  getProgress: (...args) => getAdapter().getProgress(...args),
  saveProgress: (...args) => getAdapter().saveProgress(...args),
  getMapProgress: (...args) => getAdapter().getMapProgress(...args),
  saveMapProgress: (...args) => getAdapter().saveMapProgress(...args),
};

export async function initStorageAdapter(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    _adapter = new SupabaseAdapter(user.id);
  }
}
