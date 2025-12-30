// import { getPhonicsProgress } from '../helpers/quizProgress';
import { activities } from '../data/activities';

export function getNextActivityId(): string {
  // const progress = getPhonicsProgress();
  // // Find the first activity whose unit is not completed (sampleSize < 1 or not present)
  // for (const activity of activities) {
  //   // Use the same logic as QuizView for unit id
  //   const unitId = activity.unit;
  //   const unitProgress = progress.units[unitId];
  //   if (!unitProgress || unitProgress.sampleSize < 1) {
  //     return activity.unit;
  //   }
  // }


  // If all are completed, pick a random activity
  // For now, just hardcoding a random pick
  return activities[Math.floor(Math.random() * activities.length)].id;
}
