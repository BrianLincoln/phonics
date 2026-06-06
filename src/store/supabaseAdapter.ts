import { supabase } from './supabaseClient';
import type { StorageAdapter } from './storage';
import type { Profile } from './profiles';
import type { PhonicsProgress } from '../helpers/quizProgress';
import type { MapProgress } from './mapProgress';

export class SupabaseAdapter implements StorageAdapter {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', this.userId);
    if (error || !data) return [];
    return data.map(row => ({
      id: row.id,
      name: row.name,
      avatarEmoji: row.avatar_emoji,
      avatarColor: row.avatar_color,
      companionAnimal: row.companion ?? undefined,
      createdAt: row.created_at,
    }));
  }

  async saveProfile(profile: Profile): Promise<void> {
    await supabase.from('profiles').upsert({
      id: profile.id,
      user_id: this.userId,
      name: profile.name,
      avatar_emoji: profile.avatarEmoji,
      avatar_color: profile.avatarColor,
      companion: profile.companionAnimal ?? null,
      created_at: profile.createdAt,
    });
  }

  async deleteProfile(profileId: string): Promise<void> {
    await Promise.all([
      supabase.from('profiles').delete().eq('id', profileId).eq('user_id', this.userId),
      supabase.from('phonics_progress').delete().eq('profile_id', profileId).eq('user_id', this.userId),
      supabase.from('map_progress').delete().eq('profile_id', profileId).eq('user_id', this.userId),
    ]);
  }

  async getProgress(profileId: string): Promise<PhonicsProgress> {
    const { data } = await supabase
      .from('phonics_progress')
      .select('data')
      .eq('user_id', this.userId)
      .eq('profile_id', profileId)
      .maybeSingle();
    return (data?.data as PhonicsProgress) ?? { units: {} };
  }

  async saveProgress(profileId: string, progress: PhonicsProgress): Promise<void> {
    await supabase.from('phonics_progress').upsert({
      user_id: this.userId,
      profile_id: profileId,
      data: progress,
      updated_at: new Date().toISOString(),
    });
  }

  async getMapProgress(profileId: string): Promise<MapProgress> {
    const { data } = await supabase
      .from('map_progress')
      .select('data')
      .eq('user_id', this.userId)
      .eq('profile_id', profileId)
      .maybeSingle();
    return (data?.data as MapProgress) ?? {};
  }

  async saveMapProgress(profileId: string, progress: MapProgress): Promise<void> {
    await supabase.from('map_progress').upsert({
      user_id: this.userId,
      profile_id: profileId,
      data: progress,
      updated_at: new Date().toISOString(),
    });
  }
}
