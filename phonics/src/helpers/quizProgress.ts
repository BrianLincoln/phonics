// helpers/quizProgress.ts
// Simple localStorage-backed quiz completion tracker

const STORAGE_KEY = 'quizCompletion';

export function getQuizCompletion(quizId: string): boolean {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return false;
  try {
    const obj = JSON.parse(data);
    return !!obj[quizId];
  } catch {
    return false;
  }
}

export function setQuizCompletion(quizId: string, complete: boolean = true) {
  let obj: Record<string, boolean> = {};
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      obj = JSON.parse(data);
    } catch { }
  }
  obj[quizId] = complete;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export function resetQuizCompletion(quizId: string) {
  let obj: Record<string, boolean> = {};
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      obj = JSON.parse(data);
    } catch { }
  }
  delete obj[quizId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}
