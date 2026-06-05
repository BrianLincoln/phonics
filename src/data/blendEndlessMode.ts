import { activities, ActivityType, BuildTheWordItem, BuildTheWordActivity, LessonActivity } from './activities';
import type { BlendQuestion } from './activities';

function getAllBlendWords(): BuildTheWordItem[] {
  const seen = new Set<string>();
  const items: BuildTheWordItem[] = [];

  for (const a of activities) {
    if (a.activityType === ActivityType.BUILD_THE_WORD) {
      for (const w of (a as BuildTheWordActivity).words) {
        if (!seen.has(w.word)) {
          seen.add(w.word);
          items.push(w);
        }
      }
    } else if (a.activityType === ActivityType.LESSON) {
      for (const step of (a as LessonActivity).steps) {
        if (step.kind === 'blend' || step.kind === 'scrambled-blend') {
          const q = step as BlendQuestion;
          if (!seen.has(q.word)) {
            seen.add(q.word);
            items.push({
              word: q.word,
              letters: q.letters,
              wordAudioFile: q.wordAudioFile,
              phonemeFiles: q.phonemeFiles,
            });
          }
        }
      }
    }
  }

  return items;
}

export function generateBlendWord(): BuildTheWordItem {
  const pool = getAllBlendWords();
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateBlendWordForLetters(availableLetters: Set<string>): BuildTheWordItem | null {
  const pool = getAllBlendWords().filter(item =>
    item.letters.every(l => availableLetters.has(l))
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
