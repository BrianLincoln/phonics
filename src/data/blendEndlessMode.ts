import { activities, ActivityType, BuildTheWordItem, BuildTheWordActivity } from './activities';

function getAllBlendWords(): BuildTheWordItem[] {
  return (activities as BuildTheWordActivity[])
    .filter(a => a.activityType === ActivityType.BUILD_THE_WORD)
    .reduce<BuildTheWordItem[]>((acc, a) => acc.concat(a.words), []);
}

export function generateBlendWord(): BuildTheWordItem {
  const pool = getAllBlendWords();
  return pool[Math.floor(Math.random() * pool.length)];
}
