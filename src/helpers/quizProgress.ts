// Returns the percentage of correct answers in the recent window (0-100)
export function getRecentConfidence(unit: PhonicsUnitProgress): number {
  if (!unit || !unit.recent || unit.recent.length === 0) return 0;
  const correct = unit.recent.filter(Boolean).length;
  return Math.round((correct / unit.recent.length) * 100);
}
// helpers/quizProgress.ts
// LocalStorage-backed phonics unit progress tracker (scoped per profile via storageAdapter)

import { getActiveProfileId } from '../store/profiles';
import { storageAdapter } from '../store/storage';

const RECENT_ATTEMPTS = 10;

export interface PhonicsUnitProgress {
  correct: number;
  incorrect: number;
  recent: boolean[];
  sampleSize: number;
  lastSeen: string | null;
  firstTryCorrect: number;
  attempts: number;
}

export interface PhonicsProgress {
  units: Record<string, PhonicsUnitProgress>;
}

export function getDefaultUnitProgress(): PhonicsUnitProgress {
  return {
    correct: 0,
    incorrect: 0,
    recent: [],
    sampleSize: 0,
    lastSeen: null,
    firstTryCorrect: 0,
    attempts: 0,
  };
}

export async function getPhonicsProgress(): Promise<PhonicsProgress> {
  const profileId = getActiveProfileId();
  if (!profileId) return { units: {} };
  return storageAdapter.getProgress(profileId);
}

export function setPhonicsProgress(progress: PhonicsProgress) {
  const profileId = getActiveProfileId();
  if (!profileId) return;
  // Fire-and-forget via adapter so the call site is Supabase-ready when we swap
  storageAdapter.saveProgress(profileId, progress);
}

// correct: whether the answer was eventually correct
// firstTryCorrect: whether the answer was correct on the first attempt
export async function updatePhonicsUnitProgress(unitId: string, correct: boolean, firstTryCorrect: boolean) {
  const progress = await getPhonicsProgress();
  const now = new Date().toISOString();
  let unit = progress.units[unitId] || getDefaultUnitProgress();

  if (correct) {
    unit.correct += 1;
    if (firstTryCorrect) {
      unit.firstTryCorrect += 1;
    }
  } else {
    unit.incorrect += 1;
  }
  unit.sampleSize += 1;
  unit.lastSeen = now;
  unit.recent.push(correct);
  unit.attempts += 1;
  if (unit.recent.length > RECENT_ATTEMPTS) {
    unit.recent = unit.recent.slice(-RECENT_ATTEMPTS);
  }
  progress.units[unitId] = unit;
  setPhonicsProgress(progress);
}

export async function resetPhonicsProgress(): Promise<void> {
  const profileId = getActiveProfileId();
  if (!profileId) return;
  await storageAdapter.saveProgress(profileId, { units: {} });
}
