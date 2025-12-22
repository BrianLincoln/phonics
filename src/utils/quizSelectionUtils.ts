import { getPhonicsProgress } from '../helpers/quizProgress';
import { quizzes } from '../data/quizzes';

export function getNextQuizId(): string {
  const progress = getPhonicsProgress();
  // Find the first quiz whose unit is not completed (sampleSize < 1 or not present)
  for (const quiz of quizzes) {
    // Use the same logic as QuizView for unit id
    const unitId = quiz.unit;
    const unitProgress = progress.phonicsUnits[unitId];
    if (!unitProgress || unitProgress.sampleSize < 1) {
      return quiz.unit;
    }
  }
  // If all are completed, pick a random quiz
  return quizzes[Math.floor(Math.random() * quizzes.length)].id;
}
