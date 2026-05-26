// Storage adapter interface — swap LocalStorageAdapter for SupabaseAdapter to migrate
import type { Profile } from './profiles';
import type { PhonicsProgress } from '../helpers/quizProgress';
import type { MapProgress } from './mapProgress';

export interface StorageAdapter {
  getProfiles(): Promise<Profile[]>;
  saveProfile(profile: Profile): Promise<void>;
  deleteProfile(profileId: string): Promise<void>;
  getProgress(profileId: string): Promise<PhonicsProgress>;
  saveProgress(profileId: string, progress: PhonicsProgress): Promise<void>;
  getMapProgress(profileId: string): Promise<MapProgress>;
  saveMapProgress(profileId: string, progress: MapProgress): Promise<void>;
}

const PROFILES_KEY = 'phonics_profiles';
const progressKey = (id: string) => `phonics_progress_${id}`;
const mapKey = (id: string) => `phonics_map_${id}`;

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
    localStorage.removeItem(mapKey(profileId));
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

  async getMapProgress(profileId: string): Promise<MapProgress> {
    const data = localStorage.getItem(mapKey(profileId));
    if (!data) return {};
    try {
      return JSON.parse(data) as MapProgress;
    } catch {
      return {};
    }
  }

  async saveMapProgress(profileId: string, progress: MapProgress): Promise<void> {
    localStorage.setItem(mapKey(profileId), JSON.stringify(progress));
  }
}

export const storageAdapter: StorageAdapter = new LocalStorageAdapter();
