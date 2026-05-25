// Storage adapter interface — swap LocalStorageAdapter for SupabaseAdapter to migrate
import type { Profile } from './profiles';
import type { PhonicsProgress } from '../helpers/quizProgress';

export interface StorageAdapter {
  getProfiles(): Promise<Profile[]>;
  saveProfile(profile: Profile): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  getProgress(profileId: string): Promise<PhonicsProgress>;
  saveProgress(profileId: string, progress: PhonicsProgress): Promise<void>;
}

const PROFILES_KEY = 'phonics_profiles';
const progressKey = (id: string) => `phonics_progress_${id}`;

export class LocalStorageAdapter implements StorageAdapter {
  async getProfiles(): Promise<Profile[]> {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as Profile[];
    } catch {
      return [];
    }
  }

  async saveProfile(profile: Profile): Promise<void> {
    const profiles = await this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  async deleteProfile(profileId: string): Promise<void> {
    const profiles = await this.getProfiles();
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles.filter(p => p.id !== profileId)));
    localStorage.removeItem(progressKey(profileId));
  }

  async getProgress(profileId: string): Promise<PhonicsProgress> {
    const data = localStorage.getItem(progressKey(profileId));
    if (!data) return { units: {} };
    try {
      return JSON.parse(data) as PhonicsProgress;
    } catch {
      return { units: {} };
    }
  }

  async saveProgress(profileId: string, progress: PhonicsProgress): Promise<void> {
    localStorage.setItem(progressKey(profileId), JSON.stringify(progress));
  }
}

export const storageAdapter: StorageAdapter = new LocalStorageAdapter();
