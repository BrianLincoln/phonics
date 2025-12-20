// helpers/quizProgress.ts
// LocalStorage-backed phonics unit progress tracker

const PHONICS_PROGRESS_KEY = 'phonicsProgress';
const RECENT_ATTEMPTS = 10;

export interface PhonicsUnitProgress {
  correct: number;
  incorrect: number;
  recent: boolean[];
  sampleSize: number;
  lastSeen: string | null;
}

export interface PhonicsProgress {
  phonicsUnits: Record<string, PhonicsUnitProgress>;
}

function getDefaultUnitProgress(): PhonicsUnitProgress {
  return {
    correct: 0,
    incorrect: 0,
    recent: [],
    sampleSize: 0,
    lastSeen: null,
  };
}

export function getPhonicsProgress(): PhonicsProgress {
  const data = localStorage.getItem(PHONICS_PROGRESS_KEY);
  if (!data) {
    return { phonicsUnits: {} };
  }
  try {
    return JSON.parse(data);
  } catch {
    return { phonicsUnits: {} };
  }
}

export function setPhonicsProgress(progress: PhonicsProgress) {
  localStorage.setItem(PHONICS_PROGRESS_KEY, JSON.stringify(progress));
}

export function updatePhonicsUnitProgress(unitId: string, correct: boolean) {
  const progress = getPhonicsProgress();
  const now = new Date().toISOString();
  let unit = progress.phonicsUnits[unitId] || getDefaultUnitProgress();

  if (correct) {
    unit.correct += 1;
  } else {
    unit.incorrect += 1;
  }
  unit.sampleSize += 1;
  unit.lastSeen = now;
  unit.recent.push(correct);
  if (unit.recent.length > RECENT_ATTEMPTS) {
    unit.recent = unit.recent.slice(-RECENT_ATTEMPTS);
  }
  progress.phonicsUnits[unitId] = unit;
  setPhonicsProgress(progress);
}

export function resetPhonicsProgress() {
  localStorage.removeItem(PHONICS_PROGRESS_KEY);
}
